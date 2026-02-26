import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

const TOKEN_KEY = 'jivanu_token';

function buildClass({ isActive }) {
  return isActive ? 'active' : '';
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem(TOKEN_KEY));
  const navigate = useNavigate();

  const navLinks = useMemo(
    () => [
      { to: '/', label: 'Home', end: true },
      { to: '/atlas', label: 'Jivanu Atlas™' },
      { to: '/rebiome', label: 'ReBiome™' },
      { to: '/novabiome', label: 'NovaBiome™' }
    ],
    []
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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
    <header className="site-header">
      <div className="container flex justify-between items-center">
        <Link to="/" className="logo-container" onClick={closeMobile}>
          <div className="logo">
            Jivanu<span>.</span>
          </div>
          <div className="logo-tagline">Microbes to Medicine</div>
        </Link>

        <nav className="flex items-center">
          <div className="nav-links flex items-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={buildClass}
                onClick={closeMobile}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <button
            className={`hamburger-menu ${mobileOpen ? 'active' : ''}`}
            id="hamburger-menu"
            aria-label="Menu"
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>

          <div
            className={`mobile-menu-overlay ${mobileOpen ? 'active' : ''}`}
            id="mobile-menu-overlay"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeMobile();
            }}
          >
            <div className="mobile-signin-row">
              <NavLink to="/signin" className="mobile-link signin-link" onClick={closeMobile}>
                Sign In
              </NavLink>
              <label className="theme-switch compact">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  aria-label="Toggle dark mode"
                  onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')}
                />
                <span className="theme-slider">
                  <span className="theme-knob" />
                </span>
              </label>
            </div>

            <div className="mobile-section-label mobile-only">Platforms</div>
            {navLinks.slice(1).map((link) => (
              <NavLink key={link.to} to={link.to} className="mobile-link mobile-only" onClick={closeMobile}>
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/team" className="mobile-link" onClick={closeMobile}>
              Team
            </NavLink>
            <NavLink to="/careers" className="mobile-link" onClick={closeMobile}>
              Careers
            </NavLink>
            <NavLink to="/contact" className="mobile-link" onClick={closeMobile}>
              Contact
            </NavLink>
            <NavLink to="/evidence" className="mobile-link" onClick={closeMobile}>
              Clinical Evidence
            </NavLink>
            <div className="mobile-divider" />
            {hasToken ? (
              <button className="mobile-logout" id="mobile-logout" type="button" onClick={handleLogout}>
                Logout
              </button>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
