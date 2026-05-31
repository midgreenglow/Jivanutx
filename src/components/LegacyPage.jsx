import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { toSpaPath } from '../lib/routes';

gsap.registerPlugin(ScrollTrigger);

const pageCache = new Map();
const TOKEN_KEY = 'jivanu_token';

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiRequest(url, options = {}) {
  const headers = options.headers || {};
  if (options.json !== false) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

function addListener(el, event, handler, cleanupFns) {
  if (!el) return;
  el.addEventListener(event, handler);
  cleanupFns.push(() => el.removeEventListener(event, handler));
}

function initLegacyAuthAndData(container, navigate) {
  const cleanupFns = [];
  let lastOtpIdentifier = null;

  const loginForm = container.querySelector('#login-form');
  addListener(
    loginForm,
    'submit',
    async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      try {
        const data = await apiRequest('/api/login', {
          method: 'POST',
          body: JSON.stringify({
            email: formData.get('email'),
            password: formData.get('password')
          })
        });
        saveToken(data.token);
        navigate('/account');
      } catch (err) {
        alert(err.message);
      }
    },
    cleanupFns
  );

  const signupForm = container.querySelector('#signup-form');
  addListener(
    signupForm,
    'submit',
    async (event) => {
      event.preventDefault();
      const formData = new FormData(signupForm);
      try {
        const data = await apiRequest('/api/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password')
          })
        });
        saveToken(data.token);
        navigate('/account');
      } catch (err) {
        alert(err.message);
      }
    },
    cleanupFns
  );

  const otpRequestForm = container.querySelector('#otp-request-form');
  const otpVerifyForm = container.querySelector('#otp-verify-form');
  const otpCodeEl = container.querySelector('#otp-code');
  const otpRequestSection = container.querySelector('#otp-request-section');
  const otpVerifySection = container.querySelector('#otp-verify-section');

  addListener(
    otpRequestForm,
    'submit',
    async (event) => {
      event.preventDefault();
      const formData = new FormData(otpRequestForm);
      const identifier = formData.get('identifier');

      try {
        const data = await apiRequest('/api/request-otp', {
          method: 'POST',
          body: JSON.stringify({ identifier })
        });

        lastOtpIdentifier = identifier;
        if (otpCodeEl) {
          otpCodeEl.textContent = `Mock OTP code: ${data.code}`;
          otpCodeEl.style.display = 'block';
        }
        if (otpRequestSection && otpVerifySection) {
          otpRequestSection.style.display = 'none';
          otpVerifySection.style.display = 'block';
        }
      } catch (err) {
        alert(err.message);
      }
    },
    cleanupFns
  );

  addListener(
    otpVerifyForm,
    'submit',
    async (event) => {
      event.preventDefault();
      const formData = new FormData(otpVerifyForm);
      try {
        const data = await apiRequest('/api/verify-otp', {
          method: 'POST',
          body: JSON.stringify({
            identifier: lastOtpIdentifier || '',
            code: formData.get('code')
          })
        });
        saveToken(data.token);
        navigate('/account');
      } catch (err) {
        alert(err.message);
      }
    },
    cleanupFns
  );

  const signoutButtons = container.querySelectorAll('#signout-btn, #mobile-logout');
  signoutButtons.forEach((btn) => {
    addListener(
      btn,
      'click',
      () => {
        clearToken();
        navigate('/signin');
      },
      cleanupFns
    );
  });

  const accountEmail = container.querySelector('#account-email');
  const reportsList = container.querySelector('#reports-list');
  if (accountEmail || reportsList) {
    const token = getToken();
    if (!token) {
      navigate('/signin');
      return () => cleanupFns.forEach((fn) => fn());
    }

    (async () => {
      try {
        const me = await fetch('/api/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const meData = await me.json();
        if (!me.ok) throw new Error(meData.error || 'Unauthorized');

        const emailEl = container.querySelector('#account-email');
        const phoneEl = container.querySelector('#account-phone');
        const createdEl = container.querySelector('#account-created');

        if (emailEl) emailEl.textContent = meData.user.email || '-';
        if (phoneEl) phoneEl.textContent = meData.user.phone || '-';
        if (createdEl) {
          createdEl.textContent = meData.user.created_at
            ? new Date(meData.user.created_at).toLocaleDateString()
            : '-';
        }

        const reportsRes = await fetch('/api/reports', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const reportsData = await reportsRes.json();
        if (!reportsRes.ok) throw new Error(reportsData.error || 'Failed to load reports');

        if (reportsList) {
          if (!reportsData.reports.length) {
            reportsList.innerHTML =
              '<p class="empty-state">No reports yet. We will upload them here once ready.</p>';
          } else {
            reportsList.innerHTML = reportsData.reports
              .map(
                (report) => `
                  <div class="report-card">
                    <div>
                      <h3>${report.title}</h3>
                      <p>Uploaded ${new Date(report.uploaded_at).toLocaleDateString()}</p>
                    </div>
                    <a class="btn btn-primary" href="${report.url}" target="_blank" rel="noopener">Download</a>
                  </div>
                `
              )
              .join('');
          }
        }
      } catch (err) {
        clearToken();
        alert('Session expired. Please sign in again.');
        navigate('/signin');
      }
    })();
  }

  const adminForm = container.querySelector('#admin-upload-form');
  const adminMessage = container.querySelector('#admin-upload-message');
  addListener(
    adminForm,
    'submit',
    async (event) => {
      event.preventDefault();
      const formData = new FormData(adminForm);
      const adminSecret = formData.get('adminSecret');
      formData.delete('adminSecret');

      try {
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'x-admin-secret': adminSecret
          },
          body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Upload failed');

        if (adminMessage) adminMessage.textContent = 'Upload successful.';
        adminForm.reset();
      } catch (err) {
        if (adminMessage) adminMessage.textContent = err.message;
      }
    },
    cleanupFns
  );

  return () => cleanupFns.forEach((fn) => fn());
}

