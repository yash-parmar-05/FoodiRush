import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUtensils,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSignOutAlt,
  FaSearch,
  FaBoxes,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaExternalLinkAlt,
  FaTimes,
  FaFire,
  FaShoppingBag,
  FaSyncAlt,
  FaEye,
  FaClock,
  FaTruck,
  FaBan,
} from "react-icons/fa";
import { productAPI, orderAPI } from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  // Active tab state ("products" | "orders")
  const [activeTab, setActiveTab] = useState("products");

  // Admin user state
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem("admin");
      return saved ? JSON.parse(saved) : { name: "Admin", email: "admin@foodierush.com" };
    } catch {
      return { name: "Admin", email: "admin@foodierush.com" };
    }
  });

  // Toast notification
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  // =====================================================
  // PRODUCTS STATE & ACTIONS
  // =====================================================
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("all");

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);


  const initialProductFormState = {
    name: "",
    image: "",
    price: "",
    cuisine: "Indian",
    description: "",
    rating: 4.5,
    reviewCount: 12,
    calories: 350,
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    ingredients: "",
    allergens: "",
    tags: "",
    mealType: "Main Course",
    spiceLevel: "Medium",
    availability: "Available",
    isBestseller: false,
    dietaryInfo: "Vegetarian",
  };

  const [productFormData, setProductFormData] = useState(initialProductFormState);
  const [productSubmitting, setProductSubmitting] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");

      const response = await productAPI.getAll();
      setProducts(response.data || []);
    } catch (err) {
      console.error("Dashboard products fetch error:", err);
      setProductsError(err.message || "Unable to load products. Please check if backend server is running.");
    } finally {
      setProductsLoading(false);
    }
  };

  // Open modal for ADD product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductFormData(initialProductFormState);
    setIsProductModalOpen(true);
  };

  // Open modal for EDIT product
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name || "",
      image: product.image || "",
      price: product.price || "",
      cuisine: product.cuisine || "Indian",
      description: product.description || "",
      rating: product.rating ?? 4.5,
      reviewCount: product.reviewCount ?? 10,
      calories: product.calories ?? 300,
      prepTime: product.prepTime ?? 15,
      cookTime: product.cookTime ?? 20,
      servings: product.servings ?? 2,
      ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(", ") : (product.ingredients || ""),
      allergens: Array.isArray(product.allergens) ? product.allergens.join(", ") : (product.allergens || ""),
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : (product.tags || ""),
      mealType: product.mealType || "Main Course",
      spiceLevel: product.spiceLevel || "Medium",
      availability: product.availability || "Available",
      isBestseller: Boolean(product.isBestseller),
      dietaryInfo: Array.isArray(product.dietaryInfo) ? product.dietaryInfo.join(", ") : (product.dietaryInfo || "Vegetarian"),
    });
    setIsProductModalOpen(true);
  };

  // Submit Product Form (ADD or EDIT)
  const handleSubmitProductForm = async (e) => {
    e.preventDefault();

    try {
      setProductSubmitting(true);

      const payload = {
        name: productFormData.name.trim(),
        image: productFormData.image.trim(),
        price: Number(productFormData.price),
        cuisine: productFormData.cuisine.trim(),
        description: productFormData.description.trim(),
        rating: Number(productFormData.rating),
        reviewCount: Number(productFormData.reviewCount),
        calories: Number(productFormData.calories),
        prepTime: Number(productFormData.prepTime),
        cookTime: Number(productFormData.cookTime),
        servings: Number(productFormData.servings),
        ingredients: typeof productFormData.ingredients === "string" 
          ? productFormData.ingredients.split(",").map(s => s.trim()).filter(Boolean) 
          : productFormData.ingredients,
        allergens: typeof productFormData.allergens === "string" 
          ? productFormData.allergens.split(",").map(s => s.trim()).filter(Boolean) 
          : productFormData.allergens,
        tags: typeof productFormData.tags === "string" 
          ? productFormData.tags.split(",").map(s => s.trim()).filter(Boolean) 
          : productFormData.tags,
        mealType: productFormData.mealType.trim(),
        spiceLevel: productFormData.spiceLevel,
        availability: productFormData.availability,
        isBestseller: Boolean(productFormData.isBestseller),
        dietaryInfo: typeof productFormData.dietaryInfo === "string" 
          ? productFormData.dietaryInfo.split(",").map(s => s.trim()).filter(Boolean) 
          : productFormData.dietaryInfo,
      };

      if (editingProduct) {
        const productId = editingProduct._id || editingProduct.id;
        const response = await productAPI.update(productId, payload);
        const data = response.data;

        setProducts(prev => prev.map(p => (p._id === productId || p.id === productId) ? (data.product || { ...p, ...payload }) : p));
        showToast("success", `Product "${payload.name}" updated successfully!`);
      } else {
        const response = await productAPI.create(payload);
        const data = response.data;

        const createdItem = data.product || data;
        setProducts(prev => [createdItem, ...prev]);
        showToast("success", `Product "${payload.name}" created successfully!`);
      }

      setIsProductModalOpen(false);
    } catch (err) {
      console.error("Product submit error:", err);
      showToast("error", err.message || "An error occurred while saving product");
    } finally {
      setProductSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (product) => {
    setDeletingProduct(product);
  };

  // Confirm Delete Product
  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    const productId = deletingProduct._id || deletingProduct.id;

    try {
      await productAPI.delete(productId);

      setProducts(prev => prev.filter(p => (p._id !== productId && p.id !== productId)));
      showToast("success", `Product "${deletingProduct.name}" deleted successfully!`);
    } catch (err) {
      console.error("Delete product error:", err);
      showToast("error", err.message || "Failed to delete product");
    } finally {
      setDeletingProduct(null);
    }
  };


  // Filtered Products List
  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(productSearch.toLowerCase()) ||
                          (p.cuisine || "").toLowerCase().includes(productSearch.toLowerCase());
    const matchesCuisine = cuisineFilter === "all" || (p.cuisine || "").toLowerCase() === cuisineFilter.toLowerCase();
    return matchesSearch && matchesCuisine;
  });

  const totalProducts = products.length;
  const availableCount = products.filter(p => p.availability === "Available").length;
  const bestsellerCount = products.filter(p => p.isBestseller).length;
  const outOfStockCount = totalProducts - availableCount;

  // =====================================================
  // ORDERS STATE & ACTIONS
  // =====================================================
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null); // Order object for viewing details modal
  const [updatingOrderId, setUpdatingOrderId] = useState(null); // ID of order currently updating

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError("");

      const response = await orderAPI.getAllOrders();
      const data = response.data;

      // Sort newest orders first using createdAt
      const sortedOrders = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        : [];

      setOrders(sortedOrders);
    } catch (err) {
      console.error("Fetch orders error:", err);
      if (err.status === 401) {
        showToast("error", "Session expired. Please log in again.");
        handleLogout();
        return;
      }
      setOrdersError(err.message || "Unable to load orders. Please check if backend server is running.");
    } finally {
      setOrdersLoading(false);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await orderAPI.updateStatus(orderId, newStatus);
      const data = response.data;
      const updatedOrder = data.order || data;

      // Update state locally
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, ...updatedOrder, orderStatus: newStatus } : o))
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, ...updatedOrder, orderStatus: newStatus }));
      }

      showToast("success", `Order #${orderId.slice(-6)} marked as ${newStatus}`);
    } catch (err) {
      console.error("Update order status error:", err);
      if (err.status === 401) {
        showToast("error", "Session expired. Please log in again.");
        handleLogout();
        return;
      }
      showToast("error", err.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  // Filtered Orders List
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      orderStatusFilter === "All" ||
      (order.orderStatus || "").toLowerCase() === orderStatusFilter.toLowerCase();

    const searchLower = orderSearch.toLowerCase();
    const matchesSearch =
      !orderSearch ||
      (order._id || "").toLowerCase().includes(searchLower) ||
      (order.customer?.name || "").toLowerCase().includes(searchLower) ||
      (order.customer?.email || "").toLowerCase().includes(searchLower) ||
      (order.customer?.phone || "").toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  // Calculate Order statistics directly from fetched orders
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === "Pending").length;
  const confirmedOrdersCount = orders.filter((o) => o.orderStatus === "Confirmed").length;
  const preparingOrdersCount = orders.filter((o) => o.orderStatus === "Preparing").length;
  const outForDeliveryOrdersCount = orders.filter((o) => o.orderStatus === "Out for Delivery").length;
  const deliveredOrdersCount = orders.filter((o) => o.orderStatus === "Delivered").length;
  const rejectedOrdersCount = orders.filter(
    (o) => o.orderStatus === "Rejected" || o.orderStatus === "Cancelled"
  ).length;

  return (
    <div className="admin-dashboard-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo-icon">
            <FaUtensils />
          </div>
          <div className="admin-sidebar-brand-text">
            <h2>FoodieRush</h2>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            className={`admin-nav-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <FaBoxes />
            <span>Product Catalog</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <FaShoppingBag />
            <span>Orders Management ({pendingOrdersCount > 0 ? pendingOrdersCount : totalOrdersCount})</span>
          </button>
        </nav>

        <div className="admin-sidebar-user">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {(admin.name || "Admin").charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-details">
              <p>{admin.name || "FoodieRush Admin"}</p>
              <span>{admin.email || "admin@foodierush.com"}</span>
            </div>
          </div>

          <button className="admin-logout-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="admin-main-content">
        {/* TOP HEADER */}
        <header className="admin-top-header">
          <div className="admin-page-title">
            <h1>
              {activeTab === "products" ? "Restaurant Product Catalog" : "Customer Orders Management"}
            </h1>
            <p>
              {activeTab === "products"
                ? "Manage product items, prices, availability, and menu offerings"
                : "View customer orders, update statuses, and monitor delivery workflows"}
            </p>
          </div>

          <div className="admin-action-bar">
            <Link to="/home" className="btn-website-link" target="_blank" rel="noopener noreferrer">
              <FaExternalLinkAlt />
              <span>Customer View</span>
            </Link>

            {activeTab === "products" ? (
              <button className="btn-add-product" onClick={handleOpenAddModal}>
                <FaPlus />
                <span>Add New Dish</span>
              </button>
            ) : (
              <button className="btn-add-product" onClick={fetchOrders} title="Refresh orders list">
                <FaSyncAlt />
                <span>Refresh Orders</span>
              </button>
            )}
          </div>
        </header>

        {/* TOAST NOTIFICATION */}
        {toast && (
          <div className={`admin-toast ${toast.type}`}>
            <span>{toast.message}</span>
            <button
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
              onClick={() => setToast(null)}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* =====================================================
            TAB 1: PRODUCT CATALOG MANAGEMENT
        ===================================================== */}
        {activeTab === "products" && (
          <>
            {/* STATS OVERVIEW CARDS */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-icon-box orange">
                  <FaBoxes />
                </div>
                <div className="stat-info">
                  <span>Total Products</span>
                  <h3>{totalProducts}</h3>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-box green">
                  <FaCheckCircle />
                </div>
                <div className="stat-info">
                  <span>Available Dishes</span>
                  <h3>{availableCount}</h3>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-box purple">
                  <FaFire />
                </div>
                <div className="stat-info">
                  <span>Bestsellers</span>
                  <h3>{bestsellerCount}</h3>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-box red">
                  <FaTimesCircle />
                </div>
                <div className="stat-info">
                  <span>Unavailable</span>
                  <h3>{outOfStockCount}</h3>
                </div>
              </div>
            </div>

            {/* CONTROLS (SEARCH & FILTER) */}
            <div className="admin-table-controls">
              <div className="admin-search-box">
                <FaSearch className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Search dish by name or cuisine..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>

              <div className="admin-filter-box">
                <select value={cuisineFilter} onChange={(e) => setCuisineFilter(e.target.value)}>
                  <option value="all">All Cuisines</option>
                  <option value="Indian">Indian</option>
                  <option value="Italian">Italian</option>
                  <option value="Chinese">Chinese</option>
                  <option value="American">American</option>
                  <option value="Asian">Asian</option>
                  <option value="Mexican">Mexican</option>
                </select>
              </div>
            </div>

            {/* PRODUCT TABLE CONTAINER */}
            <div className="admin-table-card">
              {productsLoading ? (
                <div className="admin-state-box">
                  <div className="admin-spinner"></div>
                  <p>Loading products from database...</p>
                </div>
              ) : productsError ? (
                <div className="admin-state-box error">
                  <FaTimesCircle style={{ fontSize: "36px", color: "#f87171" }} />
                  <p>{productsError}</p>
                  <button className="btn-save" onClick={fetchProducts} style={{ marginTop: "12px" }}>
                    Retry Loading
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="admin-state-box">
                  <p>No products found matching your search criteria.</p>
                </div>
              ) : (
                <table className="admin-product-table">
                  <thead>
                    <tr>
                      <th>Dish Name</th>
                      <th>Cuisine</th>
                      <th>Price</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product._id || product.id}>
                        <td>
                          <div className="product-cell-main">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="product-thumb"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80";
                              }}
                            />
                            <div className="product-name-info">
                              <h4>
                                {product.name}{" "}
                                {product.isBestseller && <span title="Bestseller">🔥</span>}
                              </h4>
                              <span>{product.mealType || "Main Course"}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge-cuisine">{product.cuisine}</span>
                        </td>
                        <td>
                          <span className="badge-price">₹{product.price}</span>
                        </td>
                        <td>
                          <span className="badge-rating">
                            <FaStar /> {product.rating} ({product.reviewCount})
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-tag ${
                              product.availability === "Available" ? "available" : "unavailable"
                            }`}
                          >
                            {product.availability}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-group">
                            <button
                              className="btn-icon-action edit"
                              onClick={() => handleOpenEditModal(product)}
                              title="Edit Dish"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-icon-action delete"
                              onClick={() => handleOpenDeleteModal(product)}
                              title="Delete Dish"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* =====================================================
            TAB 2: ORDERS MANAGEMENT
        ===================================================== */}
        {activeTab === "orders" && (
          <>
            {/* ORDERS STATS OVERVIEW */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-icon-box orange">
                  <FaShoppingBag />
                </div>
                <div className="stat-info">
                  <span>Total Orders</span>
                  <h3>{totalOrdersCount}</h3>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-box purple">
                  <FaClock />
                </div>
                <div className="stat-info">
                  <span>Pending</span>
                  <h3>{pendingOrdersCount}</h3>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-box green">
                  <FaCheckCircle />
                </div>
                <div className="stat-info">
                  <span>Confirmed</span>
                  <h3>{confirmedOrdersCount}</h3>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-box orange">
                  <FaUtensils />
                </div>
                <div className="stat-info">
                  <span>Preparing</span>
                  <h3>{preparingOrdersCount}</h3>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-box purple">
                  <FaTruck />
                </div>
                <div className="stat-info">
                  <span>Out for Delivery</span>
                  <h3>{outForDeliveryOrdersCount}</h3>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-box green">
                  <FaCheckCircle />
                </div>
                <div className="stat-info">
                  <span>Delivered</span>
                  <h3>{deliveredOrdersCount}</h3>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-box red">
                  <FaBan />
                </div>
                <div className="stat-info">
                  <span>Rejected</span>
                  <h3>{rejectedOrdersCount}</h3>
                </div>
              </div>
            </div>

            {/* STATUS FILTER PILLS & SEARCH */}
            <div className="admin-table-controls">
              <div className="admin-search-box">
                <FaSearch className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Search by Order ID, customer name, email, or phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="status-filter-pills">
              {["All", "Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Rejected"].map(
                (status) => (
                  <button
                    key={status}
                    className={`status-pill ${orderStatusFilter === status ? "active" : ""}`}
                    onClick={() => setOrderStatusFilter(status)}
                  >
                    {status}
                  </button>
                )
              )}
            </div>

            {/* ORDERS TABLE CONTAINER */}
            <div className="admin-table-card">
              {ordersLoading ? (
                <div className="admin-state-box">
                  <div className="admin-spinner"></div>
                  <p>Loading orders from database...</p>
                </div>
              ) : ordersError ? (
                <div className="admin-state-box error">
                  <FaTimesCircle style={{ fontSize: "36px", color: "#f87171" }} />
                  <p>{ordersError}</p>
                  <button className="btn-save" onClick={fetchOrders} style={{ marginTop: "12px" }}>
                    Retry Loading Orders
                  </button>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="admin-state-box">
                  <p>No orders found matching status "{orderStatusFilter}".</p>
                </div>
              ) : (
                <table className="admin-product-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items Summary</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const isUpdating = updatingOrderId === order._id;
                      const statusClass = (order.orderStatus || "pending")
                        .toLowerCase()
                        .replace(/\s+/g, "_");

                      return (
                        <tr key={order._id}>
                          <td>
                            <strong style={{ color: "#ffffff", fontFamily: "monospace" }}>
                              #{order._id ? order._id.slice(-6) : "N/A"}
                            </strong>
                          </td>
                          <td>
                            <div className="product-name-info">
                              <h4 style={{ color: "#ffffff", fontSize: "14px" }}>
                                {order.customer?.name || "Customer"}
                              </h4>
                              <span>{order.customer?.phone || order.customer?.email}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
                              {order.items && order.items.length > 0 ? (
                                <span>
                                  {order.items[0].name}
                                  {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ""}
                                </span>
                              ) : (
                                "No items"
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="badge-price">₹{order.totalAmount}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                              {order.paymentMethod || "COD"}
                            </span>
                          </td>
                          <td>
                            <span className={`order-status-badge ${statusClass}`}>
                              {order.orderStatus || "Pending"}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString()
                                : "Today"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons-group">
                              <button
                                className="btn-action-sm btn-action-view"
                                onClick={() => setSelectedOrder(order)}
                                title="View Details"
                              >
                                <FaEye /> View
                              </button>

                              {/* STATUS ACTION BUTTONS */}
                              {order.orderStatus === "Pending" && (
                                <>
                                  <button
                                    className="btn-action-sm btn-action-confirm"
                                    onClick={() => handleUpdateOrderStatus(order._id, "Confirmed")}
                                    disabled={isUpdating}
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    className="btn-action-sm btn-action-reject"
                                    onClick={() => handleUpdateOrderStatus(order._id, "Rejected")}
                                    disabled={isUpdating}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {order.orderStatus === "Confirmed" && (
                                <button
                                  className="btn-action-sm btn-action-status"
                                  onClick={() => handleUpdateOrderStatus(order._id, "Preparing")}
                                  disabled={isUpdating}
                                >
                                  Preparing
                                </button>
                              )}

                              {order.orderStatus === "Preparing" && (
                                <button
                                  className="btn-action-sm btn-action-status"
                                  onClick={() =>
                                    handleUpdateOrderStatus(order._id, "Out for Delivery")
                                  }
                                  disabled={isUpdating}
                                >
                                  Out for Delivery
                                </button>
                              )}

                              {order.orderStatus === "Out for Delivery" && (
                                <button
                                  className="btn-action-sm btn-action-confirm"
                                  onClick={() => handleUpdateOrderStatus(order._id, "Delivered")}
                                  disabled={isUpdating}
                                >
                                  Delivered
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* =====================================================
            MODAL 1: ADD / EDIT PRODUCT
        ===================================================== */}
        {isProductModalOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <h2>{editingProduct ? "Edit Dish Details" : "Add New Dish to Menu"}</h2>
                <button className="btn-close-modal" onClick={() => setIsProductModalOpen(false)}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmitProductForm}>
                <div className="admin-modal-body">
                  <div className="form-group-full">
                    <label>Dish Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Masala Dosa"
                      value={productFormData.name}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group-full">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        placeholder="140"
                        value={productFormData.price}
                        onChange={(e) =>
                          setProductFormData({ ...productFormData, price: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group-full">
                      <label>Cuisine Category *</label>
                      <select
                        value={productFormData.cuisine}
                        onChange={(e) =>
                          setProductFormData({ ...productFormData, cuisine: e.target.value })
                        }
                      >
                        <option value="Indian">Indian</option>
                        <option value="Italian">Italian</option>
                        <option value="Chinese">Chinese</option>
                        <option value="American">American</option>
                        <option value="Asian">Asian</option>
                        <option value="Mexican">Mexican</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group-full">
                    <label>Image URL *</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={productFormData.image}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, image: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group-full">
                    <label>Description *</label>
                    <textarea
                      rows="3"
                      placeholder="Brief description of the dish..."
                      value={productFormData.description}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, description: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group-full">
                      <label>Availability</label>
                      <select
                        value={productFormData.availability}
                        onChange={(e) =>
                          setProductFormData({ ...productFormData, availability: e.target.value })
                        }
                      >
                        <option value="Available">Available</option>
                        <option value="Unavailable">Unavailable</option>
                      </select>
                    </div>

                    <div className="form-group-full">
                      <label>Meal Type</label>
                      <input
                        type="text"
                        placeholder="e.g. Main Course, Starter"
                        value={productFormData.mealType}
                        onChange={(e) =>
                          setProductFormData({ ...productFormData, mealType: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="isBestseller"
                      checked={productFormData.isBestseller}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, isBestseller: e.target.checked })
                      }
                    />
                    <label
                      htmlFor="isBestseller"
                      style={{ color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
                    >
                      Mark as Bestseller 🔥
                    </label>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsProductModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-save" disabled={productSubmitting}>
                    {productSubmitting
                      ? "Saving..."
                      : editingProduct
                      ? "Update Product"
                      : "Create Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================
            MODAL 2: DELETE PRODUCT CONFIRMATION
        ===================================================== */}
        {deletingProduct && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card confirm-delete-card" style={{ maxWidth: "460px" }}>
              <div className="admin-modal-header">
                <h2>Confirm Dish Deletion</h2>
                <button className="btn-close-modal" onClick={() => setDeletingProduct(null)}>
                  <FaTimes />
                </button>
              </div>
              <div className="admin-modal-body" style={{ padding: "20px 0", color: "#cbd5e1" }}>
                <p>Are you sure you want to delete <strong>{deletingProduct.name}</strong> from the menu?</p>
                <p style={{ marginTop: "8px", fontSize: "13px", color: "#ef4444" }}>This action cannot be undone and will update MongoDB.</p>
              </div>
              <div className="admin-modal-footer" style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setDeletingProduct(null)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    background: "transparent",
                    color: "#cbd5e1",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-delete-confirm"
                  onClick={confirmDeleteProduct}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#ef4444",
                    color: "#ffffff",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Yes, Delete Dish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            MODAL 3: ORDER DETAILS VIEW
        ===================================================== */}
        {selectedOrder && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card" style={{ maxWidth: "760px" }}>
              <div className="admin-modal-header">
                <div>
                  <h2 style={{ fontSize: "18px" }}>
                    Order #{selectedOrder._id}
                  </h2>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Placed on:{" "}
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <button className="btn-close-modal" onClick={() => setSelectedOrder(null)}>
                  <FaTimes />
                </button>
              </div>

              <div className="admin-modal-body">
                {/* STATUS BADGES BAR */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span
                    className={`order-status-badge ${(selectedOrder.orderStatus || "pending")
                      .toLowerCase()
                      .replace(/\s+/g, "_")}`}
                  >
                    Order Status: {selectedOrder.orderStatus || "Pending"}
                  </span>
                  <span className="badge-cuisine">
                    Payment Status: {selectedOrder.paymentStatus || "Pending"}
                  </span>
                </div>

                <div className="order-details-grid-modal">
                  {/* CUSTOMER DETAILS */}
                  <div className="modal-info-block">
                    <h3>Customer Information</h3>
                    <p>
                      <strong>Name:</strong> {selectedOrder.customer?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.customer?.email || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedOrder.customer?.phone || "N/A"}
                    </p>
                  </div>

                  {/* DELIVERY ADDRESS */}
                  <div className="modal-info-block">
                    <h3>Delivery Address</h3>
                    <p>{selectedOrder.deliveryAddress?.address || "N/A"}</p>
                    <p>
                      {selectedOrder.deliveryAddress?.city},{" "}
                      {selectedOrder.deliveryAddress?.state} -{" "}
                      {selectedOrder.deliveryAddress?.pincode}
                    </p>
                  </div>
                </div>

                {/* ORDERED ITEMS */}
                <div className="modal-info-block">
                  <h3>Ordered Items ({selectedOrder.items?.length || 0})</h3>
                  <div className="modal-items-list">
                    {selectedOrder.items?.map((item, idx) => (
                      <div className="modal-item-row" key={idx}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="modal-item-img"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <div className="modal-item-details">
                          <h4>{item.name}</h4>
                          <span>
                            ₹{item.price} × {item.quantity}
                          </span>
                        </div>
                        <div className="modal-item-total">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PAYMENT & TOTAL SUMMARY */}
                <div className="modal-info-block">
                  <h3>Payment Summary</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span>Payment Method:</span>
                    <strong>{selectedOrder.paymentMethod || "Cash on Delivery"}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "#f97316",
                      marginTop: "10px",
                      paddingTop: "10px",
                      borderTop: "1px dashed rgba(255,255,255,0.1)",
                    }}
                  >
                    <span>Total Amount Paid:</span>
                    <span>₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER ACTIONS */}
              <div className="admin-modal-footer">
                {selectedOrder.orderStatus === "Pending" && (
                  <>
                    <button
                      className="btn-action-sm btn-action-confirm"
                      onClick={() => handleUpdateOrderStatus(selectedOrder._id, "Confirmed")}
                      disabled={updatingOrderId === selectedOrder._id}
                    >
                      Confirm Order
                    </button>
                    <button
                      className="btn-action-sm btn-action-reject"
                      onClick={() => handleUpdateOrderStatus(selectedOrder._id, "Rejected")}
                      disabled={updatingOrderId === selectedOrder._id}
                    >
                      Reject Order
                    </button>
                  </>
                )}

                {selectedOrder.orderStatus === "Confirmed" && (
                  <button
                    className="btn-action-sm btn-action-status"
                    onClick={() => handleUpdateOrderStatus(selectedOrder._id, "Preparing")}
                    disabled={updatingOrderId === selectedOrder._id}
                  >
                    Mark as Preparing
                  </button>
                )}

                {selectedOrder.orderStatus === "Preparing" && (
                  <button
                    className="btn-action-sm btn-action-status"
                    onClick={() => handleUpdateOrderStatus(selectedOrder._id, "Out for Delivery")}
                    disabled={updatingOrderId === selectedOrder._id}
                  >
                    Mark Out for Delivery
                  </button>
                )}

                {selectedOrder.orderStatus === "Out for Delivery" && (
                  <button
                    className="btn-action-sm btn-action-confirm"
                    onClick={() => handleUpdateOrderStatus(selectedOrder._id, "Delivered")}
                    disabled={updatingOrderId === selectedOrder._id}
                  >
                    Mark as Delivered
                  </button>
                )}

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
