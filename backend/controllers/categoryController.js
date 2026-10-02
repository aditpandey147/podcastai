// backend/controllers/categoryController.js
const Category = require("../models/Category");

// ================================================================
// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
// ================================================================
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ id: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    console.error("getCategories error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================================================================
// @desc    Get single category by slug or id
// @route   GET /api/categories/:slugOrId
// @access  Public
// ================================================================
exports.getCategory = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const query = /^\d+$/.test(slugOrId)
      ? { id: Number(slugOrId) }
      : { slug: slugOrId };

    const category = await Category.findOne(query);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    console.error("getCategory error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================================================================
// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
// ================================================================
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    // Check for duplicate name
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category name already exists" });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.error("createCategory error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Slug already exists" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================================================================
// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
// ================================================================
exports.updateCategory = async (req, res) => {
  try {
    const { name, slug, description, image } = req.body;

    const category = await Category.findOne({ id: Number(req.params.id) });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

    await category.save();

    res.json({ success: true, data: category });
  } catch (err) {
    console.error("updateCategory error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================================================================
// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
// ================================================================
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ id: Number(req.params.id) });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted", data: category });
  } catch (err) {
    console.error("deleteCategory error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};