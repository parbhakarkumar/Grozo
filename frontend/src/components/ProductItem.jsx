import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { Star, ArrowUpRight } from "lucide-react";

const ProductItem = ({ _id, image, name, price, bestseller, category }) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link
      onClick={() => scrollTo(0, 0)}
      to={`/product/${_id}`}
      className="group flex flex-col cursor-pointer bg-white rounded-2xl p-2.5 sm:p-3 border border-zinc-200/70 hover:border-zinc-300 hover:shadow-elevated transition-all duration-300 relative"
    >
      {/* Image Container with Badge */}
      <div className="relative w-full aspect-[3/4] bg-zinc-100 rounded-xl overflow-hidden mb-3">
        <img
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          src={image && image.length > 0 ? image[0] : ""}
          alt={name}
          loading="lazy"
        />

        {/* Bestseller / New Tag */}
        {bestseller && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-zinc-950/90 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase rounded-md shadow-xs">
            Bestseller
          </span>
        )}

        {/* Hover Quick Action Button */}
        <div className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-md">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 px-1">
        {category && (
          <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase mb-0.5">
            {category}
          </span>
        )}
        <h3 className="text-xs sm:text-sm font-medium text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1">
          {name}
        </h3>

        {/* Rating preview & price */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
          <p className="text-xs sm:text-sm font-bold text-zinc-950 font-sans">
            {currency}{price}
          </p>

          <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>4.9</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;

