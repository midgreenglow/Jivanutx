import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ButtonColorful } from '../components/ui/ButtonColorful';
import './HomePage.css';

gsap.registerPlugin(ScrollTrigger);

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }
});

const scrollFadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }
});

export default function HomePage() {
  const solutionsRef = useRef(null);
  const solutionCardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Solutions section: staggered reveal with scale + blur */
      if (solutionsRef.current) {
        const heading = solutionsRef.current.querySelector('h2');
        const sub = solutionsRef.current.querySelector('p');
        const cards = solutionsRef.current.querySelectorAll('.feature-card');

        if (heading) {
          gsap.set(heading, { opacity: 0, y: 40 });
          ScrollTrigger.create({
            trigger: heading,
            start: 'top 82%',
            onEnter: () => gsap.to(heading, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }),
            once: true,
          });
        }
        if (sub) {
          gsap.set(sub, { opacity: 0, y: 24 });
          ScrollTrigger.create({
            trigger: sub,
            start: 'top 84%',
            onEnter: () => gsap.to(sub, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }),
            once: true,
          });
        }
        if (cards.length) {
          gsap.set(cards, { opacity: 0, y: 60, scale: 0.95 });
          ScrollTrigger.create({
            trigger: solutionsRef.current.querySelector('.grid'),
            start: 'top 80%',
            onEnter: () =>
              gsap.to(cards, {
                opacity: 1, y: 0, scale: 1,
                duration: 0.7, stagger: 0.15, ease: 'back.out(1.3)',
              }),
            once: true,
          });
        }
      }
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    /* home-page wrapper: sets background to darkest navy so any tiny
       gap between sections shows that colour instead of the body white  */
    <div className="home-page" style={{ minHeight: '100vh' }}>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section
        className="home-hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '80px',
        }}
      >

        {/* Animated mesh gradient background */}
        <MeshGradient
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          colors={['#030c16', '#1FCAD3', '#0b1f33', '#0a3d45', '#030c16']}
          speed={0.25}
          backgroundColor="#030c16"
        />

        {/* Dark overlay for text readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(120deg, rgba(3,12,22,0.72) 0%, rgba(3,12,22,0.35) 60%, rgba(3,12,22,0.55) 100%)',
        }} />

        {/* home-hero-inner: flex row on desktop → stacked column on mobile */}
        <div
          className="container home-hero-inner flex items-center"
          style={{ position: 'relative', zIndex: 2, gap: '2rem' }}
        >

          {/* Left — text */}
          <div className="home-hero-text" style={{ flex: '0 0 48%', maxWidth: '560px' }}>

            <motion.div {...fadeUp(0.1)}>
              <span className="tag" style={{ marginBottom: '1.5rem' }}>Microbiome Therapeutics</span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.25)}
              style={{
                fontSize: '3.8rem',
                lineHeight: 1.12,
                letterSpacing: '-1.5px',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #1FCAD3 45%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              The future of Medicine is already inside you!
            </motion.h1>

            <motion.p
              {...fadeUp(0.4)}
              className="hero-subtitle-mobile"
              style={{ fontSize: '1.3rem', fontWeight: 600, color: '#ffffff', marginBottom: '1.25rem' }}
            >
              Translating Microbial Complexity into Clinical Clarity
            </motion.p>

            <motion.p
              {...fadeUp(0.55)}
              className="hero-body-mobile"
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.8,
                textAlign: 'justify',
                marginBottom: '2.5rem',
              }}
            >
              Jivanu is pioneering{' '}
              <span style={{ color: '#FF6B00', fontWeight: 700 }}>India's first</span>{' '}
              wave of microbiome-based therapeutics. We're moving beyond mere symptom
              management to deliver science-driven cures for chronic gut, brain, and
              immune diseases.
            </motion.p>

            <motion.div
              {...fadeUp(0.7)}
              className="home-hero-cta"
              style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
            >
              <ButtonColorful to="/contact" variant="primary">Contact Us →</ButtonColorful>
            </motion.div>
          </div>

          {/* Right — microbiome SVG visualization (hidden on mobile via CSS) */}
          <motion.div
            className="home-hero-visual"
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '500px',
              position: 'relative',
            }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{
              position: 'absolute',
              width: '480px',
              height: '480px',
              background: 'radial-gradient(circle, rgba(31,202,211,0.42) 0%, rgba(31,202,211,0.12) 45%, transparent 72%)',
              borderRadius: '50%',
              animation: 'pulse 6s infinite alternate',
            }} />
            <svg
              width="560"
              height="560"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: 'visible', filter: 'drop-shadow(0 0 18px rgba(31,202,211,0.35))' }}
            >
              <style>{`
                @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-8px,-16px) scale(1.03); } }
                @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(12px,12px) scale(0.97); } }
                @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12px,10px) scale(1.05); } }
                @keyframes glow   { 0%,100% { filter: drop-shadow(0 0 14px rgba(31,202,211,0.85)) drop-shadow(0 0 30px rgba(31,202,211,0.4)); } 50% { filter: drop-shadow(0 0 42px rgba(31,202,211,1)) drop-shadow(0 0 70px rgba(31,202,211,0.65)) drop-shadow(0 0 10px #ffffff); } }
                @keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes wriggle { 0%,100% { transform: scaleY(1) rotate(0deg); } 50% { transform: scaleY(1.06) rotate(1.5deg); } }
                .m1 { animation: float1 8s ease-in-out infinite, glow 4s ease-in-out infinite; transform-origin: 200px 200px; }
                .m2 { animation: float2 10s ease-in-out infinite; transform-origin: center; }
                .m3 { animation: float3 9s ease-in-out infinite; transform-origin: center; }
                .dna { animation: rotate 30s linear infinite; transform-origin: center; }
                .bacillus { animation: wriggle 6s ease-in-out infinite; transform-origin: 200px 200px; }
              `}</style>

              {/* Petri-dish orbital rings */}
              <circle cx="200" cy="200" r="155" stroke="#1FCAD3" strokeWidth="1.5" strokeDasharray="8 14" opacity="0.65" className="dna" />
              <circle cx="200" cy="200" r="105" stroke="#1FCAD3" strokeWidth="1" strokeDasharray="18 10 4 10" opacity="0.3" className="dna" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
              <circle cx="200" cy="200" r="182" stroke="#1FCAD3" strokeWidth="1" opacity="0.35" />

              {/* ── m1: Central Bacillus (E.coli / engineered rod bacterium) ── */}
              <g className="m1 bacillus">
                <ellipse cx="200" cy="200" rx="60" ry="33" fill="url(#coreG)" stroke="#1FCAD3" strokeWidth="2.5" opacity="0.95" />
                <ellipse cx="200" cy="200" rx="53" ry="26" fill="none" stroke="#1FCAD3" strokeWidth="0.75" opacity="0.35" />
                <ellipse cx="197" cy="200" rx="19" ry="11" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeDasharray="5 3" />
                <circle cx="170" cy="194" r="2.5" fill="#1FCAD3" opacity="0.75" />
                <circle cx="181" cy="210" r="2" fill="#1FCAD3" opacity="0.6" />
                <circle cx="218" cy="193" r="2.5" fill="#1FCAD3" opacity="0.7" />
                <circle cx="225" cy="208" r="2" fill="#1FCAD3" opacity="0.55" />
                <circle cx="163" cy="203" r="1.8" fill="white" opacity="0.3" />
                <circle cx="212" cy="201" r="1.6" fill="white" opacity="0.25" />
                <circle cx="190" cy="186" r="2" fill="#1FCAD3" opacity="0.5" />
                <path d="M259 196 C271 184 280 171 293 169 C306 167 312 177 324 172" stroke="#1FCAD3" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8" />
                <path d="M259 203 C273 217 282 231 296 227 C310 223 316 235 328 230" stroke="#1FCAD3" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.55" />
                <path d="M259 199 C268 190 276 183 285 187 C294 191 301 183 313 179" stroke="#1FCAD3" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.38" />
              </g>

              {/* ── m2: Cocci cluster (Staphylococcus) + small rod ── */}
              <g className="m2">
                <circle cx="299" cy="96" r="12" fill="#0d3348" stroke="#1FCAD3" strokeWidth="2" opacity="0.95" />
                <circle cx="319" cy="96" r="12" fill="#0d3348" stroke="#1FCAD3" strokeWidth="2" opacity="0.9" />
                <circle cx="309" cy="79" r="12" fill="#0d3348" stroke="#1FCAD3" strokeWidth="2" opacity="0.88" />
                <circle cx="309" cy="113" r="12" fill="#0d3348" stroke="#1FCAD3" strokeWidth="2" opacity="0.85" />
                <circle cx="304" cy="92" r="3.5" fill="white" opacity="0.18" />
                <line x1="309" y1="67" x2="309" y2="126" stroke="#1FCAD3" strokeWidth="0.5" opacity="0.2" />
                <line x1="287" y1="96" x2="331" y2="96" stroke="#1FCAD3" strokeWidth="0.5" opacity="0.2" />
                <ellipse cx="83" cy="268" rx="23" ry="11" fill="#1FCAD3" opacity="0.7" transform="rotate(-38 83 268)" />
                <ellipse cx="83" cy="268" rx="19" ry="7.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" transform="rotate(-38 83 268)" />
                <path d="M68 256 C60 245 53 233 43 231" stroke="#1FCAD3" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.6" />
                <circle cx="312" cy="258" r="9" fill="#0d3348" stroke="#1FCAD3" strokeWidth="1.8" opacity="0.9" />
              </g>

              {/* ── m3: Spirochete + binary fission ── */}
              <g className="m3">
                <path d="M78 118 C85 105 97 105 104 118 C111 131 123 131 130 118 C137 105 149 105 156 118"
                      stroke="#1FCAD3" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.85" />
                <circle cx="78" cy="118" r="4" fill="#1FCAD3" opacity="0.75" />
                <circle cx="156" cy="118" r="3.5" fill="#1FCAD3" opacity="0.6" />
                <ellipse cx="282" cy="295" rx="21" ry="15" fill="url(#navyG)" stroke="#1FCAD3" strokeWidth="1.6" opacity="0.92" />
                <ellipse cx="314" cy="295" rx="19" ry="15" fill="url(#navyG)" stroke="#1FCAD3" strokeWidth="1.6" opacity="0.88" />
                <path d="M298 281 C294 288 294 302 298 309" stroke="#1FCAD3" strokeWidth="1.2" fill="none" opacity="0.65" />
                <circle cx="278" cy="289" r="5" fill="white" opacity="0.14" />
                <circle cx="176" cy="66" r="10" fill="url(#cyanG)" opacity="0.75" />
                <circle cx="176" cy="63" r="3.5" fill="white" opacity="0.28" />
              </g>

              {/* Drifting spores / metabolite particles */}
              <circle cx="148" cy="252" r="3.5" fill="#1FCAD3" opacity="1" style={{ filter: 'drop-shadow(0 0 5px #1FCAD3)' }}>
                <animate attributeName="cy" values="252;232;252" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="263" cy="157" r="4" fill="#1FCAD3" stroke="#ffffff" strokeWidth="1" opacity="0.9" style={{ filter: 'drop-shadow(0 0 6px #1FCAD3)' }}>
                <animate attributeName="cy" values="157;177;157" dur="5.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="120" cy="200" r="3" fill="#1FCAD3" opacity="1" style={{ filter: 'drop-shadow(0 0 5px #1FCAD3)' }}>
                <animate attributeName="cx" values="120;140;120" dur="3.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="244" cy="264" r="4.5" fill="#1FCAD3" opacity="0.7">
                <animate attributeName="r" values="4.5;10;4.5" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.15;0.7" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="340" cy="190" r="5" fill="none" stroke="#1FCAD3" strokeWidth="1.5" opacity="0.75">
                <animate attributeName="r" values="5;11;5" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0.15;0.75" dur="4s" repeatCount="indefinite" />
              </circle>

              <defs>
                <linearGradient id="coreG" x1="140" y1="167" x2="260" y2="233" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1FCAD3" stopOpacity="1" />
                  <stop offset="55%" stopColor="#1FCAD3" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0b1f33" stopOpacity="0.97" />
                </linearGradient>
                <radialGradient id="cyanG" cx="176" cy="66" r="10" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#1FCAD3" />
                  <stop offset="100%" stopColor="#138d94" />
                </radialGradient>
                <radialGradient id="navyG" cx="298" cy="290" r="36" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1e3a52" />
                  <stop offset="100%" stopColor="#0b1f33" />
                </radialGradient>
              </defs>
            </svg>
          </motion.div>
        </div>

        {/* Bottom fade into next section */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: 'linear-gradient(to bottom, transparent, #0b1f33)',
        }} />
      </section>

      {/* ── SCIENCE-DRIVEN SOLUTIONS ────────────────────────── */}
      <section ref={solutionsRef} className="home-solutions" style={{ background: '#0b1f33', padding: '100px 0' }}>
        <div className="container">
          <motion.div {...scrollFadeUp(0)} style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ color: '#ffffff', marginBottom: '1rem' }}>Science-Driven Solutions</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.15rem' }}>Moving discoveries from the lab to meaningful clinical impact.</p>
          </motion.div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', maxWidth: '780px', margin: '0 auto' }}>
            {[
              { to: '/atlas',   img: '/assets/images/kit.jpg',     title: 'Jivanu Atlas™', desc: 'Personalized Microbiome Profiling Platform for individuals and clinicians.' },
              { to: '/rebiome', img: '/assets/images/rebiome.jpg', title: 'ReBiome™',      desc: 'Microbiota Restoration Platform focused on FMT-based therapeutics.' },
            ].map(({ to, img, title, desc }, i) => (
              <motion.div
                key={to}
                {...scrollFadeUp(i * 0.1)}
                className="feature-card"
                style={{
                  background: 'rgba(30,41,59,0.4)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ height: '160px', overflow: 'hidden' }}>
                  <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ padding: '1.75rem 1.5rem 2rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.2rem' }}>{title}</h3>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem', minHeight: '60px' }}>{desc}</p>
                  <Link to={to} style={{ color: '#1FCAD3', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem' }}>Explore Platform →</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
