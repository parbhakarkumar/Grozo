import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

/**
 * ProtectedRoute — Requires the user to be logged in.
 * If not logged in, redirects to /login preserving the intended destination.
 */
const ProtectedRoute = ({ children }) => {
  const { token } = useContext(ShopContext);
  const location = useLocation();
  const activeToken = token || localStorage.getItem("token");

  if (!activeToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
