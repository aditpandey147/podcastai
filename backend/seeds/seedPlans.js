// scripts/seedComplyzoPlans.js
const mongoose = require('mongoose');
const Plan = require('../models/auth/Plan');
require('dotenv').config();

const podcastAIPlans = [
  {
    planId: 1,
    name: 'FE',
    slug: 'fe',
    order: 1,
    price: 12,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3201',
    description: 'Podcast AI Front-End — Starter access',
    features: [],
  },
  {
    planId: 2,
    name: 'FE + TURBO',
    slug: 'fe-turbo',
    order: 2,
    price: 27,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3202',
    description: 'Podcast AI + Turbo boost',
    features: ['growthStudio', 'brandingSuite'],
  },
  {
    planId: 3,
    name: 'Unlimited Silver',
    slug: 'unlimited-silver',
    order: 3,
    price: 47,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3203',
    description: 'Unlimited podcasts + Pro tools',
    features: [
      'unlimited',
      'podcastCreatorPro',
      'viralShortsAI',
      'growthStudio',
      'brandingSuite',
    ],
  },
  {
    planId: 4,
    name: 'Unlimited Gold',
    slug: 'unlimited-gold',
    order: 4,
    price: 69,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3204',
    description: 'Everything in Silver + more',
    features: [
      'unlimited',
      'podcastCreatorPro',
      'viralShortsAI',
      'growthStudio',
      'brandingSuite',
    ],
  },
  {
    planId: 5,
    name: 'Podcast Creator Pro',
    slug: 'podcast-creator-pro',
    order: 5,
    price: 37,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3205',
    description: 'Premium cinematic templates',
    features: ['podcastCreatorPro'],
  },
  {
    planId: 6,
    name: 'Viral Shorts AI',
    slug: 'viral-shorts-ai',
    order: 6,
    price: 49,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3206',
    description: 'AI-powered viral shorts generator',
    features: ['viralShortsAI'],
  },
  {
    planId: 7,
    name: 'Podcast Growth Studio',
    slug: 'podcast-growth-studio',
    order: 7,
    price: 67,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3207',
    description: 'AI growth roadmap + monetization',
    features: ['growthStudio'],
  },
  {
    planId: 8,
    name: 'AI Podcast Branding Suite',
    slug: 'ai-podcast-branding-suite',
    order: 8,
    price: 47,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3208',
    description: 'Complete AI brand identity kit',
    features: ['brandingSuite'],
  },
  {
    planId: 9,
    name: 'DFY Podcast Pack Silver',
    slug: 'dfy-podcast-pack-silver',
    order: 9,
    price: 97,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3209',
    description: 'Done-for-you podcast pack (Silver)',
    features: ['dfyPodcastPack'],
  },
  {
    planId: 10,
    name: 'DFY Podcast Pack Gold',
    slug: 'dfy-podcast-pack-gold',
    order: 10,
    price: 129,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3210',
    description: 'Done-for-you podcast pack (Gold)',
    features: ['dfyPodcastPack'],
  },
  {
    planId: 11,
    name: 'AI Ranker',
    slug: 'ai-ranker',
    order: 11,
    price: 69,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3211',
    description: 'Rank higher on every platform',
    features: ['aiRanker'],
  },
  {
    planId: 12,
    name: 'Agency',
    slug: 'agency',
    order: 12,
    price: 197,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3212',
    description: 'Add members + share subscription',
    features: ['agency'],
  },
  {
    planId: 13,
    name: 'RESELLER',
    slug: 'reseller',
    order: 13,
    price: 249,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3213',
    description: 'Reseller rights + white-label',
    features: ['reseller'],
  },
];

async function seedPodcastAIPlans() {
  console.log('🌱 Seeding Podcast AI Plans...\n');
  console.log('='.repeat(60));

  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/podcastai';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const existingPlans = await Plan.find({});
    if (existingPlans.length > 0) {
      console.log(`📋 ${existingPlans.length} existing plans found.`);
      console.log('   Use --force to overwrite or delete manually');
      console.log('   Run: node scripts/seedComplyzoPlans.js --force');

      console.log('\n📊 Existing Plans:');
      console.log('='.repeat(60));
      existingPlans.forEach((plan) => {
        console.log(`   ${plan.planId}. ${plan.name}`);
        console.log(`      LaunchPad ID: ${plan.launchpad_id || 'N/A'}`);
        console.log(`      Status: ${plan.status}`);
      });

      process.exit(0);
    }

    console.log('📥 Inserting Podcast AI plans...');
    const result = await Plan.insertMany(podcastAIPlans);

    console.log('\n✅ Seeded successfully!');
    console.log('='.repeat(60));
    console.log('📊 Podcast AI Plans:');
    console.log('='.repeat(60));

    result.forEach((plan) => {
      console.log(`   ${plan.planId}. ${plan.name} — $${plan.price || '?'}`);
      console.log(`      LaunchPad ID: ${plan.launchpad_id}`);
      console.log(`      Slug: ${plan.slug}`);
      console.log(`      Validity: ${plan.validity_days} days`);
      console.log(`      Features: ${(plan.features || []).join(', ') || '—'}`);
      console.log(`      Status: ${plan.status}`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log(`✅ Total: ${result.length} plans seeded`);
    console.log('📌 Platform: LaunchPad');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate key error. Make sure planId is unique.');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

if (process.argv.includes('--force')) {
  console.log('⚠️ Force mode enabled - Deleting existing plans...\n');

  const MONGODB_URI =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/podcastai';
  mongoose.connect(MONGODB_URI).then(async () => {
    await Plan.deleteMany({});
    console.log('✅ Existing plans deleted\n');
    await mongoose.disconnect();

    seedPodcastAIPlans();
  });
} else {
  seedPodcastAIPlans();
}