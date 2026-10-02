// backend/src/models/Video.js
const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    templateId: { type: Number, default: null },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    hostLine: { type: String, default: "" },
    guestLine: { type: String, default: "" },
    tone: { type: String, default: "professional" },
    music: { type: String, default: "subtle" },
    format: { type: String, default: "16:9" },

    videoPrompt: { type: String, default: "" },
    videoUrl: { type: String, default: "" },

    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
      index: true,
    },
    progress: { type: Number, default: 0 }, // 0-100
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

videoSchema.pre("save", async function () {
  if (this.isNew && !this.id) {
    const last = await this.constructor.findOne({}).sort({ id: -1 }).select("id").lean();
    this.id = last?.id ? last.id + 1 : 1;
  }
});

videoSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Video", videoSchema);