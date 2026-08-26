import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaLeaf,
  FaUtensils,
  FaStar,
  FaChevronRight,
  FaTruck,
  FaAward,
  FaShoppingCart,
} from "react-icons/fa";
import Card from "../components/Card";

function Home({ products = [], addToCart, cart = [], setSearch, setCategory, onCardClick }) {
  const navigate = useNavigate();

  // Show first 4 products as featured items
  const featuredProducts = Array.isArray(products) ? products.slice(0, 4) : [];

  return (
    <div className="home-page">
      {/* HERO BANNER */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-tag">🔥 Craving Something Delicious?</span>
          <h1 className="hero-title">
            Gourmet Meals <span className="highlight">Delivered Fast</span> To Your Doorstep
          </h1>
          <p className="hero-subtitle">
            Experience hand-crafted meals prepared by top chefs using 100% fresh, locally sourced ingredients. Fast, hot, and satisfying every single time.
          </p>

          <div className="hero-actions">
            <button className="btn-primary-hero" onClick={() => navigate("/menu")}>
              Explore Full Menu <FaArrowRight />
            </button>
            <button className="btn-secondary-hero" onClick={() => navigate("/about")}>
              Our Story
            </button>
          </div>

          <div className="hero-badges">
            <div className="hero-badge-item">
              <FaUtensils className="badge-icon" />
              <span>30 Min Express Delivery</span>
            </div>
            <div className="hero-badge-item">
              <FaLeaf className="badge-icon" />
              <span>100% Fresh Ingredients</span>
            </div>
            <div className="hero-badge-item">
              <FaStar className="badge-icon" />
              <span>4.9★ Customer Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* B. POPULAR DISHES */}
      <section className="featured-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <span className="section-subtitle">CHEF'S FAVORITES</span>
            <h2 className="section-title">Popular Dishes Right Now</h2>
          </div>
          <button className="view-all-btn" onClick={() => { if(setCategory) setCategory("all"); if(setSearch) setSearch(""); navigate("/menu"); }}>
            View All Dishes →
          </button>
        </div>

        <div className="container">
          {featuredProducts.map((product) => (
            <Card
              key={product.id || product._id}
              image={product.image}
              title={product.name}
              product={product}
              addToCart={addToCart}
              cart={cart}
              onCardClick={onCardClick}
              priority={true}
            />
          ))}
        </div>
      </section>

      {/* D. WHY FOODIERUSH */}
      <section className="values-section">
        <div className="section-header center">
          <span className="section-subtitle">OUR ADVANTAGES</span>
          <h2 className="section-title">Why Choose FoodieRush?</h2>
        </div>

        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon"><FaLeaf /></div>
            <h3>Fresh & Quality</h3>
            <p>We bring carefully prepared food made with quality ingredients.</p>
          </div>

          <div className="value-card">
            <div className="value-icon"><FaTruck /></div>
            <h3>Fast Delivery</h3>
            <p>Get your favorite meals delivered quickly and reliably.</p>
          </div>

          <div className="value-card">
            <div className="value-icon"><FaUtensils /></div>
            <h3>Easy Ordering</h3>
            <p>Search, choose, customize and order with just a few clicks.</p>
          </div>

          <div className="value-card">
            <div className="value-icon"><FaAward /></div>
            <h3>Secure & Simple</h3>
            <p>A smooth and secure ordering experience from start to finish.</p>
          </div>
        </div>
      </section>

      {/* E. HOW IT WORKS */}
      <section className="how-it-works">
        <div className="section-header center">
          <span className="section-subtitle">SIMPLE STEPS</span>
          <h2 className="section-title">How FoodieRush Works</h2>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon-wrapper">
              <FaUtensils />
            </div>
            <h3>Choose Your Food</h3>
            <p>Browse delicious dishes.</p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon-wrapper">
              <FaShoppingCart />
            </div>
            <h3>Add To Cart</h3>
            <p>Select your favorites.</p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon-wrapper">
              <FaAward />
            </div>
            <h3>Place Your Order</h3>
            <p>Review your cart and continue.</p>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <div className="step-icon-wrapper">
              <FaTruck />
            </div>
            <h3>Enjoy Your Meal</h3>
            <p>Sit back and enjoy your food.</p>
          </div>
        </div>
      </section>

      {/* F. CTA SECTION */}
      <section className="cta-banner">
        <div className="cta-content">
          <span className="cta-subtitle">READY TO ORDER?</span>
          <h2>Craving Something Delicious?</h2>
          <p>Discover your next favorite meal with FoodieRush.</p>
          <button className="cta-btn" onClick={() => { if(setCategory) setCategory("all"); if(setSearch) setSearch(""); navigate("/menu"); }}>
            Explore Menu <FaChevronRight />
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
