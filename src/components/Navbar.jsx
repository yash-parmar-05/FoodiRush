import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";

function MyNavbar({ cartCount, onCartClick, user, onOpenAuthModal, onLogout }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLinkClick = () => {
    setExpanded(false);
  };

  return (
    <Navbar
      className="site-navbar"
      expand="lg"
      bg="dark"
      data-bs-theme="dark"
      expanded={expanded}
      onToggle={(isExpanded) => setExpanded(isExpanded)}
      sticky="top"
    >
      <Container className="align-items-center">
        <Navbar.Brand
          as={Link}
          to="/home"
          onClick={() => {
            handleLinkClick();
            navigate("/home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{ cursor: "pointer" }}
        >
          🍔 <span style={{ fontWeight: 800, letterSpacing: "-0.01em" }}>FoodieRush</span>
        </Navbar.Brand>

        {cartCount > 0 && (
          <Button
            variant="warning"
            onClick={onCartClick}
            className="d-lg-none ms-auto me-2"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "6px 14px",
              fontSize: "0.85rem",
              borderRadius: "var(--radius-pill)",
              fontWeight: 700,
            }}
          >
            <FaShoppingCart />
            <span>Cart ({cartCount})</span>
          </Button>
        )}

        <Navbar.Toggle aria-controls="main-navbar" className={cartCount > 0 ? "ms-0" : "ms-auto"} />

        <Navbar.Collapse id="main-navbar" className="align-items-center">
          <Nav className="me-auto align-items-center">
            <NavLink
              to="/home"
              onClick={handleLinkClick}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/menu"
              onClick={handleLinkClick}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              Menu
            </NavLink>
            <NavLink
              to="/about"
              onClick={handleLinkClick}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              About
            </NavLink>

            {user && (
              <NavLink
                to="/my-orders"
                onClick={handleLinkClick}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                My Orders
              </NavLink>
            )}
          </Nav>

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-light fw-bold fs-7 me-1 d-none d-xl-inline">
                  Hi, {user.name?.split(" ")[0]}
                </span>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => {
                    handleLinkClick();
                    onLogout();
                  }}
                  title="Log Out"
                  style={{ borderRadius: "var(--radius-pill)", fontWeight: 600 }}
                >
                  <FaSignOutAlt className="me-1" /> Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="outline-warning"
                size="sm"
                onClick={() => {
                  handleLinkClick();
                  onOpenAuthModal();
                }}
                style={{ borderRadius: "var(--radius-pill)", fontWeight: 700, padding: "6px 16px" }}
              >
                <FaUser className="me-1" /> Login / Register
              </Button>
            )}

            <Button
              variant="warning"
              onClick={onCartClick}
              className="d-none d-lg-flex align-items-center ms-2"
              style={{ gap: "8px" }}
            >
              <FaShoppingCart />
              Cart
              {cartCount > 0 && (
                <span style={{
                  background: "rgba(255,255,255,0.28)",
                  borderRadius: "999px",
                  padding: "1px 8px",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  minWidth: "22px",
                  textAlign: "center",
                  lineHeight: "1.4",
                }}>
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
