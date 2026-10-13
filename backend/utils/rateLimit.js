const Video = require("../../models/Video");

const COOLDOWN_MINUTES = 5;
const DAILY_LIMIT = 10;
const WINDOW_DAYS = 14;
const WINDOW_LIMIT = 60;

async function checkVideoGenerationLimit(userId) {
  const now = new Date();

  // 1. Cooldown
  const cooldownStart = new Date(now.getTime() - COOLDOWN_MINUTES * 60 * 1000);
  const lastVideo = await Video.findOne({
    userId,
    createdAt: { $gte: cooldownStart },
  }).sort({ createdAt: -1 }).select("createdAt").lean();

  if (lastVideo) {
    const elapsed = now.getTime() - new Date(lastVideo.createdAt).getTime();
    const remainingSec = Math.max(0, Math.ceil((COOLDOWN_MINUTES * 60 * 1000 - elapsed) / 1000));
    const remainingMin = Math.ceil(remainingSec / 60);
    return {
      allowed: false,
      reason: "cooldown",
      waitSeconds: remainingSec,
      message: `🎬 Great things take a moment. Your next video unlocks in ${remainingMin} minute${remainingMin > 1 ? "s" : ""}. Take a breather — we'll be ready when you are.`,
    };
  }

  // 2. Daily
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dailyCount = await Video.countDocuments({ userId, createdAt: { $gte: dayAgo } });

  if (dailyCount >= DAILY_LIMIT) {
    const oldest = await Video.findOne({ userId, createdAt: { $gte: dayAgo } })
      .sort({ createdAt: 1 }).select("createdAt").lean();
    const resetAt = new Date(new Date(oldest.createdAt).getTime() + 24 * 60 * 60 * 1000);
    const resetInMin = Math.ceil((resetAt.getTime() - now.getTime()) / 60000);
    const resetInHrs = Math.floor(resetInMin / 60);
    const resetInMins = resetInMin % 60;
    return {
      allowed: false,
      reason: "daily_limit",
      waitSeconds: Math.ceil((resetAt.getTime() - now.getTime()) / 1000),
      message: resetInHrs > 0
        ? `🎉 You've crafted ${DAILY_LIMIT} videos today — impressive! Your next slot opens in about ${resetInHrs}h ${resetInMins}m. Rest up, creator.`
        : `🎉 You've crafted ${DAILY_LIMIT} videos today — impressive! Your next slot opens in ${resetInMins} minute${resetInMins > 1 ? "s" : ""}.`,
    };
  }

  // 3. 14-day window
  const windowStart = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const windowCount = await Video.countDocuments({ userId, createdAt: { $gte: windowStart } });

  if (windowCount >= WINDOW_LIMIT) {
    const oldest = await Video.findOne({ userId, createdAt: { $gte: windowStart } })
      .sort({ createdAt: 1 }).select("createdAt").lean();
    const resetAt = new Date(new Date(oldest.createdAt).getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const resetInDays = Math.ceil((resetAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return {
      allowed: false,
      reason: "window_limit",
      waitSeconds: Math.ceil((resetAt.getTime() - now.getTime()) / 1000),
      message: `🌟 You've reached your ${WINDOW_DAYS}-day creative window. Fresh slots open in about ${resetInDays} day${resetInDays > 1 ? "s" : ""}. Thanks for creating so much with us!`,
    };
  }

  return { allowed: true };
}

async function getGenerationStats(userId) {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const dailyCount = await Video.countDocuments({ userId, createdAt: { $gte: dayAgo } });
  const lastVideo = await Video.findOne({ userId }).sort({ createdAt: -1 }).select("createdAt").lean();

  let nextAvailableIn = 0;
  if (lastVideo) {
    const elapsed = now.getTime() - new Date(lastVideo.createdAt).getTime();
    nextAvailableIn = Math.max(0, Math.ceil((COOLDOWN_MINUTES * 60 * 1000 - elapsed) / 1000));
  }

  return {
    usedToday: dailyCount,
    remainingToday: Math.max(0, DAILY_LIMIT - dailyCount),
    dailyLimit: DAILY_LIMIT,
    cooldownMinutes: COOLDOWN_MINUTES,
    nextAvailableIn,
  };
}

module.exports = {
  COOLDOWN_MINUTES,
  DAILY_LIMIT,
  WINDOW_DAYS,
  WINDOW_LIMIT,
  checkVideoGenerationLimit,
  getGenerationStats,
};