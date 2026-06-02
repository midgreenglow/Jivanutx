import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="grid footer-grid">
          <div>
            <Link to="/" className="footer-logo-link" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>
              <svg
                viewBox="0 0 320 80"
                style={{ width: 'clamp(160px, 16vw, 220px)', height: 'auto', display: 'block', overflow: 'visible' }}
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Jivanu — Microbes to Medicines"
              >
                <text
                  x="0" y="56"
                  fontFamily="'Nunito', 'Outfit', sans-serif"
                  fontWeight="900"
                  fontSize="60"
                  fill="#1FCAD3"
                >Jivanu</text>
                <text
                  x="4" y="75"
                  fontFamily="'Inter', sans-serif"
                  fontWeight="400"
                  fontSize="13.5"
                  fill="rgba(200,210,220,0.75)"
                  letterSpacing="0.5"
                >Microbes to Medicines</text>
              </svg>
            </Link>
          </div>

          <div className="footer-links">
            <h4>Platforms</h4>
            <ul>
              <li><Link to="/atlas">Jivanu Atlas™</Link></li>
              <li><Link to="/rebiome">ReBiome™</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li><Link to="/team">Team</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
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
