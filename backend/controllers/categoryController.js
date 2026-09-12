import asyncHandler from "../utils/asyncHandler.js";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";

// ─────────────────────────────────────────────
// GET /api/admin/categories (public list)
// ─────────────────────────────────────────────
const listCategories = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;
  const filter = includeInactive === "true" ? {} : { isActive: true };
  const categories = await categoryModel.find(filter).sort({ sortOrder: 1, name: 1 });

  // Attach product count per category
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const count = await productModel.countDocuments({ category: cat.name }).catch(() => 0);
      return { ...cat.toObject(), productCount: count };
    })
  );

  return res.status(200).json({ success: true, categories: categoriesWithCount });
});

// ─────────────────────────────────────────────
// POST /api/admin/categories (adminAuth)
// ─────────────────────────────────────────────
const addCategory = asyncHandler(async (req, res) => {
  const { name, description, image, isActive, sortOrder } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Category name is required." });
  }

  // Check for duplicate
  const existing = await categoryModel.findOne({
    name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
  });
  if (existing) {
    return res.status(409).json({ success: false, message: "Category already exists." });
  }

  const category = new categoryModel({
    name: name.trim(),
    description: description?.trim() || "",
    image: image || "",
    isActive: isActive !== undefined ? isActive : true,
    sortOrder: sortOrder || 0,
  });

  await category.save();
  return res.status(201).json({
    success: true,
    message: "Category created successfully.",
    category,
  });
});

// ─────────────────────────────────────────────
// PUT /api/admin/categories/:id (adminAuth)
// ─────────────────────────────────────────────
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, image, isActive, sortOrder } = req.body;

  const category = await categoryModel.findById(id);
  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found." });
  }

  // Check for name conflict with another category
  if (name && name.trim() !== category.name) {
    const conflict = await categoryModel.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (conflict) {
      return res.status(409).json({ success: false, message: "Category name already in use." });
    }
    category.name = name.trim();
  }

  if (description !== undefined) category.description = description.trim();
  if (image !== undefined) category.image = image;
  if (isActive !== undefined) category.isActive = isActive;
  if (sortOrder !== undefined) category.sortOrder = sortOrder;

  await category.save();
  return res.status(200).json({
    success: true,
    message: "Category updated.",
    category,
  });
});

// ─────────────────────────────────────────────
// DELETE /api/admin/categories/:id (adminAuth)
// ─────────────────────────────────────────────
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await categoryModel.findByIdAndDelete(id);
  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found." });
  }
  return res.status(200).json({ success: true, message: "Category deleted." });
});

export { listCategories, addCategory, updateCategory, deleteCategory };
