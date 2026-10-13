// backend/utils/rateLimit.js
const Video = require("../models/Video");

// ================================================================
// CONFIG
// ================================================================
const COOLDOWN_MINUTES = 5;         // gap between any two generations
const DAILY_LIMIT = 5;              // max 5 videos per rolling 24h
const DAILY_WINDOW_HOURS = 14;      // 👈 block window after hitting the limit
const ENABLE_WINDOW_LIMIT = false;  // 👈 disable the 14-day window check

// (kept for reference / optional re-enable)
const WINDOW_DAYS = 14;
const WINDOW_LIMIT = 60;

// ================================================================
// MAIN CHECK
// ================================================================
async function checkVideoGenerationLimit(userId) {
  const now = new Date();

  // ----------------------------------------------------------------
  // 1. Cooldown: 5 minutes between generations
  // ----------------------------------------------------------------
  const cooldownStart = new Date(
    now.getTime() - COOLDOWN_MINUTES * 60 * 1000
  );

  const lastVideo = await Video.findOne({
    userId,
    createdAt: { $gte: cooldownStart },
  })
    .sort({ createdAt: -1 })
    .select("createdAt")
    .lean();

  if (lastVideo) {
    const elapsed = now.getTime() - new Date(lastVideo.createdAt).getTime();
    const remainingSec = Math.max(
      0,
      Math.ceil((COOLDOWN_MINUTES * 60 * 1000 - elapsed) / 1000)
    );
    const remainingMin = Math.ceil(remainingSec / 60);

    return {
      allowed: false,
      reason: "cooldown",
      waitSeconds: remainingSec,
      message: `🎬 Great things take a moment. Your next video unlocks in ${remainingMin} minute${
        remainingMin > 1 ? "s" : ""
      }. Take a breather — we'll be ready when you are.`,
    };
  }

  // ----------------------------------------------------------------
  // 2. Daily limit: 5 videos per rolling 24h → 14h block
  // ----------------------------------------------------------------
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const dailyCount = await Video.countDocuments({
    userId,
    createdAt: { $gte: dayAgo },
  });

  if (dailyCount >= DAILY_LIMIT) {
    // Find the 5th-most-recent video — the one that triggered the limit
    const videosInWindow = await Video.find({
      userId,
      createdAt: { $gte: dayAgo },
    })
      .sort({ createdAt: -1 })   // newest first
      .select("createdAt")
      .lean();

    // The 5th newest = the 5th video that pushed the user over
    const triggeringVideo = videosInWindow[DAILY_LIMIT - 1];

    if (triggeringVideo) {
      // Block for 14 hours starting from the moment the 5th video was created
      const blockEnd = new Date(
        new Date(triggeringVideo.createdAt).getTime() +
          DAILY_WINDOW_HOURS * 60 * 60 * 1000
      );

      // If the block has already expired → allow
      if (blockEnd.getTime() > now.getTime()) {
        const remainingSec = Math.ceil(
          (blockEnd.getTime() - now.getTime()) / 1000
        );
        const remainingMin = Math.ceil(remainingSec / 60);
        const remainingHrs = Math.floor(remainingMin / 60);
        const remainingMins = remainingMin % 60;

        return {
          allowed: false,
          reason: "daily_limit",
          waitSeconds: remainingSec,
          message:
            remainingHrs > 0
              ? `🎉 You've crafted ${DAILY_LIMIT} videos — impressive! Take a well-deserved ${DAILY_WINDOW_HOURS}-hour break. Your next slot opens in about ${remainingHrs}h ${remainingMins}m.`
              : `🎉 You've crafted ${DAILY_LIMIT} videos — impressive! Your next slot opens in ${remainingMins} minute${
                  remainingMins > 1 ? "s" : ""
                }.`,
        };
      }
      // else: block expired → allow below (fall through)
    }
  }

  // ----------------------------------------------------------------
  // 3. Optional 14-day window (disabled by default)
  // ----------------------------------------------------------------
  if (ENABLE_WINDOW_LIMIT) {
    const windowStart = new Date(
      now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000
    );
    const windowCount = await Video.countDocuments({
      userId,
      createdAt: { $gte: windowStart },
    });

    if (windowCount >= WINDOW_LIMIT) {
      const oldest = await Video.findOne({
        userId,
        createdAt: { $gte: windowStart },
      })
        .sort({ createdAt: 1 })
        .select("createdAt")
        .lean();

      const resetAt = new Date(
        new Date(oldest.createdAt).getTime() +
          WINDOW_DAYS * 24 * 60 * 60 * 1000
      );
      const resetInDays = Math.ceil(
        (resetAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      return {
        allowed: false,
        reason: "window_limit",
        waitSeconds: Math.ceil((resetAt.getTime() - now.getTime()) / 1000),
        message: `🌟 You've reached your ${WINDOW_DAYS}-day creative window. Fresh slots open in about ${resetInDays} day${
          resetInDays > 1 ? "s" : ""
        }. Thanks for creating so much with us!`,
      };
    }
  }

  return { allowed: true };
}

// ================================================================
// STATS
// ================================================================
async function getGenerationStats(userId) {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const dailyCount = await Video.countDocuments({
    userId,
    createdAt: { $gte: dayAgo },
  });

  const lastVideo = await Video.findOne({ userId })
    .sort({ createdAt: -1 })
    .select("createdAt")
    .lean();

  let nextAvailableIn = 0;
  if (lastVideo) {
    const elapsed = now.getTime() - new Date(lastVideo.createdAt).getTime();
    nextAvailableIn = Math.max(
      0,
      Math.ceil((COOLDOWN_MINUTES * 60 * 1000 - elapsed) / 1000)
    );
  }

  return {
    usedToday: dailyCount,
    remainingToday: Math.max(0, DAILY_LIMIT - dailyCount),
    dailyLimit: DAILY_LIMIT,
    cooldownMinutes: COOLDOWN_MINUTES,
    blockHours: DAILY_WINDOW_HOURS,
    nextAvailableIn,
  };
}

module.exports = {
  COOLDOWN_MINUTES,
  DAILY_LIMIT,
  DAILY_WINDOW_HOURS,
  WINDOW_DAYS,
  WINDOW_LIMIT,
  ENABLE_WINDOW_LIMIT,
  checkVideoGenerationLimit,
  getGenerationStats,
};