function extractLegacyPageData(htmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  const title = doc.querySelector('title')?.textContent || 'Jivanu';
  const bodyClass = doc.body?.className || '';
  const styleText = Array.from(doc.querySelectorAll('head style'))
    .map((style) => style.textContent)
    .join('\n');

  const main = doc.querySelector('main');
  const temp = doc.createElement('div');
  temp.innerHTML = main ? main.innerHTML : '<section class="section"><div class="container">No content.</div></section>';

  temp.querySelectorAll('img').forEach((img) => {
    if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
  });

  temp.querySelectorAll('a[href]').forEach((anchor) => {
    const mapped = toSpaPath(anchor.getAttribute('href'));
    if (mapped) anchor.setAttribute('href', mapped);
  });

  return {
    bodyClass,
    html: temp.innerHTML,
    styleText,
    title
  };
}

export default function LegacyPage({ fileName }) {
  const [state, setState] = useState({
    bodyClass: '',
    html: '',
    styleText: '',
    title: 'Jivanu'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const contentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError('');

        if (pageCache.has(fileName)) {
          // Temporarily disable page caching during development so hot-reloads work
          // const html = pageCache.get(fileName);
          // injectHtml(html);
          // return;
        }

        const response = await fetch(`/legacy/${fileName}?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error(`Failed to load ${fileName}`);
        }
        const htmlText = await response.text();
        const parsed = extractLegacyPageData(htmlText);
        pageCache.set(fileName, parsed);

        if (active) {
          setState(parsed);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [fileName]);

  useEffect(() => {
    document.title = state.title;

    if (!state.styleText) return undefined;
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-legacy-style', fileName);
    styleEl.textContent = state.styleText;
    document.head.appendChild(styleEl);

    return () => {
      styleEl.remove();
    };
  }, [fileName, state.styleText, state.title]);

  useEffect(() => {
    const previousClass = document.body.className;
    document.body.className = state.bodyClass || '';

    return () => {
      document.body.className = previousClass;
    };
  }, [state.bodyClass]);

  useEffect(() => {
    if (!contentRef.current || !state.html) return undefined;
    return initLegacyAuthAndData(contentRef.current, navigate);
  }, [state.html, navigate]);

  /* ── GSAP Scroll & Entrance Animations ─────────────────────────────── */
  useEffect(() => {
    if (!contentRef.current || !state.html) return undefined;

    const el = contentRef.current;
    const ctx = gsap.context(() => {
      const ease = 'power3.out';
      const easeBack = 'back.out(1.5)';

      /* ── Helper: word-split an element ── */
      function splitWords(heading) {
        if (!heading) return;
        // Preserve existing child elements (like <strong>, <span>)
        // Only split pure text nodes
        const clone = heading.cloneNode(true);
        const text = clone.textContent.trim();
        if (!text || heading.querySelectorAll('*').length > 2) return; // skip complex markup
        const words = text.split(' ');
        heading.innerHTML = words
          .map(
            (w) =>
              `<span class="gsap-word" style="display:inline-block;overflow:hidden;vertical-align:bottom"><span class="gsap-word-inner" style="display:inline-block">${w}</span></span>`,
          )
          .join(' ');
      }

      /* ── 1. HERO section ── */
      const hero = el.querySelector('.hero');
      if (hero) {
        const tl = gsap.timeline({ defaults: { ease } });

        const tag = hero.querySelector('.tag');
        if (tag) {
          gsap.set(tag, { opacity: 0, y: -18 });
          tl.to(tag, { opacity: 1, y: 0, duration: 0.45 }, 0.15);
        }

        const h1 = hero.querySelector('h1');
        if (h1) {
          splitWords(h1);
          const inners = h1.querySelectorAll('.gsap-word-inner');
          if (inners.length) {
            gsap.set(inners, { y: '110%', opacity: 0 });
            tl.to(inners, { y: '0%', opacity: 1, duration: 0.65, stagger: 0.045 }, 0.3);
          } else {
            gsap.set(h1, { opacity: 0, y: 28 });
            tl.to(h1, { opacity: 1, y: 0, duration: 0.75 }, 0.3);
          }
        }

        const heroTexts = hero.querySelectorAll('p, .hero-lead');
        if (heroTexts.length) {
          gsap.set(heroTexts, { opacity: 0, y: 22 });
          tl.to(heroTexts, { opacity: 1, y: 0, duration: 0.65, stagger: 0.12 }, 0.7);
        }

        const heroBtns = hero.querySelectorAll('.btn');
        if (heroBtns.length) {
          gsap.set(heroBtns, { opacity: 0, y: 16, scale: 0.94 });
          tl.to(heroBtns, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 }, 1.0);
        }

        const heroImg = hero.querySelector('.hero-visual img');
        if (heroImg) {
          gsap.set(heroImg, { opacity: 0, scale: 0.88, x: 24 });
          tl.to(heroImg, { opacity: 1, scale: 1, x: 0, duration: 1.0 }, 0.45);
        }
      }

      /* ── 2. Section headers ── */
      el.querySelectorAll('.section-header h2, .section-title, .section-header h1').forEach((heading) => {
        splitWords(heading);
        const inners = heading.querySelectorAll('.gsap-word-inner');
        gsap.set(inners.length ? inners : [heading], { opacity: 0, y: 36 });
        ScrollTrigger.create({
          trigger: heading,
          start: 'top 86%',
          onEnter: () =>
            gsap.to(inners.length ? inners : [heading], {
              opacity: 1, y: 0, duration: 0.7, stagger: 0.05, ease,
            }),
          once: true,
        });
      });

      /* ── 3. Problem / feature / team cards with stagger ── */
      const cardSelector =
        '.problem-card, .feature-card, .team-card, .career-card, ' +
        '.evidence-card, .value-card, .pricing-card';

      el.querySelectorAll('.grid, .cards-grid, .problem-grid, .team-grid').forEach((grid) => {
        const cards = grid.querySelectorAll(cardSelector);
        if (!cards.length) return;
        gsap.set(cards, { opacity: 0, y: 48, scale: 0.97 });
        ScrollTrigger.create({
          trigger: grid,
          start: 'top 82%',
          onEnter: () =>
            gsap.to(cards, {
              opacity: 1, y: 0, scale: 1,
              duration: 0.65, stagger: 0.1, ease,
            }),
          once: true,
        });
      });

      /* standalone pricing card (not inside a .grid) */
      el.querySelectorAll('.pricing-card').forEach((card) => {
        if (card.closest('.grid, .cards-grid')) return; // already handled
        gsap.set(card, { opacity: 0, y: 40, scale: 0.96 });
        ScrollTrigger.create({
          trigger: card,
          start: 'top 82%',
          onEnter: () =>
            gsap.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: easeBack }),
          once: true,
        });

        /* price count-up */
        const priceEl = card.querySelector('h2');
        if (priceEl && priceEl.textContent.includes('₹')) {
          const match = priceEl.textContent.replace(/[^0-9]/g, '');
          const finalVal = parseInt(match, 10) || 10000;
          const obj = { n: 0 };
          ScrollTrigger.create({
            trigger: card,
            start: 'top 82%',
            onEnter: () =>
              gsap.to(obj, {
                n: finalVal,
                duration: 1.4,
                ease: 'power2.out',
                onUpdate() {
                  priceEl.textContent = `₹${Math.round(obj.n).toLocaleString('en-IN')}`;
                },
                onComplete() {
                  priceEl.textContent = `₹${finalVal.toLocaleString('en-IN')}`;
                },
              }),
            once: true,
          });
        }
      });

      /* ── 4. Benefit list items ── */
      el.querySelectorAll('.benefit-list').forEach((list) => {
        const items = list.querySelectorAll('.benefit-item');
        if (!items.length) return;
        gsap.set(items, { opacity: 0, x: -32 });
        ScrollTrigger.create({
          trigger: list,
          start: 'top 82%',
          onEnter: () =>
            gsap.to(items, { opacity: 1, x: 0, duration: 0.55, stagger: 0.12, ease }),
          once: true,
        });
      });

      /* ── 5. Stand-alone section paragraphs ── */
      el.querySelectorAll('.section > .container > p, .section > .container > div > p').forEach(
        (p) => {
          if (p.closest('.problem-card, .pricing-card, .benefit-list, .hero')) return;
          gsap.set(p, { opacity: 0, y: 18 });
          ScrollTrigger.create({
            trigger: p,
            start: 'top 88%',
            onEnter: () => gsap.to(p, { opacity: 1, y: 0, duration: 0.6, ease }),
            once: true,
          });
        },
      );

      /* ── 6. Images (non-hero) with reveal ── */
      el.querySelectorAll('.hero-visual img').forEach((img) => {
        if (img.closest('.hero')) return; // hero already handled
        gsap.set(img, { opacity: 0, scale: 0.92, x: 20 });
        ScrollTrigger.create({
          trigger: img,
          start: 'top 82%',
          onEnter: () =>
            gsap.to(img, { opacity: 1, scale: 1, x: 0, duration: 0.9, ease }),
          once: true,
        });
      });

      /* ── 7. CTA buttons in dark sections ── */
      el.querySelectorAll('section .btn').forEach((btn) => {
        if (btn.closest('.hero')) return;
        gsap.set(btn, { opacity: 0, y: 14 });
        ScrollTrigger.create({
          trigger: btn,
          start: 'top 90%',
          onEnter: () =>
            gsap.to(btn, { opacity: 1, y: 0, duration: 0.5, ease }),
          once: true,
        });
      });

      /* ── 8. Card 3-D tilt on hover (desktop) ── */
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isTouchDevice = 'ontouchstart' in window;
      if (!prefersReduced && !isTouchDevice) {
        el.querySelectorAll('.problem-card, .feature-card, .team-card').forEach((card) => {
          card.style.willChange = 'transform';
          const onMove = (e) => {
            const r = card.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            const rx = ((y - r.height / 2) / r.height) * -7;
            const ry = ((x - r.width / 2) / r.width) * 7;
            gsap.to(card, {
              rotateX: rx, rotateY: ry,
              duration: 0.3, ease: 'power1.out',
              transformPerspective: 900, transformOrigin: 'center center',
            });
          };
          const onLeave = () =>
            gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.55, ease: 'power1.out' });
          card.addEventListener('mousemove', onMove);
          card.addEventListener('mouseleave', onLeave);
        });
      }

      /* ── 9. Scroll-parallax on hero images ── */
      const heroBg = el.querySelector('.hero');
      if (heroBg) {
        const heroVisual = heroBg.querySelector('.hero-visual');
        if (heroVisual) {
          gsap.to(heroVisual, {
            y: 60,
            ease: 'none',
            scrollTrigger: { trigger: heroBg, start: 'top top', end: 'bottom top', scrub: 1.2 },
          });
        }
      }

    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [state.html]);

  const handleClick = (event) => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    if (anchor.target === '_blank') return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    if (href.startsWith('/')) {
      event.preventDefault();
      navigate(href);
    }
  };

  if (loading) {
    return <div className="page-skeleton">Loading page content...</div>;
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <h2>Unable to load this page</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <div
      ref={contentRef}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: state.html }}
    />
  );
}
