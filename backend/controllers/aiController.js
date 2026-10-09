// backend/src/controllers/aiController.js
const axios = require("axios");
const ai = require("../services/aiService");

// ================================================================
// POST /api/ai/enhance
// ================================================================
exports.enhanceDialog = async (req, res) => {
  try {
    const { text, role = "host" } = req.body;

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Text is required" });
    }

    const speaker = role === "host" ? "podcast host" : "podcast guest";

    const polished = await ai.chat({
      userMessage: text.trim(),
      systemPrompt: `You are an expert script writer for professional podcasts.
Rewrite the ${speaker}'s rough line into ONE punchy, memorable podcast line.
Output ONLY the rewritten line — no quotes, no explanation. Under 25 words.`,
      temperature: 0.9,
      maxTokens: 200,
    });

    const cleaned = polished
      .replace(/^["'`]+/, "")
      .replace(/["'`]+$/, "")
      .trim();

    res.json({ success: true, text: cleaned });
  } catch (err) {
    console.error("enhanceDialog error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: err.response?.data?.error?.message || err.message,
    });
  }
};

// ================================================================
// POST /api/ai/dialogue
// ================================================================
exports.generateDialogue = async (req, res) => {
  try {
    const {
      topic,
      category = "Technology & AI",
      details = "",
      tone = "Professional",
      style = "Conversational",
    } = req.body;

    if (!topic || !topic.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Topic is required" });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "DEEPSEEK_API_KEY not configured",
      });
    }

    const systemPrompt = `You are a podcast scriptwriter for SHORT 5-SECOND video clips.

Generate a punchy, natural conversation between a HOST and a GUEST.

CRITICAL RULES:
- Respond with ONLY a valid JSON array — no intro, no markdown, no code fences.
- Return exactly 2 sections.
- Each section = {"host":"...","guest":"..."}.
- Each "host" and "guest" line MUST be 6–10 words MAX.
- One sentence only per line.
- Punchy, conversational, hook-style.
- Tone: ${tone}.
- Category: ${category}.
- Section 2 continues from Section 1.

Format: [{"host":"...","guest":"..."},{"host":"...","guest":"..."}]`;

    const userPrompt = `Topic: ${topic}
${details ? `\nContext:\n${details}\n` : ""}
Write a punchy 2-part host/guest exchange. Each line 6–10 words only.
Return ONLY the JSON array.`;

    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 400,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    let raw = response.data?.choices?.[0]?.message?.content?.trim() || "";
    raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    if (start === -1 || end === -1) {
      throw new Error("AI did not return a valid JSON array");
    }

    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("AI returned an empty dialogue");
    }

    const shorten = (text, maxWords = 10) => {
      const clean = String(text || "").trim().replace(/\s+/g, " ");
      const firstSentence = clean.split(/(?<=[.!?])\s+/)[0] || clean;
      const words = firstSentence.split(" ").slice(0, maxWords);
      let out = words.join(" ");
      if (out && !/[.!?]$/.test(out)) out += ".";
      return out;
    };

    const contents = parsed
      .slice(0, 2)
      .map((item) => ({
        host: shorten(item.host, 10),
        guest: shorten(item.guest, 10),
      }))
      .filter((c) => c.host && c.guest);

    if (contents.length === 0) {
      throw new Error("AI returned no valid content");
    }

    res.json({ success: true, contents });
  } catch (err) {
    console.error("generateDialogue error:", err.response?.data || err.message);

    const fallback = [
      {
        host: "AI is changing the world faster than ever.",
        guest: "And it's only getting started.",
      },
      {
        host: "So what should we focus on?",
        guest: "Learning to work with AI, not against it.",
      },
    ];

    res.json({
      success: true,
      contents: fallback,
      fallback: true,
      message: "Using fallback dialogue (AI call failed)",
    });
  }
};

