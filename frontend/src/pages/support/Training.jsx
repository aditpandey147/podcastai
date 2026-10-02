// frontend/src/pages/support/Training.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import videoThumbnail from '../../assets/video-thumbnail.jpg';
import {
  Play,
  BookOpen,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Video,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  Rocket,
  Headphones,
  PlayCircle,
} from 'lucide-react';

const Training = () => {
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const faqContainerRef = useRef(null);

  // Demo Video Configuration
  const VIDEO_ID = 'YOUR_VIDEO_ID'; // Replace with your YouTube video ID
  const videoUrl = `https://www.youtube.com/embed/${VIDEO_ID}`;

  // ================================================================
  // FAQ DATA — PodcastAI specific
  // ================================================================
  const faqs = [
    // ============ Getting Started (5) ============
    {
      id: 1,
      category: 'Getting Started',
      question: 'What is PodcastAI and how does it work?',
      answer:
        'PodcastAI is an AI-powered platform that helps you create, design, and launch podcast videos instantly. Enter your topic, pick a category, choose a template, and our AI generates host & guest dialogues, AI cover art, and cinematic video — all in minutes. Perfect for YouTube Shorts, TikTok, Spotify, and all major platforms.',
      icon: '🎙️',
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'How do I create my first podcast video?',
      answer:
        'Go to your dashboard → click "Create New Podcast" → choose a template from the library → enter your topic and details → select tone and style → click "Generate". Our AI crafts the dialogue, generates cover art, and produces your video. Download when complete.',
      icon: '➕',
    },
    {
      id: 3,
      category: 'Getting Started',
      question: 'How long does it take to generate a podcast video?',
      answer:
        'Video generation takes 1–3 minutes depending on the format and length. The AI dialogue appears in seconds; cover art streams in as it finishes. You can continue using the platform while generation runs in the background.',
      icon: '⏱️',
    },
    {
      id: 4,
      category: 'Getting Started',
      question: 'What podcast categories are available?',
      answer:
        'We support multiple categories including True Crime, Comedy & Entertainment, Business, Technology, Health & Wellness, Education, News, Sports, and more. Each category has professionally designed templates optimized for that niche.',
      icon: '📊',
    },
    {
      id: 5,
      category: 'Getting Started',
      question: 'Can I edit my podcast after generation?',
      answer:
        'Yes! Go to "My Podcasts", select the video, and click "Edit". You can modify the title, dialogue, cover image, category, and regenerate with new information at any time.',
      icon: '🔄',
    },

    // ============ Podcast Creation (6) ============
    {
      id: 6,
      category: 'Podcast Creation',
      question: 'What information do I need to create a podcast?',
      answer:
        'To create a podcast, you need: Topic (or let AI suggest one), Category, Host & Guest Line (or use AI Dialogue generator), Tone (Professional, Casual, Inspiring), Music, Format (16:9 or 9:16), and Language. The more detailed your inputs, the better the AI output.',
      icon: '📝',
    },
    {
      id: 7,
      category: 'Podcast Creation',
      question: 'Can I generate cover art for my podcast?',
      answer:
        'Yes! Our AI generates professional podcast cover art automatically. Each video gets a unique AI-generated image based on your topic and mood. You can also regenerate covers from the Templates page or use the Branding Suite for a full identity kit.',
      icon: '🎨',
    },
    {
      id: 8,
      category: 'Podcast Creation',
      question: 'How do I download my podcast video?',
      answer:
        'Once your video is marked "Completed", go to "My Podcasts", find your video, and click the "Download" button. Your video downloads as MP4 with all assets bundled (video + cover art).',
      icon: '📥',
    },
    {
      id: 9,
      category: 'Podcast Creation',
      question: 'Can I create multiple podcasts at once?',
      answer:
        'Yes! You can create multiple podcast videos simultaneously. Each generation runs independently, and you can track progress for each one from your My Podcasts page.',
      icon: '📚',
    },
    {
      id: 10,
      category: 'Podcast Creation',
      question: 'What video formats and durations are supported?',
      answer:
        'We support 16:9 (landscape) and 9:16 (portrait/vertical) formats. Standard duration is 5 seconds per video segment. Premium plans unlock longer durations up to 60 seconds. Export formats include MP4 for all major platforms.',
      icon: '📄',
    },
    {
      id: 11,
      category: 'Podcast Creation',
      question: 'Can I add my own branding to podcasts?',
      answer:
        'Yes! The Branding Suite generates a complete brand identity — name, tagline, colors, fonts, logo concept, voice, and social bios. Agency plans let you share your brand with team members.',
      icon: '🏷️',
    },

    // ============ AI Dialogue (4) ============
    {
      id: 12,
      category: 'AI Dialogue',
      question: 'What is the AI Dialogue Generator?',
      answer:
        'The AI Dialogue Generator creates natural, punchy host-and-guest conversations for your podcast videos. Enter a topic, pick a tone and style, and AI writes the dialogue — optimized for short-form viral clips (5-10 words per line).',
      icon: '💬',
    },
    {
      id: 13,
      category: 'AI Dialogue',
      question: 'How do I create an AI dialogue?',
      answer:
        'Go to "AI Dialogue" in the sidebar → enter your topic → select a category → add optional context → choose tone (Professional / Casual / Educational) and style (Conversational / Interview / Storytelling) → click "Generate Dialogue". You\'ll get 2-part host/guest sections you can save.',
      icon: '✍️',
    },
    {
      id: 14,
      category: 'AI Dialogue',
      question: 'Can I save my dialogues for later?',
      answer:
        'Yes! Each Content card has its own "Save dialogue" button. Saved dialogues are stored in your browser\'s local storage and can be re-loaded anytime. Perfect for iterating on scripts.',
      icon: '💾',
    },
    {
      id: 15,
      category: 'AI Dialogue',
      question: 'What line lengths work best for 5-second videos?',
      answer:
        'Each line should be 6-10 words maximum — one punchy sentence. The AI automatically optimizes for this. Longer lines get truncated to keep your video tight and viral-friendly.',
      icon: '⏱️',
    },

    // ============ Trending & Templates (3) ============
    {
      id: 16,
      category: 'Trending & Templates',
      question: 'What is the Trending Podcasts page?',
      answer:
        'The Trending Podcasts page lets you search any topic — AI returns the top 12 trending podcasts across YouTube, Spotify, Apple Podcasts, Amazon Music, and Google Podcasts, complete with AI-generated cover art. Perfect for inspiration or market research.',
      icon: '🔥',
    },
    {
      id: 17,
      category: 'Trending & Templates',
      question: 'How many templates are available?',
      answer:
        'We offer 50+ templates across all categories including True Crime, Comedy, Business, Health, Education, and more. New templates are added regularly. The Templates page has category filters and search to find the perfect match.',
      icon: '📋',
    },
    {
      id: 18,
      category: 'Trending & Templates',
      question: 'Can I use templates commercially?',
      answer:
        'Yes! All templates and AI-generated assets are royalty-free and can be used for commercial purposes — YouTube monetization, client work, sponsorships, and more.',
      icon: '💼',
    },

    // ============ Premium Features (4) ============
    {
      id: 19,
      category: 'Premium Features',
      question: 'What is Podcast Creator Pro?',
      answer:
        'Podcast Creator Pro unlocks 30 cinematic templates, 4× faster renders, AI enhance, and instant export to all platforms. Available with Unlimited Silver, Gold, or as a standalone plan.',
      icon: '👑',
    },
    {
      id: 20,
      category: 'Premium Features',
      question: 'What is Viral Shorts AI?',
      answer:
        'Viral Shorts AI analyzes your generated podcast video and platform, then generates a complete publishing kit — title, description, hashtags, tags, thumbnail text, best posting time, hook, and CTA — all optimized per platform.',
      icon: '✨',
    },
    {
      id: 21,
      category: 'Premium Features',
      question: 'What is Podcast Growth Studio?',
      answer:
        'Podcast Growth Studio builds a personalized 4-week roadmap, content plan, and monetization strategy based on your video. Includes growth score, positioning analysis, distribution channels, and monetization paths.',
      icon: '📈',
    },
    {
      id: 22,
      category: 'Premium Features',
      question: 'What is the AI Podcast Branding Suite?',
      answer:
        'The Branding Suite generates a complete brand identity: name, tagline, mission, 5-color palette, typography system, logo concept, voice & tone guide, 4 platform bios, thumbnail formula, and a launch checklist — all in 30 seconds.',
      icon: '🎨',
    },

    // ============ Plans & Pricing (4) ============
    {
      id: 23,
      category: 'Plans & Pricing',
      question: 'What plans are available?',
      answer:
        'We offer: FE ($12), FE + TURBO ($27), Unlimited Silver ($47), Unlimited Gold ($69), Podcast Creator Pro ($37), Viral Shorts AI ($49), Podcast Growth Studio ($67), AI Podcast Branding Suite ($47), DFY Podcast Pack Silver ($97), DFY Podcast Pack Gold ($129), AI Ranker ($69), Agency ($197), and RESELLER ($249).',
      icon: '💎',
    },
    {
      id: 24,
      category: 'Plans & Pricing',
      question: 'Can I upgrade my plan later?',
      answer:
        'Yes! Upgrade to a higher plan anytime — the upgrade is instant and you get immediate access to all new features. Your existing podcasts, dialogues, and saved work are all preserved.',
      icon: '⬆️',
    },
    {
      id: 25,
      category: 'Plans & Pricing',
      question: 'Do you offer refunds?',
      answer:
        'Yes — we offer a 30-day money-back guarantee. If you\'re not satisfied for any reason, contact support within 30 days of purchase for a full refund, no questions asked.',
      icon: '✅',
    },
    {
      id: 26,
      category: 'Plans & Pricing',
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers through our payment partners JVZoo and LaunchPad.',
      icon: '💳',
    },

    // ============ General (3) ============
    {
      id: 27,
      category: 'General',
      question: 'How do I contact support?',
      answer:
        'Contact us via the Support page in your dashboard or use our live chat. Our team responds within 24-48 hours (excluding Sundays). For urgent issues, live chat is the fastest way to get help.',
      icon: '📧',
    },
    {
      id: 28,
      category: 'General',
      question: 'Can I create unlimited podcast videos?',
      answer:
        'With Unlimited Silver and Unlimited Gold plans, yes — unlimited podcast videos, AI shorts, and all premium features. Lower plans have reasonable monthly limits.',
      icon: '♾️',
    },
    {
      id: 29,
      category: 'General',
      question: 'How do I change my password?',
      answer:
        'Go to Settings → Security → Change Password. Enter your current password and your new password, then click Save. Your default password is the same as your purchase email — we recommend changing it after first login.',
      icon: '🔐',
    },
  ];

  const categories = ['all', ...new Set(faqs.map(faq => faq.category))];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const categoryCounts = faqs.reduce((acc, faq) => {
    acc[faq.category] = (acc[faq.category] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (id) => setExpandedFaq(expandedFaq === id ? null : id);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToCategory = (category) => {
    const element = document.getElementById(`faq-${category.replace(/\s+/g, '-')}`);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const handlePlayVideo = () => setIsVideoPlaying(true);

  return (
    <div className="flex h-screen" style={{ background: '#020914' }}>
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 overflow-y-auto custom-scroll" ref={faqContainerRef}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

            {/* ===== HEADER ===== */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-[#eaf1ff] flex items-center gap-3">
                <BookOpen size={28} className="text-[#c9b5ff]" />
                Training Center
              </h1>
              <p className="text-sm text-[#8fa0ba] mt-1">
                Watch our demo video and find answers to common questions
              </p>
            </div>

            {/* ===== TWO COLUMN LAYOUT ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ===== LEFT COLUMN - Main Content ===== */}
              <div className="lg:col-span-2 space-y-6">

                {/* ===== Video Section ===== */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: '#06162b',
                    border: '1px solid #17385f',
                    boxShadow: '0 4px 20px rgba(0,0,0,.35)',
                  }}
                >
                  <div
                    className="px-6 py-4"
                    style={{
                      background: 'linear-gradient(100deg, #6e35ed, #3483ff)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Video size={20} className="text-white" />
                      <h2 className="text-lg font-bold text-white">Demo Video</h2>
                    </div>
                    <p className="text-white/80 text-sm">
                      Watch this quick demo to get started
                    </p>
                  </div>

                  <div className="p-4 md:p-6">
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg group"
                      style={{ background: '#041124', border: '1px solid #17385f' }}
                    >
                      {!isVideoPlaying ? (
                        <>
                          {!thumbnailError && (
                            <img
                              src={videoThumbnail}
                              alt="Demo Video Thumbnail"
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={() => setThumbnailError(true)}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                          <button
                            onClick={handlePlayVideo}
                            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                          >
                            <div className="relative">
                              <div
                                className="absolute inset-0 rounded-full animate-ping"
                                style={{ background: 'rgba(110,53,237,.35)' }}
                              ></div>
                              <div
                                className="relative w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-2xl"
                                style={{
                                  background: 'rgba(255,255,255,.15)',
                                  backdropFilter: 'blur(6px)',
                                  border: '2px solid rgba(255,255,255,.3)',
                                }}
                              >
                                <div
                                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg transition"
                                  style={{
                                    background:
                                      'linear-gradient(135deg, #6e35ed, #3483ff)',
                                  }}
                                >
                                  <Play size={28} className="text-white ml-1" />
                                </div>
                              </div>
                            </div>
                          </button>

                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                            <p className="text-white font-semibold text-sm flex items-center gap-2">
                              <PlayCircle size={16} className="text-[#c9b5ff]" />
                              Watch Demo Video
                            </p>
                            <p className="text-gray-300 text-xs">
                              Click play to watch the demo • ~5 minutes
                            </p>
                          </div>

                          <div
                            className="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-2"
                            style={{
                              background: 'rgba(2,7,19,.6)',
                              backdropFilter: 'blur(6px)',
                              border: '1px solid rgba(255,255,255,.15)',
                            }}
                          >
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            HD
                          </div>
                        </>
                      ) : (
                        <iframe
                          src={`${videoUrl}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
                          title="Demo Video"
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          frameBorder="0"
                        ></iframe>
                      )}
                    </div>
                  </div>
                </div>

                {/* ===== FAQ Section ===== */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: '#06162b',
                    border: '1px solid #17385f',
                    boxShadow: '0 4px 20px rgba(0,0,0,.35)',
                  }}
                >
                  <div
                    className="px-6 py-4"
                    style={{
                      background: 'linear-gradient(100deg, #6e35ed, #3483ff)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle size={20} className="text-white" />
                      <h2 className="text-lg font-bold text-white">
                        Frequently Asked Questions
                      </h2>
                    </div>
                    <p className="text-white/80 text-sm">
                      Find answers to common questions
                    </p>
                  </div>

                  <div className="p-4 md:p-6">
                    {/* Search */}
                    <div className="relative mb-4">
                      <Search
                        size={18}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#7d8fa8]"
                      />
                      <input
                        type="text"
                        placeholder="Search FAQs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 rounded-xl text-sm focus:outline-none transition"
                        style={{
                          background: '#041124',
                          border: '1px solid #17385f',
                          color: '#eaf1ff',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            'rgba(150,120,255,.6)';
                          e.currentTarget.style.boxShadow =
                            '0 0 0 3px rgba(110,53,237,.15)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#17385f';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7d8fa8] hover:text-white transition"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-[#8fa0ba] mb-4">
                      Showing {filteredFaqs.length} of {faqs.length} FAQs
                    </p>

                    {Object.keys(groupedFaqs).length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold text-[#eaf1ff]">
                          No FAQs Found
                        </h3>
                        <p className="text-[#8fa0ba] text-sm">
                          Try adjusting your search or filter
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('all');
                          }}
                          className="mt-4 text-sm font-medium transition"
                          style={{ color: '#c9b5ff' }}
                        >
                          Clear filters
                        </button>
                      </div>
                    ) : (
                      Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                        <div key={category} className="mb-6 last:mb-0">
                          <h3
                            id={`faq-${category.replace(/\s+/g, '-')}`}
                            className="text-sm font-semibold text-[#eaf1ff] px-4 py-2 rounded-lg mb-3 flex items-center gap-2"
                            style={{
                              background: 'rgba(6,20,42,.7)',
                              border: '1px solid #17385f',
                            }}
                          >
                            <FolderOpen size={16} className="text-[#c9b5ff]" />
                            {category} ({categoryFaqs.length})
                          </h3>

                          <div className="space-y-2">
                            {categoryFaqs.map((faq) => {
                              const isOpen = expandedFaq === faq.id;
                              return (
                                <div
                                  key={faq.id}
                                  className="rounded-xl overflow-hidden transition-all duration-200"
                                  style={{
                                    background: isOpen
                                      ? 'linear-gradient(135deg, rgba(110,53,237,.12), rgba(52,131,255,.08))'
                                      : 'rgba(6,20,42,.5)',
                                    border: isOpen
                                      ? '1px solid rgba(150,120,255,.5)'
                                      : '1px solid #17385f',
                                    boxShadow: isOpen
                                      ? '0 8px 24px rgba(0,0,0,.35)'
                                      : 'none',
                                  }}
                                >
                                  <button
                                    onClick={() => toggleFaq(faq.id)}
                                    className="w-full px-4 py-3 text-left flex items-start gap-3 transition"
                                  >
                                    <span className="text-xl mt-0.5">
                                      {faq.icon}
                                    </span>
                                    <span className="text-sm font-medium text-[#eaf1ff] pr-4 flex-1">
                                      {faq.question}
                                    </span>
                                    <span
                                      className="transition-transform duration-300 flex-shrink-0 mt-1"
                                      style={{
                                        transform: isOpen
                                          ? 'rotate(180deg)'
                                          : 'rotate(0)',
                                        color: isOpen ? '#c9b5ff' : '#7d8fa8',
                                      }}
                                    >
                                      <ChevronDown size={18} />
                                    </span>
                                  </button>

                                  {isOpen && (
                                    <div
                                      className="px-4 pb-3 pt-0"
                                      style={{ borderTop: '1px solid #17385f' }}
                                    >
                                      <p className="text-sm text-[#aebfd5] leading-relaxed pt-3">
                                        {faq.answer}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ===== RIGHT COLUMN - Sidebar ===== */}
              <div className="lg:col-span-1 space-y-4 sticky top-4">
                {/* Categories */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: '#06162b',
                    border: '1px solid #17385f',
                    boxShadow: '0 4px 20px rgba(0,0,0,.35)',
                  }}
                >
                  <div
                    className="px-4 py-3"
                    style={{
                      background: 'linear-gradient(100deg, #6e35ed, #3483ff)',
                    }}
                  >
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FolderOpen size={16} />
                      Categories
                    </h3>
                  </div>

                  <div className="p-4">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1"
                      style={
                        selectedCategory === 'all'
                          ? {
                              background: 'rgba(110,53,237,.2)',
                              color: '#eaf1ff',
                              border: '1px solid rgba(150,120,255,.4)',
                            }
                          : { color: '#aebfd5' }
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span>📋 All Questions</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(6,20,42,.7)',
                            border: '1px solid #17385f',
                            color: '#8fa0ba',
                          }}
                        >
                          {faqs.length}
                        </span>
                      </div>
                    </button>

                    {categories.filter((c) => c !== 'all').map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          scrollToCategory(category);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1"
                        style={
                          selectedCategory === category
                            ? {
                                background: 'rgba(110,53,237,.2)',
                                color: '#eaf1ff',
                                border: '1px solid rgba(150,120,255,.4)',
                              }
                            : { color: '#aebfd5' }
                        }
                      >
                        <div className="flex items-center justify-between">
                          <span>{category}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: 'rgba(6,20,42,.7)',
                              border: '1px solid #17385f',
                              color: '#8fa0ba',
                            }}
                          >
                            {categoryCounts[category] || 0}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Need Help */}
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(110,53,237,.15), rgba(52,131,255,.1))',
                    border: '1px solid rgba(150,120,255,.4)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones size={18} className="text-[#c9b5ff]" />
                    <h3 className="text-sm font-bold text-[#eaf1ff]">
                      Need Help?
                    </h3>
                  </div>
                  <p className="text-xs text-[#8fa0ba] mb-3">
                    Still have questions? Our support team is here to help.
                  </p>
                  <div className="space-y-2">
                    <a
                      href="/support"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:-translate-y-0.5"
                      style={{
                        background: 'linear-gradient(100deg, #6e35ed, #3483ff)',
                        boxShadow: '0 6px 18px rgba(110,53,237,.35)',
                      }}
                    >
                      <MessageCircle size={16} />
                      Contact Support
                      <ArrowRight size={14} />
                    </a>
                    <a
                      href="/dashboard"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition"
                      style={{
                        background: 'rgba(6,20,42,.7)',
                        border: '1px solid #17385f',
                        color: '#aebfd5',
                      }}
                    >
                      <Rocket size={16} />
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full transition z-50"
          style={{
            background: 'linear-gradient(100deg, #6e35ed, #3483ff)',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(110,53,237,.45)',
          }}
        >
          <ChevronUp size={20} />
        </button>
      )}

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(110,53,237,.4);
          border-radius: 20px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(110,53,237,.7);
        }
        .custom-scroll { scroll-behavior: smooth; }
        @keyframes ping {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Training;