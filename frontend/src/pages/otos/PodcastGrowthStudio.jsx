// frontend/src/pages/PodcastGrowthStudio.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Sparkles,
  Loader2,
  Play,
  Check,
  Target,
  Rocket,
  Users,
  DollarSign,
  Calendar,
  Lightbulb,
  Radio,
  ChevronRight,
  Trophy,
  Crown,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import bannerBg from "../../assets/images/podcast-studio-bg.png";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_URL}${cleanPath}`;
};

// ================================================================
// GOAL OPTIONS
// ================================================================
const GOALS = [
  { key: "grow audience", label: "Grow Audience", icon: Users },
  { key: "monetize", label: "Start Monetizing", icon: DollarSign },
  { key: "get sponsors", label: "Land Sponsors", icon: Trophy },
  { key: "build authority", label: "Build Authority", icon: Crown },
];

// ================================================================
// PAGE
// ================================================================
export default function PodcastGrowthStudio() {
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [goal, setGoal] = useState("grow audience");

  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);

  // Fetch completed videos
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingVideos(true);
        const res = await api.get("/video/my-videos");
        if (!cancelled) {
          const list = res.data?.data || [];
          const completed = list.filter((v) => v.status === "completed");
          setVideos(completed);
          if (completed.length > 0) setSelectedVideo(completed[0]);
        }
      } catch (err) {
        console.error("Failed to load videos:", err);
        if (!cancelled) setVideos([]);
      } finally {
        if (!cancelled) setLoadingVideos(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Generate ----
  const handleGenerate = useCallback(async () => {
    if (!selectedVideo) {
      toast.error("Select a podcast video first");
      return;
    }

    setGenerating(true);
    setPlan(null);

    try {
      const res = await api.post("/ai/growth-plan", {
        video: {
          title: selectedVideo.title,
          category: selectedVideo.category,
          hostLine: selectedVideo.hostLine,
          guestLine: selectedVideo.guestLine,
        },
        goal,
        experience: "beginner",
      });

      setPlan(res.data?.plan || null);
      toast.success("Growth roadmap ready!");
    } catch (err) {
      console.error("Growth plan failed:", err);
      toast.error("Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  }, [selectedVideo, goal]);

  return (
    <div
      className="flex min-h-screen"
      style={{
        background:
          "radial-gradient(circle at 60% 10%, rgba(10,35,64,.15), transparent 32%), #020914",
        color: "#eef5ff",
        overflowX: "hidden",
      }}
    >
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen bg-[#020814]">
        <Navbar />

        <main className="flex-1 p-3 md:p-6 overflow-y-auto">
          {/* HERO BANNER */}
          <section
            className="relative border border-[#153c6d] rounded-[10px] overflow-hidden mb-5"
            style={{
              background:
                "linear-gradient(105deg, #020b1b 0%, #03112b 52%, #040b20 100%)",
            }}
          >
            {/* Right-side background image */}
            <div
              className="absolute inset-y-0 right-0 w-[62%] md:w-[55%]"
              style={{
                backgroundImage: `url(${bannerBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center right",
                backgroundRepeat: "no-repeat",
                opacity: 0.9,
              }}
            />

            {/* Left-to-right fade overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, #020b1a 0%, #020b1a 30%, rgba(3,17,43,.95) 45%, rgba(3,17,43,.6) 65%, rgba(3,17,43,.2) 82%, transparent 100%)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 py-10 md:py-12 pl-7 pr-7 max-w-[720px]">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 border border-[#a84eff] bg-[#211b65] text-[10px] text-[#e0c9ff] mb-3">
                <TrendingUp size={11} />
                PODCAST GROWTH STUDIO
              </div>

              {/* Title */}
              <h1 className="text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.4px] font-semibold mt-3 text-[#eef4ff]">
                Turn Views Into
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #b65bff, #7855ff, #338dff)",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  Real Growth.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-[14px] leading-[1.6] text-[#aebfd5] mt-4 max-w-[640px]">
                AI builds you a personalized 4-week roadmap, content plan, and
                monetization strategy — based on the video you just made.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 mt-7">
                {/* Primary CTA — scrolls to Generate button */}
                <button
                  type="button"
                  onClick={() => {
                    const el = document.querySelector("[data-generate]");
                    if (el)
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                  }}
                  className="h-[46px] px-6 rounded-[10px] text-white text-[13.5px] font-semibold transition-all duration-200 hover:brightness-110 flex items-center gap-2"
                  style={{
                    background: "linear-gradient(100deg, #6c36ed, #3477ff)",
                    boxShadow: "0 8px 24px rgba(108,54,237,.35)",
                  }}
                >
                  <Sparkles size={15} />
                  Generate Growth Plan
                </button>

                {/* Secondary CTA — scrolls to video picker */}
                <button
                  type="button"
                  onClick={() => {
                    const el = document.querySelector("[data-video-picker]");
                    if (el)
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                  }}
                  className="h-[46px] px-6 rounded-[10px] text-[13.5px] transition-colors duration-200 hover:bg-[#0a2952] flex items-center gap-2"
                  style={{
                    border: "1px solid #1d568e",
                    background: "#061b37",
                    color: "#dbe7f7",
                  }}
                >
                  <TrendingUp size={14} />
                  Pick a Video
                </button>
              </div>
            </div>
          </section>

          {/* STEP 1 — SELECT VIDEO */}
          <section className="mb-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="grid place-items-center w-8 h-8 rounded-full shrink-0 text-[13px] font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #4e43f7, #237cff)",
                  boxShadow: "0 0 16px rgba(49,95,255,.4)",
                }}
              >
                1
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#eaf1ff]">
                  Select Your Podcast Video
                </h2>
                <p className="text-[11.5px] text-[#8fa0ba] mt-0.5">
                  We'll build a growth plan tailored to this video.
                </p>
              </div>
            </div>

            {loadingVideos ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[13px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-[12px] animate-pulse"
                    style={{
                      height: 200,
                      background: "linear-gradient(180deg,#061d3a,#04162b)",
                      border: "1px solid #12436f",
                    }}
                  />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div
                className="rounded-[12px] py-12 text-center"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(4,26,53,.45), rgba(3,17,38,.55))",
                  border: "1px dashed rgba(80,150,255,.35)",
                }}
              >
                <TrendingUp size={28} className="text-[#a98bff] mx-auto mb-2" />
                <p className="text-[13px] text-[#dbe6f7]">No videos yet</p>
                <p className="text-[11.5px] text-[#7d90ac] mt-1">
                  Generate a podcast video first.
                </p>
                <button
                  onClick={() => navigate("/create-podcast")}
                  className="mt-3 h-[36px] px-5 rounded-[10px] text-[12px] font-semibold text-white transition-all hover:brightness-110"
                  style={{
                    background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                  }}
                >
                  Create Video
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[13px]">
                {videos.map((v) => {
                  const isSelected = selectedVideo?.id === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        setSelectedVideo(v);
                        setPlan(null);
                      }}
                      className="rounded-[12px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-[2px]"
                      style={{
                        background: "linear-gradient(180deg,#06162b,#041124)",
                        border: isSelected
                          ? "1.5px solid #6e35ed"
                          : "1px solid #17385f",
                        boxShadow: isSelected
                          ? "0 0 0 3px rgba(110,53,237,.25), 0 8px 24px rgba(0,0,0,.4)"
                          : "0 4px 18px rgba(0,0,0,.3)",
                      }}
                    >
                      <div
                        className="relative bg-[#0a1a30]"
                        style={{ height: 110 }}
                      >
                        {v.coverImage ? (
                          <img
                            src={getImageUrl(v.coverImage)}
                            alt={v.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-[24px] opacity-60">
                            🎙️
                          </div>
                        )}
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, transparent 40%, rgba(2,7,19,.85) 100%)",
                          }}
                        />
                        {isSelected && (
                          <span
                            className="absolute top-2 right-2 grid place-items-center w-6 h-6 rounded-full text-white"
                            style={{
                              background:
                                "linear-gradient(135deg, #6e35ed, #3483ff)",
                              boxShadow: "0 4px 12px rgba(110,53,237,.5)",
                            }}
                          >
                            <Check size={13} />
                          </span>
                        )}
                        <span
                          className="absolute bottom-1.5 left-2 flex items-center gap-1 text-[9px] text-white"
                          style={{ textShadow: "0 1px 3px rgba(0,0,0,.9)" }}
                        >
                          <Play size={9} fill="currentColor" />
                          Ready
                        </span>
                      </div>
                      <div className="p-2.5">
                        <div className="text-[11.5px] font-semibold text-[#eaf1ff] truncate">
                          {v.title || "Untitled"}
                        </div>
                        <div className="text-[9.5px] text-[#7d90ac] mt-1 truncate">
                          {v.category || "Podcast"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* STEP 2 — SELECT GOAL */}
          <section className="mb-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="grid place-items-center w-8 h-8 rounded-full shrink-0 text-[13px] font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #4e43f7, #237cff)",
                  boxShadow: "0 0 16px rgba(49,95,255,.4)",
                }}
              >
                2
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#eaf1ff]">
                  What's Your Main Goal?
                </h2>
                <p className="text-[11.5px] text-[#8fa0ba] mt-0.5">
                  The AI will tailor the plan around this.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-[13px]">
              {GOALS.map((g) => {
                const Icon = g.icon;
                const isSelected = goal === g.key;
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => {
                      setGoal(g.key);
                      setPlan(null);
                    }}
                    className="rounded-[12px] p-4 transition-all duration-300 hover:-translate-y-[2px] flex flex-col items-start gap-3 text-left"
                    style={{
                      background: isSelected
                        ? "linear-gradient(180deg, rgba(110,53,237,.2), rgba(52,131,255,.12))"
                        : "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.7))",
                      border: isSelected
                        ? "1.5px solid #6e35ed"
                        : "1px solid rgba(80,150,255,.25)",
                      boxShadow: isSelected
                        ? "0 0 0 3px rgba(110,53,237,.25), 0 8px 24px rgba(0,0,0,.4)"
                        : "0 1px 0 rgba(255,255,255,.05) inset",
                    }}
                  >
                    <div className="flex items-center gap-2.5 w-full">
                      <div
                        className="w-10 h-10 rounded-[10px] grid place-items-center shrink-0"
                        style={{
                          background: isSelected
                            ? "linear-gradient(135deg, #6e35ed, #3483ff)"
                            : "rgba(6,20,42,.7)",
                          border: isSelected
                            ? "1px solid rgba(255,255,255,.2)"
                            : "1px solid rgba(80,150,255,.3)",
                        }}
                      >
                        <Icon
                          size={18}
                          style={{
                            color: isSelected ? "#fff" : "#c9b5ff",
                          }}
                        />
                      </div>
                      {isSelected && (
                        <Check size={16} className="text-[#c9b5ff] ml-auto" />
                      )}
                    </div>
                    <div className="text-[13px] font-semibold text-[#eaf1ff]">
                      {g.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* GENERATE */}
          <section className="mb-5">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !selectedVideo}
              className="w-full md:w-auto md:min-w-[360px] h-[52px] px-8 rounded-[12px] text-[14px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              style={{
                background:
                  "linear-gradient(100deg, #6432f3, #235eff 55%, #08a5ee)",
                boxShadow:
                  "0 10px 28px rgba(49,95,255,.4), 0 1px 0 rgba(255,255,255,.15) inset",
              }}
            >
              {generating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Building your growth plan…
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate Growth Plan
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </section>

          {/* ============================================================
              RESULTS — Growth Plan
              ============================================================ */}
          {plan && (
            <div className="space-y-5">
              {/* ---- OVERVIEW + SCORE ---- */}
              <section className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
                <div
                  className="rounded-[14px] p-5"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
                    border: "1px solid rgba(80,150,255,.25)",
                    boxShadow: "0 1px 0 rgba(255,255,255,.05) inset",
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className="w-8 h-8 rounded-[9px] grid place-items-center shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(110,53,237,.35), rgba(52,131,255,.35))",
                        border: "1px solid rgba(150,120,255,.5)",
                      }}
                    >
                      <Sparkles size={14} className="text-[#c9b5ff]" />
                    </div>
                    <h2 className="text-[15px] font-semibold text-[#eaf1ff]">
                      Strategic Overview
                    </h2>
                  </div>

                  <p className="text-[13.5px] leading-[1.65] text-[#c9d5e8]">
                    {plan.overview.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div
                      className="rounded-[10px] p-3"
                      style={{
                        background: "rgba(12,228,189,.08)",
                        border: "1px solid rgba(12,228,189,.3)",
                      }}
                    >
                      <div className="text-[10px] font-semibold tracking-[0.4px] text-[#0ce4bd]">
                        ✓ CURRENT STRENGTH
                      </div>
                      <p className="text-[12.5px] leading-[1.5] text-[#c9d5e8] mt-1.5">
                        {plan.overview.currentStrength}
                      </p>
                    </div>

                    <div
                      className="rounded-[10px] p-3"
                      style={{
                        background: "rgba(255,207,112,.08)",
                        border: "1px solid rgba(255,207,112,.3)",
                      }}
                    >
                      <div className="text-[10px] font-semibold tracking-[0.4px] text-[#ffcf70]">
                        ⚡ BIGGEST OPPORTUNITY
                      </div>
                      <p className="text-[12.5px] leading-[1.5] text-[#c9d5e8] mt-1.5">
                        {plan.overview.biggestOpportunity}
                      </p>
                    </div>
                  </div>
                </div>

                {/* GROWTH SCORE */}
                <div
                  className="rounded-[14px] p-5 flex flex-col items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(110,53,237,.15), transparent 70%), linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
                    border: "1px solid rgba(150,120,255,.35)",
                    boxShadow: "0 1px 0 rgba(255,255,255,.05) inset",
                  }}
                >
                  <div className="text-[11px] font-semibold tracking-[1px] text-[#8fa0ba] mb-3">
                    GROWTH POTENTIAL
                  </div>
                  <div className="relative w-[140px] h-[140px]">
                    <svg
                      className="absolute inset-0 -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="rgba(80,150,255,.15)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="url(#grad)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(plan.overview.growthScore / 100) * 264} 264`}
                        style={{
                          transition: "stroke-dasharray 0.8s ease",
                        }}
                      />
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#b65bff" />
                          <stop offset="100%" stopColor="#338dff" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="text-center">
                        <div
                          className="text-[36px] font-bold bg-clip-text text-transparent leading-none"
                          style={{
                            backgroundImage:
                              "linear-gradient(90deg, #b65bff, #338dff)",
                            WebkitBackgroundClip: "text",
                          }}
                        >
                          {plan.overview.growthScore}
                        </div>
                        <div className="text-[10px] text-[#8fa0ba] mt-1">
                          / 100
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11.5px] text-center mt-3 text-[#c9d5e8]">
                    {plan.overview.growthScore >= 80
                      ? "Excellent potential"
                      : plan.overview.growthScore >= 65
                        ? "Strong potential"
                        : "Room to grow"}
                  </div>
                </div>
              </section>

              {/* ---- POSITIONING ---- */}
              <section
                className="rounded-[14px] p-5"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
                  border: "1px solid rgba(80,150,255,.25)",
                  boxShadow: "0 1px 0 rgba(255,255,255,.05) inset",
                }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-[9px] grid place-items-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(110,53,237,.35), rgba(52,131,255,.35))",
                      border: "1px solid rgba(150,120,255,.5)",
                    }}
                  >
                    <Target size={14} className="text-[#c9b5ff]" />
                  </div>
                  <h2 className="text-[15px] font-semibold text-[#eaf1ff]">
                    Positioning Strategy
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <PositioningCard
                    icon={Radio}
                    label="Niche"
                    value={plan.positioning.niche}
                    color="#6ddcff"
                  />
                  <PositioningCard
                    icon={Users}
                    label="Target Audience"
                    value={plan.positioning.targetAudience}
                    color="#b59aff"
                  />
                  <PositioningCard
                    icon={Sparkles}
                    label="Unique Angle"
                    value={plan.positioning.uniqueAngle}
                    color="#ffcf70"
                  />
                </div>

                {plan.positioning.toneWords?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {plan.positioning.toneWords.map((w, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-[11px] text-[#c9b5ff]"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(110,53,237,.2), rgba(52,131,255,.15))",
                          border: "1px solid rgba(150,120,255,.4)",
                        }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* ---- 4-WEEK ROADMAP ---- */}
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-[9px] grid place-items-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(110,53,237,.35), rgba(52,131,255,.35))",
                      border: "1px solid rgba(150,120,255,.5)",
                    }}
                  >
                    <Calendar size={14} className="text-[#c9b5ff]" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#eaf1ff]">
                      4-Week Growth Roadmap
                    </h2>
                    <p className="text-[11.5px] text-[#8fa0ba] mt-0.5">
                      Follow this plan exactly — every week builds on the last.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.roadmap.map((w, i) => (
                    <WeekCard key={w.week} week={w} index={i} />
                  ))}
                </div>
              </section>

              {/* ---- CONTENT IDEAS ---- */}
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-[9px] grid place-items-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(110,53,237,.35), rgba(52,131,255,.35))",
                      border: "1px solid rgba(150,120,255,.5)",
                    }}
                  >
                    <Lightbulb size={14} className="text-[#c9b5ff]" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#eaf1ff]">
                      Content Ideas
                    </h2>
                    <p className="text-[11.5px] text-[#8fa0ba] mt-0.5">
                      6 ready-to-record episode concepts.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {plan.contentIdeas.map((c, i) => (
                    <ContentIdeaCard key={i} idea={c} index={i} />
                  ))}
                </div>
              </section>

              {/* ---- DISTRIBUTION CHANNELS ---- */}
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-[9px] grid place-items-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(110,53,237,.35), rgba(52,131,255,.35))",
                      border: "1px solid rgba(150,120,255,.5)",
                    }}
                  >
                    <Radio size={14} className="text-[#c9b5ff]" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#eaf1ff]">
                      Distribution Channels
                    </h2>
                    <p className="text-[11.5px] text-[#8fa0ba] mt-0.5">
                      Where to publish and how often.
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-[12px] overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.7))",
                    border: "1px solid rgba(80,150,255,.25)",
                  }}
                >
                  {plan.distributionChannels.map((c, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-3 px-4 py-3 items-center"
                      style={{
                        borderBottom:
                          i < plan.distributionChannels.length - 1
                            ? "1px solid rgba(80,150,255,.12)"
                            : "none",
                      }}
                    >
                      <div className="col-span-3 flex items-center gap-2">
                        <PriorityDot priority={c.priority} />
                        <span className="text-[12.5px] font-semibold text-[#eaf1ff]">
                          {c.channel}
                        </span>
                      </div>
                      <div className="col-span-5 text-[11.5px] text-[#a0b0cd]">
                        {c.why}
                      </div>
                      <div className="col-span-4 text-right text-[11px] text-[#c9b5ff]">
                        {c.weeklyAction}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ---- MONETIZATION ---- */}
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-[9px] grid place-items-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,207,112,.25), rgba(255,140,60,.25))",
                      border: "1px solid rgba(255,207,112,.5)",
                    }}
                  >
                    <DollarSign size={14} className="text-[#ffcf70]" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#eaf1ff]">
                      Monetization Paths
                    </h2>
                    <p className="text-[11.5px] text-[#8fa0ba] mt-0.5">
                      4 realistic ways to earn from this podcast.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {plan.monetizationPaths.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-[12px] p-4"
                      style={{
                        background:
                          "radial-gradient(circle at 100% 0%, rgba(255,207,112,.12), transparent 60%), linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
                        border: "1px solid rgba(255,207,112,.25)",
                        boxShadow: "0 1px 0 rgba(255,255,255,.05) inset",
                      }}
                    >
                      <div className="text-[13px] font-semibold text-[#ffcf70]">
                        {p.path}
                      </div>
                      <div className="text-[20px] font-bold text-[#eaf1ff] mt-2">
                        {p.potential}
                      </div>
                      <div className="text-[10.5px] text-[#8fa0ba] mt-2">
                        Start: {p.whenToStart}
                      </div>
                      <p className="text-[11.5px] text-[#c9d5e8] mt-2 leading-[1.5]">
                        {p.how}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* ---- FINAL CTA ---- */}
              <section
                className="relative rounded-[12px] overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5"
                style={{
                  background:
                    "radial-gradient(ellipse at 65% 100%, rgba(255,180,80,.35), transparent 45%), linear-gradient(90deg, #1a1140, #221a54 55%, #0b1a4a)",
                  border: "1px solid #7c5ce0",
                  boxShadow: "0 12px 40px rgba(120,80,220,.25)",
                }}
              >
                <div
                  className="w-[52px] h-[52px] rounded-full grid place-items-center shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,207,112,.3), rgba(255,140,60,.3))",
                    border: "1px solid rgba(255,207,112,.5)",
                  }}
                >
                  <Rocket size={24} className="text-[#ffcf70]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[19px] md:text-[22px] font-semibold text-[#eaf1ff]">
                    Now Go Execute
                  </div>
                  <div className="text-[12.5px] md:text-[13px] text-[#a0b0cd] mt-1.5">
                    You have the plan. Take week 1, day 1 — and ship.
                  </div>
                </div>

                <button
                  onClick={() => navigate("/viral-shorts-ai")}
                  className="h-[48px] px-7 rounded-[12px] text-white text-[13.5px] font-semibold shrink-0 transition-all hover:-translate-y-[1px] hover:brightness-110 flex items-center gap-2"
                  style={{
                    background: "linear-gradient(100deg, #7735ee, #2f78ff)",
                    boxShadow: "0 10px 28px rgba(80,60,240,.4)",
                  }}
                >
                  <Sparkles size={15} />
                  Build Publishing Kit →
                </button>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ================================================================
