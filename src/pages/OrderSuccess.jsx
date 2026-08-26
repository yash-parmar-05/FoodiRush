import { useLocation, useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";
import "./OrderSuccess.css";


function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <main className="order-success-page">
        <div className="order-success-card empty-state">
          <div className="status-icon info-icon">ℹ️</div>
          <h2>No Order Found</h2>
          <p>We couldn't find any recent order details to display.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/menu")}
          >
            Browse Menu
          </button>
        </div>
      </main>
    );
  }

  const {
    _id,
    customer,
    deliveryAddress,
    items = [],
    totalAmount,
    paymentMethod,
    orderStatus,
    paymentStatus,
    createdAt,
  } = order;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString()
    : new Date().toLocaleString();

  return (
    <main className="order-success-page">
      <div className="order-success-container">
        {/* SUCCESS HEADER */}
        <div className="success-banner">
          <div className="success-icon-badge">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p className="success-subtitle">
            Thank you for your order! We have received your order and are getting it ready.
          </p>
        </div>

        <div className="order-details-grid">
          {/* MAIN ORDER SUMMARY CARD */}
          <div className="order-main-card">
            <div className="card-header">
              <div>
                <span className="order-id-label">Order ID</span>
                <h2 className="order-id-value">#{_id}</h2>
              </div>
              <div className="badge-group">
                <span className={`status-badge status-${(orderStatus || "pending").toLowerCase()}`}>
                  {orderStatus || "Pending"}
                </span>
                <span className={`status-badge payment-${(paymentStatus || "pending").toLowerCase()}`}>
                  Payment: {paymentStatus || "Pending"}
                </span>
              </div>
            </div>

            <div className="order-meta-info">
              <div>
                <span className="meta-label">Date & Time</span>
                <span className="meta-value">{formattedDate}</span>
              </div>
              <div>
                <span className="meta-label">Payment Method</span>
                <span className="meta-value">{paymentMethod}</span>
              </div>
            </div>

            <div className="section-divider"></div>

            {/* ORDERED ITEMS */}
            <h3 className="section-title">Items Ordered ({items.length})</h3>
            <div className="items-list">
              {items.map((item, index) => (
                <div className="item-row" key={index}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="item-image"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div className="item-info">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-price-qty">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <div className="item-total">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="section-divider"></div>

            {/* TOTAL CALCULATION */}
            <div className="total-summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Charge</span>
                <span className="free-badge">FREE</span>
              </div>
              <div className="summary-row total-row">
                <span>Total Amount Paid</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* SIDEBAR: CUSTOMER & ADDRESS DETAILS */}
          <div className="order-sidebar">
            <div className="info-card">
              <h3>Customer Details</h3>
              <div className="info-group">
                <span className="info-label">Name</span>
                <span className="info-value">{customer?.name}</span>
              </div>
              <div className="info-group">
                <span className="info-label">Email</span>
                <span className="info-value">{customer?.email}</span>
              </div>
              <div className="info-group">
                <span className="info-label">Phone</span>
                <span className="info-value">{customer?.phone}</span>
              </div>
            </div>

            <div className="info-card">
              <h3>Delivery Address</h3>
              <p className="address-text">
                {deliveryAddress?.address}<br />
                {deliveryAddress?.city}, {deliveryAddress?.state} - {deliveryAddress?.pincode}
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="action-buttons">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (order._id) {
                    localStorage.setItem("activeOrderId", order._id);
                  }
                  navigate("/menu");
                }}
              >
                ➕ Order More Food
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/my-orders")}
              >
                Track / View My Orders
              </button>
              {orderStatus !== "Cancelled" && (
                <button
                  type="button"
                  style={{
                    width: "100%",
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1.5px solid #fecaca",
                    padding: "12px 20px",
                    borderRadius: "14px",
                    fontWeight: "750",
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    marginTop: "6px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#dc2626";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "#fef2f2";
                    e.currentTarget.style.color = "#dc2626";
                  }}
                  onClick={async () => {
                    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
                    if (!confirmCancel) return;
                    try {
                      await orderAPI.cancel(order._id, "Cancelled from order confirmation page");
                      alert("Order cancelled successfully.");
                      navigate("/my-orders");
                    } catch (err) {
                      alert(err.message || "Error cancelling order.");
                    }
                  }}
                >
                  ✕ Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default OrderSuccess;
