// backend/src/services/aiService.js
const axios = require("axios");
const Replicate = require("replicate");

// ================================================================
// 🤖 MODELS
// ================================================================
const MODELS = {
  VISION_GPT: "openai/gpt-5.4",
  IMAGE_SDXL:
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  VIDEO_WAN: "wan-video/wan-2.2-5b-fast",
  TEXT_CHAT: "deepseek-chat",
  ENDPOINTS: {
    deepseek: "https://api.deepseek.com/v1/chat/completions",
  },
  DEFAULTS: {
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 30000,
  },
};

// ================================================================
// 🔌 INIT CLIENTS
// ================================================================
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// ================================================================
// 💬 CHAT — text chat (DeepSeek)
// ================================================================
async function chat({
  userMessage,
  systemPrompt = "",
  model = MODELS.TEXT_CHAT,
  temperature = MODELS.DEFAULTS.temperature,
  maxTokens = MODELS.DEFAULTS.maxTokens,
}) {
  if (!userMessage) throw new Error("userMessage is required");
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userMessage });

  const res = await axios.post(
    process.env.DEEPSEEK_API_URL || MODELS.ENDPOINTS.deepseek,
    { model, messages, temperature, max_tokens: maxTokens },
    {
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: MODELS.DEFAULTS.timeout,
    }
  );

  return res.data?.choices?.[0]?.message?.content?.trim() || "";
}

// ================================================================
// 🖼️ VISION — analyze an image (Replicate GPT)
// ================================================================
async function vision({
  imageUrl,
  prompt,
  systemPrompt = "",
  model = MODELS.VISION_GPT,
}) {
  if (!imageUrl) throw new Error("imageUrl is required");
  if (!prompt) throw new Error("prompt is required");
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  const input = {
    image_input: [imageUrl],
    ...(systemPrompt && { system_prompt: systemPrompt }),
    prompt,
    verbosity: "low",
    reasoning_effort: "low",
  };

  const output = await replicate.run(model, { input });

  if (Array.isArray(output)) return output.join(" ").trim();
  if (typeof output === "string") return output.trim();
  return JSON.stringify(output).trim();
}

// ================================================================
// 🎨 IMAGE — text → image (Replicate SDXL)
// ================================================================
async function image({
  prompt,
  aspectRatio = "square",
  model = MODELS.IMAGE_SDXL,
  steps = 30,
  guidance = 7.5,
}) {
  if (!prompt) throw new Error("prompt is required");
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  let width = 1024;
  let height = 1024;

  if (aspectRatio === "portrait") {
    width = 832;
    height = 1216;
  } else if (aspectRatio === "wide") {
    width = 1344;
    height = 768;
  }

  const input = {
    prompt,
    width,
    height,
    num_outputs: 1,
    scheduler: "K_EULER",
    num_inference_steps: steps,
    guidance_scale: guidance,
  };

  console.log("🎨 Replicate image input:", {
    aspectRatio,
    width,
    height,
    prompt: prompt.slice(0, 80) + "…",
  });

  const output = await replicate.run(model, { input });

  if (Array.isArray(output) && output[0]) return String(output[0]);
  if (typeof output === "string") return output;
  return String(output);
}

// ================================================================
// 🎥 VIDEO — image → video (Replicate — Wan 2.2 5B Fast)
// Accepts "landscape" | "portrait" | "square" | raw ratios
// ================================================================
async function video({
  imageUrl,
  prompt,
  format = "landscape",
  resolution = "720p",
  numFrames = 121,
  fps = 24,
  sampleShift = 12,
  optimizePrompt = false,
  model = MODELS.VIDEO_WAN,
}) {
  if (!imageUrl) throw new Error("imageUrl is required");
  if (!prompt) throw new Error("prompt is required");
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  const FORMAT_MAP = {
    landscape: "16:9",
    portrait: "9:16",
    square: "1:1",
    "16:9": "16:9",
    "9:16": "9:16",
    "1:1": "1:1",
    "4:3": "4:3",
    "3:4": "3:4",
  };

  const normalized = String(format || "").toLowerCase().trim();
  const aspectRatio = FORMAT_MAP[normalized] || "16:9";

  console.log("🎬 Format mapping:", {
    received: format,
    normalized,
    aspectRatio,
  });

  const frames = [81, 121].includes(numFrames) ? numFrames : 121;
  const res = ["480p", "720p"].includes(resolution) ? resolution : "720p";

  const input = {
    image: imageUrl,
    prompt: prompt.trim(),
    go_fast: true,
    num_frames: frames,
    resolution: res,
    aspect_ratio: aspectRatio,
    sample_shift: sampleShift,
    optimize_prompt: optimizePrompt,
    frames_per_second: fps,
  };

  console.log("🎥 Replicate video input:", JSON.stringify(input, null, 2));

  const output = await replicate.run(model, { input });

  console.log("🎥 Replicate video output:", output);

  if (typeof output === "string") return output;
  if (Array.isArray(output) && output[0]) {
    const first = output[0];
    if (typeof first === "string") return first;
    if (first && typeof first.url === "function") return first.url();
    return String(first);
  }
  if (output && typeof output.url === "function") return output.url();
  return String(output);
}

// ================================================================
// 📦 EXPORTS
// ================================================================
module.exports = {
  MODELS,
  chat,
  vision,
  image,
  video,
};
