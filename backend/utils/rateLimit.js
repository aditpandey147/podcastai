const Video = require("../models/Video");

const COOLDOWN_MINUTES = 5;
const DAILY_LIMIT = 5;
const WINDOW_DAYS = 14;
const WINDOW_LIMIT = 60;

// Turns seconds into friendly text: "45 seconds", "3 minutes", "2h 10m", "3 days"
function formatWait(totalSeconds) {
  const secs = Math.max(1, Math.ceil(totalSeconds));
  if (secs < 60) return `${secs} second${secs > 1 ? "s" : ""}`;

  const mins = Math.ceil(secs / 60);
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""}`;

  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs < 24) return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs} hour${hrs > 1 ? "s" : ""}`;

  const days = Math.ceil(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""}`;
}

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
    return {
      allowed: false,
      reason: "cooldown",
      waitSeconds: remainingSec,
      message: `✨ Your last video is still fresh! You'll be ready to create the next one in ${formatWait(remainingSec)}. A perfect moment to review what you made.`,
    };
  }

  // 2. Daily
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dailyCount = await Video.countDocuments({ userId, createdAt: { $gte: dayAgo } });

  if (dailyCount >= DAILY_LIMIT) {
    const oldest = await Video.findOne({ userId, createdAt: { $gte: dayAgo } })
      .sort({ createdAt: 1 }).select("createdAt").lean();
    const resetAt = new Date(new Date(oldest.createdAt).getTime() + 24 * 60 * 60 * 1000);
    const waitSeconds = Math.ceil((resetAt.getTime() - now.getTime()) / 1000);
    return {
      allowed: false,
      reason: "daily_limit",
      waitSeconds,
      message: `🎉 ${DAILY_LIMIT} videos created today, great work! Your next creation slot opens in about ${formatWait(waitSeconds)}. Come back soon, your ideas will be waiting.`,
    };
  }

  // 3. 14-day window
  const windowStart = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const windowCount = await Video.countDocuments({ userId, createdAt: { $gte: windowStart } });

  if (windowCount >= WINDOW_LIMIT) {
    const oldest = await Video.findOne({ userId, createdAt: { $gte: windowStart } })
      .sort({ createdAt: 1 }).select("createdAt").lean();
    const resetAt = new Date(new Date(oldest.createdAt).getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const waitSeconds = Math.ceil((resetAt.getTime() - now.getTime()) / 1000);
    return {
      allowed: false,
      reason: "window_limit",
      waitSeconds,
      message: `🌟 What a creative stretch! You've made a lot of videos these past ${WINDOW_DAYS} days. Fresh slots open up in about ${formatWait(waitSeconds)}. Thanks for creating with us!`,
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
