import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

function Cart({
  cart,
  isOpen,
  onClose,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  totalItems,
  totalPrice,
  user,
  onOpenAuthModal,
}) {
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    onClose();
    if (!user) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    navigate("/checkout");
  };
  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      ></div>

      <aside
        className={`cart-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="cart-header">
          <div>
            <p className="cart-eyebrow">Your order</p>
            <h2>Shopping Cart</h2>
          </div>

          <button className="close-cart-btn" onClick={onClose} aria-label="Close cart">
            <FaTimes size={16} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <p>Your cart is empty</p>
            <span>Add some delicious food to get started!</span>
          </div>
        ) : (
          <div className="cart-items">
            {cart.map((product) => (
              <div className="cart-item" key={product.id}>
                <img src={product.image} alt={product.name} />

                <div className="cart-details">
                  <div className="cart-details-top">
                    <h3>{product.name}</h3>
                    <p>₹{product.price}</p>
                  </div>

                  <div className="cart-actions">
                    <div className="quantity-controls">
                      <button onClick={() => decreaseQuantity(product.id)}>
                        −
                      </button>
                      <span>{product.quantity}</span>
                      <button onClick={() => increaseQuantity(product.id)}>
                        +
                      </button>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cart-summary">
          <div className="summary-row">
            <span className="summary-label">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
            <span className="summary-total">₹{totalPrice}</span>
          </div>
          <button
            className="checkout-btn"
            disabled={cart.length === 0}
            onClick={handleCheckoutClick}
          >
            Checkout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Cart;