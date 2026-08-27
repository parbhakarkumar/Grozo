import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
export const currency = "₹";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        toastStyle={{
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          fontSize: "13px",
        }}
        progressStyle={{ background: "var(--accent)" }}
      />

      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <div className="flex min-h-screen overflow-hidden">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
          <div
            className="flex flex-col flex-1 transition-all duration-300 overflow-hidden"
            style={{ minWidth: 0 }}
          >
            <Navbar setToken={setToken} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main className="flex-1 overflow-y-auto p-6" style={{ background: "var(--bg-base)" }}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard token={token} />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
