// backend/src/models/Template.js
const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      index: true,
    },
    categoryId: {
      type: Number,
      required: [true, "Category is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    coverImage: {
      type: String,
      trim: true,
      default: "",
    },
    // ================================================================
    // ✅ DIALOG — actual spoken lines
    // ================================================================
    dialog: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        host: "",
        guest: "",
      },
    },
    isTrending: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

templateSchema.pre("save", async function () {
  if (this.isNew && !this.id) {
    const last = await this.constructor
      .findOne({})
      .sort({ id: -1 })
      .select("id")
      .lean();
    this.id = last?.id ? last.id + 1 : 1;
  }
});

templateSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Template", templateSchema);