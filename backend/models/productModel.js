import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [150, "Name cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      default: null, // Sale/offer price
    },
    image: {
      type: [String],
      required: [true, "At least one product image is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    subCategory: {
      type: String,
      required: [true, "Sub-category is required"],
      trim: true,
    },
    sizes: {
      type: [String],
      required: [true, "Sizes are required"],
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      default: 100,
      min: [0, "Stock cannot be negative"],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient search queries
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, subCategory: 1 });

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
