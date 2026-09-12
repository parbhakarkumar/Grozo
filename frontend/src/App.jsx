import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ── Layouts ──────────────────────────────────────────────
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// ── Route Guards ─────────────────────────────────────────
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// ── User / Shopping Pages ─────────────────────────────────
import Home from "./Pages/Home";
import Collection from "./Pages/Collection";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Product from "./Pages/Product";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login";
import PlaceOrder from "./Pages/PlaceOrder";
import Orders from "./Pages/Orders";
import Profile from "./Pages/Profile";
import Settings from "./Pages/Settings";
import Verify from "./Pages/Verify";
import Wishlist from "./Pages/Wishlist";
import UserOrderTracking from "./Pages/UserOrderTracking";

// ── Admin Pages ───────────────────────────────────────────
import AdminDashboard  from "./admin/AdminDashboard";
import AdminOrders     from "./admin/AdminOrders";
import AdminTracking   from "./admin/AdminTracking";
import AdminProducts   from "./admin/AdminProducts";
import AdminCategories from "./admin/AdminCategories";
import AdminAddProduct from "./admin/AdminAddProduct";
import AdminEditProduct from "./admin/AdminEditProduct";
import AdminUsers      from "./admin/AdminUsers";
import AdminAnalytics  from "./admin/AdminAnalytics";
import AdminSettings   from "./admin/AdminSettings";
import AdminProfile    from "./admin/AdminProfile";

// ── Auto scroll-to-top on every route change ──────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// ─────────────────────────────────────────────────────────
const App = () => {
  return (
    <>
      <ScrollToTop />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>

        {/* ── STANDALONE AUTH PAGE (no layout wrapper) ── */}
        <Route path="/login"  element={<Login />} />
        <Route path="/verify" element={<Verify />} />

        {/* ── USER / SHOPPING LAYOUT ─────────────────────
            All shopping pages share the same Navbar + Footer
        ─────────────────────────────────────────────────── */}
        <Route element={<UserLayout />}>
          <Route path="/"               element={<Home />} />
          <Route path="/shop"           element={<Home />} />
          <Route path="/products"       element={<Collection />} />
          <Route path="/collection"     element={<Collection />} />
          <Route path="/about"          element={<About />} />
          <Route path="/contact"        element={<Contact />} />
          <Route path="/product/:productId" element={<Product />} />

          {/* Auth-protected user pages */}
          <Route path="/wishlist"     element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/cart"         element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout"     element={<ProtectedRoute><PlaceOrder /></ProtectedRoute>} />
          <Route path="/place-order"  element={<ProtectedRoute><PlaceOrder /></ProtectedRoute>} />
          <Route path="/orders"       element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:orderId/tracking" element={<ProtectedRoute><UserOrderTracking /></ProtectedRoute>} />
          <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings"     element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Route>

        {/* ── ADMIN LAYOUT ───────────────────────────────
            All admin pages share the dark sidebar + topbar
            Protected: role must be "admin"
        ─────────────────────────────────────────────────── */}
        <Route
          path="/admin"
          element={<AdminRoute><AdminLayout /></AdminRoute>}
        >
          {/* Redirect /admin → /admin/dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"          element={<AdminDashboard />} />
          <Route path="orders"             element={<AdminOrders />} />
          <Route path="tracking"           element={<AdminTracking />} />
          <Route path="tracking/:orderId"  element={<AdminTracking />} />
          <Route path="products"           element={<AdminProducts />} />
          <Route path="products/add"       element={<AdminAddProduct />} />
          <Route path="products/edit/:productId" element={<AdminEditProduct />} />
          <Route path="categories"         element={<AdminCategories />} />
          <Route path="users"              element={<AdminUsers />} />
          <Route path="analytics"          element={<AdminAnalytics />} />
          <Route path="settings"           element={<AdminSettings />} />
          <Route path="profile"            element={<AdminProfile />} />
        </Route>

        {/* ── FALLBACK ─────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
};

export default App;

