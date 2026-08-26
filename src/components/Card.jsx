import React, { useState } from "react";
import "./Card.css";

// Helper to optimize image URLs for mobile bandwidth & speed
function getOptimizedImageUrl(url, width = 380, quality = 75) {
  if (!url || typeof url !== "string") {
    return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=380&auto=format&fit=crop&q=75";
  }
  if (url.includes("images.unsplash.com")) {
    try {
      const u = new URL(url);
      u.searchParams.set("w", width.toString());
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      u.searchParams.set("q", quality.toString());
      return u.toString();
    } catch {
      return url;
    }
  }
  return url;
}

function getSrcSet(url) {
  if (!url || !url.includes("images.unsplash.com")) return undefined;
  return `${getOptimizedImageUrl(url, 260, 70)} 260w, ${getOptimizedImageUrl(url, 380, 75)} 380w, ${getOptimizedImageUrl(url, 540, 80)} 540w`;
}

function Card({ image, title, addToCart, product, cart = [], onCardClick, priority = false }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const targetId = product._id || product.id;
  const cartItem = cart.find((item) => (item._id || item.id) === targetId);

  const optimizedSrc = getOptimizedImageUrl(image, 380, 75);
  const srcSet = getSrcSet(image);

  return (
    <div
      className="card"
      onClick={() => onCardClick?.(product)}
      style={{ cursor: "pointer" }}
    >
      <div className={`card-image-wrapper ${!imageLoaded ? "is-loading" : ""}`}>
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes="(max-width: 580px) 48vw, (max-width: 992px) 33vw, 280px"
          alt={title}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`card-product-img ${imageLoaded ? "loaded" : ""}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=380&auto=format&fit=crop&q=75";
            setImageLoaded(true);
          }}
        />
        {product.cuisine && (
          <span className="card-cuisine-badge">{product.cuisine}</span>
        )}
      </div>

      <div className="card-body">
        <div className="card-info">
          <h2 className="card-title">{title}</h2>
          <p className="card-price">₹{product.price}</p>
        </div>

        <button
          type="button"
          className={`cart-btn ${cartItem ? "cart-btn--added" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          aria-pressed={Boolean(cartItem)}
          aria-label={cartItem ? `Added ${cartItem.quantity}` : "Add to cart"}
        >
          {cartItem ? (
            <span className="btn-content">
              <span className="btn-check">✓</span> Added ({cartItem.quantity})
            </span>
          ) : (
            <span className="btn-content">
              <span className="btn-icon">🛒</span> Add to Cart
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default React.memo(Card);