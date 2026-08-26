import { useNavigate } from "react-router-dom";
import { FaHeart, FaUtensils, FaArrowRight, FaAward, FaTruck, FaLeaf, FaSmile } from "react-icons/fa";

function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* A. ABOUT HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-tag"><FaHeart /> Our Story</span>
          <h1 className="about-title">Food That Brings People Together.</h1>
          <p className="about-subtitle">
            FoodieRush makes discovering and ordering great food simple, convenient and enjoyable.
          </p>
        </div>
      </section>

      {/* B. ABOUT FOODIERUSH */}
      <section className="story-section">
        <div className="story-grid">
          <div className="story-text">
            <span className="section-subtitle">WHO WE ARE</span>
            <h2>About FoodieRush</h2>
            <p>
              FoodieRush is a modern food ordering platform designed to help users discover delicious food and order it easily. We bring culinary craftsmanship together with convenient technology to offer a seamless dining service right from the comfort of your home.
            </p>
            <p>
              We focus on preparing high-quality meals using fresh, locally sourced ingredients and delivering them hot and fresh to your doorstep.
            </p>
          </div>
          <div className="story-image-card">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
              alt="FoodieRush Kitchen"
            />
          </div>
        </div>
      </section>

      {/* C. OUR MISSION */}
      <section className="about-mission-section">
        <div className="mission-box">
          <span className="mission-tag">OUR MISSION</span>
          <h2>Our Mission</h2>
          <p className="mission-text">
            "Our mission is to make great food easier to discover, easier to order, and more enjoyable to experience."
          </p>
        </div>
      </section>

      {/* D. WHY CHOOSE FOODIERUSH */}
      <section className="values-section">
        <div className="section-header center">
          <span className="section-subtitle">THE FOODIERUSH DIFFERENCE</span>
          <h2 className="section-title">Why Choose FoodieRush?</h2>
        </div>

        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon"><FaLeaf /></div>
            <h3>Quality Food</h3>
            <p>Every dish is made using fresh ingredients sourced from local farms and trusted partners.</p>
          </div>

          <div className="value-card">
            <div className="value-icon"><FaUtensils /></div>
            <h3>Simple Ordering</h3>
            <p>Easily browse our menu, search for your favorites, and place your order in seconds.</p>
          </div>

          <div className="value-card">
            <div className="value-icon"><FaTruck /></div>
            <h3>Fast & Convenient</h3>
            <p>We pack and deliver your food quickly so you can enjoy your meals hot and fresh.</p>
          </div>

          <div className="value-card">
            <div className="value-icon"><FaSmile /></div>
            <h3>Customer First</h3>
            <p>We are dedicated to providing support and ensuring a great food ordering experience.</p>
          </div>
        </div>
      </section>

      {/* E. FINAL CTA */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready to Find Your Next Favorite Dish?</h2>
          <p>Explore our menu and discover something delicious today.</p>
          <button className="cta-btn" onClick={() => navigate("/menu")}>
            Explore Menu <FaArrowRight />
          </button>
        </div>
      </section>
    </div>
  );
}

export default About;
