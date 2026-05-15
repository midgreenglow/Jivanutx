import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'lucide-react';

const TOKEN_KEY = 'jivanu_token';

function buildClass({ isActive }) {
  return isActive ? 'active' : '';
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem(TOKEN_KEY));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const navLinks = useMemo(
    () => [
      { to: '/', label: 'Home', end: true },
      { to: '/atlas', label: 'Jivanu Atlas™' },
      { to: '/pathobiome', label: 'Pathobiome™' },
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

  useEffect(() => {
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setHasToken(false);
    setDropdownOpen(false);
    closeMobile();
    navigate('/signin');
  };

  return (
    <header className="site-header">
      <div className="container flex justify-between items-center">
        <Link to="/" className="logo-container" onClick={closeMobile}>
          <div className="logo">Jivanu<span>.</span></div>
          <div className="logo-tagline">Microbes to Medicine</div>
        </Link>

        <nav className="flex items-center">
          {/* Desktop-only nav links */}
          <div className="nav-links flex items-center">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={buildClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* User icon — desktop only, shows when logged in */}
          {hasToken && (
            <div className="user-dropdown desktop-only-user" ref={dropdownRef}>
              <button
                className="user-icon-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label="Account menu"
              >
                <User size={20} strokeWidth={2} />
              </button>
              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <NavLink to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    My Dashboard
                  </NavLink>
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger — always visible on all screen sizes */}
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
              {/* Theme toggle lives inside the menu */}
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
            <NavLink to="/team" className="mobile-link" onClick={closeMobile}>Team</NavLink>
            <NavLink to="/careers" className="mobile-link" onClick={closeMobile}>Careers</NavLink>
            <NavLink to="/contact" className="mobile-link" onClick={closeMobile}>Contact</NavLink>
            <NavLink to="/evidence" className="mobile-link" onClick={closeMobile}>Clinical Evidence</NavLink>

            <div className="mobile-divider" />
            {hasToken ? (
              <>
                <NavLink to="/dashboard" className="mobile-link" onClick={closeMobile}>
                  My Dashboard
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
