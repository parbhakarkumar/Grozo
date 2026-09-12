import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Users = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(backendUrl + "/api/user/all", {
        headers: { token },
        params: {
          page,
          limit: 15,
          search: search.trim() || undefined,
          role: roleFilter || undefined,
        },
      });

      if (res.data.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination.pages || 1);
        setTotalCount(res.data.pagination.total || 0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load customer list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token, page, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handlePromote = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const actionName = newRole === "admin" ? "promote to Admin" : "demote to Customer";
    
    if (!window.confirm(`Are you sure you want to ${actionName}?`)) return;

    try {
      const res = await axios.post(
        backendUrl + "/api/user/promote",
        { userId, role: newRole },
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success(res.data.message || `User role changed to ${newRole}.`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Role change failed.");
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    const actionName = currentActive ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${actionName} this user account?`)) return;

    try {
      const res = await axios.post(
        backendUrl + "/api/user/toggle-active",
        { userId },
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Status change failed.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1400px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
            Customer & Role Management
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Total registered accounts: <strong>{totalCount}</strong> · Manage roles and account security.
          </p>
        </div>

        {/* Filter & Search */}
        <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <option value="">All Roles</option>
            <option value="user">Customer (user)</option>
            <option value="admin">Administrator (admin)</option>
          </select>

          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              fontSize: "12px",
              minWidth: "220px",
            }}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{ padding: "8px 16px", fontSize: "12px", borderRadius: "var(--radius-sm)" }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>User</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Role</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Last Login</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Registered</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    Loading customers...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isAdm = u.role === "admin";
                  return (
                    <tr
                      key={u._id}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "var(--radius-sm)",
                              background: isAdm ? "var(--accent)" : "#0C831F",
                              color: isAdm ? "#fff" : "#fde047",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "12px",
                              flexShrink: 0,
                            }}
                          >
                            {(u.name?.[0] || "U").toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <span
                          className={`badge ${isAdm ? "badge-accent" : "badge-info"}`}
                          style={{ textTransform: "uppercase", fontSize: "10px", fontWeight: 700 }}
                        >
                          {isAdm ? "🛡️ Admin" : "👤 Customer"}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <span
                          className={`badge ${u.isActive ? "badge-success" : "badge-danger"}`}
                          style={{ fontSize: "10px", fontWeight: 600 }}
                        >
                          {u.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px", color: "var(--text-secondary)", fontSize: "12px" }}>
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "Never"}
                      </td>

                      <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "12px" }}>
                        {new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </td>

                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            onClick={() => handlePromote(u._id, u.role)}
                            style={{
                              padding: "6px 10px",
                              fontSize: "11px",
                              fontWeight: 600,
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--border)",
                              background: isAdm ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.1)",
                              color: isAdm ? "#f87171" : "#818cf8",
                              cursor: "pointer",
                            }}
                          >
                            {isAdm ? "Revoke Admin" : "Make Admin"}
                          </button>

                          <button
                            onClick={() => handleToggleActive(u._id, u.isActive)}
                            style={{
                              padding: "6px 10px",
                              fontSize: "11px",
                              fontWeight: 600,
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--border)",
                              background: u.isActive ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                              color: u.isActive ? "#f87171" : "#34d399",
                              cursor: "pointer",
                            }}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Page {page} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  opacity: page <= 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  opacity: page >= totalPages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
