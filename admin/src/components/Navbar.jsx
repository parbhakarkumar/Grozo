import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { assets } from "../assets/assets";

const PAGE_LABELS = {
  "/dashboard": "Dashboard",
  "/add": "Add Product",
  "/list": "Products",
  "/orders": "Orders",
};

const Navbar = ({ setToken, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageLabel = PAGE_LABELS[location.pathname] || "Admin";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Left: Hamburger + Logo + Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Sidebar toggle */}
        <button
          id="sidebar-toggle-btn"
          onClick={() => setSidebarOpen((v) => !v)}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "7px",
            cursor: "pointer",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--accent-light)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <img
          src={assets.logo}
          alt="Cartivo"
          style={{ height: "28px", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }}
        />

        {/* Separator + Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>·</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
            {pageLabel}
          </span>
        </div>
      </div>

      {/* Right: Socket status + Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Live socket indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "999px",
            padding: "5px 13px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#10b981",
          }}
        >
          <div className="live-dot" />
          <span className="hidden sm:inline">Real-Time Active</span>
          <span className="sm:hidden">Live</span>
        </div>

        {/* Admin avatar + dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            id="admin-avatar-btn"
            onClick={() => setDropdownOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "6px 12px 6px 8px",
              cursor: "pointer",
              color: "var(--text-primary)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
            >
              A
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.3 }} className="hidden sm:block">
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>Admin</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Super Admin</div>
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                color: "var(--text-muted)",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                minWidth: "170px",
                boxShadow: "var(--shadow-lg)",
                overflow: "hidden",
                zIndex: 100,
                animation: "fadeInUp 0.15s ease both",
              }}
            >
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>Admin Panel</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Cartivo v2.1</div>
              </div>
              <button
                id="logout-btn"
                onClick={() => {
                  setToken("");
                  localStorage.removeItem("token");
                  setDropdownOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "11px 16px",
                  background: "transparent",
                  border: "none",
                  color: "var(--danger)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: "background 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--danger-bg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
