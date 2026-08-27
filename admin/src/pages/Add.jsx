import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CATEGORIES = ["Men", "Women", "Kids"];
const SUB_CATEGORIES = ["Topwear", "Bottomwear", "Winterwear"];

// Image upload zone component
const ImageZone = ({ id, file, onChange, label }) => (
  <label
    htmlFor={id}
    className="upload-zone"
    style={{ cursor: "pointer", flexDirection: "column", gap: "8px" }}
  >
    {file ? (
      <img
        src={URL.createObjectURL(file)}
        alt="preview"
        style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
      />
    ) : (
      <>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)" }}>
          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center" }}>{label}</span>
      </>
    )}
    {file && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          opacity: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.2s",
          color: "white",
          fontSize: "11px",
          fontWeight: 600,
        }}
        className="upload-overlay"
      >
        Change
      </div>
    )}
    <input onChange={onChange} type="file" id={id} hidden accept="image/*" />
  </label>
);

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice]             = useState("");
  const [category, setCategory]       = useState("Men");
  const [subCategory, setSubcategory] = useState("Topwear");
  const [bestseller, setBestseller]   = useState(false);
  const [sizes, setSizes]             = useState([]);
  const [loading, setLoading]         = useState(false);

  const toggleSize = (size) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const resetForm = () => {
    setName(""); setDescription(""); setCategory("Men");
    setSubcategory("Topwear"); setImage1(false); setImage2(false);
    setImage3(false); setImage4(false); setPrice(""); setSizes([]);
    setBestseller(false);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (sizes.length === 0) {
      toast.error("Please select at least one size");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Product added successfully!");
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>Add Product</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Fill in the details to add a new product to your catalog.
        </p>
      </div>

      <form onSubmit={onSubmitHandler}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* ── Left column: Images ── */}
          <div className="glass-card animate-fade-up" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "16px" }}>
                Product Images
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <ImageZone id="image1" file={image1} onChange={(e) => setImage1(e.target.files[0])} label="Main Image" />
                <ImageZone id="image2" file={image2} onChange={(e) => setImage2(e.target.files[0])} label="Image 2" />
                <ImageZone id="image3" file={image3} onChange={(e) => setImage3(e.target.files[0])} label="Image 3" />
                <ImageZone id="image4" file={image4} onChange={(e) => setImage4(e.target.files[0])} label="Image 4" />
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "12px", textAlign: "center" }}>
                Upload up to 4 product images · JPG, PNG, WEBP
              </p>
            </div>

            {/* Bestseller toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                background: "var(--bg-input)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
              onClick={() => setBestseller((v) => !v)}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Mark as Bestseller</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Feature on homepage bestsellers section</div>
              </div>
              <div
                id="bestseller-toggle"
                style={{
                  width: "44px",
                  height: "24px",
                  borderRadius: "999px",
                  background: bestseller ? "var(--accent)" : "var(--bg-hover)",
                  border: `1px solid ${bestseller ? "var(--accent)" : "var(--border)"}`,
                  position: "relative",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "white",
                    top: "2px",
                    left: bestseller ? "22px" : "2px",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Right column: Details ── */}
          <div className="glass-card animate-fade-up" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", animationDelay: "0.05s" }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.7px", display: "block", marginBottom: "8px" }}>
                Product Name *
              </label>
              <input
                id="product-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium Cotton T-Shirt"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.7px", display: "block", marginBottom: "8px" }}>
                Description *
              </label>
              <textarea
                id="product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the product — material, fit, features..."
                required
                rows={4}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Category + SubCategory */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.7px", display: "block", marginBottom: "8px" }}>
                  Category *
                </label>
                <select id="product-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.7px", display: "block", marginBottom: "8px" }}>
                  Sub-Category *
                </label>
                <select id="product-subcategory" value={subCategory} onChange={(e) => setSubcategory(e.target.value)}>
                  {SUB_CATEGORIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.7px", display: "block", marginBottom: "8px" }}>
                Price (₹) *
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", fontWeight: 700, color: "var(--text-muted)" }}>₹</span>
                <input
                  id="product-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  required
                  min="0"
                  style={{ paddingLeft: "30px" }}
                />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.7px", display: "block", marginBottom: "10px" }}>
                Available Sizes *
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {SIZES.map((size) => (
                  <div
                    key={size}
                    id={`size-${size}`}
                    className={`size-pill ${sizes.includes(size) ? "active" : ""}`}
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
              {sizes.length > 0 && (
                <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--text-muted)" }}>
                  Selected: <span style={{ color: "var(--accent-light)", fontWeight: 600 }}>{sizes.join(", ")}</span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              id="add-product-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                marginTop: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "13px",
                fontSize: "14px",
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Adding Product...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Add Product
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Responsive single column on mobile */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .upload-zone:hover .upload-overlay { opacity: 1 !important; }
        @media (max-width: 640px) {
          form > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Add;
