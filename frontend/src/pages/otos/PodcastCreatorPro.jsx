// frontend/src/pages/PodcastCreatorPro.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  Sparkles,
  Zap,
  Rocket,
  Star,
  Check,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import bannerBg from "../../assets/images/podcastcreater-bg.png";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// ================================================================
// IMAGE URL HELPER
// ================================================================
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_URL}${cleanPath}`;
};

// ================================================================
// PRO FEATURES
// ================================================================
const PRO_FEATURES = [
  {
    icon: Crown,
    title: "Pro Templates",
    desc: "Hand-crafted, cinematic-grade templates used by top podcasters.",
  },
  {
    icon: Zap,
    title: "4× Faster Renders",
    desc: "Dedicated GPU queue — your videos finish while others wait.",
  },
  {
    icon: Sparkles,
    title: "AI Enhance",
    desc: "One-click enhancement for audio, visuals, and storytelling.",
  },
  {
    icon: Rocket,
    title: "Instant Export",
    desc: "Export to all platforms at once — YouTube, Spotify, TikTok.",
  },
];

// ================================================================
// PAGE
// ================================================================
export default function PodcastCreatorPro() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- Fetch 30 templates ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/templates");
        if (!cancelled) {
          const list = res.data?.data || res.data?.templates || [];
          setTemplates(list.slice(0, 30)); // exactly 30
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
        if (!cancelled) setTemplates([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Click handler ----
  const handleUseTemplate = useCallback(
    (t) => {
      console.log("🎯 Pro template clicked:", t);
      navigate("/create-podcast", {
        state: {
          templateId: t.id || t._id,
          templateTitle: t.title || t.name,
          templateCategory:
            typeof t.category === "object"
              ? t.category?.name || ""
              : t.category || "",
          coverImage: t.coverImage || t.image || t.thumbnail,
          dialog: t.dialog,
          isPro: true,
        },
      });
    },
    [navigate]
  );

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
                <Crown size={11} />
                PODCAST CREATOR PRO
              </div>

              {/* Title */}
              <h1 className="text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.4px] font-semibold mt-3 text-[#eef4ff]">
                Cinematic Templates.
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #b65bff, #7855ff, #338dff)",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  Built for Pros.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-[14px] leading-[1.6] text-[#aebfd5] mt-4 max-w-[640px]">
                A curated collection of 30 premium templates — designed for
                creators who want cinematic-quality podcasts without the
                complexity.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 mt-7">
                <button
                  onClick={() =>
                    document
                      .getElementById("pro-templates")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="h-[46px] px-6 rounded-[10px] text-white text-[13.5px] font-semibold transition-all duration-200 hover:brightness-110 flex items-center gap-2"
                  style={{
                    background: "linear-gradient(100deg, #6c36ed, #3477ff)",
                    boxShadow: "0 8px 24px rgba(108,54,237,.35)",
                  }}
                >
                  <Sparkles size={15} />
                  Explore Pro Templates
                </button>

                <div
                  className="h-[46px] px-6 rounded-[10px] text-[13.5px] flex items-center gap-2"
                  style={{
                    border: "1px solid rgba(255,207,112,.4)",
                    background: "rgba(255,207,112,.08)",
                    color: "#ffcf70",
                  }}
                >
                  <Check size={14} />
                  Pro Access Active
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================
              PRO FEATURES STRIP
              ============================================================ */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[13px] mb-5">
            {PRO_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-[12px] p-4 transition-all hover:-translate-y-[2px]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.7))",
                    border: "1px solid rgba(80,150,255,.25)",
                    boxShadow:
                      "0 8px 24px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.05) inset",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-[10px] grid place-items-center mb-3"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(110,53,237,.35), rgba(52,131,255,.35))",
                      border: "1px solid rgba(150,120,255,.5)",
                    }}
                  >
                    <Icon size={18} className="text-[#c9b5ff]" />
                  </div>
                  <div className="text-[13.5px] font-semibold text-[#eaf1ff]">
                    {f.title}
                  </div>
                  <p className="text-[11.5px] leading-[1.55] text-[#8fa0ba] mt-1.5">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </section>

          {/* ============================================================
              TEMPLATES — 4-COLUMN GRID, 30 TILES
              ============================================================ */}
          <section id="pro-templates" className="mb-5">
            {/* Section header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-[19px] font-semibold flex items-center gap-2 text-[#eaf1ff]">
                  <Crown size={17} className="text-[#ffcf70]" />
                  Pro Template Collection
                </h2>
                <p className="text-[12px] text-[#8fa0ba] mt-1">
                  {loading
                    ? "Loading premium templates…"
                    : `${templates.length} hand-picked templates`}
                </p>
              </div>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-semibold"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,207,112,.15), rgba(255,140,60,.15))",
                  border: "1px solid rgba(255,207,112,.4)",
                  color: "#ffcf70",
                }}
              >
                <Star size={10} fill="#ffcf70" />
                PRO ONLY
              </span>
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[13px]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-[12px] animate-pulse"
                    style={{
                      height: 230,
                      background: "linear-gradient(180deg,#061d3a,#04162b)",
                      border: "1px solid #12436f",
                    }}
                  />
                ))}
              </div>
            ) : templates.length === 0 ? (
              /* Empty state */
              <div
                className="rounded-[12px] py-12 text-center"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(4,26,53,.45), rgba(3,17,38,.55))",
                  border: "1px dashed rgba(80,150,255,.35)",
                }}
              >
                <Crown size={28} className="text-[#ffcf70] mx-auto mb-2" />
                <p className="text-[13px] text-[#dbe6f7]">
                  No pro templates yet
                </p>
              </div>
            ) : (
              /* 4-column grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[13px]">
                {templates.map((t, i) => (
                  <ProTile
                    key={t.id || t._id || i}
                    t={t}
                    onUse={handleUseTemplate}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ============================================================
              BOTTOM CTA
              ============================================================ */}
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
              <Crown size={24} className="text-[#ffcf70]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[19px] md:text-[22px] font-semibold text-[#eaf1ff]">
                You're on Pro — Everything Unlocked
              </div>
              <div className="text-[12.5px] md:text-[13px] text-[#a0b0cd] mt-1.5">
                30 cinematic templates, AI enhance, and 4× faster rendering are
                already yours. Pick a template and start creating.
              </div>
            </div>

            <button
              onClick={() =>
                document
                  .getElementById("pro-templates")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="h-[48px] px-7 rounded-[12px] text-white text-[13.5px] font-semibold shrink-0 transition-all hover:-translate-y-[1px] hover:brightness-110 flex items-center gap-2"
              style={{
                background: "linear-gradient(100deg, #ff8c3c, #ff5fa2)",
                boxShadow: "0 10px 28px rgba(255,120,80,.4)",
              }}
            >
              <Sparkles size={15} />
              Browse Templates →
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}

// ================================================================
// PRO TILE — clean card with image + title + category + Create button
// ================================================================
function ProTile({ t, onUse }) {
  const categoryLabel = t.category
    ? typeof t.category === "string"
      ? t.category
      : t.category.name || t.category.title || ""
    : "";

  const coverUrl = getImageUrl(t.coverImage || t.image || t.thumbnail || "");
  const handleCreate = () => onUse(t);

  return (
    <div
      className="rounded-[12px] overflow-hidden transition-all duration-300 hover:-translate-y-[2px]"
      style={{
        background: "linear-gradient(180deg,#06162b,#041124)",
        border: "1px solid #17385f",
        boxShadow:
          "0 6px 24px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.05) inset",
      }}
    >
      {/* Thumbnail with PRO badge */}
      <div
        className="relative bg-[#0a1a30] overflow-hidden"
        style={{ height: 150 }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={t.title || t.name || "Pro Template"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : (
          <div
            className="w-full h-full grid place-items-center text-[32px] opacity-60"
            style={{
              background:
                "linear-gradient(135deg, rgba(110,53,237,.2), rgba(52,131,255,.2))",
            }}
          >
            🎙️
          </div>
        )}

        {/* Soft dark gradient at the bottom */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(2,7,19,.75) 100%)",
          }}
        />

        {/* PRO badge */}
        <span
          className="absolute top-2 right-2 z-[2] flex items-center gap-1 rounded-full px-2 py-[3px] text-[9px] font-bold tracking-wide"
          style={{
            background:
              "linear-gradient(100deg, rgba(255,207,112,.95), rgba(255,140,60,.95))",
            color: "#291900",
            boxShadow: "0 4px 12px rgba(255,180,80,.4)",
          }}
        >
          <Crown size={9} />
          PRO
        </span>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="text-[13.5px] font-semibold text-[#f2f6ff] truncate leading-tight">
          {t.title || t.name || "Untitled Template"}
        </h3>

        {categoryLabel && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className="w-[6px] h-[6px] rounded-full shrink-0"
              style={{
                background: "linear-gradient(135deg, #ffcf70, #ff8c3c)",
              }}
            />
            <span className="text-[11px] text-[#c9b5ff] truncate">
              {categoryLabel}
            </span>
          </div>
        )}

        {/* Create button */}
        <button
          type="button"
          onClick={handleCreate}
          className="w-full mt-3 h-[34px] rounded-full text-[11.5px] font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-1.5"
          style={{
            background: "linear-gradient(100deg, #ff8c3c, #ff5fa2)",
            boxShadow: "0 6px 18px rgba(255,120,80,.35)",
          }}
        >
          <Sparkles size={13} />
          Create
        </button>
      </div>
    </div>
  );
}