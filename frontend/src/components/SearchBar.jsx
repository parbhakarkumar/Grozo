import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useLocation } from "react-router-dom";
import { Search, X, Sparkles } from "lucide-react";

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("collection")) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location]);

  const quickTags = ["Cotton", "T-shirt", "Jacket", "Denim", "Trouser", "Women", "Men"];

  return showSearch && visible ? (
    <div className="bg-white/95 backdrop-blur-md border-b border-zinc-200/80 py-6 px-4 transition-all duration-300 animate-fade-in shadow-sm">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
        {/* Search input bar */}
        <div className="w-full flex items-center justify-between gap-3 bg-zinc-50 border border-zinc-300/80 focus-within:border-zinc-950 focus-within:ring-2 focus-within:ring-zinc-950/5 rounded-2xl px-4 py-2.5 transition-all">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-zinc-900 placeholder:text-zinc-400 font-sans"
            type="text"
            placeholder="Search collections, cotton shirts, jackets, trousers..."
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-zinc-400 hover:text-zinc-700 text-xs px-1.5 py-0.5 rounded bg-zinc-200/60"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setShowSearch(false)}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/50 transition-colors"
            title="Close Search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Tag Recommendations */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
          <span className="flex items-center gap-1 text-zinc-400 font-medium">
            <Sparkles className="w-3 h-3" /> Popular:
          </span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearch(tag)}
              className={`px-3 py-1 rounded-full border text-[11px] tracking-wide transition-all ${
                search.toLowerCase() === tag.toLowerCase()
                  ? "bg-zinc-900 text-white border-zinc-900 font-medium"
                  : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-950"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;
};

export default SearchBar;