// ================================================================
// GET /api/ai/trending-stream  (SSE)
// Text-only — uses ai.chat(). No images. Streams 12 podcasts then done.
// ================================================================
exports.generateTrendingStream = async (req, res) => {
  console.log("🔴 SSE hit — topic:", req.query.topic);
  console.log("🔴 token present:", !!req.query.token);

  // ---- SSE headers ----
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (event, data) => {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      console.error("SSE send error:", e.message);
    }
  };

  const topic = (req.query.topic || "").trim();

  if (!topic) {
    send("error", { message: "Topic is required" });
    return res.end();
  }

  const ping = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {}
  }, 15000);

  req.on("close", () => {
    clearInterval(ping);
    try {
      res.end();
    } catch {}
  });

  try {
    const systemPrompt = `You are a podcast industry analyst with real-time knowledge of trending podcasts.

Task: Given a TOPIC, return the TOP 12 podcasts currently trending across YouTube, Spotify, Apple Podcasts, Amazon Music, and Google Podcasts.

CRITICAL RULES:
- Respond with ONLY a valid JSON array — no intro, no markdown, no code fences.
- Return exactly 12 podcast objects.
- Each object must have keys: rank, title, host, category, platform, listeners, rating, growth, description, tags.
- "platform" MUST be one of: "YouTube", "Spotify", "Apple Podcasts", "Amazon Music", "Google Podcasts".
- "listeners" format: "12.4M", "890K" etc.
- "rating": number like 4.8.
- "growth": weekly growth percentage like "+12%" or "+4.5%".
- "description": 20-35 words describing what the podcast is about. Punchy, no fluff.
- "tags": array of 3-4 short keyword strings.
- Rank 1 = most trending.

Format:
[{"rank":1,"title":"...","host":"...","category":"...","platform":"YouTube","listeners":"12.4M","rating":4.8,"growth":"+12%","description":"...","tags":["tag1","tag2","tag3"]}, ...]`;

    const userPrompt = `Topic: ${topic}

Return the TOP 12 trending podcasts.
Return ONLY the JSON array.`;

    // 👇 use ai.chat() from your aiService
    const raw = await ai.chat({
      userMessage: userPrompt,
      systemPrompt,
      temperature: 0.85,
      maxTokens: 3000,
    });

    const cleaned = String(raw || "")
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();

    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1) throw new Error("AI did not return JSON");

    const parsed = JSON.parse(cleaned.slice(start, end + 1));

    const allowedPlatforms = [
      "YouTube",
      "Spotify",
      "Apple Podcasts",
      "Amazon Music",
      "Google Podcasts",
    ];

    const podcasts = parsed.slice(0, 12).map((item, i) => ({
      rank: Number(item.rank) || i + 1,
      title: String(item.title || "").trim(),
      host: String(item.host || "").trim(),
      category: String(item.category || "").trim(),
      platform: allowedPlatforms.includes(item.platform)
        ? item.platform
        : "YouTube",
      listeners: String(item.listeners || "1.0M").trim(),
      rating: Number(item.rating) || 4.5,
      growth: String(item.growth || "+0%").trim(),
      description: String(item.description || "").trim(),
      tags: Array.isArray(item.tags)
        ? item.tags.slice(0, 4).map((t) => String(t).trim())
        : [],
    }));

    console.log(`✅ Sending ${podcasts.length} podcasts (no images)`);

    send("podcasts", { topic, podcasts });

    send("done", { topic });
    clearInterval(ping);
    res.end();
  } catch (err) {
    console.error(
      "generateTrendingStream error:",
      err.response?.data || err.message
    );

    const fallback = Array.from({ length: 12 }, (_, i) => ({
      rank: i + 1,
      title: `${topic} Podcast ${i + 1}`,
      host: `Host ${i + 1}`,
      category: topic,
      platform: [
        "YouTube",
        "Spotify",
        "Apple Podcasts",
        "Amazon Music",
        "Google Podcasts",
      ][i % 5],
      listeners: `${12 - i}.${4 - (i % 3)}M`,
      rating: 4.8 - (i % 3) * 0.1,
      growth: `+${12 - i}%`,
      description: `A trending podcast about ${topic}, hosted by industry experts.`,
      tags: [topic.split(" ")[0], "trending", "podcast"],
    }));

    send("podcasts", { topic, podcasts: fallback, fallback: true });
    send("error", { message: "AI call failed — showing sample data" });
    send("done", { topic });
    clearInterval(ping);
    res.end();
  }
};


