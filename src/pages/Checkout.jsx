import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI, authAPI } from "../services/api";
import "./Checkout.css";

function Checkout({ cart = [], totalItems = 0, totalPrice = 0, clearCart, activeOrderId, setActiveOrderId, user }) {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(() => {
    try {
      const savedUser = user || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null);
      if (savedUser) {
        return {
          name: savedUser.name || "",
          email: savedUser.email || "",
          phone: savedUser.phone || "",
        };
      }
      const savedCheckoutCustomer = localStorage.getItem("checkoutCustomer");
      if (savedCheckoutCustomer) {
        return JSON.parse(savedCheckoutCustomer);
      }
    } catch (e) {}
    return { name: "", email: "", phone: "" };
  });

  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    try {
      const savedUser = user || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null);
      if (savedUser && (savedUser.address || savedUser.city || savedUser.state || savedUser.pincode)) {
        return {
          address: savedUser.address || "",
          city: savedUser.city || "",
          state: savedUser.state || "",
          pincode: savedUser.pincode || "",
        };
      }
      const savedAddress = localStorage.getItem("checkoutDeliveryAddress");
      if (savedAddress) {
        return JSON.parse(savedAddress);
      }
    } catch (e) {}
    return {
      address: "",
      city: "",
      state: "",
      pincode: "",
    };
  });

  // Fetch latest profile from backend if user exists to ensure up-to-date address
  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;
      try {
        const res = await authAPI.getMe();
        const u = res.data?.user;
        if (u) {
          localStorage.setItem("user", JSON.stringify(u));
          setCustomer((prev) => ({
            name: prev.name || u.name || "",
            email: prev.email || u.email || "",
            phone: prev.phone || u.phone || "",
          }));
          if (u.address || u.city || u.state || u.pincode) {
            setDeliveryAddress((prev) => ({
              address: prev.address || u.address || "",
              city: prev.city || u.city || "",
              state: prev.state || u.state || "",
              pincode: prev.pincode || u.pincode || "",
            }));
          }
        }
      } catch (e) {
        // Silently fallback to current values
      }
    };
    loadProfile();
  }, []);

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCustomerChange = (event) => {
    const { name, value } = event.target;
    setCustomer((prev) => {
      const updated = { ...prev, [name]: value };
      try {
        localStorage.setItem("checkoutCustomer", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setDeliveryAddress((prev) => {
      const updated = { ...prev, [name]: value };
      try {
        localStorage.setItem("checkoutDeliveryAddress", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!cart || cart.length === 0) {
      setError("Your cart is empty. Please add products before placing an order.");
      return;
    }

    if (!customer.name.trim() || !customer.email.trim() || !customer.phone.trim()) {
      setError("Please fill in all customer contact details.");
      return;
    }

    if (
      !deliveryAddress.address.trim() ||
      !deliveryAddress.city.trim() ||
      !deliveryAddress.state.trim() ||
      !deliveryAddress.pincode.trim()
    ) {
      setError("Please fill in all delivery address fields.");
      return;
    }

    if (paymentMethod !== "Cash on Delivery") {
      setError("Online Payment is currently unavailable. Please select Cash on Delivery.");
      return;
    }

    let items;
    try {
      items = cart.map((item) => {
        const productId = item._id || item.id;
        if (!productId) {
          throw new Error(`Missing MongoDB ID for product: ${item.name}`);
        }
        return {
          product: productId,
          name: item.name,
          image: item.image || "",
          price: Number(item.price),
          quantity: Number(item.quantity),
        };
      });
    } catch (err) {
      console.error("Cart item mapping error:", err);
      setError(err.message || "Invalid cart item data.");
      return;
    }

    const calculatedTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const currentActiveOrderId = activeOrderId || localStorage.getItem("activeOrderId");

    const orderData = {
      items,
      totalAmount: calculatedTotal,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
      },
      shippingAddress: {
        fullName: customer.name.trim(),
        address: deliveryAddress.address.trim(),
        city: deliveryAddress.city.trim(),
        state: deliveryAddress.state.trim(),
        pincode: deliveryAddress.pincode.trim(),
        phone: customer.phone.trim(),
      },
      deliveryAddress: {
        address: deliveryAddress.address.trim(),
        city: deliveryAddress.city.trim(),
        state: deliveryAddress.state.trim(),
        pincode: deliveryAddress.pincode.trim(),
      },
      paymentMethod,
      ...(currentActiveOrderId ? { activeOrderId: currentActiveOrderId } : {}),
    };

    setSubmitting(true);

    try {
      // Save customer and address permanently for instant 1-click repeat orders
      try {
        localStorage.setItem("checkoutCustomer", JSON.stringify(customer));
        localStorage.setItem("checkoutDeliveryAddress", JSON.stringify(deliveryAddress));
      } catch (e) {}

      const response = await orderAPI.create(orderData);
      const data = response.data;

      // Order created successfully
      if (clearCart && typeof clearCart === "function") {
        clearCart();
      }
      localStorage.removeItem("activeOrderId");
      if (setActiveOrderId) setActiveOrderId(null);

      navigate("/order-success", {
        state: {
          order: data.order,
        },
      });
    } catch (err) {
      console.error("Checkout submission error:", err);
      setError(err.message || "Failed to place order. Please verify backend server is running.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious food before proceeding to checkout.</p>
          <button
            type="button"
            className="checkout-back-btn"
            onClick={() => navigate("/menu")}
          >
            Browse Menu
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        {/* HEADER */}
        <div className="checkout-header">
          <div>
            <p className="checkout-eyebrow">Complete your order</p>
            <h1>Checkout</h1>
            <p>Enter your details and delivery information to place your order.</p>
          </div>
          <button
            type="button"
            className="back-to-menu-btn"
            onClick={() => navigate("/menu")}
          >
            ← Continue Shopping
          </button>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="checkout-error-banner" style={{ marginBottom: "24px" }}>
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <div className="checkout-layout">
          {/* LEFT SIDE: FORM */}
          <form className="checkout-form" onSubmit={handleSubmit}>
            {/* 01: CUSTOMER INFORMATION */}
            <section className="checkout-card">
              <div className="checkout-section-title">
                <span>01</span>
                <div>
                  <h2>Customer Information</h2>
                  <p>Tell us who is placing the order.</p>
                </div>
              </div>
              <div className="checkout-grid">
                <div className="checkout-field checkout-full">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={customer.name}
                    onChange={handleCustomerChange}
                    required
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={customer.email}
                    onChange={handleCustomerChange}
                    required
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={customer.phone}
                    onChange={handleCustomerChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* 02: DELIVERY ADDRESS */}
            <section className="checkout-card">
              <div className="checkout-section-title">
                <span>02</span>
                <div>
                  <h2>Delivery Address</h2>
                  <p>Where should we deliver your order?</p>
                </div>
              </div>
              <div className="checkout-grid">
                <div className="checkout-field checkout-full">
                  <label htmlFor="address">Full Address</label>
                  <textarea
                    id="address"
                    name="address"
                    placeholder="House / Flat / Street / Area"
                    value={deliveryAddress.address}
                    onChange={handleAddressChange}
                    rows="4"
                    required
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Surat"
                    value={deliveryAddress.city}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="Gujarat"
                    value={deliveryAddress.state}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    placeholder="395001"
                    value={deliveryAddress.pincode}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* 03: PAYMENT METHOD */}
            <section className="checkout-card">
              <div className="checkout-section-title">
                <span>03</span>
                <div>
                  <h2>Payment Method</h2>
                  <p>Select your preferred payment method.</p>
                </div>
              </div>
              <div className="payment-options">
                <label
                  className={`payment-option ${
                    paymentMethod === "Cash on Delivery" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === "Cash on Delivery"}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  />
                  <div>
                    <strong>Cash on Delivery</strong>
                    <span>Pay when your order arrives.</span>
                  </div>
                </label>
                <label
                  className={`payment-option ${
                    paymentMethod === "Online Payment" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online Payment"
                    checked={paymentMethod === "Online Payment"}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  />
                  <div>
                    <strong>Online Payment</strong>
                    <span>Online payment will be available soon.</span>
                  </div>
                </label>
              </div>
            </section>

            <button
              type="submit"
              className="place-order-btn"
              disabled={submitting}
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          {/* RIGHT SIDE: ORDER SUMMARY */}
          <aside className="checkout-summary">
            <div className="summary-card">
              <div className="summary-header">
                <div>
                  <p>Your order</p>
                  <h2>Order Summary</h2>
                </div>
                <span>
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="summary-products">
                {cart.map((product) => (
                  <div
                    className="summary-product"
                    key={product._id || product.id}
                  >
                    <img src={product.image} alt={product.name} />
                    <div className="summary-product-info">
                      <h3>{product.name}</h3>
                      <p>
                        ₹{product.price} × {product.quantity}
                      </p>
                    </div>
                    <strong>₹{product.price * product.quantity}</strong>
                  </div>
                ))}
              </div>
              <div className="summary-divider"></div>
              <div className="summary-calculation">
                <div>
                  <span>Items</span>
                  <strong>{totalItems}</strong>
                </div>
                <div>
                  <span>Subtotal</span>
                  <strong>₹{totalPrice}</strong>
                </div>
                <div>
                  <span>Delivery</span>
                  <strong className="free-text">FREE</strong>
                </div>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-final-total">
                <span>Total</span>
                <strong>₹{totalPrice}</strong>
              </div>
            </div>
            <div className="checkout-security">
              <span>🔒</span>
              <div>
                <strong>Secure Checkout</strong>
                <p>Your order information is handled securely.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
