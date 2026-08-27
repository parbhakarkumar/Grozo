import asyncHandler from "../utils/asyncHandler.js";
import {
  addProductService,
  listProductsService,
  removeProductService,
  singleProductService,
  updateStockService,
} from "../services/productService.js";

// ─────────────────────────────────────────────
// POST /api/product/add  (Admin only)
// ─────────────────────────────────────────────
const addProduct = asyncHandler(async (req, res) => {
  const product = await addProductService({
    ...req.body,
    files: req.files,
  });

  return res.status(201).json({
    success: true,
    message: "Product added successfully.",
    product,
  });
});

// ─────────────────────────────────────────────
// GET /api/product/list
// ─────────────────────────────────────────────
const listProducts = asyncHandler(async (req, res) => {
  const products = await listProductsService();

  return res.status(200).json({
    success: true,
    count: products.length,
    products,
  });
});

// ─────────────────────────────────────────────
// DELETE /api/product/remove  (Admin only)
// ─────────────────────────────────────────────
const removeProduct = asyncHandler(async (req, res) => {
  await removeProductService(req.body.id);

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully.",
  });
});

// ─────────────────────────────────────────────
// POST /api/product/single
// ─────────────────────────────────────────────
const singleProduct = asyncHandler(async (req, res) => {
  const product = await singleProductService(req.body.productId);

  return res.status(200).json({
    success: true,
    product,
  });
});

// ─────────────────────────────────────────────
// POST /api/product/update-stock (Admin only)
// ─────────────────────────────────────────────
const updateStock = asyncHandler(async (req, res) => {
  const { productId, stock } = req.body;
  const product = await updateStockService({ productId, stock });

  return res.status(200).json({
    success: true,
    message: "Stock updated successfully.",
    product,
  });
});

export { addProduct, listProducts, removeProduct, singleProduct, updateStock };
