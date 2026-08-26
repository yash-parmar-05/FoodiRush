import { useEffect } from "react";
import {
  FaShoppingCart,
  FaTimes,
  FaStar,
  FaUtensils,
  FaClock,
  FaFire,
  FaClipboardList,
} from "react-icons/fa";

import "./ProductDetails.css";

function ProductDetails({ product, onClose, addToCart, cart }) {
  // Escape key થી modal close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Modal open હોય ત્યારે background scroll બંધ
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Product ન હોય તો કશું બતાવવું નહીં
  if (!product) return null;

  // Product cart item lookup with MongoDB ID support
  const targetId = product._id || product.id;
  const cartItem = cart?.find((item) => (item._id || item.id) === targetId);

  // Add to cart
  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  return (
    <div
      className="product-details-overlay"
      onClick={onClose}
    >
      <div
        className="product-details-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close Button */}
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>

        <div className="product-details-content">

          {/* ================= LEFT SIDE ================= */}
          <div className="product-details-image-section">

            {/* Bestseller */}
            {product.isBestseller && (
              <span className="bestseller-badge">
                🔥 Bestseller
              </span>
            )}

            <img
              src={product.image}
              alt={product.name}
              className="product-details-img"
              decoding="async"
              fetchPriority="high"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80";
              }}
            />
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div className="product-details-info-section">

            {/* Scrollable Inner Content */}
            <div className="product-details-scroll-content">

              {/* Product Name */}
              <h1 className="product-details-title">
                {product.name}
              </h1>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="short-description">
                  {product.shortDescription}
                </p>
              )}

              {/* Cuisine • Course • Rating */}
              <div className="product-details-meta-line">
                {product.cuisine && <span>{product.cuisine}</span>}
                {product.cuisine && product.mealType && <span className="meta-dot">•</span>}
                {product.mealType && <span>{product.mealType}</span>}
                {(product.cuisine || product.mealType) && product.rating && <span className="meta-dot">•</span>}
                {product.rating && (
                  <span className="rating-info">
                    <FaStar className="star-icon" /> {product.rating} {product.reviewCount && ` (${product.reviewCount} reviews)`}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="product-details-price">
                ₹{product.price}
              </div>

              {/* ================= DESCRIPTION ================= */}
              {product.description && (
                <div className="details-section">
                  <h3>Description</h3>
                  <p className="details-text">
                    {product.description}
                  </p>
                </div>
              )}

              {/* ================= SPECS ================= */}
              {(product.calories ||
                product.prepTime ||
                product.cookTime ||
                product.totalTime ||
                product.servings) && (
                <div className="details-specs-grid">
                  {/* Calories */}
                  {product.calories && (
                    <div className="spec-item">
                      <FaFire className="spec-icon" />
                      <div className="spec-info">
                        <span className="spec-label">Calories</span>
                        <span className="spec-value">{product.calories} kcal</span>
                      </div>
                    </div>
                  )}

                  {/* Time */}
                  {(product.prepTime || product.cookTime || product.totalTime) && (
                    <div className="spec-item">
                      <FaClock className="spec-icon" />
                      <div className="spec-info">
                        <span className="spec-label">Time</span>
                        <span className="spec-value">
                          {[
                            product.prepTime && `Prep: ${product.prepTime}m`,
                            product.cookTime && `Cook: ${product.cookTime}m`,
                            product.totalTime && `Total: ${product.totalTime}m`,
                          ]
                            .filter(Boolean)
                            .join(" / ")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Servings */}
                  {product.servings && (
                    <div className="spec-item">
                      <FaClipboardList className="spec-icon" />
                      <div className="spec-info">
                        <span className="spec-label">Servings</span>
                        <span className="spec-value">{product.servings} people</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= FOOD INFORMATION ================= */}
              {(product.dietaryInfo?.length > 0 || product.spiceLevel) && (
                <div className="details-section">
                  <h3>Food Information</h3>
                  <div className="food-info-line">
                    {product.dietaryInfo?.map((info, index) => (
                      <span key={index} className="dietary-info-item">
                        🌱 {info}
                      </span>
                    ))}
                    {product.dietaryInfo?.length > 0 && product.spiceLevel && product.spiceLevel !== "None" && (
                      <span className="meta-dot">•</span>
                    )}
                    {product.spiceLevel && product.spiceLevel !== "None" && (
                      <span className="spice-level-item">
                        🌶️ {product.spiceLevel}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* ================= INGREDIENTS ================= */}
              {Array.isArray(product.ingredients) && product.ingredients.length > 0 && (
                <div className="details-section">
                  <h3>Ingredients</h3>
                  <ul className="details-list">
                    {product.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ================= ALLERGENS ================= */}
              {Array.isArray(product.allergens) && product.allergens.length > 0 && (
                <div className="details-section">
                  <h3>Allergens</h3>
                  <div className="allergens-text">
                    {product.allergens.join(", ")}
                  </div>
                </div>
              )}

              {/* ================= TAGS ================= */}
              {Array.isArray(product.tags) && product.tags.length > 0 && (
                <div className="details-section">
                  <h3>Tags</h3>
                  <div className="tags-text">
                    {product.tags.map((tag) => `#${tag}`).join(", ")}
                  </div>
                </div>
              )}

            </div>

            {/* Sticky Action Footer */}
            <div className="details-sticky-footer">

              {product.availability && (
                <div className="availability">
                  <span
                    className={
                      product.availability === "Available"
                        ? "available"
                        : "not-available"
                    }
                  >
                    ● {product.availability}
                  </span>
                </div>
              )}

              <div className="details-action-section">
                <button
                  className={`add-to-cart-details-btn ${cartItem ? "added" : ""}`}
                  onClick={handleAddToCart}
                >
                  <FaShoppingCart />
                  {cartItem
                    ? `Added to Cart (${cartItem.quantity})`
                    : "Add to Cart"}
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;