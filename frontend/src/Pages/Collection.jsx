import React, { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { useSettings } from "../context/SettingsContext";
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
  const { t } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  const categoriesList = [
    "Masala & Spices",
    "Atta, Rice & Oil",
    "Dairy & Breakfast",
    "Snacks & Instant Food",
    "Beverages & Tea",
    "Cleaning & Household"
  ];

  const subCategoriesList = ["Daily Essentials", "Cooking Essentials", "Instant Food"];

  // Read URL query parameter on mount or when searchParams change
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (urlCategory) {
      setCategory([urlCategory]);
    }
  }, [searchParams]);

  const toggleCategory = (e) => {
    const val = e.target.value;
    let updatedCategory = [];
    if (category.includes(val)) {
      updatedCategory = category.filter((item) => item !== val);
    } else {
      updatedCategory = [...category, val];
    }
    setCategory(updatedCategory);

    // Sync with URL query string
    if (updatedCategory.length === 1) {
      setSearchParams({ category: updatedCategory[0] });
    } else {
      setSearchParams({});
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
    setSearchParams({});
  };

  const applyFilter = () => {
    let productsCopy = products ? products.slice() : [];

    // Search bar filtering
    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category strict filtering (only return products belonging to selected categories)
    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }

    // SubCategory strict filtering
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

  return (
    <div className="py-4 sm:py-6">
      
      {/* Mobile Filter Header Toggle */}
      <div className="flex sm:hidden items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showFilters ? "Hide Filters" : t("filters", "Filters")}</span>
        </button>

        <span className="text-xs text-slate-600 dark:text-slate-300 font-bold">
          {filterProducts.length} {t("items", "Items")}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        
        {/* ------------ Filter Sidebar ----------- */}
        <aside className={`w-full sm:w-60 shrink-0 ${showFilters ? "block" : "hidden sm:block"}`}>
          <div className="sticky top-32 space-y-4">
            
            {/* Filter Header with Clear Action */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white">
                  {t("filters", "Filters")}
                </span>
              </div>
              {(category.length > 0 || subCategory.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
                >
                  {t("reset_all", "Reset All")}
                </button>
              )}
            </div>

            {/* Active Filter Chips */}
            {(category.length > 0 || subCategory.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {category.map((cat) => (
                  <span
                    key={cat}
                    onClick={() => {
                      setCategory((prev) => prev.filter((i) => i !== cat));
                      setSearchParams({});
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-300 text-[11px] font-bold cursor-pointer hover:bg-cyan-200 dark:hover:bg-cyan-900/50"
                  >
                    {cat}
                    <X className="w-3 h-3" />
                  </span>
                ))}
                {subCategory.map((sub) => (
                  <span
                    key={sub}
                    onClick={() => setSubCategory((prev) => prev.filter((i) => i !== sub))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-300 text-[11px] font-bold cursor-pointer hover:bg-cyan-200 dark:hover:bg-cyan-900/50"
                  >
                    {sub}
                    <X className="w-3 h-3" />
                  </span>
                ))}
              </div>
            )}

            {/* Category Filter Box */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <p className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase mb-3">
                {t("categories", "Categories")}
              </p>
              <div className="space-y-2.5">
                {categoriesList.map((cat) => (
                  <label
                    key={cat}
                    className={`flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none transition-colors ${
                      category.includes(cat) ? "text-cyan-600 dark:text-cyan-400 font-bold" : "text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={cat}
                      checked={category.includes(cat)}
                      onChange={toggleCategory}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-cyan-600 focus:ring-cyan-600 cursor-pointer accent-cyan-600"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SubCategory Filter Box */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <p className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase mb-3">
                {t("sub_categories", "Sub-Categories")}
              </p>
              <div className="space-y-2.5">
                {subCategoriesList.map((sub) => (
                  <label
                    key={sub}
                    className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      value={sub}
                      checked={subCategory.includes(sub)}
                      onChange={toggleSubCategory}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-cyan-600 focus:ring-cyan-600 cursor-pointer accent-cyan-600"
                    />
                    <span>{sub}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Delivery Guarantee Note */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
              <span>All items dispatch within 8 minutes!</span>
            </div>

          </div>
        </aside>

        {/* ------------ Product Grid & Sort Controls ----------- */}
        <main className="flex-1">
          
          {/* Header Row: Title & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-cyan-600 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  ⚡ 8-MIN CATALOG
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {category.length === 1 ? category[0] : "All Grocery Products"}
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Showing <span className="text-cyan-600 dark:text-cyan-400 font-bold">{filterProducts.length}</span> items matching selection
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                  className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors shadow-xs cursor-pointer"
                >
                  <option value="relevant">Featured / Relevant</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Grid with Framer Motion Layout */}
          {filterProducts.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch"
            >
              {filterProducts.map((item, index) => (
                <motion.div
                  key={item._id || index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="h-full"
                >
                  <ProductItem {...item} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-4 flex flex-col items-center justify-center bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 my-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300 mb-3">
                <PackageOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                No matching items found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 font-medium">
                Try clearing your search query or reset category filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-cyan-700 transition-colors shadow-xs"
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
