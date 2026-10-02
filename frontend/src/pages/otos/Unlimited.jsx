// frontend/src/pages/Unlimited.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Infinity as InfinityIcon,
  Zap,
  Sparkles,
  Crown,
  Check,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import bannerBg from "../../assets/images/unlimited-bg.png";

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
// STATIC
// ================================================================
const BENEFITS = [
  {
    icon: InfinityIcon,
    title: "Unlimited Podcasts",
    desc: "Create as many podcasts as you want — no monthly limit, no daily cap.",
  },
  {
    icon: Zap,
    title: "Unlimited AI Shorts",
    desc: "Turn every episode into viral shorts without ever hitting a limit.",
  },
  {
    icon: Sparkles,
    title: "All Premium Templates",
    desc: "Unlock every template in the library, plus new ones added weekly.",
  },
  {
    icon: Crown,
    title: "Priority Rendering",
    desc: "Your videos skip the queue and render up to 3× faster.",
  },
];

const COMPARISON = [
  { feature: "Podcasts per month", free: "5", pro: "Unlimited" },
  { feature: "AI Shorts per month", free: "3", pro: "Unlimited" },
  { feature: "Templates", free: "Basic", pro: "All Premium" },
  { feature: "Video length", free: "Up to 5s", pro: "Up to 60s" },
  { feature: "Render priority", free: "Standard", pro: "Priority" },
  { feature: "Custom branding", free: "—", pro: "Yes" },
  { feature: "Commercial license", free: "—", pro: "Yes" },
  { feature: "Support", free: "Email", pro: "Priority" },
];

