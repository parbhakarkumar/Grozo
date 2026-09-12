import React from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import Footer from "../components/Footer";
import FloatingCartBar from "../components/FloatingCartBar";
import { Outlet } from "react-router-dom";

/**
 * UserLayout — Shopping-focused layout.
 * Wraps all customer-facing pages with Navbar, SearchBar, FloatingCartBar, Footer.
 */
const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 sm:pb-20 transition-colors duration-200">
      {/* Sticky Navigation */}
      <Navbar />
      <SearchBar />

      {/* Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
        <Outlet />
      </main>

      {/* Floating Cart Bar (quick-commerce) */}
      <FloatingCartBar />

      {/* Footer */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Footer />
      </div>
    </div>
  );
};

export default UserLayout;
