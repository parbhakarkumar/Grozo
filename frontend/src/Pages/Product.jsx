import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
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
  ArrowRight
} from "lucide-react";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [size, setSize] = useState("");
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

  const handleAddToCart = () => {
    if (!size) {
      toast.error("Please choose a size before adding to bag");
      return;
    }
    addToCart(productData._id, size);
    toast.success(`${productData.name} (${size}) added to bag!`, {
      position: "bottom-center",
    });
  };

  const handleBuyNow = () => {
    if (!size) {
      toast.error("Please choose a size first");
      return;
    }
    addToCart(productData._id, size);
    navigate("/cart");
  };

  return productData ? (
    <div className="py-8 sm:py-12 border-t border-zinc-200/80 animate-fade-in">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-8 font-light">
        <span onClick={() => navigate("/")} className="hover:text-zinc-950 cursor-pointer">Home</span>
        <span>/</span>
        <span onClick={() => navigate("/collection")} className="hover:text-zinc-950 cursor-pointer">Collection</span>
        <span>/</span>
        <span className="text-zinc-800 font-medium truncate">{productData.name}</span>
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
                    ? "border-zinc-950 shadow-md ring-2 ring-zinc-950/10"
                    : "border-transparent opacity-70 hover:opacity-100 hover:border-zinc-300"
                }`}
              >
                <img
                  src={item}
                  alt={`Thumbnail ${i}`}
                  className="w-full h-full object-cover object-center"
                />
              </button>
            ))}
          </div>

          {/* Main Large Image Container */}
          <div className="flex-1 relative aspect-[3/4] sm:aspect-[4/5] bg-zinc-100 rounded-3xl overflow-hidden border border-zinc-200/80 group">
            <img
              src={image}
              alt={productData.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {productData.bestseller && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-zinc-950/90 backdrop-blur-xs text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-sm">
                Bestseller
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Info & Actions - 5 Cols */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          
          {/* Category & Badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              {productData.category} • {productData.subCategory}
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              In Stock & Ready
            </div>
          </div>

          {/* Title */}
          <h1 className="font-editorial text-2xl sm:text-3xl text-zinc-950 font-normal leading-tight mb-3">
            {productData.name}
          </h1>

          {/* Star Reviews */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-zinc-500 font-medium">4.9 (132 Verified Reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-zinc-200">
            <p className="text-3xl font-bold text-zinc-950 font-sans tracking-tight">
              {currency}{productData.price}
            </p>
            <span className="text-xs text-zinc-400 font-light">Inclusive of all local taxes</span>
          </div>

          {/* Description Excerpt */}
          <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed mb-6">
            {productData.description}
          </p>

          {/* Pack / Size Selector */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-900">
                Select Pack / Unit Size
              </label>
              <span className="text-[11px] text-[#0C831F] font-bold">
                ⚡ 8-Min Fast Dispatch
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {productData.sizes.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSize(s)}
                  className={`min-w-[56px] h-10 px-4 rounded-xl text-xs font-bold tracking-wider transition-all flex items-center justify-center ${
                    s === size
                      ? "bg-[#0C831F] text-white shadow-md ring-2 ring-emerald-500/30"
                      : "bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-800"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              className="w-full flex-1 inline-flex items-center justify-center gap-2 bg-[#0C831F] hover:bg-emerald-700 text-white text-xs font-black tracking-wider uppercase py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-[0.99]"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>Add To Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black tracking-wider uppercase py-3.5 px-6 rounded-2xl transition-all shadow-sm active:scale-[0.99]"
            >
              <span>Instant Buy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Trust Value Badges Card */}
          <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-4 space-y-2.5 text-xs text-zinc-600 font-light">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-zinc-900 shrink-0" />
              <span>100% Genuine, Authenticity Guaranteed</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-zinc-900 shrink-0" />
              <span>Cash on delivery & Express dispatch available</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-zinc-900 shrink-0" />
              <span>Easy 7-day complimentary return and size exchange</span>
            </div>
          </div>

        </div>
      </div>

      {/* Accordion / Tabs for Specifications & Reviews */}
      <div className="mt-20 border-t border-zinc-200 pt-10">
        <div className="flex items-center gap-8 border-b border-zinc-200 pb-4 mb-6 text-sm">
          <button
            onClick={() => setActiveTab("description")}
            className={`font-semibold tracking-wider transition-colors relative py-1 ${
              activeTab === "description" ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            Product Description
            {activeTab === "description" && (
              <span className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-zinc-950" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("material")}
            className={`font-semibold tracking-wider transition-colors relative py-1 ${
              activeTab === "material" ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            Materials & Sustainability
            {activeTab === "material" && (
              <span className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-zinc-950" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`font-semibold tracking-wider transition-colors relative py-1 ${
              activeTab === "reviews" ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            Reviews (132)
            {activeTab === "reviews" && (
              <span className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-zinc-950" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-3xl font-light space-y-4">
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
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-zinc-900 text-xs">Arjun S.</span>
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-600 font-light">
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
      <div className="w-8 h-8 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin"></div>
    </div>
  );
};

export default Product;

