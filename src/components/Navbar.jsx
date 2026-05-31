import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOKEN_KEY = 'jivanu_token';

function buildClass({ isActive }) {
  return isActive ? 'active' : '';
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme]           = useState(() => localStorage.getItem('theme') || 'dark');
  const [hasToken, setHasToken]     = useState(() => !!localStorage.getItem(TOKEN_KEY));
  const navigate = useNavigate();
  const headerRef = useRef(null);

  const navLinks = useMemo(
    () => [
      { to: '/',         label: 'Home',              end: true },
      { to: '/atlas',    label: 'Jivanu Atlas™'               },
      { to: '/rebiome',  label: 'ReBiome™'                    },
      { to: '/evidence', label: 'Clinical Evidence'            },
    ],
    []
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  /* Navbar entrance + scroll-shrink effect */
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    /* Initial entrance: slide down + fade in */
    gsap.fromTo(
      header,
      { y: -72, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', delay: 0.1 },
    );

    /* Scroll-shrink: compress padding and add shadow as user scrolls */
    const st = ScrollTrigger.create({
      start: 80,
      end: 99999,
      onUpdate: (self) => {
        if (self.isActive) {
          header.classList.add('navbar-scrolled');
        } else {
          header.classList.remove('navbar-scrolled');
        }
      },
    });

    return () => st.kill();
  }, []);

  useEffect(() => {
    const onStorage = () => setHasToken(!!localStorage.getItem(TOKEN_KEY));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setHasToken(false);
    closeMobile();
    navigate('/signin');
  };

  return (
    <header ref={headerRef} className="site-header">
      <div className="container flex justify-between items-center">
        <Link to="/" className="logo-container" onClick={closeMobile}>
          <div className="logo">Jivanu<span>.</span></div>
          <div className="logo-tagline">Microbes to Medicine</div>
        </Link>

        <nav className="flex items-center">
          {/* Desktop nav links */}
          <div className="nav-links flex items-center">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={buildClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Hamburger — always visible */}
          <button
            className={`hamburger-menu ${mobileOpen ? 'active' : ''}`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>

          {/* Slide-out overlay */}
          <div
            className={`mobile-menu-overlay ${mobileOpen ? 'active' : ''}`}
            onClick={(e) => { if (e.target === e.currentTarget) closeMobile(); }}
          >
            <div className="mobile-signin-row">
              {hasToken ? (
                <span className="mobile-user-label">
                  <User size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  My Account
                </span>
              ) : (
                <NavLink to="/signin" className="mobile-link signin-link" onClick={closeMobile}>
                  Sign In
                </NavLink>
              )}
              {/* Theme toggle */}
              <label className="theme-switch compact">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  aria-label="Toggle dark mode"
                  onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                />
                <span className="theme-slider"><span className="theme-knob" /></span>
              </label>
            </div>

            <div className="mobile-section-label">Platforms</div>
            {navLinks.slice(1).map((link) => (
              <NavLink key={link.to} to={link.to} className="mobile-link" onClick={closeMobile}>
                {link.label}
              </NavLink>
            ))}

            <div className="mobile-section-label" style={{ marginTop: '0.5rem' }}>Company</div>
            <NavLink to="/team"     className="mobile-link" onClick={closeMobile}>Team</NavLink>
            <NavLink to="/careers"  className="mobile-link" onClick={closeMobile}>Careers</NavLink>
            <NavLink to="/contact"  className="mobile-link" onClick={closeMobile}>Contact</NavLink>
            <NavLink to="/evidence" className="mobile-link" onClick={closeMobile}>Clinical Evidence</NavLink>

            <div className="mobile-divider" />
            {hasToken ? (
              <>
                <NavLink to="/account" className="mobile-link" onClick={closeMobile}>
                  My Account
                </NavLink>
                <button className="mobile-logout" type="button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/signup" className="mobile-link" onClick={closeMobile}>
                Create Account
              </NavLink>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
