import { useState, useMemo } from "react";
import Hero from "../components/Hero";
import Card from "../components/Card";
import { FaUtensils, FaRedo, FaSort } from "react-icons/fa";

function Menu({
  search,
  setSearch,
  category,
  setCategory,
  products = [],
  filteredProducts = [],
  addToCart,
  cart = [],
  onCardClick,
}) {
  const [sortBy, setSortBy] = useState("recommended");

  // Dynamically compute available categories from products
  const categories = useMemo(() => {
    const rawCuisines = products.map((p) => p.cuisine).filter(Boolean);
    const unique = Array.from(new Set(rawCuisines));
    return ["all", ...unique];
  }, [products]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("all");
    setSortBy("recommended");
  };

  // Map category code to human-readable label
  const getCategoryLabel = (cat) => {
    if (cat === "all") return "All Cuisines";
    if (cat === "Dessert") return "Desserts";
    return cat;
  };

  // Apply sorting with useMemo to avoid re-sorting on unrelated renders
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-low") return list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") return list.sort((a, b) => b.price - a.price);
    if (sortBy === "rating-high") return list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "name-az") return list.sort((a, b) => a.name.localeCompare(b.name));
    return list; // recommended / original
  }, [filteredProducts, sortBy]);

  return (
    <div className="menu-page">
      {/* PAGE HEADER */}
      <div className="menu-header">
        <span className="menu-tag"><FaUtensils /> Fresh & Hot</span>
        <h1 className="menu-title">Explore Our Menu</h1>
        <p className="menu-subtitle">
          Discover delicious dishes made for every craving.
        </p>
      </div>

      {/* SEARCH BAR */}
      <Hero search={search} setSearch={setSearch} />

      {/* FILTERS & SORT ROW */}
      <div className="menu-controls-row">
        {/* CATEGORY FILTER PILLS */}
        <div className="category-buttons">
          {categories.map((cat) => (
            <button
              key={cat}
              className={category.toLowerCase() === cat.toLowerCase() ? "active" : ""}
              onClick={() => setCategory(cat)}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* SORT DROPDOWN */}
        <div className="sort-dropdown-wrap">
          <label htmlFor="menu-sort-select">
            <FaSort className="sort-icon" /> Sort By:
          </label>
          <select
            id="menu-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="menu-sort-select"
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating-high">Rating: High to Low</option>
            <option value="name-az">Name: A-Z</option>
          </select>
        </div>
      </div>

      {/* FILTER RESULTS SUMMARY */}
      <div className="filter-summary-bar">
        <span className="results-count">
          Showing <strong>{sortedProducts.length}</strong> delicious item{sortedProducts.length !== 1 ? "s" : ""}
          {category !== "all" && ` in ${getCategoryLabel(category)}`}
          {search && ` matching "${search}"`}
        </span>

        {(category !== "all" || search || sortBy !== "recommended") && (
          <button className="reset-filter-btn" onClick={handleResetFilters}>
            <FaRedo /> Reset Filters
          </button>
        )}
      </div>

      {/* PRODUCTS GRID */}
      {sortedProducts.length > 0 ? (
        <div className="container">
          {sortedProducts.map((product, index) => (
            <Card
              key={product.id || product._id}
              image={product.image}
              title={product.name}
              product={product}
              addToCart={addToCart}
              cart={cart}
              onCardClick={onCardClick}
              priority={index < 4}
            />
          ))}
        </div>
      ) : (
        <div className="empty-menu-state">
          <div className="empty-icon">🔍</div>
          <h3>No Dishes Found</h3>
          <p>We couldn't find any dish matching your search criteria.</p>
          <button className="btn-primary-hero" onClick={handleResetFilters}>
            View All Dishes
          </button>
        </div>
      )}
    </div>
  );
}

export default Menu;