// ================================================================
// PAGE
// ================================================================
export default function Unlimited() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- Fetch all templates ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/templates");
        if (!cancelled) {
          // 👇 LIMIT TO 50
          const list = res.data?.data || res.data?.templates || [];
          setTemplates(list.slice(0, 50));
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

  // ---- Click handler (same as Templates.jsx) ----
  const handleUseTemplate = useCallback(
    (t) => {
      console.log("🎯 Template clicked:", t);
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
          {/* HERO BANNER */}
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
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 border border-[#a84eff] bg-[#211b65] text-[10px] text-[#e0c9ff] mb-3">
                <InfinityIcon size={11} />
                UNLIMITED PLAN
              </div>

              <h1 className="text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.4px] font-semibold mt-3 text-[#eef4ff]">
                Create Without
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #b65bff, #7855ff, #338dff)",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  Limits. Ever.
                </span>
              </h1>

              <p className="text-[14px] leading-[1.6] text-[#aebfd5] mt-4 max-w-[640px]">
                Unlock every template, unlimited podcasts, unlimited AI shorts,
                and priority rendering — all for one simple price.
              </p>

              <div className="flex flex-wrap gap-3 mt-7">
                <button
                  onClick={() => navigate("/upgrades")}
                  className="h-[46px] px-6 rounded-[10px] text-white text-[13.5px] font-semibold transition-all duration-200 hover:brightness-110 flex items-center gap-2"
                  style={{
                    background: "linear-gradient(100deg, #6c36ed, #3477ff)",
                    boxShadow: "0 8px 24px rgba(108,54,237,.35)",
                  }}
                >
                  <InfinityIcon size={16} />
                  Go Unlimited
                </button>

                <button
                  onClick={() =>
                    document
                      .getElementById("templates-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="h-[46px] px-6 rounded-[10px] text-[13.5px] transition-colors duration-200 hover:bg-[#0a2952]"
                  style={{
                    border: "1px solid #1d568e",
                    background: "#061b37",
                    color: "#dbe7f7",
                  }}
                >
                  See All Templates
                </button>
              </div>
            </div>
          </section>

          {/* TEMPLATES — limited to 50 */}
          <section id="templates-section" className="mb-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="text-[17px] font-semibold flex items-center gap-2">
                <InfinityIcon size={16} className="text-[#c25bff]" />
                All Templates Included
              </h2>
              <span className="text-[10.5px] text-[#7d8fa8]">
                {loading
                  ? "Loading…"
                  : `Showing ${templates.length} templates`}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[13px]">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-[10px] overflow-hidden animate-pulse"
                    style={{
                      background: "linear-gradient(180deg,#061d3a,#04162b)",
                      border: "1px solid #12436f",
                    }}
                  >
                    <div className="h-[140px] bg-[#0a1a30]" />
                    <div className="p-2">
                      <div className="h-3 bg-[#0a2952] rounded" />
                      <div className="mt-2 h-2 bg-[#0a2952] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : templates.length === 0 ? (
              <div
                className="rounded-[12px] py-12 text-center"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(4,26,53,.45), rgba(3,17,38,.55))",
                  border: "1px dashed rgba(80,150,255,.35)",
                }}
              >
                <InfinityIcon size={28} className="text-[#a98bff] mx-auto mb-2" />
                <p className="text-[13px] text-[#dbe6f7]">No templates yet</p>
                <p className="text-[11.5px] text-[#7d90ac] mt-1">
                  Templates from the library will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[13px]">
                {templates.map((t) => (
                  <TemplateCard
                    key={t.id || t._id}
                    template={t}
                    onUse={handleUseTemplate}
                  />
                ))}
              </div>
            )}
          </section>

          {/* BOTTOM CTA */}
          <section
            className="relative rounded-[12px] overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5"
            style={{
              background:
                "radial-gradient(ellipse at 65% 100%, rgba(62,57,255,.55), transparent 40%), linear-gradient(90deg, #0a1240, #131a54 55%, #0b1a4a)",
              border: "1px solid #5334b4",
              boxShadow: "0 12px 40px rgba(60,50,220,.25)",
            }}
          >
            <div
              className="w-[52px] h-[52px] rounded-full grid place-items-center shrink-0"
              style={{
                background: "rgba(39,22,94,.9)",
                border: "1px solid rgba(150,120,255,.5)",
              }}
            >
              <InfinityIcon size={26} className="text-[#c9b5ff]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[19px] md:text-[22px] font-semibold text-[#eaf1ff]">
                Your Next Episode Awaits
              </div>
              <div className="text-[12.5px] md:text-[13px] text-[#a0b0cd] mt-1.5">
                Stop counting. Start creating. Go Unlimited and turn every idea
                into a podcast — no limits, no waiting.
              </div>
            </div>

            <button
              onClick={() => navigate("/upgrades")}
              className="h-[48px] px-7 rounded-[12px] text-white text-[13.5px] font-semibold shrink-0 transition-all hover:-translate-y-[1px] hover:brightness-110 flex items-center gap-2"
              style={{
                background: "linear-gradient(100deg, #7735ee, #2f78ff)",
                boxShadow: "0 10px 28px rgba(80,60,240,.4)",
              }}
            >
              <InfinityIcon size={15} />
              Start Creating →
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}

// ================================================================
// TEMPLATE CARD
// ================================================================
function TemplateCard({ template, onUse }) {
  const categoryLabel = template.category
    ? typeof template.category === "string"
      ? template.category
      : template.category.name || template.category.title || ""
    : "";

  const coverUrl = getImageUrl(
    template.coverImage || template.image || template.thumbnail || ""
  );

  const handleCardClick = () => {
    onUse(template);
  };

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className="rounded-[10px] overflow-hidden transition-all hover:-translate-y-[2px] cursor-pointer group"
      style={{
        background: "linear-gradient(180deg,#06162b,#041124)",
        border: "1px solid #17385f",
        boxShadow: "0 4px 20px rgba(0,0,0,.3)",
      }}
    >
      <div className="relative h-[140px] bg-[#0a1a30] overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={template.title || template.name || "Template"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-[28px] opacity-60">
            🎙️
          </div>
        )}

        <span
          className="absolute top-2 right-2 flex items-center gap-1 rounded-[9px] px-2 py-[3px] text-[9px] font-semibold"
          style={{
            background: "rgba(6,20,42,.9)",
            border: "1px solid rgba(150,120,255,.5)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            color: "#c9b5ff",
          }}
        >
          <InfinityIcon size={10} />
          Unlimited
        </span>
      </div>

      <div className="p-[11px]">
        <div className="text-[12.5px] font-semibold text-[#eaf1ff] truncate group-hover:text-[#a080ff] transition-colors">
          {template.title || template.name || "Untitled Template"}
        </div>
        {categoryLabel && (
          <p className="text-[10.5px] text-[#8198b6] mt-1 truncate">
            {categoryLabel}
          </p>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUse(template);
          }}
          className="w-full h-[30px] mt-3 rounded-full text-[11px] font-medium text-white transition-all hover:brightness-110"
          style={{
            background: "linear-gradient(100deg, #6e35ed, #3483ff)",
            boxShadow: "0 4px 14px rgba(58,90,255,.28)",
          }}
        >
          Use Template →
        </button>
      </div>
    </div>
  );
}