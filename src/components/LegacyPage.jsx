import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toSpaPath } from '../lib/routes';

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
          if (active) {
            setState(pageCache.get(fileName));
            setLoading(false);
          }
          return;
        }

        const response = await fetch(`/legacy/${fileName}`);
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
