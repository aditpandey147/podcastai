// backend/src/seeds/seedComedyTemplates.js
const path = require("path");
const fs = require("fs");

// ================================================================
// MANUAL .env LOADER
// ================================================================
const envCandidates = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../.env"),
  path.resolve(process.cwd(), ".env"),
];

for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    require("dotenv").config({ path: p });
    console.log(`✅ Loaded env from: ${p}`);
    break;
  }
}

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  process.env.DATABASE_URL;

if (!MONGO_URI) {
  console.error("❌ No MongoDB URI found in .env");
  process.exit(1);
}

const mongoose = require("mongoose");
const Category = require("../models/Category");
const Template = require("../models/Template");

// ================================================================
// TARGET CATEGORY
// ================================================================
const CATEGORY_ID = 6; // 👈 Comedy & Entertainment

// ================================================================
// 10 COMEDY & ENTERTAINMENT TEMPLATES
// ================================================================
const comedyEntertainmentTemplates = [
  {
    title: "Level Up Your Life",
    description:
      "Explore practical strategies for building confidence, discipline, better habits and becoming your strongest self.",
    categoryId: 6,
    coverImage: "/public/templates/level-up-your-life.jpg",
    dialog: {
      host: "What's the first step to completely changing your life?",
      guest: "Stop waiting for motivation and start building consistent habits.",
    },
    isTrending: true,
  },
  {
    title: "The Learning Lab",
    description:
      "Discover smarter ways to learn, remember information and develop powerful lifelong learning skills.",
    categoryId: 6,
    coverImage: "/public/templates/the-learning-lab.jpg",
    dialog: {
      host: "Why do we forget so much of what we study?",
      guest: "Because learning once is very different from remembering long term.",
    },
    isTrending: true,
  },

  {
    title: "Mindset Reset",
    description:
      "Explore how changing your mindset can help overcome limiting beliefs and create meaningful personal growth.",
    categoryId: 6,
    coverImage: "/public/templates/mindset-reset.jpg",
    dialog: {
      host: "Can changing your mindset really change your life?",
      guest: "Absolutely, because your actions often follow the beliefs you repeat.",
    },
    isTrending: true,
  },

  {
    title: "Study Smarter",
    description:
      "Learn practical techniques for better concentration, memory, productivity and effective studying.",
    categoryId: 6,
    coverImage: "/public/templates/study-smarter.jpg",
    dialog: {
      host: "Why can someone study for hours and still remember almost nothing?",
      guest: "Because time spent studying matters less than how actively you learn.",
    },
    isTrending: true,
  },

  {
    title: "Unlock Your Potential",
    description:
      "Discover how confidence, meaningful goals and consistent action can unlock your personal potential.",
    categoryId: 6,
    coverImage: "/public/templates/unlock-your-potential.jpg",
    dialog: {
      host: "What stops most people from reaching their potential?",
      guest: "They wait until they feel ready instead of starting before they're ready.",
    },
    isTrending: true,
  },

  {
    title: "Deep Focus",
    description:
      "Explore techniques for improving concentration, eliminating distractions and doing meaningful focused work.",
    categoryId: 6,
    coverImage: "/public/templates/deep-focus.jpg",
    dialog: {
      host: "Why is staying focused becoming so difficult?",
      guest: "Because we've trained our attention to expect constant interruption.",
    },
    isTrending: true,
  },

  {
    title: "Better Every Day",
    description:
      "Learn how small daily habits and consistent improvements can create powerful long-term results.",
    categoryId: 6,
    coverImage: "/public/templates/better-every-day.jpg",
    dialog: {
      host: "Can one small habit really make a big difference?",
      guest: "Small changes become powerful when you repeat them long enough.",
    },
    isTrending: true,
  },

  {
    title: "Speak With Confidence",
    description:
      "Develop stronger communication, public speaking and confidence skills for everyday life.",
    categoryId: 6,
    coverImage: "/public/templates/speak-with-confidence.jpg",
    dialog: {
      host: "Why do confident people sound so convincing?",
      guest: "Because they focus on communicating clearly instead of trying to sound perfect.",
    },
    isTrending: true,
  },

  {
    title: "Life Lessons",
    description:
      "Explore meaningful lessons about mistakes, relationships, personal growth and wisdom gained through experience.",
    categoryId: 6,
    coverImage: "/public/templates/life-lessons.jpg",
    dialog: {
      host: "What's one lesson you wish you understood earlier?",
      guest: "That not every setback is a failure. Some of them redirect your life.",
    },
    isTrending: true,
  },

  {
    title: "Master Your Mind",
    description:
      "Explore mental resilience, discipline, emotional control and strategies for mastering your mindset.",
    categoryId: 6,
    coverImage: "/public/templates/master-your-mind.jpg",
    dialog: {
      host: "What's the real secret to mental discipline?",
      guest: "Learning to act according to your goals even when your emotions disagree.",
    },
    isTrending: true,
  },
];

// ================================================================
// SEED — scoped to CATEGORY_ID = 2 only
// ================================================================
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // 1. Confirm category 2 exists
    const category = await Category.findOne({ id: CATEGORY_ID });
    if (!category) {
      console.error(`❌ Category id=${CATEGORY_ID} not found.`);
      console.error("   Create it first, then re-run this seed.");
      process.exit(1);
    }
    console.log(`✅ Using category: id=${category.id} (${category.name})\n`);

    // 2. Remove ONLY category-2 templates (safe re-run)
    const existing = await Template.find({ categoryId: CATEGORY_ID });
    if (existing.length > 0) {
      console.log(
        `🗑  Removing ${existing.length} existing template(s) in category ${CATEGORY_ID}...`,
      );
      await Template.deleteMany({ categoryId: CATEGORY_ID });
      console.log("   ✅ Cleared\n");
    } else {
      console.log(`📋 No existing templates in category ${CATEGORY_ID}\n`);
    }

    // 3. Find the global max template id so new templates continue from there
    const last = await Template.findOne({})
      .sort({ id: -1 })
      .select("id")
      .lean();
    let nextId = (last?.id || 0) + 1;
    console.log(`📌 Starting template id from: ${nextId}\n`);

    // 4. Insert all templates under category 2
    const created = [];
    for (const t of comedyEntertainmentTemplates) {
      const doc = await Template.create({
        id: nextId,
        categoryId: CATEGORY_ID,
        title: t.title,
        description: t.description,
        coverImage: t.coverImage,
        dialog: t.dialog,
        isTrending: t.isTrending,
      });

      created.push(doc);
      console.log(`  ✅ id=${doc.id}  "${doc.title}"`);

      nextId++;
    }

    console.log(
      `\n🎉 Inserted ${created.length} template(s) under category ${CATEGORY_ID} (${category.name})`,
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();
