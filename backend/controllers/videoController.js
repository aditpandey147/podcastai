// backend/src/controllers/videoController.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Video = require("../models/Video");
const ai = require("../services/aiService");
const { spawn } = require("child_process");

const {
  checkVideoGenerationLimit,
  getGenerationStats: getStatsFromVideos,
} = require("../utils/rateLimit");

// ================================================================
// 📁 VIDEOS DIRECTORY
// ================================================================
const VIDEOS_DIR = path.join(__dirname, "..", "uploads", "videos");
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// ================================================================
// Helper — resolve user ID from any JWT payload shape
// ================================================================
function getUserId(req) {
  return req.user?.userId || req.user?.id || req.user?._id || null;
}

// ================================================================
// Helper — build an absolute URL from a possibly-relative path
// ================================================================
function buildAbsoluteUrl(input) {
  if (!input) return "";
  if (/^https?:\/\//i.test(input)) return input;

  const SERVER_URL =
    process.env.SERVER_URL ||
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`;

  const cleanPath = input.startsWith("/") ? input : `/${input}`;
  return `${SERVER_URL}${cleanPath}`;
}

// ================================================================
// Helper — delete a local file from disk (safe — never throws)
// Only deletes files inside /uploads/videos/
// ================================================================
function deleteLocalVideoFile(urlOrPath) {
  if (!urlOrPath) return false;

  try {
    let pathname = urlOrPath;
    if (/^https?:\/\//i.test(urlOrPath)) {
      try {
        pathname = new URL(urlOrPath).pathname;
      } catch {
        return false;
      }
    }

    if (!pathname.startsWith("/uploads/videos/")) {
      return false;
    }

    const filename = path.basename(pathname);
    const filePath = path.join(VIDEOS_DIR, filename);

    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(VIDEOS_DIR))) {
      console.warn("🚫 Refusing to delete outside VIDEOS_DIR:", resolved);
      return false;
    }

    if (fs.existsSync(resolved)) {
      fs.unlinkSync(resolved);
      console.log("🗑️  Deleted file:", resolved);
      return true;
    }
  } catch (err) {
    console.warn("⚠️  File delete warning:", err.message);
  }
  return false;
}

// ================================================================
// Helper — download a remote video URL → local file
// ================================================================
async function downloadVideoToLocal(remoteUrl, videoId) {
  if (!remoteUrl) throw new Error("remoteUrl is required");

  const filename = `video-${videoId}-${Date.now()}.mp4`;
  const filePath = path.join(VIDEOS_DIR, filename);

  console.log(`⬇️  Downloading video → ${filename}`);

  const response = await axios({
    method: "GET",
    url: remoteUrl,
    responseType: "stream",
    timeout: 120000,
  });

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  console.log(`✅ Video saved locally: ${filePath}`);

  return `/uploads/videos/${filename}`;
}

// ================================================================
// POST /api/video/generate
// ================================================================
exports.generateVideo = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      console.error("❌ No user ID — req.user =", req.user);
      return res.status(401).json({
        success: false,
        message: "Not authenticated — user ID missing",
      });
    }

    // ------------------------------------------------------------
    // 🚦 RATE LIMIT CHECK
    // ------------------------------------------------------------
    const limit = await checkVideoGenerationLimit(userId);

    if (!limit.allowed) {
      console.log(
        `🚦 Rate limited user ${userId} — reason: ${limit.reason} (wait ${limit.waitSeconds}s)`
      );
      return res.status(429).json({
        success: false,
        rateLimited: true,
        reason: limit.reason,
        waitSeconds: limit.waitSeconds,
        message: limit.message,
      });
    }

    // ------------------------------------------------------------
    // Validate input
    // ------------------------------------------------------------
    const {
      imageUrl: incomingImageUrl,
      hostLine,
      guestLine,
      tone = "professional",
      music = "subtle",
      format = "landscape",
      templateId,
      templateTitle,
      templateCategory,
      coverImage,
    } = req.body;

    console.log("📥 Incoming format from frontend:", format);

    const rawImageUrl = incomingImageUrl || coverImage || "";

    if (!rawImageUrl) {
      return res.status(400).json({
        success: false,
        message: "No image selected — please choose a template or image",
      });
    }

    const imageUrl = buildAbsoluteUrl(rawImageUrl);
    console.log("🖼️ Using user image:", imageUrl);

    if (!hostLine || !guestLine) {
      return res
        .status(400)
        .json({ success: false, message: "Both dialog lines required" });
    }

    // ------------------------------------------------------------
    // Create video record — this IS the rate-limit record
    // ------------------------------------------------------------
    const videoDoc = await Video.create({
      userId,
      templateId: templateId || null,
      title: templateTitle || "Untitled Podcast",
      category: templateCategory || "",
      coverImage: imageUrl,
      hostLine,
      guestLine,
      tone,
      music,
      format,
      status: "queued",
      progress: 0,
    });

    console.log(`🎬 Video ${videoDoc.id} queued for user ${userId}`);

    // ------------------------------------------------------------
    // Kick off async pipeline
    // ------------------------------------------------------------
    processVideo(videoDoc._id, imageUrl).catch((err) =>
      console.error("processVideo async error:", err)
    );

    res.json({
      success: true,
      videoId: videoDoc.id,
      video: videoDoc.toJSON(),
    });
  } catch (err) {
    console.error("generateVideo error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// ASYNC PIPELINE
// ================================================================
async function processVideo(videoMongoId, imageUrl) {
  let localVideoPath = null;

  try {
    // ---- Step 1: Vision → prompt ----
    await Video.findByIdAndUpdate(videoMongoId, {
      status: "processing",
      progress: 15,
    });

    const doc = await Video.findById(videoMongoId);
    if (!doc) return;

    const videoPrompt = await ai.vision({
      imageUrl,
      systemPrompt: `You are an AI video prompt engineer. Write ONE detailed image-to-video prompt describing camera motion, character micro-movements, ambient details, lighting, mood. Output ONLY the prompt, under 120 words.`,
      prompt: `Dialog:
Host: "${doc.hostLine}"
Guest: "${doc.guestLine}"

Tone: ${doc.tone}
Music: ${doc.music}
Aspect Ratio: ${doc.format}

Write the image-to-video prompt.`,
    });

    await Video.findByIdAndUpdate(videoMongoId, {
      videoPrompt,
      progress: 35,
    });

    console.log("✅ Video prompt:", videoPrompt);

    // ---- Step 2: Video generation — pruna p-video (fast) ----
    console.log("⚡ Generating with pruna — format:", doc.format);

    const remoteVideoUrl = await ai.videoFast({
      imageUrl,
      prompt: videoPrompt,
      format: doc.format,
    });

    console.log("⚡ pruna URL:", remoteVideoUrl);

    // ---- Step 3: Download to local ----
    localVideoPath = await downloadVideoToLocal(remoteVideoUrl, doc.id);

    // ---- Step 4: Save both paths in DB ----
    await Video.findByIdAndUpdate(videoMongoId, {
      videoUrl: remoteVideoUrl,
      localVideoUrl: localVideoPath,
      status: "completed",
      progress: 100,
    });

    console.log(`✅ Video ${doc.id} ready at ${localVideoPath}`);
  } catch (err) {
    console.error("processVideo error:", err.response?.data || err.message);

    if (localVideoPath) {
      try {
        const filePath = path.join(VIDEOS_DIR, path.basename(localVideoPath));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (_) {}
    }

    await Video.findByIdAndUpdate(videoMongoId, {
      status: "failed",
      errorMessage:
        err.response?.data?.error?.message ||
        err.message ||
        "Generation failed",
    });
  }
}

// ================================================================
// GET /api/video/my-videos
// ================================================================
exports.getMyVideos = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const videos = await Video.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: videos.length, data: videos });
  } catch (err) {
    console.error("getMyVideos error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// GET /api/video/generation-stats
// ================================================================
exports.getGenerationStats = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const stats = await getStatsFromVideos(userId);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error("getGenerationStats error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// GET /api/video/:id
// ================================================================
exports.getVideo = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const video = await Video.findOne({
      id: Number(req.params.id),
      userId,
    });

    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    res.json({ success: true, data: video.toJSON() });
  } catch (err) {
    console.error("getVideo error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// DELETE /api/video/:id
// ================================================================
exports.deleteVideo = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const idNum = Number(req.params.id);
    if (!Number.isFinite(idNum)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid video id" });
    }

    const video = await Video.findOne({ id: idNum, userId });

    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    const filesToDelete = [video.localVideoUrl, video.videoUrl].filter(Boolean);
    const deletedFiles = [];
    for (const url of filesToDelete) {
      if (deleteLocalVideoFile(url)) {
        deletedFiles.push(url);
      }
    }

    await Video.deleteOne({ _id: video._id });

    console.log(
      `🗑️  Deleted video ${idNum} (files removed: ${deletedFiles.length})`
    );

    res.json({
      success: true,
      message: "Video deleted",
      deletedId: idNum,
      deletedFiles,
    });
  } catch (err) {
    console.error("deleteVideo error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// POST /api/video/bulk-delete
// ================================================================
exports.bulkDeleteVideos = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const { videoIds } = req.body;

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "videoIds array required" });
    }

    const videos = await Video.find({
      id: { $in: videoIds },
      userId,
    });

    if (videos.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No matching videos found" });
    }

    let filesDeleted = 0;
    for (const v of videos) {
      const urls = [v.localVideoUrl, v.videoUrl].filter(Boolean);
      for (const url of urls) {
        if (deleteLocalVideoFile(url)) filesDeleted++;
      }
    }

    const result = await Video.deleteMany({
      _id: { $in: videos.map((v) => v._id) },
    });

    console.log(
      `🗑️  Bulk deleted ${result.deletedCount} videos (files removed: ${filesDeleted})`
    );

    res.json({
      success: true,
      message: `${result.deletedCount} video(s) deleted`,
      deletedCount: result.deletedCount,
      filesDeleted,
    });
  } catch (err) {
    console.error("bulkDeleteVideos error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.mergeVideos = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { videoIds } = req.body;
    if (!Array.isArray(videoIds) || videoIds.length < 2) {
      return res.status(400).json({ success: false, message: "Select at least 2 videos" });
    }

    const videos = await Video.find({ id: { $in: videoIds }, userId });
    if (videos.length !== videoIds.length) {
      return res.status(404).json({ success: false, message: "One or more videos not found" });
    }

    const ordered = videoIds.map((id) => videos.find((v) => v.id === id)).filter(Boolean);
    const inputPaths = [];
    for (const v of ordered) {
      if (!v.localVideoUrl) {
        return res.status(400).json({ success: false, message: `Video "${v.title}" has no local file` });
      }
      const rel = v.localVideoUrl.replace(/^\/+/, "");
      const abs = path.join(__dirname, "..", rel);
      if (!fs.existsSync(abs)) {
        return res.status(404).json({ success: false, message: `Missing file: ${path.basename(abs)}` });
      }
      inputPaths.push(abs);
    }

    // ---- Check audio ----
    const probeAudio = (filePath) =>
      new Promise((resolve) => {
        const ff = spawn("ffprobe", [
          "-v", "error",
          "-select_streams", "a:0",
          "-show_entries", "stream=codec_type",
          "-of", "csv=p=0",
          filePath,
        ]);
        let out = "";
        ff.stdout.on("data", (d) => (out += d.toString()));
        ff.on("close", () => resolve(out.trim().includes("audio")));
        ff.on("error", () => resolve(false));
      });

    const audioFlags = await Promise.all(inputPaths.map(probeAudio));
    const anyHasAudio = audioFlags.some((f) => f === true);

    console.log("🎬 Merge inputs:");
    inputPaths.forEach((p, i) => {
      console.log(`   [${i + 1}] ${path.basename(p)} — audio: ${audioFlags[i] ? "YES ✅" : "NO ❌"}`);
    });

    // ⬇️ EVERY INPUT IS SCALED + PADDED TO 960x960 HERE
    const V_SIZE = "960:960";
    const normalize = (i) =>
      `[${i}:v]scale=${V_SIZE}:force_original_aspect_ratio=decrease,` +
      `pad=${V_SIZE}:(ow-iw)/2:(oh-ih)/2:color=black,` +
      `setsar=1,format=yuv420p[v${i}]`;

    let args;

    if (!anyHasAudio) {
      // ⚡ FAST PATH — no audio anywhere, video-only merge
      console.log("⚡ Fast path: video-only merge (no audio in any clip)");

      const filterParts = inputPaths.map((_, i) => normalize(i));
      const concatInputs = inputPaths.map((_, i) => `[v${i}]`).join("");
      const filter =
        filterParts.join(";") +
        `;${concatInputs}concat=n=${inputPaths.length}:v=1:a=0[outv]`;

      args = [
        ...inputPaths.flatMap((p) => ["-i", p]),
        "-filter_complex", filter,
        "-map", "[outv]",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "26",
        "-pix_fmt", "yuv420p",
        "-movflags", "frag_keyframe+empty_moov+default_base_moof",
        "-f", "mp4", "pipe:1",
      ];
    } else {
      // FULL PATH — has audio, do the audio-preserving merge
      console.log("🎬 Full path: audio-preserving merge");

      const inputs = [];
      for (let i = 0; i < inputPaths.length; i++) {
        inputs.push("-i", inputPaths[i]);
      }

      const silenceIndexMap = {};
      let nextInputIdx = inputPaths.length;
      for (let i = 0; i < inputPaths.length; i++) {
        if (!audioFlags[i]) {
          inputs.push("-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100");
          silenceIndexMap[i] = nextInputIdx;
          nextInputIdx++;
        }
      }

      const filterParts = [];
      for (let i = 0; i < inputPaths.length; i++) {
        filterParts.push(normalize(i));
        if (audioFlags[i]) {
          filterParts.push(`[${i}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo,apad[a${i}]`);
        } else {
          const sIdx = silenceIndexMap[i];
          filterParts.push(`[${sIdx}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo,apad[a${i}]`);
        }
      }

      const concatInputs = inputPaths.map((_, i) => `[v${i}][a${i}]`).join("");
      const filter =
        filterParts.join(";") +
        `;${concatInputs}concat=n=${inputPaths.length}:v=1:a=1[outv][outa]`;

      args = [
        ...inputs,
        "-filter_complex", filter,
        "-map", "[outv]",
        "-map", "[outa]",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "26",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "128k",
        "-ar", "44100",
        "-movflags", "frag_keyframe+empty_moov+default_base_moof",
        "-f", "mp4", "pipe:1",
      ];
    }

    console.log("🎬 FFmpeg args:", args.join(" "));

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="full-podcast-${Date.now()}.mp4"`);
    res.setHeader("Cache-Control", "no-store");

    const ff = spawn("ffmpeg", args);
    ff.stdout.pipe(res);

    ff.stderr.on("data", (data) => {
      process.stdout.write(`[ffmpeg] ${data.toString()}`);
    });

    ff.on("error", (err) => {
      console.error("❌ FFmpeg spawn error:", err.message);
      if (!res.headersSent) res.status(500).json({ success: false, message: "FFmpeg failed" });
      else res.end();
    });

    ff.on("close", (code) => {
      if (code === 0) console.log("✅ Merge done");
      else console.error(`❌ FFmpeg exited ${code}`);
      if (!res.writableEnded) res.end();
    });

    req.on("close", () => {
      if (!ff.killed) ff.kill("SIGKILL");
    });
  } catch (err) {
    console.error("mergeVideos error:", err.message);
    if (!res.headersSent) res.status(500).json({ success: false, message: err.message });
    else res.end();
  }
};
