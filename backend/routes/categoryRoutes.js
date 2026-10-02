// backend/routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// Optional: add auth middleware for admin routes
// const { protect, adminOnly } = require("../middleware/auth");

router
  .route("/")
  .get(getCategories)
  .post(createCategory); // .post(protect, adminOnly, createCategory)

router
  .route("/:slugOrId")
  .get(getCategory);

router
  .route("/:id")
  .put(updateCategory)   // .put(protect, adminOnly, updateCategory)
  .delete(deleteCategory); // .delete(protect, adminOnly, deleteCategory)

module.exports = router;