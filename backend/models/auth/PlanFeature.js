// backend/models/PlanFeature.js
const mongoose = require('mongoose');

const planFeatureSchema = new mongoose.Schema(
  {
    planId: { type: Number, required: true, index: true },
    featureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feature',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

planFeatureSchema.index({ planId: 1, featureId: 1 }, { unique: true });

module.exports = mongoose.model('PlanFeature', planFeatureSchema);