// ================================================================
// POST /api/ai/publish-kit
// body: { video: { title, category, hostLine, guestLine }, platform }
// returns: { success, kit }
// ================================================================
// ================================================================
// POST /api/ai/publish-kit
// body: { video: { title, category, hostLine, guestLine }, platform }
// returns: { success, kit }
// ================================================================
exports.generatePublishKit = async (req, res) => {
  try {
    const { video, platform } = req.body;

    if (!video || !platform) {
      return res
        .status(400)
        .json({ success: false, message: "Video and platform are required" });
    }

    // Platform-specific rules
    const platformRules = {
      YouTube: `YouTube Shorts:
- Title: 60-70 chars, front-loaded keyword, curiosity hook
- Description: 150-300 chars, hook + value + CTA + link placeholder
- Tags: 8-12 short tags
- Hashtags: 3-5 (#Shorts, #Podcast, topic-specific)
- Best time: pick specific time like "Weekdays 6-9 PM ET"
- Thumbnail text: 3-5 words, uppercase, high contrast`,

      TikTok: `TikTok:
- Title: 40-60 chars, POV/hook style, emoji allowed
- Description: 100-200 chars, punchy + question to drive comments
- Tags: 6-10 short trending tags
- Hashtags: 5-8 (#fyp #foryou #podcast + niche)
- Best time: specific like "Tue/Thu/Sat 7-11 PM"
- Thumbnail text: 4-6 words, casual, trend-aligned`,

      Instagram: `Instagram Reels:
- Title: 50-70 chars, aesthetic + benefit-driven
- Description: 150-250 chars, conversational + emoji sprinkle
- Tags: 8-12 niche tags
- Hashtags: 8-12 mix of broad + niche
- Best time: specific like "Mon/Wed/Fri 11 AM-1 PM"
- Thumbnail text: 3-5 words, clean, minimal`,

      Spotify: `Spotify / Podcast:
- Title: 50-70 chars, SEO-focused, clear value
- Description: 200-400 chars, structured with bullets, guest credentials
- Tags: 6-10 discovery keywords
- Hashtags: 3-5 (Spotify prefers fewer)
- Best time: "Tue-Thu mornings"
- Thumbnail text: 3-4 words, strong typography`,

      "Apple Podcasts": `Apple Podcasts:
- Title: 50-70 chars, clean and searchable
- Description: 250-400 chars, structured, mention episode number if relevant
- Tags: 6-10 keywords Apple recommends
- Hashtags: 3-5 (Apple uses fewer)
- Best time: "Weekday mornings, Tuesday-Thursday"
- Thumbnail text: 3-5 words, minimal and premium`,

      "Amazon Music": `Amazon Music Podcasts:
- Title: 50-70 chars, keyword-rich
- Description: 200-350 chars, benefit-focused, mention target audience
- Tags: 6-10 keywords for Amazon search
- Hashtags: 3-5
- Best time: "Weeknights 7-10 PM"
- Thumbnail text: 3-4 words, bold`,

      "Google Podcasts": `Google Podcasts:
- Title: 50-70 chars, SEO-first, use searchable phrases
- Description: 250-400 chars, naturally include keywords, structured
- Tags: 8-12 search keywords
- Hashtags: 3-5
- Best time: "Mon-Fri mornings"
- Thumbnail text: 3-5 words, clear typography`,
    };

    const rules = platformRules[platform] || platformRules.YouTube;

    const systemPrompt = `You are a senior social media strategist for podcast creators.

Task: Generate a complete publishing kit for a podcast video being published to ${platform}.

${rules}

Respond with ONLY valid JSON (no markdown, no code fences) in this exact structure:
{
  "title": "...",
  "description": "...",
  "tags": ["tag1", "tag2"],
  "hashtags": ["#tag1", "#tag2"],
  "bestTime": "...",
  "thumbnailText": "...",
  "hook": "...",
  "cta": "..."
}

Rules for every field:
- title: string, follow the platform length rule
- description: string, follow the platform length rule
- tags: array of short keyword strings (no # prefix)
- hashtags: array of strings WITH # prefix
- bestTime: specific day + time recommendation
- thumbnailText: short ALL-CAPS text for the video thumbnail
- hook: 1-2 sentence opening hook the creator can say on camera
- cta: single clear call-to-action line (e.g. "Follow for more!")`;

    const userPrompt = `Video details:
Title: ${video.title || "Untitled Podcast"}
Category: ${video.category || "Podcast"}
Host line: "${video.hostLine || ""}"
Guest line: "${video.guestLine || ""}"

Generate the full ${platform} publishing kit as JSON.`;

    // 👇 use ai.chat() instead of raw axios
    const raw = await ai.chat({
      userMessage: userPrompt,
      systemPrompt,
      temperature: 0.85,
      maxTokens: 1500,
    });

    const cleaned = String(raw || "")
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error("AI did not return valid JSON");
    }

    const parsed = JSON.parse(cleaned.slice(start, end + 1));

    const kit = {
      title: String(parsed.title || "").trim(),
      description: String(parsed.description || "").trim(),
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 15) : [],
      hashtags: Array.isArray(parsed.hashtags)
        ? parsed.hashtags.slice(0, 15)
        : [],
      bestTime: String(parsed.bestTime || "").trim(),
      thumbnailText: String(parsed.thumbnailText || "").trim(),
      hook: String(parsed.hook || "").trim(),
      cta: String(parsed.cta || "").trim(),
    };

    res.json({ success: true, platform, kit });
  } catch (err) {
    console.error(
      "generatePublishKit error:",
      err.response?.data || err.message
    );

    // Fallback
    res.json({
      success: true,
      platform: req.body.platform || "YouTube",
      kit: {
        title: "New Podcast Episode — Watch Now",
        description:
          "Fresh insights on the latest topic. Full episode available now. Subscribe for more.",
        tags: ["podcast", "shorts", "viral"],
        hashtags: ["#podcast", "#shorts", "#viral"],
        bestTime: "Weekdays 6-9 PM",
        thumbnailText: "NEW EPISODE",
        hook: "You won't believe what happened next.",
        cta: "Follow for more!",
      },
      fallback: true,
    });
  }
};

