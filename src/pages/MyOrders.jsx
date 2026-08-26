import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingBag, FaClock, FaRedo, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { orderAPI } from "../services/api";
import "./MyOrders.css";

function MyOrders({ user, onOrderMoreFood }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("userToken");

      if (!token) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const response = await orderAPI.getMyOrders();
      const data = response.data;

      const nonCancelledOrders = Array.isArray(data) ? data.filter(order => order.orderStatus !== "Cancelled") : [];
      setOrders(nonCancelledOrders);
    } catch (err) {
      console.error("My orders fetch error:", err);
      if (err.status === 401) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("user");
        setError("Session expired. Please log in again.");
      } else {
        setError(err.message || "Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const [cancellingIds, setCancellingIds] = useState([]);

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order? It will be removed in 3 seconds.");
    if (!confirmCancel) return;

    try {
      await orderAPI.cancel(orderId, "Cancelled by customer from My Orders");

      // Mark order as cancelled and start fading state
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, orderStatus: "Cancelled" } : ord))
      );
      setCancellingIds((prev) => [...prev, orderId]);

      // If active order was this one, clear it
      if (localStorage.getItem("activeOrderId") === orderId) {
        localStorage.removeItem("activeOrderId");
      }

      // Automatically remove from list after exactly 3 seconds (3000ms)
      setTimeout(() => {
        setOrders((prev) => prev.filter((ord) => ord._id !== orderId));
        setCancellingIds((prev) => prev.filter((id) => id !== orderId));
      }, 3000);

    } catch (err) {
      console.error("Cancel order error:", err);
      alert(err.message || "Something went wrong while cancelling your order. Please try again.");
    }
  };

  const handleOrderMore = (order) => {
    if (onOrderMoreFood) {
      onOrderMoreFood(order);
    } else {
      navigate("/menu");
    }
  };

  if (!localStorage.getItem("userToken")) {
    return (
      <main className="my-orders-page">
        <div className="my-orders-empty">
          <div className="empty-icon">🔒</div>
          <h2>Authentication Required</h2>
          <p>Please log in to view your order history and track active food deliveries.</p>
          <button className="btn-browse-menu" onClick={() => navigate("/home")}>
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="my-orders-page">
        <div className="my-orders-loading">
          <p>⏳ Loading your order history...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="my-orders-page">
        <div className="my-orders-empty">
          <FaExclamationTriangle size={40} color="#ef4444" />
          <h2>Unable to load orders</h2>
          <p>{error}</p>
          <button className="btn-browse-menu" onClick={fetchMyOrders}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="my-orders-page">
      <div className="my-orders-container">
        <div className="my-orders-header">
          <div>
            <p className="eyebrow">Order History & Tracking</p>
            <h1>My Orders</h1>
          </div>
          <button className="btn-browse-menu" onClick={() => navigate("/menu")}>
            + Browse Menu
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="my-orders-empty">
            <div className="empty-icon">🍱</div>
            <h2>No orders placed yet</h2>
            <p>You haven't placed any orders with this account yet.</p>
            <button className="btn-browse-menu" onClick={() => navigate("/menu")}>
              Explore Delicious Menu
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const isActive = ["Pending", "Confirmed", "Preparing", "Out for Delivery"].includes(
                order.orderStatus
              );

              const canCancel = ["Pending", "Confirmed"].includes(order.orderStatus);

              const formattedDate = order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "Recent";

              const isCancelling = cancellingIds.includes(order._id);

              return (
                <div className={`order-card ${isActive ? "active-order" : ""} ${order.orderStatus === "Cancelled" ? "cancelled-order" : ""} ${isCancelling ? "auto-removing-card" : ""}`} key={order._id}>
                  <div className="order-card-header">
                    <div>
                      <span className="order-id-tag">Order #{order._id.slice(-8).toUpperCase()}</span>
                      <p className="order-date"><FaClock /> {formattedDate}</p>
                    </div>

                    <div className="order-status-group">
                      <span className={`status-pill status-${(order.orderStatus || "pending").toLowerCase().replace(/\s+/g, "-")}`}>
                        {order.orderStatus || "Pending"}
                      </span>
                    </div>
                  </div>

                  {isCancelling && (
                    <div className="cancel-countdown-banner">
                      <span className="pulse-indicator"></span>
                      <span>⏳ Order cancelled. Removing in 3 seconds...</span>
                    </div>
                  )}

                  <div className="order-card-items">
                    {order.items?.map((item, idx) => (
                      <div className="order-item-row" key={idx}>
                        <span className="item-qty">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <div className="total-block">
                      <span>Total Amount:</span>
                      <strong>₹{order.totalAmount}</strong>
                    </div>

                    <div className="order-card-actions">
                      {canCancel && (
                        <button
                          type="button"
                          className="btn-cancel-order"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          ✕ Cancel Order
                        </button>
                      )}
                      <button
                        className="btn-order-more"
                        onClick={() => handleOrderMore(order)}
                      >
                        <FaRedo /> {isActive ? "Add More Food" : "Order Again"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default MyOrders;
