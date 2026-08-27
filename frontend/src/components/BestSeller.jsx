import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { Flame } from "lucide-react";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    if (products && products.length > 0) {
      setBestSeller(products.filter((item) => item.bestseller).slice(0, 5));
    }
  }, [products]);

  return (
    <section className="my-16 sm:my-24">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-[10px] font-bold tracking-widest uppercase mb-3">
          <Flame className="w-3 h-3 text-amber-600 fill-amber-600" />
          <span>Most Wanted</span>
        </div>
        <Title text1="MOST LOVED" text2="BESTSELLERS" />
        <p className="text-xs sm:text-sm text-zinc-500 max-w-xl font-light tracking-wide -mt-3">
          Discover the top-rated sartorial pieces adored by our community for exceptional comfort, drape, and enduring longevity.
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-6">
        {bestSeller.map((item, index) => (
          <ProductItem key={item._id || index} {...item} />
        ))}
      </div>
    </section>
  );
};

export default BestSeller;