// ================================================================
// POST /api/ai/growth-plan
// body: { video: { title, category, hostLine, guestLine }, goal, experience }
// returns: { success, plan }
// ================================================================
exports.generateGrowthPlan = async (req, res) => {
  try {
    const { video, goal = "grow audience", experience = "beginner" } = req.body;

    if (!video) {
      return res
        .status(400)
        .json({ success: false, message: "Video is required" });
    }

    const systemPrompt = `You are a senior podcast growth strategist who has helped creators grow from 0 to millions of listeners.

Task: Given a podcast video, generate a COMPLETE step-by-step growth roadmap.

Respond with ONLY valid JSON (no markdown, no code fences) in this EXACT structure:

{
  "overview": {
    "summary": "2-3 sentence strategic summary of the podcast's growth potential",
    "currentStrength": "1 sentence on what's working",
    "biggestOpportunity": "1 sentence on the biggest untapped lever",
    "growthScore": 78
  },
  "positioning": {
    "niche": "specific niche angle (not broad)",
    "targetAudience": "who exactly to speak to",
    "uniqueAngle": "what makes this different",
    "toneWords": ["word1", "word2", "word3"]
  },
  "roadmap": [
    {
      "week": 1,
      "theme": "Setup & Foundation",
      "goals": ["goal 1", "goal 2"],
      "actions": [
        {"day": "Mon", "task": "specific action step"},
        {"day": "Wed", "task": "specific action step"},
        {"day": "Fri", "task": "specific action step"}
      ],
      "successMetric": "how to know it worked"
    }
  ],
  "contentIdeas": [
    {"title": "Episode/Short idea", "format": "Short|Long|Clip", "hook": "opening hook line"}
  ],
  "distributionChannels": [
    {"channel": "TikTok", "why": "1 sentence reason", "weeklyAction": "what to post weekly", "priority": "high|medium|low"}
  ],
  "monetizationPaths": [
    {"path": "Path name", "potential": "$X/month", "whenToStart": "milestone", "how": "1 sentence"}
  ]
}

Rules:
- "growthScore": integer 1-100
- "roadmap": EXACTLY 4 weeks
- Each week: 2-3 goals, 3 actions (Mon/Wed/Fri), 1 success metric
- "contentIdeas": EXACTLY 6 ideas
- "distributionChannels": EXACTLY 5 channels
- "monetizationPaths": EXACTLY 4 paths
- Everything specific to the video topic, not generic
- Tone: expert, actionable, no fluff`;

    const userPrompt = `Podcast video details:
Title: ${video.title || "Untitled Podcast"}
Category: ${video.category || "General"}
Host line: "${video.hostLine || ""}"
Guest line: "${video.guestLine || ""}"

User goal: ${goal}
User experience: ${experience}

Generate the complete growth roadmap JSON.`;

    // 👇 use ai.chat() instead of raw axios
    const raw = await ai.chat({
      userMessage: userPrompt,
      systemPrompt,
      temperature: 0.85,
      maxTokens: 3000,
    });

    const cleaned = String(raw || "")
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("AI did not return JSON");

    const plan = JSON.parse(cleaned.slice(start, end + 1));

    res.json({ success: true, plan });
  } catch (err) {
    console.error(
      "generateGrowthPlan error:",
      err.response?.data || err.message
    );

    // Fallback so UI never breaks
    res.json({
      success: true,
      fallback: true,
      plan: {
        overview: {
          summary:
            "This podcast has strong potential in a focused niche. With consistent publishing and short-form clips, you can realistically grow listeners 10× in 90 days.",
          currentStrength:
            "Clear topic positioning gives you an advantage in search and recommendations.",
          biggestOpportunity:
            "Converting long episodes into 15-30 short clips per week is the fastest growth lever.",
          growthScore: 72,
        },
        positioning: {
          niche: "AI & Future of Work",
          targetAudience: "Founders, product managers, and creators aged 22-40",
          uniqueAngle: "Real, unfiltered conversations about building with AI",
          toneWords: ["Smart", "Practical", "Optimistic"],
        },
        roadmap: [
          {
            week: 1,
            theme: "Foundation Setup",
            goals: [
              "Nail down your niche and positioning",
              "Optimize podcast feeds on all platforms",
            ],
            actions: [
              { day: "Mon", task: "Rewrite your podcast description" },
              { day: "Wed", task: "Set up TikTok + YouTube Shorts" },
              { day: "Fri", task: "Publish your first 3 clips" },
            ],
            successMetric: "All platforms live + first 100 views per clip",
          },
          {
            week: 2,
            theme: "Clip Factory",
            goals: ["Build a clip workflow", "Post 2 clips per day"],
            actions: [
              { day: "Mon", task: "Create 20 clips from last episode" },
              { day: "Wed", task: "Post 4 clips across platforms" },
              { day: "Fri", task: "Analyze first-week retention" },
            ],
            successMetric: "≥ 5K total views across all clips",
          },
          {
            week: 3,
            theme: "Community Building",
            goals: [
              "Start a Discord or newsletter",
              "Engage with 50 comments/day",
            ],
            actions: [
              { day: "Mon", task: "Launch a Discord server" },
              { day: "Wed", task: "Send first newsletter" },
              { day: "Fri", task: "Do a live Q&A" },
            ],
            successMetric: "100 Discord members + 500 newsletter subs",
          },
          {
            week: 4,
            theme: "Guests & Collaborations",
            goals: [
              "Book 3 guest interviews",
              "Cross-promote with 2 podcasts",
            ],
            actions: [
              { day: "Mon", task: "Pitch 10 potential guests" },
              { day: "Wed", task: "Record first guest interview" },
              { day: "Fri", task: "Set up cross-promo swap" },
            ],
            successMetric: "3 guests booked + 1 cross-promo live",
          },
        ],
        contentIdeas: [
          {
            title: "Why AI won't replace you",
            format: "Short",
            hook: "Everyone's scared of AI. Here's the truth.",
          },
          {
            title: "The 5 tools I use daily",
            format: "Long",
            hook: "If you're not using these, you're behind.",
          },
          {
            title: "From 0 to 10K listeners",
            format: "Clip",
            hook: "Here's exactly how I did it.",
          },
          {
            title: "The biggest AI myth",
            format: "Short",
            hook: "This myth is costing you time.",
          },
          {
            title: "Interview with a founder",
            format: "Long",
            hook: "He built a $10M company with AI.",
          },
          {
            title: "3-minute news breakdown",
            format: "Clip",
            hook: "AI news you missed this week.",
          },
        ],
        distributionChannels: [
          {
            channel: "TikTok",
            why: "Fastest organic reach for short clips",
            weeklyAction: "Post 10 clips",
            priority: "high",
          },
          {
            channel: "YouTube Shorts",
            why: "Best search + discovery",
            weeklyAction: "Post 7 clips",
            priority: "high",
          },
          {
            channel: "Instagram Reels",
            why: "Strong for brand building",
            weeklyAction: "Post 5 reels",
            priority: "medium",
          },
          {
            channel: "LinkedIn",
            why: "Perfect for B2B audience",
            weeklyAction: "Post 2 clips + 1 text post",
            priority: "medium",
          },
          {
            channel: "Newsletter",
            why: "Own your audience",
            weeklyAction: "Send 1 issue",
            priority: "low",
          },
        ],
        monetizationPaths: [
          {
            path: "Sponsorships",
            potential: "$500-2K/month",
            whenToStart: "At 5K subscribers",
            how: "Pitch niche sponsors directly",
          },
          {
            path: "Patreon / Memberships",
            potential: "$300-1K/month",
            whenToStart: "At 1K true fans",
            how: "Offer bonus episodes and Q&A",
          },
          {
            path: "Digital Products",
            potential: "$1K-5K/month",
            whenToStart: "At 10K listeners",
            how: "Sell a course or template pack",
          },
          {
            path: "Coaching / Consulting",
            potential: "$2K-10K/month",
            whenToStart: "Any time",
            how: "Turn listeners into clients",
          },
        ],
      },
    });
  }
};

