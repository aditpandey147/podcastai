// backend/src/services/aiService.js
const axios = require("axios");
const Replicate = require("replicate");

// ================================================================
// 🤖 MODELS — change here to update everywhere
// ================================================================
const MODELS = {
  // ---------- VISION (Replicate) ----------
  VISION_GPT: "openai/gpt-5.4",

  // ---------- IMAGE (Replicate — SDXL) ----------
  IMAGE_SDXL:
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",

  // ---------- VIDEO (Replicate) ----------
  VIDEO_KLING: "wan-video/wan-2.2-i2v-fast",

  // ---------- TEXT CHAT (DeepSeek) ----------
  TEXT_CHAT: "deepseek-chat",

  // ---------- ENDPOINTS ----------
  ENDPOINTS: {
    deepseek: "https://api.deepseek.com/v1/chat/completions",
  },

  // ---------- DEFAULTS ----------
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
    {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    },
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
/**
 * @param {Object} opts
 * @param {string} opts.prompt            Image prompt (required)
 * @param {string} [opts.aspectRatio]     "square" | "portrait" | "wide"
 * @param {string} [opts.model]           Override default SDXL model
 * @param {number} [opts.steps]           Inference steps (default 30)
 * @param {number} [opts.guidance]        Guidance scale (default 7.5)
 * @returns {Promise<string>}             Public image URL
 */
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

  // SDXL native resolution buckets (keeps composition natural)
  let width = 1024;
  let height = 1024;

  if (aspectRatio === "portrait") {
    width = 832;
    height = 1216; // ~2:3
  } else if (aspectRatio === "wide") {
    width = 1344;
    height = 768; // ~16:9
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

  // Output is typically an array with one URL string
  if (Array.isArray(output) && output[0]) return String(output[0]);
  if (typeof output === "string") return output;
  return String(output);
}

// ================================================================
// 🎥 VIDEO — image → video (Replicate)
// ================================================================
async function video({
  imageUrl,
  prompt,
  model = MODELS.VIDEO_KLING,
  resolution = "480p",
  numFrames = 81,
  fps = 16,
}) {
  if (!imageUrl) throw new Error("imageUrl is required");
  if (!prompt) throw new Error("prompt is required");
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  const input = {
    image: imageUrl,
    prompt: prompt,
    num_frames: numFrames,
    resolution: resolution,
    frames_per_second: fps,
    go_fast: true,
    interpolate_output: false,
  };

  console.log("🎥 Replicate input:", JSON.stringify(input, null, 2));

  const output = await replicate.run(model, { input });

  if (typeof output === "string") return output;
  if (Array.isArray(output) && output[0]) return String(output[0]);
  return String(output);
}

// ================================================================
// 📦 EXPORTS
// ================================================================
module.exports = {
  MODELS,
  chat,
  vision,
  image,   // 👈 NEW
  video,
};