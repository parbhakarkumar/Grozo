import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";
import { motion } from "framer-motion";
import { 
  SlidersHorizontal, 
  ChevronDown, 
  X, 
  PackageOpen,
  Zap,
  Sparkles
} from "lucide-react";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilters, setShowFilters] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  const toggleCategory = (e) => {
    const val = e.target.value;
    if (category.includes(val)) {
      setCategory((prev) => prev.filter((item) => item !== val));
    } else {
      setCategory((prev) => [...prev, val]);
    }
  };

  const toggleSubCategory = (e) => {
    const val = e.target.value;
    if (subCategory.includes(val)) {
      setSubCategory((prev) => prev.filter((item) => item !== val));
    } else {
      setSubCategory((prev) => [...prev, val]);
    }
  };

  const clearAllFilters = () => {
    setCategory([]);
    setSubCategory([]);
  };

  const applyFilter = () => {
    let productsCopy = products ? products.slice() : [];

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }
    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let copy = [...filterProducts];

    switch (sortType) {
      case "low-high":
        setFilterProducts(copy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilterProducts(copy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  const categoriesList = ["Men", "Women", "Kids"];
  const subCategoriesList = ["Topwear", "Bottomwear", "Winterwear"];

  return (
    <div className="py-4 sm:py-6">
      
      {/* Mobile Filter Header Toggle */}
      <div className="flex sm:hidden items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0C831F] text-white text-xs font-bold rounded-xl"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showFilters ? "Hide Filters" : "Filter Products"}</span>
        </button>

        <span className="text-xs text-slate-600 font-bold">
          {filterProducts.length} Items
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        
        {/* ------------ Filter Sidebar ----------- */}
        <aside className={`w-full sm:w-60 shrink-0 ${showFilters ? "block" : "hidden sm:block"}`}>
          <div className="sticky top-32 space-y-4">
            
            {/* Filter Header with Clear Action */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#0C831F]" />
                <span className="text-xs font-black tracking-wider uppercase text-slate-900">
                  Filters
                </span>
              </div>
              {(category.length > 0 || subCategory.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-[#0C831F] font-bold hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Active Filter Chips */}
            {(category.length > 0 || subCategory.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {category.map((cat) => (
                  <span
                    key={cat}
                    onClick={() => setCategory((prev) => prev.filter((i) => i !== cat))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-[#0C831F] text-[11px] font-bold cursor-pointer hover:bg-emerald-200"
                  >
                    {cat}
                    <X className="w-3 h-3" />
                  </span>
                ))}
                {subCategory.map((sub) => (
                  <span
                    key={sub}
                    onClick={() => setSubCategory((prev) => prev.filter((i) => i !== sub))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-[#0C831F] text-[11px] font-bold cursor-pointer hover:bg-emerald-200"
                  >
                    {sub}
                    <X className="w-3 h-3" />
                  </span>
                ))}
              </div>
            )}

            {/* Category Filter Box */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-xs font-black tracking-wider text-slate-900 uppercase mb-3">
                Categories
              </p>
              <div className="space-y-2.5">
                {categoriesList.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2.5 text-xs text-slate-700 font-medium hover:text-[#0C831F] cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      value={cat}
                      checked={category.includes(cat)}
                      onChange={toggleCategory}
                      className="w-4 h-4 rounded border-slate-300 text-[#0C831F] focus:ring-[#0C831F] cursor-pointer accent-[#0C831F]"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SubCategory Filter Box */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-xs font-black tracking-wider text-slate-900 uppercase mb-3">
                Garment Type
              </p>
              <div className="space-y-2.5">
                {subCategoriesList.map((sub) => (
                  <label
                    key={sub}
                    className="flex items-center gap-2.5 text-xs text-slate-700 font-medium hover:text-[#0C831F] cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      value={sub}
                      checked={subCategory.includes(sub)}
                      onChange={toggleSubCategory}
                      className="w-4 h-4 rounded border-slate-300 text-[#0C831F] focus:ring-[#0C831F] cursor-pointer accent-[#0C831F]"
                    />
                    <span>{sub}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Delivery Guarantee Note */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
              <span>All items dispatch within 8 minutes!</span>
            </div>

          </div>
        </aside>

        {/* ------------ Product Grid & Sort Controls ----------- */}
        <main className="flex-1">
          
          {/* Header Row: Title & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#0C831F] text-amber-300 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  ⚡ FAST CATALOG
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  All 8-Min Express Items
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Showing <span className="text-[#0C831F]">{filterProducts.length}</span> products
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0C831F] transition-colors shadow-xs cursor-pointer"
                >
                  <option value="relevant">Featured / Relevant</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Grid with Framer Motion Layout */}
          {filterProducts.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              {filterProducts.map((item, index) => (
                <motion.div
                  key={item._id || index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ProductItem {...item} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-4 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 my-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <PackageOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                No matching items found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4 font-medium">
                Try clearing your search query or reset category filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-[#0C831F] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Clear Filters
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Collection;
