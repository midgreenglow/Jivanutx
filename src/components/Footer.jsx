import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="grid footer-grid">
          <div>
            <Link to="/" className="footer-logo-link">
              <img
                src="/assets/images/Jivanu_Logo.png"
                alt="Jivanu Logo"
                style={{ maxWidth: '280px', marginBottom: '1.5rem' }}
              />
            </Link>
          </div>

          <div className="footer-links">
            <h4>Platforms</h4>
            <ul>
              <li>
                <Link to="/atlas">Jivanu Atlas™</Link>
              </li>
              <li>
                <Link to="/rebiome">ReBiome™</Link>
              </li>
              <li>
                <Link to="/novabiome">NovaBiome™</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li>
                <Link to="/team">Team</Link>
              </li>
              <li>
                <Link to="/careers">Careers</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link to="/refund">Refund Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Jivanu Therapeutics Pvt Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
