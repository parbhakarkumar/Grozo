import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { ArrowRight, Sparkles } from "lucide-react";

const LatestCollections = () => {
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

  const tabs = ["All", "Women", "Men", "Kids"];

  return (
    <section className="my-16 sm:my-24">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <Title text1="LATEST" text2="COLLECTIONS" />
        <p className="text-xs sm:text-sm text-zinc-500 max-w-xl font-light tracking-wide -mt-3 mb-6">
          Explore our newly unveiled season drops, combining relaxed silhouettes with structured tailoring and timeless tones.
        </p>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-full border border-zinc-200/80">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Rendering Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-6">
        {latestProducts.map((product, index) => (
          <ProductItem key={product._id || index} {...product} />
        ))}
      </div>

      {/* View All CTA */}
      <div className="mt-12 text-center">
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-zinc-300 text-zinc-900 text-xs font-semibold tracking-widest uppercase hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all duration-200"
        >
          <span>View Entire Collection</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};

export default LatestCollections;

