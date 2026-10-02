// backend/src/seeds/seedCategories.js
const path = require("path");
const fs = require("fs");

// ================================================================
// MANUAL .env LOADER (works regardless of dotenv/dotenvx)
// ================================================================
const envCandidates = [
  path.resolve(__dirname, "../../.env"),    // backend/.env
  path.resolve(__dirname, "../.env"),       // backend/src/.env
  path.resolve(process.cwd(), ".env"),      // cwd
];

let envLoaded = false;
for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    require("dotenv").config({ path: p });
    console.log(`✅ Loaded env from: ${p}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn("⚠️  No .env found. Using process.env directly.");
}

// ================================================================
// MONGO URI
// ================================================================
const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  process.env.DATABASE_URL;

if (!MONGO_URI) {
  console.error("❌ No MongoDB URI found in .env");
  console.error("Add one of: MONGODB_URI, MONGO_URI, MONGO_URL, DATABASE_URL");
  process.exit(1);
}

const mongoose = require("mongoose");
const Category = require("../models/Category");

// ================================================================
// YOUR 10 CATEGORIES
// ================================================================
const categories = [
  {
    name: "True Crime & Mystery",
    slug: "true-crime-mystery",
    description: "Real-life investigations, unsolved cases and mysterious stories.",
    image: "/public/categories/true-crime-mystery.jpg",
  },
  {
    name: "Comedy & Entertainment",
    slug: "comedy-entertainment",
    description: "Laugh-out-loud shows, comedy specials and entertaining conversations.",
    image: "/public/categories/comedy-entertainment.jpg",
  },
  {
    name: "News & Current Affairs",
    slug: "news-current-affairs",
    description: "Daily news, politics, and in-depth analysis of what's happening in the world.",
    image: "/public/categories/news-current-affairs.jpg",
  },
  {
    name: "Business & Entrepreneurship",
    slug: "business-entrepreneurship",
    description: "Startup stories, business strategies, and entrepreneurial insights.",
    image: "/public/categories/business-entrepreneurship.jpg",
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Sports news, athlete interviews, match breakdowns and analysis.",
    image: "/public/categories/sports.jpg",
  },
  {
    name: "Education & Self-Improvement",
    slug: "education-self-improvement",
    description: "Learning, growth, personal development and self-improvement.",
    image: "/public/categories/education-self-improvement.jpg",
  },
  {
    name: "Health & Wellness",
    slug: "health-wellness",
    description: "Mental health, fitness, nutrition, and holistic well-being.",
    image: "/public/categories/health-wellness.jpg",
  },
  {
    name: "Technology & AI",
    slug: "technology-ai",
    description: "AI tools, tech trends, innovation and how they shape the future.",
    image: "/public/categories/technology-ai.jpg",
  },
  {
    name: "Society & Culture",
    slug: "society-culture",
    description: "Culture, lifestyle, relationships and the stories that shape our world.",
    image: "/public/categories/society-culture.jpg",
  },
  {
    name: "Movies, TV & Pop Culture",
    slug: "movies-tv-pop-culture",
    description: "Film reviews, TV recaps, celebrity news and pop culture discussions.",
    image: "/public/categories/movies-tv-pop-culture.jpg",
  },
];

// ================================================================
// SEED
// ================================================================
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected\n");

    await Category.deleteMany({});
    console.log("🗑  Cleared existing categories\n");

    const created = [];
    for (const c of categories) {
      const doc = await Category.create(c);
      created.push(doc);
      console.log(`  ✅ id=${doc.id}  ${doc.name}  (${doc.slug})`);
    }

    console.log(`\n🎉 Inserted ${created.length} categories (ids 1–${created.length})`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();