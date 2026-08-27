import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import ProductItem from "./ProductItem";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    if (products && products.length > 0) {
      if (activeTab === "All") {
        setLatestProducts(products.slice(0, 10));
      } else {
        setLatestProducts(
          products.filter((p) => p.category === activeTab).slice(0, 10)
        );
      }
    }
  }, [products, activeTab]);

  const tabs = ["All", "Masala & Spices", "Atta, Rice & Oil", "Dairy & Breakfast", "Snacks & Instant Food"];

  return (
    <section className="my-8 sm:my-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-[#0C831F] font-black text-xs uppercase tracking-widest mb-1">
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span>Delivered in 8-10 Mins</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Trending SuperFast Items
          </h2>
        </div>

        {/* Quick Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                activeTab === tab
                  ? "bg-[#0C831F] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Product Cards with Framer Motion Stagger */}
      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
      >
        {latestProducts.map((product, index) => (
          <motion.div
            key={product._id || index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <ProductItem {...product} />
          </motion.div>
        ))}
      </motion.div>

      {/* View All Button */}
      <div className="mt-8 text-center">
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-600 text-slate-900 hover:text-emerald-700 text-xs font-black uppercase tracking-wider transition-all shadow-xs"
        >
          <span>Explore All 8-Min Products</span>
          <ArrowRight className="w-4 h-4 text-emerald-600" />
        </Link>
      </div>
    </section>
  );
};

export default LatestCollection;