// POSITIONING CARD
// ================================================================
function PositioningCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="rounded-[10px] p-3.5"
      style={{
        background: "rgba(6,20,42,.55)",
        border: "1px solid rgba(80,150,255,.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-[6px] grid place-items-center shrink-0"
          style={{
            background: `${color}22`,
            border: `1px solid ${color}60`,
          }}
        >
          <Icon size={11} style={{ color }} />
        </div>
        <span className="text-[10px] font-semibold tracking-[0.4px] text-[#8fa0ba]">
          {label.toUpperCase()}
        </span>
      </div>
      <p className="text-[12.5px] text-[#eaf1ff] leading-[1.5]">{value}</p>
    </div>
  );
}

// ================================================================
// WEEK CARD
// ================================================================
function WeekCard({ week, index }) {
  const accent = ["#b65bff", "#6ddcff", "#0ce4bd", "#ffcf70"][index % 4];

  return (
    <div
      className="rounded-[12px] p-4"
      style={{
        background:
          "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
        border: `1px solid ${accent}40`,
        boxShadow: `0 0 0 1px ${accent}10 inset, 0 8px 24px rgba(0,0,0,.35)`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-[9px] grid place-items-center shrink-0 font-bold text-[13px]"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}80)`,
              color: "#0d1424",
              boxShadow: `0 4px 12px ${accent}40`,
            }}
          >
            W{week.week}
          </div>
          <div>
            <div className="text-[13.5px] font-semibold text-[#eaf1ff]">
              {week.theme}
            </div>
            <div className="text-[10.5px] text-[#8fa0ba] mt-0.5">
              Week {week.week} focus
            </div>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="mb-3">
        <div className="text-[10px] font-semibold tracking-[0.4px] text-[#8fa0ba] mb-1.5">
          GOALS
        </div>
        <div className="flex flex-wrap gap-1.5">
          {week.goals.map((g, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-[10.5px] text-[#eaf1ff]"
              style={{
                background: `${accent}18`,
                border: `1px solid ${accent}40`,
              }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mb-3">
        <div className="text-[10px] font-semibold tracking-[0.4px] text-[#8fa0ba] mb-1.5">
          DAILY ACTIONS
        </div>
        <div className="space-y-1.5">
          {week.actions.map((a, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span
                className="w-[38px] text-[10.5px] font-bold shrink-0 pt-[3px]"
                style={{ color: accent }}
              >
                {a.day}
              </span>
              <span className="text-[12px] text-[#c9d5e8] leading-[1.5] flex-1">
                {a.task}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Success metric */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-[8px]"
        style={{
          background: `${accent}15`,
          border: `1px solid ${accent}35`,
        }}
      >
        <Check size={12} style={{ color: accent }} />
        <span className="text-[11px] text-[#eaf1ff]">{week.successMetric}</span>
      </div>
    </div>
  );
}

// ================================================================
// CONTENT IDEA CARD
// ================================================================
function ContentIdeaCard({ idea, index }) {
  const formatColors = {
    Short: "#ff9ecf",
    Long: "#6ddcff",
    Clip: "#0ce4bd",
  };
  const color = formatColors[idea.format] || "#c9b5ff";

  return (
    <div
      className="rounded-[12px] p-4"
      style={{
        background:
          "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
        border: "1px solid rgba(80,150,255,.25)",
        boxShadow: "0 1px 0 rgba(255,255,255,.05) inset",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[9.5px] font-bold tracking-[0.5px] px-2 py-[3px] rounded-full"
          style={{
            background: `${color}20`,
            border: `1px solid ${color}55`,
            color,
          }}
        >
          {idea.format.toUpperCase()}
        </span>
        <span className="text-[10px] text-[#5f7391]">#{index + 1}</span>
      </div>
      <h4 className="text-[13px] font-semibold text-[#eaf1ff] leading-[1.35]">
        {idea.title}
      </h4>
      <p className="text-[11.5px] italic text-[#a0b0cd] mt-2 leading-[1.5]">
        "{idea.hook}"
      </p>
    </div>
  );
}

// ================================================================
// PRIORITY DOT
// ================================================================
function PriorityDot({ priority }) {
  const map = {
    high: "#ff5f7e",
    medium: "#ffcf70",
    low: "#4ef0ae",
  };
  const color = map[priority] || "#8fa0ba";
  return (
    <span
      className="w-[8px] h-[8px] rounded-full shrink-0"
      style={{
        background: color,
        boxShadow: `0 0 8px ${color}80`,
      }}
    />
  );
}
