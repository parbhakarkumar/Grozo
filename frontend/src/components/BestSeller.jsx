import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    if (products && products.length > 0) {
      setBestSeller(products.filter((item) => item.bestseller).slice(0, 5));
    }
  }, [products]);

  return (
    <section className="my-8 sm:my-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center shadow-xs">
            <Flame className="w-5 h-5 fill-emerald-950" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-amber-600 uppercase">
              HIGH DEMAND
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              🔥 Top Selling Best Sellers
            </h2>
          </div>
        </div>

        <div className="hidden xs:flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Restocked Today</span>
        </div>
      </div>

      {/* Products Grid */}
      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
      >
        {bestSeller.map((item, index) => (
          <motion.div
            key={item._id || index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ProductItem {...item} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default BestSeller;
