import { useEffect, useState, useMemo, useCallback } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import "./App.css";

import Cart from "./components/Cart";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import About from "./pages/About";
import ProductDetails from "./components/ProductDetails";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import AuthModal from "./components/AuthModal";

import { productAPI } from "./services/api";

// =========================
// CUSTOMER LAYOUT COMPONENT
// =========================
function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Customer Auth state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("foodierush_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Active Order ID for "Order More Food" workflow
  const [activeOrderId, setActiveOrderId] = useState(() => {
    return localStorage.getItem("activeOrderId") || null;
  });

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("foodierush_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Fetch products from backend API once
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await productAPI.getAll();
        const data = response.data;

        if (!isMounted) return;

        // MongoDB _id normalized with frontend id for safety
        const formattedProducts = (Array.isArray(data) ? data : []).map((product) => ({
          ...product,
          id: product._id || product.id,
        }));

        setProducts(formattedProducts);
      } catch (err) {
        if (!isMounted) return;
        console.error("Product fetch error:", err);
        setProducts([]);
        setError(err.message || "Unable to load products. Please make sure backend server is running.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Memoized Add to cart using MongoDB unique ID
  const addToCart = useCallback((product) => {
    const targetId = product._id || product.id;

    setCart((prevCart) => {
      const existingProduct = prevCart.find(
        (item) => (item._id || item.id) === targetId
      );

      if (existingProduct) {
        return prevCart.map((item) =>
          (item._id || item.id) === targetId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          id: targetId,
          _id: targetId,
          quantity: 1,
        },
      ];
    });
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) =>
      prevCart.filter((product) => (product._id || product.id) !== productId)
    );
  }, []);

  // Increase quantity
  const increaseQuantity = useCallback((productId) => {
    setCart((prevCart) =>
      prevCart.map((product) =>
        (product._id || product.id) === productId
          ? { ...product, quantity: product.quantity + 1 }
          : product
      )
    );
  }, []);

  // Decrease quantity
  const decreaseQuantity = useCallback((productId) => {
    setCart((prevCart) =>
      prevCart
        .map((product) =>
          (product._id || product.id) === productId
            ? { ...product, quantity: product.quantity - 1 }
            : product
        )
        .filter((product) => product.quantity > 0)
    );
  }, []);

  // Total items & price
  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );
  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem("foodierush_cart");
  }, []);

  // Handle Order More Food trigger
  const handleOrderMoreFood = useCallback((order) => {
    if (order && order._id) {
      setActiveOrderId(order._id);
      localStorage.setItem("activeOrderId", order._id);
    }
    navigate("/menu");
  }, [navigate]);

  // Handle Customer Logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  // Search & category filter memoized
  const filteredProducts = useMemo(() => {
    const s = search.toLowerCase();
    const c = category.toLowerCase();

    return products.filter((product) => {
      const productName = product.name?.toLowerCase() || "";
      const matchSearch = !s || productName.includes(s);
      const matchCategory =
        c === "all" ||
        product.cuisine?.toLowerCase() === c;

      return matchSearch && matchCategory;
    });
  }, [products, search, category]);

  // Customer loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <h2>⏳</h2>
        <p>Loading delicious food...</p>
      </div>
    );
  }

  // Customer error screen
  if (error) {
    return (
      <div className="loading-screen">
        <h2>⚠️</h2>
        <p>{error}</p>
        <p style={{ marginTop: "10px" }}>
          Please make sure the backend server is reachable.
        </p>
      </div>
    );
  }

  return (
    <>
      <Navbar
        cartCount={totalItems}
        onCartClick={() => setIsCartOpen(true)}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route
            path="/home"
            element={
              <Home
                products={products}
                addToCart={addToCart}
                cart={cart}
                setSearch={setSearch}
                setCategory={setCategory}
                onCardClick={(product) => setSelectedProduct(product)}
              />
            }
          />
          <Route
            path="/menu"
            element={
              <Menu
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                products={products}
                filteredProducts={filteredProducts}
                addToCart={addToCart}
                cart={cart}
                onCardClick={(product) => setSelectedProduct(product)}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/my-orders"
            element={
              <MyOrders
                user={user}
                onOrderMoreFood={handleOrderMoreFood}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <Checkout
                cart={cart}
                totalItems={totalItems}
                totalPrice={totalPrice}
                clearCart={clearCart}
                activeOrderId={activeOrderId}
                setActiveOrderId={setActiveOrderId}
                user={user}
              />
            }
          />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>

        <Cart
          cart={cart}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          removeFromCart={removeFromCart}
          increaseQuantity={increaseQuantity}
          decreaseQuantity={decreaseQuantity}
          totalItems={totalItems}
          totalPrice={totalPrice}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      </div>

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          addToCart={addToCart}
          cart={cart}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
        }}
      />

      <Footer setCategory={setCategory} />
    </>
  );
}

// =========================
// MAIN APP ROUTER
// =========================
function App() {
  return (
    <Routes>
      {/* ADMIN LOGIN ROUTE (Independent Layout) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ADMIN DASHBOARD ROUTE (Protected Independent Layout) */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />

      {/* CUSTOMER WEBSITE LAYOUT */}
      <Route path="/*" element={<CustomerLayout />} />
    </Routes>
  );
}

export default App;
