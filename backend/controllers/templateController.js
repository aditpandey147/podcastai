// backend/src/controllers/templateController.js
const Template = require("../models/Template");
const Category = require("../models/Category");

// ================================================================
// GET /api/templates
// ================================================================
exports.getTemplates = async (req, res) => {
  try {
    const { category, search, limit } = req.query;
    const query = { isActive: true };

    if (category && category !== "trending") {
      if (/^\d+$/.test(category)) {
        query.categoryId = Number(category);
      } else {
        const cat = await Category.findOne({ slug: category });
        if (!cat) return res.json({ success: true, count: 0, data: [] });
        query.categoryId = cat.id;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let q = Template.find(query).sort({ id: 1 });
    if (limit) q = q.limit(Number(limit));

    const templates = await q;

    const categoryIds = [...new Set(templates.map((t) => t.categoryId))];
    const categories = await Category.find({ id: { $in: categoryIds } });
    const catMap = new Map(categories.map((c) => [c.id, c]));

    const enriched = templates.map((t) => {
      const json = t.toJSON();
      const cat = catMap.get(t.categoryId);
      return {
        ...json,
        category: cat
          ? { id: cat.id, name: cat.name, slug: cat.slug, image: cat.image }
          : null,
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    console.error("getTemplates error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================================================================
// GET /api/templates/:id
// ================================================================
exports.getTemplate = async (req, res) => {
  try {
    const t = await Template.findOne({ id: Number(req.params.id) });
    if (!t) return res.status(404).json({ success: false, message: "Not found" });

    const category = await Category.findOne({ id: t.categoryId });
    const data = {
      ...t.toJSON(),
      category: category
        ? {
            id: category.id,
            name: category.name,
            slug: category.slug,
            image: category.image,
          }
        : null,
    };

    res.json({ success: true, data });
  } catch (err) {
    console.error("getTemplate error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================================================================
// POST /api/templates
// ================================================================
exports.createTemplate = async (req, res) => {
  try {
    const {
      title,
      description,
      coverImage,
      dialog,
      categoryId,
      isTrending,
    } = req.body;

    if (!title || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "title and categoryId are required",
      });
    }

    const category = await Category.findOne({ id: Number(categoryId) });
    if (!category) {
      return res.status(400).json({ success: false, message: "Category not found" });
    }

    const template = await Template.create({
      title,
      description,
      coverImage,
      dialog: dialog || { host: "", guest: "" },
      categoryId: category.id,
      isTrending: isTrending !== undefined ? isTrending : true,
    });

    res.status(201).json({ success: true, data: template.toJSON() });
  } catch (err) {
    console.error("createTemplate error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================================================================
// PUT /api/templates/:id
// ================================================================
exports.updateTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({ id: Number(req.params.id) });
    if (!template)
      return res.status(404).json({ success: false, message: "Not found" });

    const {
      title,
      description,
      coverImage,
      dialog,
      categoryId,
      isTrending,
      isActive,
    } = req.body;

    if (title !== undefined) template.title = title;
    if (description !== undefined) template.description = description;
    if (coverImage !== undefined) template.coverImage = coverImage;
    if (dialog !== undefined) template.dialog = dialog;
    if (isTrending !== undefined) template.isTrending = isTrending;
    if (isActive !== undefined) template.isActive = isActive;

    if (categoryId !== undefined && Number(categoryId) !== template.categoryId) {
      const category = await Category.findOne({ id: Number(categoryId) });
      if (!category) {
        return res.status(400).json({ success: false, message: "Category not found" });
      }
      template.categoryId = category.id;
    }

    await template.save();
    res.json({ success: true, data: template.toJSON() });
  } catch (err) {
    console.error("updateTemplate error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================================================================
// DELETE /api/templates/:id
// ================================================================
exports.deleteTemplate = async (req, res) => {
  try {
    const t = await Template.findOneAndDelete({ id: Number(req.params.id) });
    if (!t) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted", data: t.toJSON() });
  } catch (err) {
    console.error("deleteTemplate error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};