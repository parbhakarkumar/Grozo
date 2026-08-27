import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

export const addProductService = async ({ name, description, price, category, subCategory, sizes, bestseller, files }) => {
  const image1 = files?.image1?.[0];
  const image2 = files?.image2?.[0];
  const image3 = files?.image3?.[0];
  const image4 = files?.image4?.[0];

  const images = [image1, image2, image3, image4].filter(Boolean);

  if (images.length === 0) {
    const error = new Error("At least one product image is required.");
    error.statusCode = 400;
    throw error;
  }

  const imagesURL = await Promise.all(
    images.map(async (img) => {
      const result = await cloudinary.uploader.upload(img.path, {
        resource_type: "image",
        folder: "shopease/products",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
      return result.secure_url;
    })
  );

  const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;

  const product = await productModel.create({
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    category: category.trim(),
    subCategory: subCategory.trim(),
    sizes: parsedSizes,
    bestseller: bestseller === "true" || bestseller === true,
    image: imagesURL,
    date: new Date(),
  });

  return product;
};

export const listProductsService = async () => {
  const products = await productModel.find({}).sort({ createdAt: -1 }).lean();
  return products;
};

export const removeProductService = async (id) => {
  const product = await productModel.findByIdAndDelete(id);

  if (!product) {
    const error = new Error("Product not found.");
    error.statusCode = 404;
    throw error;
  }

  return product;
};

export const singleProductService = async (productId) => {
  const product = await productModel.findById(productId).lean();

  if (!product) {
    const error = new Error("Product not found.");
    error.statusCode = 404;
    throw error;
  }

  return product;
};

export const updateStockService = async ({ productId, stock }) => {
  const parsedStock = Number(stock);
  if (isNaN(parsedStock) || parsedStock < 0) {
    const error = new Error("Stock must be a non-negative number.");
    error.statusCode = 400;
    throw error;
  }

  const product = await productModel.findByIdAndUpdate(
    productId,
    { stock: parsedStock },
    { new: true }
  );

  if (!product) {
    const error = new Error("Product not found.");
    error.statusCode = 404;
    throw error;
  }

  return product;
};
