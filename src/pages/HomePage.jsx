import { motion } from 'framer-motion';
import { MeshGradient } from '@paper-design/shaders-react';
import { Link } from 'react-router-dom';
import { ButtonColorful } from '../components/ui/ButtonColorful';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }
});

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '92vh', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>

        {/* Animated mesh gradient background */}
        <MeshGradient
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          colors={['#030c16', '#1FCAD3', '#0b1f33', '#0a3d45', '#030c16']}
          speed={0.25}
          backgroundColor="#030c16"
        />

        {/* Dark overlay for text readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(3,12,22,0.72) 0%, rgba(3,12,22,0.35) 60%, rgba(3,12,22,0.55) 100%)' }} />

        <div className="container flex items-center" style={{ position: 'relative', zIndex: 2, gap: '2rem' }}>

          {/* Left — text */}
          <div style={{ flex: '0 0 48%', maxWidth: '560px' }}>

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
              style={{ fontSize: '1.3rem', fontWeight: 600, color: '#ffffff', marginBottom: '1.25rem' }}
            >
              Translating Microbial Complexity into Clinical Clarity
            </motion.p>

            <motion.p
              {...fadeUp(0.55)}
              style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, textAlign: 'justify', marginBottom: '2.5rem' }}
            >
              Jivanu is pioneering{' '}
              <span style={{ color: '#FF6B00', fontWeight: 700 }}>India's first</span>{' '}
              wave of microbiome-based therapeutics. We're moving beyond mere symptom
              management to deliver science-driven cures for chronic gut, brain, and
              immune diseases.
            </motion.p>

            <motion.div
              {...fadeUp(0.7)}
              style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
            >
              <ButtonColorful to="/atlas" variant="primary">Explore Atlas →</ButtonColorful>
              <ButtonColorful to="/contact" variant="outline">Contact Us</ButtonColorful>
            </motion.div>
          </div>

          {/* Right — microbiome SVG visualization */}
          <motion.div
            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px', position: 'relative' }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ position: 'absolute', width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(31,202,211,0.18) 0%, transparent 70%)', borderRadius: '50%', animation: 'pulse 6s infinite alternate' }} />
            <svg width="560" height="560" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
              <style>{`
                @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-8px,-16px) scale(1.03); } }
                @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(12px,12px) scale(0.97); } }
                @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12px,10px) scale(1.05); } }
                @keyframes glow   { 0%,100% { filter: drop-shadow(0 0 10px rgba(31,202,211,0.5)); } 50% { filter: drop-shadow(0 0 28px rgba(31,202,211,0.9)); } }
                @keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes wriggle { 0%,100% { transform: scaleY(1) rotate(0deg); } 50% { transform: scaleY(1.06) rotate(1.5deg); } }
                .m1 { animation: float1 8s ease-in-out infinite, glow 4s ease-in-out infinite; transform-origin: 200px 200px; }
                .m2 { animation: float2 10s ease-in-out infinite; transform-origin: center; }
                .m3 { animation: float3 9s ease-in-out infinite; transform-origin: center; }
                .dna { animation: rotate 30s linear infinite; transform-origin: center; }
                .bacillus { animation: wriggle 6s ease-in-out infinite; transform-origin: 200px 200px; }
              `}</style>

              {/* Petri-dish orbital rings */}
              <circle cx="200" cy="200" r="155" stroke="#1FCAD3" strokeWidth="1" strokeDasharray="8 14" opacity="0.3" className="dna" />
              <circle cx="200" cy="200" r="105" stroke="#ffffff" strokeWidth="1" strokeDasharray="18 10 4 10" opacity="0.1" className="dna" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
              <circle cx="200" cy="200" r="182" stroke="#1FCAD3" strokeWidth="0.5" opacity="0.15" />

              {/* ── m1: Central Bacillus (E.coli / engineered rod bacterium) ── */}
              <g className="m1 bacillus">
                {/* Outer cell wall — horizontal capsule */}
                <ellipse cx="200" cy="200" rx="60" ry="33" fill="url(#coreG)" stroke="#1FCAD3" strokeWidth="2.5" opacity="0.95" />
                {/* Inner membrane */}
                <ellipse cx="200" cy="200" rx="53" ry="26" fill="none" stroke="#1FCAD3" strokeWidth="0.75" opacity="0.35" />
                {/* Nucleoid — circular DNA region (dashed) */}
                <ellipse cx="197" cy="200" rx="19" ry="11" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeDasharray="5 3" />
                {/* Ribosomes — dots scattered in cytoplasm */}
                <circle cx="170" cy="194" r="2.5" fill="#1FCAD3" opacity="0.75" />
                <circle cx="181" cy="210" r="2" fill="#1FCAD3" opacity="0.6" />
                <circle cx="218" cy="193" r="2.5" fill="#1FCAD3" opacity="0.7" />
                <circle cx="225" cy="208" r="2" fill="#1FCAD3" opacity="0.55" />
                <circle cx="163" cy="203" r="1.8" fill="white" opacity="0.3" />
                <circle cx="212" cy="201" r="1.6" fill="white" opacity="0.25" />
                <circle cx="190" cy="186" r="2" fill="#1FCAD3" opacity="0.5" />
                {/* Flagella bundle — wavy paths from right pole */}
                <path d="M259 196 C271 184 280 171 293 169 C306 167 312 177 324 172" stroke="#1FCAD3" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8" />
                <path d="M259 203 C273 217 282 231 296 227 C310 223 316 235 328 230" stroke="#1FCAD3" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.55" />
                <path d="M259 199 C268 190 276 183 285 187 C294 191 301 183 313 179" stroke="#1FCAD3" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.38" />
              </g>

              {/* ── m2: Cocci cluster (Staphylococcus) + small rod ── */}
              <g className="m2">
                {/* 2×2 cocci cluster — top right */}
                <circle cx="299" cy="96" r="12" fill="#0a2235" stroke="#1FCAD3" strokeWidth="1.6" opacity="0.9" />
                <circle cx="319" cy="96" r="12" fill="#0a2235" stroke="#1FCAD3" strokeWidth="1.6" opacity="0.85" />
                <circle cx="309" cy="79" r="12" fill="#0a2235" stroke="#1FCAD3" strokeWidth="1.6" opacity="0.8" />
                <circle cx="309" cy="113" r="12" fill="#0a2235" stroke="#1FCAD3" strokeWidth="1.6" opacity="0.75" />
                {/* Gloss on top cocci */}
                <circle cx="304" cy="92" r="3.5" fill="white" opacity="0.18" />
                {/* Label-style: tiny "+" division planes */}
                <line x1="309" y1="67" x2="309" y2="126" stroke="#1FCAD3" strokeWidth="0.5" opacity="0.2" />
                <line x1="287" y1="96" x2="331" y2="96" stroke="#1FCAD3" strokeWidth="0.5" opacity="0.2" />

                {/* Small flagellated rod — bottom left */}
                <ellipse cx="83" cy="268" rx="23" ry="11" fill="#1FCAD3" opacity="0.7" transform="rotate(-38 83 268)" />
                <ellipse cx="83" cy="268" rx="19" ry="7.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" transform="rotate(-38 83 268)" />
                {/* Short flagellum */}
                <path d="M68 256 C60 245 53 233 43 231" stroke="#1FCAD3" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.6" />

                {/* Lone cocci bottom right */}
                <circle cx="312" cy="258" r="9" fill="#0a2235" stroke="#1FCAD3" strokeWidth="1.2" opacity="0.6" />
              </g>

              {/* ── m3: Spirochete + binary fission ── */}
              <g className="m3">
                {/* Spirochete — top left (helical bacterium like H. pylori) */}
                <path d="M78 118 C85 105 97 105 104 118 C111 131 123 131 130 118 C137 105 149 105 156 118"
                      stroke="#1FCAD3" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.85" />
                {/* End caps of spirochete */}
                <circle cx="78" cy="118" r="4" fill="#1FCAD3" opacity="0.75" />
                <circle cx="156" cy="118" r="3.5" fill="#1FCAD3" opacity="0.6" />

                {/* Binary fission — two daughter cells pinching apart (bottom right) */}
                <ellipse cx="282" cy="295" rx="21" ry="15" fill="url(#navyG)" stroke="#1FCAD3" strokeWidth="1.6" opacity="0.92" />
                <ellipse cx="314" cy="295" rx="19" ry="15" fill="url(#navyG)" stroke="#1FCAD3" strokeWidth="1.6" opacity="0.88" />
                {/* Constriction / division septum */}
                <path d="M298 281 C294 288 294 302 298 309" stroke="#1FCAD3" strokeWidth="1.2" fill="none" opacity="0.65" />
                {/* Gloss */}
                <circle cx="278" cy="289" r="5" fill="white" opacity="0.14" />

                {/* Small free-floating cocci — top centre-left */}
                <circle cx="176" cy="66" r="10" fill="url(#cyanG)" opacity="0.75" />
                <circle cx="176" cy="63" r="3.5" fill="white" opacity="0.28" />
              </g>

              {/* Drifting spores / metabolite particles */}
              <circle cx="148" cy="252" r="3" fill="#1FCAD3" opacity="0.85">
                <animate attributeName="cy" values="252;232;252" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="263" cy="157" r="3.5" fill="#0b1f33" stroke="#1FCAD3" strokeWidth="1" opacity="0.7">
                <animate attributeName="cy" values="157;177;157" dur="5.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="120" cy="200" r="2.5" fill="#1FCAD3" opacity="0.9">
                <animate attributeName="cx" values="120;140;120" dur="3.2s" repeatCount="indefinite" />
              </circle>
              {/* Pulsing spore (sporulation) */}
              <circle cx="244" cy="264" r="4.5" fill="#1FCAD3" opacity="0.35">
                <animate attributeName="r" values="4.5;8;4.5" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0.08;0.35" dur="3s" repeatCount="indefinite" />
              </circle>
              {/* Tiny released vesicle */}
              <circle cx="340" cy="190" r="5" fill="none" stroke="#1FCAD3" strokeWidth="1" opacity="0.45">
                <animate attributeName="r" values="5;9;5" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.45;0.1;0.45" dur="4s" repeatCount="indefinite" />
              </circle>

              <defs>
                <linearGradient id="coreG" x1="140" y1="167" x2="260" y2="233" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1FCAD3" stopOpacity="0.9" />
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
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(to bottom, transparent, #0b1f33)' }} />
      </section>

      {/* ── SCIENCE-DRIVEN SOLUTIONS ────────────────────────── */}
      <section style={{ background: '#0b1f33', padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ color: '#ffffff', marginBottom: '1rem' }}>Science-Driven Solutions</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.15rem' }}>Moving discoveries from the lab to meaningful clinical impact.</p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {[
              { to: '/atlas',      img: '/assets/images/kit.jpg',     title: 'Jivanu Atlas™',  badge: 'AVAILABLE NOW', desc: 'Personalized Microbiome Profiling Platform for individuals and clinicians.' },
              { to: '/pathobiome', img: '/assets/images/lab.png',     title: 'Pathobiome™',    badge: 'R&D',           desc: 'Predictive microbial diagnostics and targeted therapies.' },
              { to: '/rebiome',    img: '/assets/images/rebiome.jpg', title: 'ReBiome™',       badge: 'CLINICAL PHASE',desc: 'Microbiota Restoration Platform focused on FMT-based therapeutics.' },
              { to: '/novabiome',  img: '/assets/images/novabiome.jpg',title: 'NovaBiome™',    badge: 'R&D',           desc: 'Next-Generation Microbiome Therapeutics Platform.' },
            ].map(({ to, img, title, badge, desc }) => (
              <div key={to} className="feature-card" style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ height: '160px', overflow: 'hidden' }}>
                  <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ padding: '1.75rem 1.5rem 2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.2rem' }}>{title}</h3>
                    <span style={{ fontSize: '0.6rem', padding: '3px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>{badge}</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem', minHeight: '60px' }}>{desc}</p>
                  <Link to={to} style={{ color: '#1FCAD3', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem' }}>Explore Platform →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
