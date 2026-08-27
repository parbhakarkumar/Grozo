import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // "all" | "low" | "out" | "in"
  const [deletingId, setDeletingId] = useState(null);
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockValues, setStockValues] = useState({});
  const [updatingStock, setUpdatingStock] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        headers: { token },
      });
      if (response.data.success) {
        setList(response.data.products);
        // Initialize stock values
        const stocks = {};
        response.data.products.forEach((p) => {
          stocks[p._id] = p.stock !== undefined ? p.stock : 100;
        });
        setStockValues(stocks);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Are you sure you want to remove this product?")) return;
    setDeletingId(id);
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Product removed successfully");
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove product");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStockSave = async (productId) => {
    const newStock = Number(stockValues[productId]);
    if (isNaN(newStock) || newStock < 0) {
      toast.error("Stock must be a positive number");
      return;
    }
    setUpdatingStock(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/update-stock`,
        { productId, stock: newStock },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Stock updated successfully");
        setEditingStockId(null);
        // Update local list
        setList((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, stock: newStock } : p))
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update stock");
    } finally {
      setUpdatingStock(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const lowStockCount = list.filter((item) => (item.stock ?? 100) > 0 && (item.stock ?? 100) <= 5).length;
  const outOfStockCount = list.filter((item) => (item.stock ?? 100) === 0).length;

  const filtered = list.filter((item) => {
    const stock = item.stock ?? 100;
    const matchesSearch =
      search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (stockFilter === "low") return stock > 0 && stock <= 5;
    if (stockFilter === "out") return stock === 0;
    if (stockFilter === "in") return stock > 5;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1200px" }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>Products & Stock</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Manage catalog, inventory counts, and track stock alerts in real-time.
          </p>
        </div>
        <button onClick={fetchList} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }}>
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh Catalog
        </button>
      </div>

      {/* Filters & Search */}
      <div className="glass-card animate-fade-up" style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
        {/* Search */}
        <div style={{ position: "relative", minWidth: "280px", flex: "1 1 280px" }}>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="product-search"
            type="text"
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Stock Filter Pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setStockFilter("all")}
            className={`badge ${stockFilter === "all" ? "badge-info" : "badge-muted"}`}
            style={{ cursor: "pointer", padding: "6px 12px", fontSize: "12px", border: "none" }}
          >
            All ({list.length})
          </button>
          <button
            onClick={() => setStockFilter("in")}
            className={`badge ${stockFilter === "in" ? "badge-success" : "badge-muted"}`}
            style={{ cursor: "pointer", padding: "6px 12px", fontSize: "12px", border: "none" }}
          >
            In Stock
          </button>
          <button
            onClick={() => setStockFilter("low")}
            className={`badge ${stockFilter === "low" ? "badge-warning" : "badge-muted"}`}
            style={{ cursor: "pointer", padding: "6px 12px", fontSize: "12px", border: "none" }}
          >
            ⚠️ Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setStockFilter("out")}
            className={`badge ${stockFilter === "out" ? "badge-danger" : "badge-muted"}`}
            style={{ cursor: "pointer", padding: "6px 12px", fontSize: "12px", border: "none" }}
          >
            ❌ Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card animate-fade-up" style={{ overflow: "hidden" }}>
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "56px 2fr 1fr 1fr 180px 80px",
            gap: "12px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--border)",
            alignItems: "center",
          }}
        >
          {["Image", "Product", "Category", "Price", "Stock / Inventory", "Action"].map((h) => (
            <span
              key={h}
              style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px" }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 2fr 1fr 1fr 180px 80px",
                gap: "12px",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                alignItems: "center",
              }}
            >
              <div className="skeleton" style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)" }} />
              <div className="skeleton" style={{ height: "13px", width: "70%" }} />
              <div className="skeleton" style={{ height: "13px", width: "60%" }} />
              <div className="skeleton" style={{ height: "13px", width: "50%" }} />
              <div className="skeleton" style={{ height: "28px", width: "120px", borderRadius: "var(--radius-sm)" }} />
              <div className="skeleton" style={{ height: "30px", width: "60px", borderRadius: "var(--radius-sm)" }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 12px", display: "block" }}>
              <rect x="2" y="3" width="20" height="4" rx="1" /><rect x="2" y="10" width="20" height="4" rx="1" /><rect x="2" y="17" width="20" height="4" rx="1" />
            </svg>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>No products matching filter</div>
          </div>
        ) : (
          filtered.map((item, index) => {
            const stock = item.stock !== undefined ? item.stock : 100;
            const isEditing = editingStockId === item._id;

            return (
              <div
                key={item._id || index}
                className="animate-fade-up"
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 2fr 1fr 1fr 180px 80px",
                  gap: "12px",
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border)",
                  alignItems: "center",
                  transition: "background 0.15s",
                  animationDelay: `${index * 0.02}s`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {/* Image */}
                <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)", flexShrink: 0 }}>
                  <img
                    src={item.image?.[0]}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Name */}
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", display: "flex", gap: "6px", alignItems: "center" }}>
                    <span>{item.subCategory}</span>
                    {item.bestseller && (
                      <span className="badge badge-warning" style={{ fontSize: "9px", padding: "1px 5px" }}>⭐ Bestseller</span>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <span className="badge badge-muted">{item.category}</span>
                </div>

                {/* Price */}
                <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                  {currency}{(item.price || 0).toLocaleString("en-IN")}
                </div>

                {/* Stock Editor */}
                <div>
                  {isEditing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="number"
                        min="0"
                        value={stockValues[item._id] ?? stock}
                        onChange={(e) =>
                          setStockValues({ ...stockValues, [item._id]: e.target.value })
                        }
                        style={{
                          width: "70px",
                          padding: "5px 8px",
                          fontSize: "12px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-input)",
                          border: "1px solid var(--accent)",
                          color: "var(--text-primary)",
                        }}
                      />
                      <button
                        onClick={() => handleStockSave(item._id)}
                        disabled={updatingStock}
                        className="btn-primary"
                        style={{ padding: "5px 9px", fontSize: "11px" }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingStockId(null)}
                        className="btn-ghost"
                        style={{ padding: "5px 8px", fontSize: "11px" }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {stock === 0 ? (
                        <span className="badge badge-danger" style={{ fontSize: "11px" }}>0 (Out of stock)</span>
                      ) : stock <= 5 ? (
                        <span className="badge badge-warning" style={{ fontSize: "11px" }}>⚠️ {stock} units left</span>
                      ) : (
                        <span className="badge badge-success" style={{ fontSize: "11px" }}>{stock} in stock</span>
                      )}

                      <button
                        onClick={() => setEditingStockId(item._id)}
                        title="Edit stock"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete */}
                <div>
                  <button
                    id={`delete-product-${item._id}`}
                    onClick={() => removeProduct(item._id)}
                    disabled={deletingId === item._id}
                    className="btn-danger"
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", fontSize: "11px", opacity: deletingId === item._id ? 0.6 : 1 }}
                  >
                    {deletingId === item._id ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" />
                      </svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" />
                      </svg>
                    )}
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default List;
