import { useNavigate } from "react-router-dom";
import { FaInstagram, FaFacebook, FaTwitter, FaHeart } from "react-icons/fa";

function Footer({ setCategory }) {
  const navigate = useNavigate();

  const handleCategoryClick = (cat) => {
    if (setCategory) setCategory(cat);
    navigate("/menu");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageClick = (page) => {
    navigate(`/${page}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* BRAND COLUMN */}
          <div className="footer-col brand-col">
            <div className="footer-brand" onClick={() => handlePageClick("home")}>
              🍔 <span>FoodieRush</span>
            </div>
            <p className="footer-desc">
              Good food. Great moments. Delivering fresh, high-quality chef-crafted dishes directly to you.
            </p>
            <div className="social-links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-icon">
                <FaInstagram />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-icon">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X" className="social-icon">
                <FaTwitter />
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-col">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><button onClick={() => handlePageClick("home")}>Home</button></li>
              <li><button onClick={() => handlePageClick("menu")}>Menu</button></li>
              <li><button onClick={() => handlePageClick("about")}>About</button></li>
            </ul>
          </div>

          {/* MENU CATEGORIES */}
          <div className="footer-col">
            <h4 className="footer-title">Menu</h4>
            <ul className="footer-links">
              <li><button onClick={() => handleCategoryClick("Indian")}>Indian</button></li>
              <li><button onClick={() => handleCategoryClick("Italian")}>Italian</button></li>
              <li><button onClick={() => handleCategoryClick("Chinese")}>Chinese</button></li>
              <li><button onClick={() => handleCategoryClick("Dessert")}>Desserts</button></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div className="footer-col">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); handlePageClick("about"); }}>Contact</a></li>
              <li><a href="#help" onClick={(e) => e.preventDefault()}>Help</a></li>
              <li><a href="#faq" onClick={(e) => e.preventDefault()}>FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 FoodieRush. All rights reserved.</p>
          <p className="made-with">Crafted with <FaHeart style={{ color: "#f05e0a" }} /> for food lovers.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