// ================================================================
// POST /api/ai/brand-kit
// body: { video, vibe, audience, goal }
// returns: { success, kit }
// ================================================================
exports.generateBrandKit = async (req, res) => {
  try {
    const {
      video,
      vibe = "modern",
      audience = "creators",
      goal = "grow audience",
    } = req.body;

    if (!video) {
      return res
        .status(400)
        .json({ success: false, message: "Video is required" });
    }

    const systemPrompt = `You are a world-class brand strategist and identity designer for podcast creators.

Task: Given a podcast, generate a COMPLETE brand identity kit.

Brand vibe: ${vibe}
Target audience: ${audience}
Primary goal: ${goal}

Respond with ONLY valid JSON (no markdown, no code fences) in this EXACT structure:

{
  "identity": {
    "name": "Brand/podcast name (2-3 words, memorable)",
    "tagline": "7 words max, punchy, memorable",
    "pitch": "30 words, elevator pitch",
    "mission": "1 sentence mission statement"
  },
  "palette": {
    "primary": "#hex",
    "secondary": "#hex",
    "background": "#hex",
    "text": "#hex",
    "highlight": "#hex",
    "rationale": "1 sentence explaining the color story"
  },
  "typography": {
    "heading": "Font name + weight (e.g. Inter Bold)",
    "body": "Font name + weight",
    "accent": "Font name + weight",
    "usage": "1 sentence on how to use them together"
  },
  "logo": {
    "style": "wordmark|icon|combination",
    "iconIdea": "short visual description of an icon concept",
    "layoutNotes": "how to arrange with the name",
    "imagePrompt": "detailed AI image-generation prompt (30-40 words) to create the logo"
  },
  "voice": {
    "toneWords": ["word1", "word2", "word3"],
    "dos": ["do this", "do that", "do this", "do that"],
    "donts": ["never this", "never that", "never this", "never that"],
    "samples": ["sample sentence in brand voice", "another sample sentence"]
  },
  "bios": {
    "youtube": "200 char YouTube channel bio",
    "tiktok": "80 char TikTok bio with emoji",
    "instagram": "150 char Instagram bio with emoji",
    "twitter": "160 char X/Twitter bio"
  },
  "thumbnail": {
    "layout": "1 sentence layout rule (text position, image placement)",
    "textRules": "1 sentence on max words + font size",
    "colorUsage": "1 sentence on which palette color goes where",
    "prompt": "reusable AI image prompt template (20-30 words)"
  },
  "checklist": [
    "Task 1 to launch the brand",
    "Task 2",
    "Task 3",
    "Task 4",
    "Task 5",
    "Task 6",
    "Task 7",
    "Task 8"
  ]
}

Rules:
- Colors MUST be valid 6-digit hex codes (#RRGGBB)
- Palette should feel cohesive (dark base OR light base, not both)
- Fonts should be real Google Fonts (Inter, Poppins, Playfair Display, Space Grotesk, DM Sans, etc.)
- Every field must be specific to THIS podcast, not generic
- No filler text, no "lorem ipsum"
- Tone: expert, confident, actionable`;

    const userPrompt = `Podcast details:
Title: ${video.title || "Untitled Podcast"}
Category: ${video.category || "General"}
Host line: "${video.hostLine || ""}"
Guest line: "${video.guestLine || ""}"

Brand vibe: ${vibe}
Target audience: ${audience}
Primary goal: ${goal}

Generate the complete brand identity kit JSON.`;

    const raw = await ai.chat({
      userMessage: userPrompt,
      systemPrompt,
      temperature: 0.9,
      maxTokens: 3000,
    });

    const cleaned = String(raw || "")
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("AI did not return JSON");

    const kit = JSON.parse(cleaned.slice(start, end + 1));

    res.json({ success: true, kit });
  } catch (err) {
    console.error(
      "generateBrandKit error:",
      err.response?.data || err.message
    );

    // Fallback
    res.json({
      success: true,
      fallback: true,
      kit: {
        identity: {
          name: "Signal & Noise",
          tagline: "Cut through the AI hype.",
          pitch:
            "A weekly show for founders who want to build real businesses with AI — no hype, just proven plays.",
          mission:
            "Help builders ship smarter using AI as leverage, not magic.",
        },
        palette: {
          primary: "#6c36ed",
          secondary: "#3477ff",
          background: "#020914",
          text: "#eef5ff",
          highlight: "#ffcf70",
          rationale:
            "Deep purple-to-blue signals intelligence; gold accents signal premium insight.",
        },
        typography: {
          heading: "Space Grotesk Bold",
          body: "Inter Regular",
          accent: "Playfair Display Italic",
          usage:
            "Headings in Space Grotesk for punch; body in Inter for readability; Playfair for pull-quotes.",
        },
        logo: {
          style: "combination",
          iconIdea:
            "A microphone silhouette with sound waves morphing into circuit lines",
          layoutNotes:
            "Icon to left of wordmark, 32px gap, vertically centered",
          imagePrompt:
            "minimalist podcast logo icon, microphone with circuit-line sound waves, purple-to-blue gradient, dark background, vector style, no text",
        },
        voice: {
          toneWords: ["Confident", "Curious", "Direct"],
          dos: [
            "Start with a bold claim",
            "Use concrete examples",
            "Speak to one person",
            "Cut every unnecessary word",
          ],
          donts: [
            "Use corporate jargon",
            "Hedge with 'maybe' or 'kind of'",
            "Stack buzzwords",
            "Explain the obvious",
          ],
          samples: [
            "AI won't replace you. Someone using AI will.",
            "The best AI tools are the ones you actually use.",
          ],
        },
        bios: {
          youtube:
            "Weekly conversations on building real businesses with AI. New episodes every Tuesday. Subscribe for founder-grade insights.",
          tiktok: "AI for builders 🚀 New drops weekly 👇",
          instagram:
            "Cut through the AI hype 🎙 Weekly podcast for founders building with AI ⚡ New episode every Tue",
          twitter:
            "Weekly podcast helping founders build real businesses with AI. No hype. Just plays that work. 🎙",
        },
        thumbnail: {
          layout:
            "Left: face/icon. Right: bold text block. Bottom-right: episode number",
          textRules: "Max 4 words, 60-80px font, all caps, tight tracking",
          colorUsage:
            "Primary gradient on background, highlight color for key word, text color on top",
          prompt:
            "bold podcast thumbnail, subject on left third, dramatic purple-blue gradient background, empty right side for text overlay, cinematic lighting, no text",
        },
        checklist: [
          "Register domain for podcast name",
          "Create Instagram business account",
          "Set up TikTok creator account",
          "Design cover art using the palette + logo concept",
          "Write and schedule 3 launch episodes",
          "Update podcast RSS artwork on Spotify + Apple",
          "Publish intro episode on all platforms",
          "Post 5 short clips from episode 1",
        ],
      },
    });
  }
};
