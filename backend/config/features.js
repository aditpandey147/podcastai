// backend/config/features.js
const PLAN_ACCESS = {
  unlimited:         [3, 4],
  podcastCreatorPro: [3, 4],
  viralShortsAI:     [3, 4],
  growthStudio:      [2, 3, 4],
  brandingSuite:     [2, 3, 4],
  agency:            [8, 12],
  reseller:          [13],
};

function computeFeatures(user) {
  const out = {};
  Object.keys(PLAN_ACCESS).forEach((k) => {
    out[k] = false;
  });

  if (!user) return out;

  if (user.role === 'admin') {
    Object.keys(out).forEach((k) => {
      out[k] = true;
    });
    return out;
  }

  const userPlans = Array.isArray(user.planId)
    ? user.planId
    : [user.planId || 1];

  Object.entries(PLAN_ACCESS).forEach(([key, plans]) => {
    out[key] = plans.some((id) => userPlans.includes(id));
  });

  return out;
}

function hasFeature(user, featureKey) {
  return computeFeatures(user)[featureKey] === true;
}

// 👇 MUST be exactly this:
module.exports = {
  PLAN_ACCESS,
  computeFeatures,
  hasFeature,
};