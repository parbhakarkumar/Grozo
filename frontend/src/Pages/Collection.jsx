import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { 
  SlidersHorizontal, 
  ChevronDown, 
  X, 
  ArrowUpDown, 
  Search, 
  PackageOpen,
  Check
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
    <div className="py-8 sm:py-12 border-t border-zinc-200/70">
      
      {/* Mobile Filter Header Toggle */}
      <div className="flex sm:hidden items-center justify-between pb-4 mb-4 border-b border-zinc-200">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-xl"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showFilters ? "Hide Filters" : "Filter & Refine"}</span>
        </button>

        <span className="text-xs text-zinc-500 font-medium">
          {filterProducts.length} Items
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
        
        {/* ------------ Filter Sidebar ----------- */}
        <aside className={`w-full sm:w-64 shrink-0 ${showFilters ? "block" : "hidden sm:block"}`}>
          <div className="sticky top-28 space-y-6">
            
            {/* Filter Header with Clear Action */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-zinc-900" />
                <span className="text-xs font-bold tracking-widest uppercase text-zinc-900">
                  Filters
                </span>
              </div>
              {(category.length > 0 || subCategory.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-zinc-500 hover:text-zinc-950 underline font-medium"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Active Filter Chips */}
            {(category.length > 0 || subCategory.length > 0) && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {category.map((cat) => (
                  <span
                    key={cat}
                    onClick={() => setCategory((prev) => prev.filter((i) => i !== cat))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-medium cursor-pointer hover:bg-zinc-200 transition-colors"
                  >
                    {cat}
                    <X className="w-3 h-3 text-zinc-500" />
                  </span>
                ))}
                {subCategory.map((sub) => (
                  <span
                    key={sub}
                    onClick={() => setSubCategory((prev) => prev.filter((i) => i !== sub))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-medium cursor-pointer hover:bg-zinc-200 transition-colors"
                  >
                    {sub}
                    <X className="w-3 h-3 text-zinc-500" />
                  </span>
                ))}
              </div>
            )}

            {/* Category Filter Box */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
              <p className="text-xs font-bold tracking-wider text-zinc-900 uppercase mb-4">
                Categories
              </p>
              <div className="space-y-3">
                {categoriesList.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-3 text-xs text-zinc-600 hover:text-zinc-950 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      value={cat}
                      checked={category.includes(cat)}
                      onChange={toggleCategory}
                      className="w-4 h-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950/20 cursor-pointer accent-zinc-950"
                    />
                    <span className="font-normal">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type / Subcategory Filter Box */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
              <p className="text-xs font-bold tracking-wider text-zinc-900 uppercase mb-4">
                Garment Type
              </p>
              <div className="space-y-3">
                {subCategoriesList.map((sub) => (
                  <label
                    key={sub}
                    className="flex items-center gap-3 text-xs text-zinc-600 hover:text-zinc-950 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      value={sub}
                      checked={subCategory.includes(sub)}
                      onChange={toggleSubCategory}
                      className="w-4 h-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950/20 cursor-pointer accent-zinc-950"
                    />
                    <span className="font-normal">{sub}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Guarantee Note */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/60 text-[11px] text-zinc-500 leading-relaxed font-light">
              <p className="font-semibold text-zinc-800 mb-0.5">Ethical Craftsmanship</p>
              All garments are pre-shrunk, skin-friendly, and inspected for supreme stitch durability.
            </div>

          </div>
        </aside>

        {/* ------------ Product Grid & Sort Controls ----------- */}
        <main className="flex-1">
          
          {/* Header Row: Title & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-zinc-200/80">
            <div>
              <div className="inline-flex items-center gap-2">
                <Title text1="CURATED" text2="CATALOG" />
              </div>
              <p className="text-xs text-zinc-400 font-light -mt-4">
                Showing <span className="font-semibold text-zinc-800">{filterProducts.length}</span> curated pieces
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                  className="appearance-none bg-white border border-zinc-200/80 rounded-xl px-4 py-2.5 pr-8 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-zinc-900 transition-colors shadow-xs cursor-pointer"
                >
                  <option value="relevant">Featured / Relevant</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {filterProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {filterProducts.map((item, index) => (
                <ProductItem key={item._id || index} {...item} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-24 px-4 flex flex-col items-center justify-center bg-white rounded-3xl border border-zinc-200/70 my-8">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mb-1">
                No matching apparel found
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mb-6 font-light">
                We couldn't find any products matching your current search or filter combination.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-zinc-950 text-white rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-zinc-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Collection;

