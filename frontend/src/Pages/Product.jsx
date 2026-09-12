import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShopContext, getProductPriceForSize } from "../context/ShopContext";
import { useSettings } from "../context/SettingsContext";
import RelatedProduct from "../components/RelatedProduct";
import { 
  Star, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Check, 
  Heart,
  Share2,
  Sparkles,
  ArrowRight,
  Minus,
  Plus
} from "lucide-react";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, currency, addToCart } = useContext(ShopContext);
  const { playChime, t } = useSettings();
  const [productData, setProductData] = useState(false);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState("");
  const [activeTab, setActiveTab] = useState("description");

  const fetchProductData = async () => {
    if (products && products.length > 0) {
      const found = products.find((product) => product._id === productId);
      if (found) {
        setProductData(found);
        setImage(found.image[0]);
        // default select first size if available
        if (found.sizes && found.sizes.length > 0) {
          setSize(found.sizes[0]);
        }
      }
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  const currentUnitPrice = productData ? getProductPriceForSize(productData, size) : 0;
  const currentTotalPrice = currentUnitPrice * quantity;

  const handleAddToCart = () => {
    if (!size) {
      toast.error("Please choose a size before adding to bag");
      return;
    }
    addToCart(productData._id, size, quantity);
    playChime("add");
    toast.success(`${quantity}x ${productData.name} (${size}) added to bag!`, {
      position: "bottom-center",
    });
  };

  const handleBuyNow = () => {
    if (!size) {
      toast.error("Please choose a size first");
      return;
    }
    addToCart(productData._id, size, quantity);
    playChime("add");
    navigate("/cart");
  };

  return productData ? (
    <div className="py-8 sm:py-12 border-t border-zinc-200/80 dark:border-slate-800 animate-fade-in">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-slate-400 mb-8 font-light">
        <span onClick={() => navigate("/")} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">Home</span>
        <span>/</span>
        <span onClick={() => navigate("/collection")} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">Collection</span>
        <span>/</span>
        <span className="text-zinc-800 dark:text-slate-200 font-medium truncate">{productData.name}</span>
      </div>

      {/* Main Product Showcase (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        
        {/* Left: Gallery (Thumbnails + Main Stage) - 7 Cols */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          
          {/* Thumbnails list */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-24 shrink-0">
            {productData.image.map((item, i) => (
              <button
                key={i}
                onClick={() => setImage(item)}
                className={`relative w-16 sm:w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  image === item
                    ? "border-zinc-950 dark:border-cyan-500 shadow-md ring-2 ring-zinc-950/10 dark:ring-emerald-500/20"
                    : "border-transparent opacity-70 hover:opacity-100 hover:border-zinc-300 dark:hover:border-slate-600"
                }`}
              >
                <img
                  src={item}
                  alt={`Thumbnail ${i}`}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80";
                  }}
                />
              </button>
            ))}
          </div>

          {/* Main Large Image Container */}
          <div className="flex-1 relative aspect-[3/4] sm:aspect-[4/5] bg-zinc-100 dark:bg-slate-800 rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-slate-700 group">
            <img
              src={image}
              alt={productData.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80";
              }}
            />
            {productData.bestseller && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-zinc-950/90 dark:bg-cyan-950/90 backdrop-blur-xs text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-sm">
                Bestseller
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Info & Actions - 5 Cols */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          
          {/* Category & Badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-widest text-zinc-400 dark:text-slate-400 uppercase">
              {productData.category} • {productData.subCategory}
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
              In Stock & Ready
            </div>
          </div>

          {/* Title */}
          <h1 className="font-editorial text-2xl sm:text-3xl text-zinc-950 dark:text-white font-normal leading-tight mb-3">
            {productData.name}
          </h1>

          {/* Star Reviews */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-zinc-500 dark:text-slate-400 font-medium">4.9 (132 Verified Reviews)</span>
          </div>

          {/* Price & Dynamic Size/Quantity Calculation */}
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6 pb-6 border-b border-zinc-200 dark:border-slate-800">
            <div>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <p className="text-3xl font-black text-zinc-950 dark:text-white font-sans tracking-tight">
                  {currency}{currentUnitPrice}
                </p>
                {size && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300">
                    for {size}
                  </span>
                )}
                {quantity > 1 && (
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    Total: {currency}{currentTotalPrice} ({quantity} items)
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-400 dark:text-slate-500 font-light mt-1 block">
                Inclusive of all local taxes • 8-Min Express Delivery
              </span>
            </div>
          </div>

          {/* Description Excerpt */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-slate-300 font-light leading-relaxed mb-6">
            {productData.description}
          </p>

          {/* Pack / Size Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Select Pack / Unit Size (Price adjusts per size)
              </label>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold">
                ⚡ 8-Min Fast Dispatch
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {productData.sizes.map((s, i) => {
                const sPrice = getProductPriceForSize(productData, s);
                return (
                  <button
                    key={i}
                    onClick={() => setSize(s)}
                    className={`min-w-[70px] px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      s === size
                        ? "bg-cyan-600 text-white shadow-md ring-2 ring-cyan-500/40"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-500 dark:hover:border-cyan-500 hover:text-cyan-800 dark:hover:text-cyan-300"
                    }`}
                  >
                    <span>{s}</span>
                    <span className={`text-[10px] font-mono ${s === size ? "text-cyan-100 font-semibold" : "text-slate-400"}`}>
                      {currency}{sPrice}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="mb-8 flex items-center gap-4 bg-zinc-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-slate-700">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Quantity:
            </span>
            <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3.5 py-1.5 text-sm font-bold text-slate-900 dark:text-white min-w-[36px] text-center font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 ml-auto font-medium">
              Subtotal: <strong className="text-cyan-600 dark:text-cyan-400 text-sm font-black">{currency}{currentTotalPrice}</strong>
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              className="w-full flex-1 inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black tracking-wider uppercase py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>{t("add_to_cart", "Add To Cart")} • {currency}{currentTotalPrice}</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-cyan-950 text-xs font-black tracking-wider uppercase py-3.5 px-6 rounded-2xl transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              <span>{t("instant_buy", "Instant Buy")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Trust Value Badges Card */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-slate-800/80 border border-zinc-200/80 dark:border-slate-700 p-4 space-y-2.5 text-xs text-zinc-600 dark:text-slate-300 font-light">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-zinc-900 dark:text-cyan-400 shrink-0" />
              <span>100% Genuine, Authenticity Guaranteed</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-zinc-900 dark:text-amber-400 shrink-0" />
              <span>Cash on delivery & Express dispatch available</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-zinc-900 dark:text-sky-400 shrink-0" />
              <span>Easy 7-day complimentary return and size exchange</span>
            </div>
          </div>

        </div>
      </div>

      {/* Accordion / Tabs for Specifications & Reviews */}
      <div className="mt-20 border-t border-zinc-200 dark:border-slate-800 pt-10">
        <div className="flex items-center gap-8 border-b border-zinc-200 dark:border-slate-800 pb-4 mb-6 text-sm">
          <button
            onClick={() => setActiveTab("description")}
            className={`font-semibold tracking-wider transition-colors relative py-1 ${
              activeTab === "description" ? "text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-slate-500 hover:text-zinc-700 dark:hover:text-slate-300"
            }`}
          >
            Product Description
            {activeTab === "description" && (
              <span className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-zinc-950 dark:bg-cyan-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("material")}
            className={`font-semibold tracking-wider transition-colors relative py-1 ${
              activeTab === "material" ? "text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-slate-500 hover:text-zinc-700 dark:hover:text-slate-300"
            }`}
          >
            Materials & Sustainability
            {activeTab === "material" && (
              <span className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-zinc-950 dark:bg-cyan-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`font-semibold tracking-wider transition-colors relative py-1 ${
              activeTab === "reviews" ? "text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-slate-500 hover:text-zinc-700 dark:hover:text-slate-300"
            }`}
          >
            Reviews (132)
            {activeTab === "reviews" && (
              <span className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-zinc-950 dark:bg-cyan-400" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="text-xs sm:text-sm text-zinc-600 dark:text-slate-300 leading-relaxed max-w-3xl font-light space-y-4">
          {activeTab === "description" && (
            <>
              <p>
                Crafted from carefully chosen combed cotton yarns, this essential piece delivers an unmatched softness and natural breathability. Designed with modern proportions and reinforced stitching for daily wear.
              </p>
              <p>
                Pre-washed to minimize shrinkage and maintain a tailored drape wash after wash. Pair effortlessly with tailored trousers or relaxed denim for an elevated everyday uniform.
              </p>
            </>
          )}

          {activeTab === "material" && (
            <>
              <p>• 100% GOTS-Certified Organic Long-Staple Cotton.</p>
              <p>• Dyed with non-toxic, OEKO-TEX certified eco-friendly pigments.</p>
              <p>• Machine wash cold on delicate cycle; tumble dry low or hang dry in shade.</p>
            </>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-slate-800/60 border border-zinc-200/60 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-zinc-900 dark:text-slate-100 text-xs">Arjun S.</span>
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-600 dark:text-slate-400 font-light">
                  "The fit and fabric quality are stellar. Feels like high-end luxury brands at a fraction of the cost."
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <RelatedProduct category={productData.category} subCategory={productData.subCategory} />

    </div>
  ) : (
    <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-950 dark:border-white border-t-transparent animate-spin"></div>
    </div>
  );
};

export default Product;

