import React from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: "/add",
    label: "Add Product",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    to: "/list",
    label: "Products",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="4" rx="1" />
        <rect x="2" y="10" width="20" height="4" rx="1" />
        <rect x="2" y="17" width="20" height="4" rx="1" />
      </svg>
    ),
  },
  {
    to: "/orders",
    label: "Orders",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
];

const Sidebar = ({ open, setOpen }) => {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        style={{
          width: open ? "220px" : "64px",
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          flexShrink: 0,
          zIndex: 50,
        }}
        className="hidden md:flex"
      >
        {/* Logo area */}
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            borderBottom: "1px solid var(--border)",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 0 16px var(--accent-glow)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          {open && (
            <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Cartivo</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.5px", textTransform: "uppercase" }}>Admin</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ padding: "16px 8px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              id={`sidebar-nav-${label.toLowerCase().replace(" ", "-")}`}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                color: isActive ? "var(--accent-light)" : "var(--text-secondary)",
                background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                transition: "all 0.18s",
                whiteSpace: "nowrap",
                overflow: "hidden",
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains("active")) {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                const isActive = e.currentTarget.getAttribute("aria-current") === "page";
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <span style={{ flexShrink: 0 }}>{icon}</span>
              {open && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom version badge */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          {open ? (
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div className="live-dot" />
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)" }}>All Systems Live</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>v2.1.0 · Socket.IO</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="live-dot" />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: open ? 0 : "-240px",
          width: "240px",
          height: "100vh",
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          transition: "left 0.28s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 50,
        }}
        className="md:hidden"
      >
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            borderBottom: "1px solid var(--border)",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Cartivo</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Admin</div>
          </div>
        </div>
        <nav style={{ padding: "16px 10px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 14px",
                borderRadius: "var(--radius-md)",
                color: isActive ? "var(--accent-light)" : "var(--text-secondary)",
                background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 500,
                transition: "all 0.18s",
              })}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
