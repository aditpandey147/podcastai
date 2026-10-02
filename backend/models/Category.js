// backend/models/Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ================================================================
// AUTO-INCREMENT `id` — async, no `next`
// ================================================================
categorySchema.pre("save", async function () {
  if (this.isNew && !this.id) {
    const lastCategory = await this.constructor
      .findOne({})
      .sort({ id: -1 })
      .select("id")
      .lean();

    this.id = lastCategory?.id ? lastCategory.id + 1 : 1;
  }
});

// ================================================================
// AUTO-SLUG — async, no `next`
// ================================================================
categorySchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
});

// ================================================================
// JSON cleanup
// ================================================================
categorySchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Category", categorySchema);