// frontend/src/pages/ViralShortsAI.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Video,
  PlayCircle,
  Music,
  Camera,
  Headphones,
  Loader2,
  Copy,
  Check,
  Clock,
  Hash,
  Type,
  MessageSquare,
  Target,
  Tag,
  ChevronRight,
  Play,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import bannerBg from "../../assets/images/viral-bg.png";
import youtubeLogo from "../../assets/images/platforms/youtube.svg";
import spotifyLogo from "../../assets/images/platforms/spotify.svg";
import applePodcastsLogo from "../../assets/images/platforms/apple-podcasts.svg";
import amazonMusicLogo from "../../assets/images/platforms/amazon-music.png";
import googlePodcastsLogo from "../../assets/images/platforms/google-podcasts.png";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_URL}${cleanPath}`;
};

// ================================================================
// PLATFORMS
// ================================================================
const PLATFORMS = [
  {
    name: "YouTube",
    logo: youtubeLogo,
    color: "#FF0000",
    gradient: "linear-gradient(100deg, #ff3838, #c81c1c)",
  },
  {
    name: "Spotify",
    logo: spotifyLogo,
    color: "#1DB954",
    gradient: "linear-gradient(100deg, #1DB954, #0a8a3a)",
  },
  {
    name: "Apple Podcasts",
    logo: applePodcastsLogo,
    color: "#9933CC",
    gradient: "linear-gradient(100deg, #b84dff, #7a1fae)",
  },
  {
    name: "Amazon Music",
    logo: amazonMusicLogo,
    color: "#25D1DA",
    gradient: "linear-gradient(100deg, #25D1DA, #0a8a94)",
  },
  {
    name: "Google Podcasts",
    logo: googlePodcastsLogo,
    color: "#4285F4",
    gradient: "linear-gradient(100deg, #4285F4, #1a5fbc)",
  },
];
// ================================================================
// PAGE
// ================================================================
export default function ViralShortsAI() {
  const navigate = useNavigate();

  // Videos from user library
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Selection
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState("YouTube");

  // Generation
  const [generating, setGenerating] = useState(false);
  const [kit, setKit] = useState(null);

  // Fetch user's videos
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
    if (!selectedPlatform) {
      toast.error("Select a platform");
      return;
    }

    setGenerating(true);
    setKit(null);

    try {
      const res = await api.post("/ai/publish-kit", {
        video: {
          title: selectedVideo.title,
          category: selectedVideo.category,
          hostLine: selectedVideo.hostLine,
          guestLine: selectedVideo.guestLine,
        },
        platform: selectedPlatform,
      });

      setKit(res.data?.kit || null);
      toast.success(`${selectedPlatform} publishing kit ready!`);
    } catch (err) {
      console.error("Generate kit failed:", err);
      toast.error("Failed to generate kit");
    } finally {
      setGenerating(false);
    }
  }, [selectedVideo, selectedPlatform]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

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
          {/* ============================================================
              HERO BANNER
              ============================================================ */}
          <section
            className="relative border border-[#153c6d] rounded-[10px] overflow-hidden mb-5"
            style={{
              background:
                "linear-gradient(105deg, #020b1b 0%, #03112b 52%, #040b20 100%)",
            }}
          >
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
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, #020b1a 0%, #020b1a 30%, rgba(3,17,43,.95) 45%, rgba(3,17,43,.6) 65%, rgba(3,17,43,.2) 82%, transparent 100%)",
              }}
            />

            <div className="relative z-10 py-10 md:py-12 pl-7 pr-7 max-w-[720px]">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 border border-[#a84eff] bg-[#211b65] text-[10px] text-[#e0c9ff] mb-3">
                <Sparkles size={11} />
                VIRAL SHORTS AI
              </div>

              {/* Title */}
              <h1 className="text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.4px] font-semibold mt-3 text-[#eef4ff]">
                Publish Smarter.
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #b65bff, #7855ff, #338dff)",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  Go Viral Faster.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-[14px] leading-[1.6] text-[#aebfd5] mt-4 max-w-[640px]">
                Pick a podcast video, choose your platform — our AI writes the
                perfect title, description, hashtags, and posting strategy in
                seconds.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 mt-7">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("generate-publish-kit");
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
                  Generate Publishing Kit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("select-video");
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
                  <Play size={14} />
                  Pick a Video
                </button>
              </div>
            </div>
          </section>

          {/* ============================================================
              STEP 1 — SELECT VIDEO
              ============================================================ */}
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
                  Pick any completed video from your library.
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
                <Video size={28} className="text-[#a98bff] mx-auto mb-2" />
                <p className="text-[13px] text-[#dbe6f7]">No videos yet</p>
                <p className="text-[11.5px] text-[#7d90ac] mt-1">
                  Generate a podcast video first to use this feature.
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
                  const thumb = getImageUrl(
                    v.localVideoUrl || v.videoUrl || v.coverImage,
                  );
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        setSelectedVideo(v);
                        setKit(null);
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

          {/* ============================================================
              STEP 2 — SELECT PLATFORM
              ============================================================ */}
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
                  Choose Publishing Platform
                </h2>
                <p className="text-[11.5px] text-[#8fa0ba] mt-0.5">
                  We'll tailor the publishing kit to each platform.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-[13px]">
              {PLATFORMS.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPlatform === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(p.key);
                      setKit(null);
                    }}
                    className="rounded-[12px] p-4 transition-all duration-300 hover:-translate-y-[2px] flex flex-col items-start gap-2.5 text-left"
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
                            ? p.gradient
                            : "rgba(6,20,42,.7)",
                          border: isSelected
                            ? "1px solid rgba(255,255,255,.2)"
                            : "1px solid rgba(80,150,255,.3)",
                        }}
                      >
                        {p.logo ? (
                          <img
                            src={p.logo}
                            alt={p.name}
                            className="w-[20px] h-[20px] object-contain"
                          />
                        ) : (
                          <Icon
                            size={18}
                            style={{
                              color: isSelected ? "#fff" : p.color,
                            }}
                          />
                        )}
                      </div>
                      {isSelected && (
                        <Check size={16} className="text-[#c9b5ff] ml-auto" />
                      )}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-[#eaf1ff]">
                        {p.name}
                      </div>
                      <div className="text-[10.5px] text-[#8fa0ba] mt-0.5">
                        Optimized kit
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ============================================================
              GENERATE BUTTON
              ============================================================ */}
          <section className="mb-5">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !selectedVideo}
              className="w-full md:w-auto md:min-w-[340px] h-[52px] px-8 rounded-[12px] text-[14px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
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
                  Generating Publishing Kit…
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate Publishing Kit
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </section>

          {/* ============================================================
              RESULTS
              ============================================================ */}
          {kit && (
            <section className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                <h2 className="text-[17px] font-semibold flex items-center gap-2 text-[#eaf1ff]">
                  <Sparkles size={16} className="text-[#c25bff]" />
                  Your {selectedPlatform} Publishing Kit
                </h2>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-semibold"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(110,53,237,.2), rgba(52,131,255,.15))",
                    border: "1px solid rgba(150,120,255,.4)",
                    color: "#c9b5ff",
                  }}
                >
                  <Sparkles size={10} />
                  AI Generated
                </span>
              </div>

              {/* Grid of kit cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* TITLE */}
                <KitCard
                  icon={Type}
                  label="Title"
                  color="#6ddcff"
                  onCopy={() => handleCopy(kit.title, "Title")}
                >
                  <p className="text-[14px] text-[#eaf1ff] leading-[1.5]">
                    {kit.title}
                  </p>
                </KitCard>

                {/* THUMBNAIL TEXT */}
                <KitCard
                  icon={Target}
                  label="Thumbnail Text"
                  color="#ffcf70"
                  onCopy={() => handleCopy(kit.thumbnailText, "Thumbnail text")}
                >
                  <div
                    className="rounded-[10px] py-3 px-4 text-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,207,112,.12), rgba(255,140,60,.12))",
                      border: "1px solid rgba(255,207,112,.35)",
                    }}
                  >
                    <span className="text-[16px] font-bold tracking-[1.5px] text-[#ffcf70]">
                      {kit.thumbnailText}
                    </span>
                  </div>
                </KitCard>

                {/* DESCRIPTION */}
                <KitCard
                  icon={MessageSquare}
                  label="Description"
                  color="#b59aff"
                  className="lg:col-span-2"
                  onCopy={() => handleCopy(kit.description, "Description")}
                >
                  <p className="text-[13px] text-[#c9d5e8] leading-[1.65] whitespace-pre-wrap">
                    {kit.description}
                  </p>
                </KitCard>

                {/* HOOK */}
                <KitCard
                  icon={Sparkles}
                  label="Opening Hook"
                  color="#6ddcff"
                  onCopy={() => handleCopy(kit.hook, "Hook")}
                >
                  <p className="text-[13px] text-[#c9d5e8] leading-[1.6] italic">
                    "{kit.hook}"
                  </p>
                </KitCard>

                {/* CTA */}
                <KitCard
                  icon={Target}
                  label="Call To Action"
                  color="#ff9ecf"
                  onCopy={() => handleCopy(kit.cta, "CTA")}
                >
                  <p className="text-[13px] text-[#c9d5e8] leading-[1.6]">
                    {kit.cta}
                  </p>
                </KitCard>

                {/* TAGS */}
                <KitCard
                  icon={Tag}
                  label="Tags"
                  color="#8fe3b8"
                  onCopy={() => handleCopy(kit.tags.join(", "), "Tags")}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {kit.tags.map((t, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full text-[10.5px] text-[#c9d5e8]"
                        style={{
                          background: "rgba(80,150,255,.12)",
                          border: "1px solid rgba(80,150,255,.3)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </KitCard>

                {/* HASHTAGS */}
                <KitCard
                  icon={Hash}
                  label="Hashtags"
                  color="#c9b5ff"
                  onCopy={() => handleCopy(kit.hashtags.join(" "), "Hashtags")}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {kit.hashtags.map((h, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full text-[10.5px] text-[#c9b5ff]"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(110,53,237,.2), rgba(52,131,255,.15))",
                          border: "1px solid rgba(150,120,255,.4)",
                        }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </KitCard>

                {/* BEST TIME */}
                <KitCard
                  icon={Clock}
                  label="Best Time To Post"
                  color="#ffcf70"
                  className="lg:col-span-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-[10px] grid place-items-center shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,207,112,.2), rgba(255,140,60,.2))",
                        border: "1px solid rgba(255,207,112,.4)",
                      }}
                    >
                      <Clock size={16} className="text-[#ffcf70]" />
                    </div>
                    <div className="text-[13.5px] font-medium text-[#eaf1ff]">
                      {kit.bestTime}
                    </div>
                  </div>
                </KitCard>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

// ================================================================
// KIT CARD
// ================================================================
function KitCard({
  icon: Icon,
  label,
  color,
  children,
  onCopy,
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!onCopy) return;
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      className={`rounded-[12px] p-4 transition-all ${className}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.7))",
        border: "1px solid rgba(80,150,255,.25)",
        boxShadow: "0 1px 0 rgba(255,255,255,.05) inset",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-[8px] grid place-items-center shrink-0"
            style={{
              background: `${color}20`,
              border: `1px solid ${color}60`,
            }}
          >
            <Icon size={14} style={{ color }} />
          </div>
          <span
            className="text-[11.5px] font-semibold tracking-[0.3px]"
            style={{ color: "#cbd8ec" }}
          >
            {label.toUpperCase()}
          </span>
        </div>
        {onCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className="h-[28px] px-2.5 rounded-[7px] text-[10.5px] font-medium transition-all hover:brightness-110 flex items-center gap-1"
            style={{
              background: copied
                ? "rgba(12,228,189,.15)"
                : "rgba(80,150,255,.1)",
              border: copied
                ? "1px solid rgba(12,228,189,.4)"
                : "1px solid rgba(80,150,255,.3)",
              color: copied ? "#0ce4bd" : "#9bb4d4",
            }}
          >
            {copied ? (
              <>
                <Check size={11} />
                Copied
              </>
            ) : (
              <>
                <Copy size={11} />
                Copy
              </>
            )}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
