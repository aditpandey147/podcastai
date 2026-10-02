// backend/routes/templateRoutes.js
const express = require("express");
const router = express.Router();
const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require("../controllers/templateController");

router.route("/").get(getTemplates).post(createTemplate);
router
  .route("/:id")
  .get(getTemplate)
  .put(updateTemplate)
  .delete(deleteTemplate);

module.exports = router;