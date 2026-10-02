// frontend/src/pages/Templates.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Flame,
  Play,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import bannerBg from "../assets/images/template-banner-bg.png";

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
// CATEGORY FALLBACK ACCENTS
// ================================================================
const CATEGORY_ACCENTS = [
  ["#d642ff", "#8d43ff"],
  ["#ff67bf", "#c967ff"],
  ["#6ddcff", "#356cff"],
  ["#b879ff", "#7737f4"],
  ["#ff873c", "#ff5f9e"],
  ["#7de8c8", "#3483ff"],
  ["#768eff", "#a46aff"],
  ["#e86bff", "#6e35ed"],
  ["#ffb36d", "#ff7de8"],
  ["#6df0ff", "#768eff"],
];

// ================================================================
// THUMB GRADIENTS
// ================================================================
const THUMB_GRADIENTS = [
  "radial-gradient(circle at 70% 30%, rgba(68,95,255,.48), transparent 24%), linear-gradient(135deg, #1a3151, #07101d 55%, #251145)",
  "radial-gradient(circle at 72% 35%, #8e3f65, transparent 22%), linear-gradient(135deg, #152b48, #25113d)",
  "radial-gradient(circle at 72% 38%, #0c8f8f, transparent 24%), linear-gradient(135deg, #031e35, #07131d 55%, #18291c)",
  "radial-gradient(circle at 70% 25%, #274ca7, transparent 28%), linear-gradient(135deg, #112d5b, #080d19)",
  "radial-gradient(circle at 70% 32%, #db7628, transparent 25%), linear-gradient(135deg, #452515, #101822)",
  "radial-gradient(circle at 48% 25%, #0f7fc8, transparent 30%), linear-gradient(135deg, #0a3156, #091019)",
  "radial-gradient(circle at 70% 30%, #f09c76, transparent 25%), linear-gradient(135deg, #1b463a, #0e201c)",
  "radial-gradient(circle at 68% 35%, #0c8eff, transparent 27%), linear-gradient(135deg, #061c43, #07101b)",
  "linear-gradient(135deg, #512e44, #ed8c5b 45%, #1d2c49)",
  "linear-gradient(135deg, #49351f, #a37b54 44%, #111c29)",
];

// ================================================================
// PHYSICS-BASED SMOOTH SCROLL
// ================================================================
const smoothScrollTo = (element, targetLeft, options = {}) => {
  if (!element) return;

  const { duration = 700, easing = "expoOut" } = options;

  if (element._scrollRAF) {
    cancelAnimationFrame(element._scrollRAF);
  }

  const startLeft = element.scrollLeft;
  const distance = targetLeft - startLeft;
  const startTime = performance.now();

  const easings = {
    expoOut: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    quintOut: (t) => 1 - Math.pow(1 - t, 5),
    easeInOutCubic: (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeInOutQuint: (t) =>
      t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
  };

  const ease = easings[easing] || easings.expoOut;

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    element.scrollLeft = startLeft + distance * ease(progress);

    if (progress < 1) {
      element._scrollRAF = requestAnimationFrame(step);
    } else {
      element._scrollRAF = null;
    }
  };

  element._scrollRAF = requestAnimationFrame(step);
};

// ================================================================
// SHARED STYLES
// ================================================================
function PremiumStyles() {
  return (
    <style>{`
      @keyframes shimmerSweep {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
      .tpl-shimmer {
        background-image: linear-gradient(
          100deg,
          rgba(255,255,255,0) 30%,
          rgba(255,255,255,0.05) 50%,
          rgba(255,255,255,0) 70%
        );
        background-size: 400px 100%;
        background-repeat: no-repeat;
        animation: shimmerSweep 1.6s ease-in-out infinite;
      }

      @keyframes tplCardIn {
        0% { opacity: 0; transform: translateY(12px) scale(0.96); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      .tpl-card-enter {
        animation: tplCardIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) backwards;
      }

      @keyframes tplGlow {
        0%, 100% { opacity: 0.85; transform: translateX(-50%) scale(1); }
        50%      { opacity: 1;    transform: translateX(-50%) scale(1.08); }
      }

      .tpl-card-ring:focus-visible,
      .tpl-icon-btn:focus-visible,
      .tpl-use-btn:focus-visible,
      .tpl-cat-btn:focus-visible {
        outline: 2px solid #6ddcff;
        outline-offset: 2px;
      }

      .tpl-cat-scroll {
        scrollbar-width: none;
        -ms-overflow-style: none;
        scroll-behavior: auto;
        overscroll-behavior-x: contain;
        overscroll-behavior-y: none;
        -webkit-overflow-scrolling: touch;
      }
      .tpl-cat-scroll::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }

      .tpl-cat-btn,
      .tpl-card-enter {
        will-change: transform, opacity;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }

      .tpl-arrow {
        transition:
          transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
          background 0.25s ease,
          border-color 0.25s ease;
      }

      @media (prefers-reduced-motion: reduce) {
        .tpl-shimmer,
        .tpl-card-enter,
        .tpl-anim {
          animation: none !important;
          transition: none !important;
        }
        .tpl-cat-scroll { scroll-behavior: auto; }
      }
    `}</style>
  );
}

// ================================================================
// TEMPLATE CARD
// ================================================================
const TemplateCard = memo(function TemplateCard({ template, onUse, index }) {
  const idx = (template.id || 1) - 1;
  const gradient = THUMB_GRADIENTS[idx % THUMB_GRADIENTS.length];
  const [accentA, accentB] = CATEGORY_ACCENTS[idx % CATEGORY_ACCENTS.length];

  const coverUrl = template.coverImage ? getImageUrl(template.coverImage) : "";

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
      className="tpl-card-enter rounded-[16px] p-[1px] transition-all duration-300 cursor-pointer"
      style={{
        background:
          "linear-gradient(155deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 40%, rgba(255,255,255,0.02) 60%, rgba(120,110,255,0.18))",
        animationDelay: `${Math.min(index * 0.04, 0.4)}s`,
      }}
    >
      <article
        tabIndex={-1}
        className="tpl-card-ring group relative rounded-[15px] overflow-hidden flex flex-col h-full"
        style={{
          background: "linear-gradient(180deg, #07182f, #04101f 65%)",
          boxShadow: "0 1px 0 rgba(255,255,255,.03) inset",
          transition:
            "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow =
            "0 22px 50px rgba(5,15,40,.6), 0 0 0 1px rgba(140,120,255,.25) inset";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 1px 0 rgba(255,255,255,.03) inset";
        }}
      >
        <div
          className="relative h-[200px] overflow-hidden shrink-0"
          style={{ background: gradient }}
        >
          {coverUrl && (
            <img
              src={coverUrl}
              alt={template.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
                willChange: "transform",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#040e1f] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />

          {template.isTrending && (
            <span
              className="absolute top-2.5 left-2.5 z-[4] flex items-center gap-1 px-2.5 py-[5px] rounded-full text-white text-[10px] font-semibold backdrop-blur-md"
              style={{
                background:
                  "linear-gradient(100deg, rgba(123,47,247,.85), rgba(141,67,255,.85))",
                boxShadow: "0 0 16px rgba(141,67,255,.45)",
                border: "1px solid rgba(255,255,255,.14)",
              }}
            >
              <Flame size={11} className="shrink-0" />
              Trending
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUse(template);
            }}
            className="tpl-icon-btn absolute bottom-2.5 right-2.5 z-[4] grid place-items-center rounded-full"
            style={{
              width: 34,
              height: 34,
              background: "rgba(4,12,26,.55)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,.16)",
              color: "white",
              opacity: 0,
              transform: "translateY(6px)",
              transition:
                "opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onMouseEnter={(e) => {
              const parent = e.currentTarget.closest(".group");
              if (parent) {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
            aria-label="Preview template"
          >
            <Play size={13} fill="currentColor" className="ml-[1px]" />
          </button>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-[15px] font-semibold text-[#f2f6ff] tracking-[-0.2px] line-clamp-1">
            {template.title}
          </h3>

          {template.category && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className="w-[6px] h-[6px] rounded-full shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${accentA}, ${accentB})`,
                }}
              />
              <span className="text-[11px] font-medium tracking-wide text-[#9c8bff] line-clamp-1">
                {template.category.name}
              </span>
            </div>
          )}

          <p className="text-[12px] leading-[1.6] text-[#8fa0ba] mt-3 min-h-[46px] line-clamp-2">
            {template.description}
          </p>

          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/[0.05]">
            <span className="text-[11px] text-[#5f7391] tracking-wide">
              Ready to customize
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUse(template);
              }}
              className="tpl-use-btn group/btn relative overflow-hidden rounded-full h-[34px] pl-4 pr-3 flex items-center gap-1.5 text-[12px] font-medium text-white"
              style={{
                background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                boxShadow: "0 4px 14px rgba(58,90,255,.28)",
                transition:
                  "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), filter 0.25s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-1px) scale(1.02)";
                e.currentTarget.style.filter = "brightness(1.1)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(58,90,255,.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.filter = "brightness(1)";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(58,90,255,.28)";
              }}
            >
              Use Template
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
});

// ================================================================
// CATEGORY BUTTON
// ================================================================
const CategoryButton = memo(function CategoryButton({
  cat,
  isActive,
  onSelect,
}) {
  const [imgError, setImgError] = useState(false);
  const [accentA, accentB] =
    CATEGORY_ACCENTS[(cat.id || 0) % CATEGORY_ACCENTS.length];

  const showImage = cat.image && !imgError;

  return (
    <button
      onClick={() => onSelect(cat.slug)}
      className="tpl-cat-btn tpl-anim relative h-[165px] md:h-[185px] w-full rounded-[14px] overflow-hidden"
      style={{
        background: isActive
          ? "linear-gradient(165deg, rgba(123,58,255,.22), rgba(52,131,255,.14))"
          : "linear-gradient(180deg, rgba(255,255,255,.025), rgba(255,255,255,0))",
        border: isActive
          ? "1px solid rgba(150,120,255,.55)"
          : "1px solid rgba(255,255,255,.06)",
        boxShadow: isActive
          ? "0 10px 28px rgba(90,60,255,.28), 0 0 0 1px rgba(150,120,255,.12) inset"
          : "none",
        transition:
          "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease, box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {showImage ? (
        <img
          src={cat.image}
          alt={cat.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: isActive ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform",
          }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${accentA}55, ${accentB}55)`,
          }}
        />
      )}

      <div
        className="absolute inset-x-0 bottom-0 h-[60%] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(2,8,20,.55) 45%, rgba(2,8,20,.92) 100%)",
        }}
      />

      {isActive && (
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(140,110,255,.55), transparent 70%)",
            filter: "blur(10px)",
            animation: "tplGlow 3s ease-in-out infinite",
          }}
        />
      )}

      <span
        className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-4 text-[13.5px] leading-[1.25] font-semibold text-center"
        style={{
          color: isActive ? "#ffffff" : "#e4ecf9",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textShadow: "0 1px 3px rgba(0,0,0,.85)",
          letterSpacing: "0.1px",
          transition: "color 0.3s ease",
        }}
      >
        {cat.name}
      </span>

      {isActive && (
        <span
          className="absolute inset-x-0 bottom-0 h-[3px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentA}, ${accentB}, transparent)`,
            boxShadow: `0 0 12px ${accentA}`,
          }}
        />
      )}
    </button>
  );
});

// ================================================================
// PAGE
// ================================================================
export default function Templates() {
  const navigate = useNavigate();

  const [dbCategories, setDbCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [templates, setTemplates] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);

  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const categoryScrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkCategoryScroll = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftArrow(scrollLeft > 4);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  const scrollCategories = useCallback((direction) => {
    const el = categoryScrollRef.current;
    if (!el) return;

    const cardWidth = 180 + 12;
    const amount = cardWidth * 2;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const target =
      direction === "left"
        ? Math.max(0, el.scrollLeft - amount)
        : Math.min(maxScroll, el.scrollLeft + amount);

    smoothScrollTo(el, target, { duration: 750, easing: "expoOut" });
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setCategoriesLoading(true);
        const res = await api.get("/categories");
        if (cancelled) return;

        const mapped = (res.data?.data || []).map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image ? getImageUrl(c.image) : null,
        }));

        setDbCategories(mapped);

        if (mapped.length > 0) {
          setActiveCategory((prev) => prev || mapped[0].slug);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (categoriesLoading) return;
    const t = setTimeout(() => checkCategoryScroll(), 80);
    window.addEventListener("resize", checkCategoryScroll);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", checkCategoryScroll);
    };
  }, [categoriesLoading, dbCategories, checkCategoryScroll]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (initialLoading) {
          // keep initialLoading true
        } else {
          setRefetching(true);
        }

        const params = new URLSearchParams();
        if (activeCategory) {
          params.append("category", activeCategory);
        }
        if (debouncedSearch.trim()) {
          params.append("search", debouncedSearch.trim());
        }

        const url = `/templates${
          params.toString() ? "?" + params.toString() : ""
        }`;
        const res = await api.get(url);
        if (cancelled) return;
        setTemplates(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
        if (!cancelled) setTemplates([]);
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
          setRefetching(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, debouncedSearch]);

  const displayCategories = useMemo(() => dbCategories, [dbCategories]);

  const sectionTitle = useMemo(() => {
    if (!activeCategory) return "Templates";
    return (
      displayCategories.find((c) => c.slug === activeCategory)?.name ||
      "Templates"
    );
  }, [activeCategory, displayCategories]);

  const handleCategorySelect = useCallback((slug) => {
    setActiveCategory(slug);
  }, []);

  const handleUseTemplate = useCallback(
    (t) => {
      navigate("/create-podcast", {
        state: {
          templateId: t.id,
          templateTitle: t.title,
          templateCategory: t.category?.name || "",
          coverImage: t.coverImage,
          dialog: t.dialog,
        },
      });
    },
    [navigate]
  );

  return (
    <div
      className="flex min-h-screen bg-[#020814]"
      style={{ overflowX: "hidden", maxWidth: "100vw" }}
    >
      <PremiumStyles />
      <Sidebar />

      <div
        className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen bg-[#020814]"
        style={{ minWidth: 0, overflowX: "hidden" }}
      >
        <Navbar />

        <main
          className="flex-1 p-3 md:p-6 overflow-y-auto"
          style={{ overflowX: "hidden" }}
        >
          <section className="pb-7">
            {/* ============================================================
                HERO
                ============================================================ */}
            <div
              className="relative overflow-hidden rounded-[10px] border border-[#153c6d]"
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
                <div className="text-[13px] tracking-[1.8px] text-[#9c65ff] font-medium">
                  READY-TO-USE PODCAST TEMPLATES
                </div>
                <h1 className="text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.4px] font-semibold mt-3 text-[#eef4ff]">
                  Choose a Template.
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #b65bff, #7855ff, #338dff)",
                      WebkitBackgroundClip: "text",
                    }}
                  >
                    Create Amazing Podcasts.
                  </span>
                </h1>
                <p className="text-[14px] leading-[1.6] text-[#aebfd5] mt-4 max-w-[640px]">
                  Professional, high-quality podcast templates for every niche.
                  Just pick a category, customize with AI, and turn your ideas
                  into engaging podcasts — in minutes.
                </p>

                <div
                  className="mt-7 w-[540px] max-w-full h-[46px] rounded-[10px] flex items-center px-4 gap-3"
                  style={{
                    background: "#041127",
                    border: "1px solid #1b4273",
                  }}
                >
                  <Search size={20} className="text-[#9bb4d7] shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full bg-transparent outline-none text-[13px] text-white placeholder:text-[#8ea2bd]"
                  />
                </div>
              </div>
            </div>

            {/* ============================================================
                CATEGORY STRIP
                ============================================================ */}
            <div
              className="mt-7 z-20"
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {showLeftArrow && !categoriesLoading && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => scrollCategories("left")}
                  className="tpl-arrow absolute left-2 top-1/2 -translate-y-1/2 z-30 grid place-items-center rounded-full"
                  style={{
                    width: 42,
                    height: 42,
                    background: "rgba(4,12,26,.92)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(150,120,255,.4)",
                    boxShadow: "0 8px 24px rgba(0,0,0,.5)",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-50%) scale(1.12)";
                    e.currentTarget.style.boxShadow =
                      "0 14px 36px rgba(120,80,255,.55)";
                    e.currentTarget.style.borderColor = "rgba(160,130,255,.7)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-50%) scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(0,0,0,.5)";
                    e.currentTarget.style.borderColor = "rgba(150,120,255,.4)";
                  }}
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              {showRightArrow && !categoriesLoading && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => scrollCategories("right")}
                  className="tpl-arrow absolute right-2 top-1/2 -translate-y-1/2 z-30 grid place-items-center rounded-full"
                  style={{
                    width: 42,
                    height: 42,
                    background: "rgba(4,12,26,.92)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(150,120,255,.4)",
                    boxShadow: "0 8px 24px rgba(0,0,0,.5)",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-50%) scale(1.12)";
                    e.currentTarget.style.boxShadow =
                      "0 14px 36px rgba(120,80,255,.55)";
                    e.currentTarget.style.borderColor = "rgba(160,130,255,.7)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-50%) scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(0,0,0,.5)";
                    e.currentTarget.style.borderColor = "rgba(150,120,255,.4)";
                  }}
                  aria-label="Scroll categories right"
                >
                  <ChevronRight size={20} />
                </button>
              )}

              <div
                className="absolute left-0 top-0 bottom-0 w-[48px] z-[25] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, #020814 0%, rgba(2,8,20,.85) 50%, transparent 100%)",
                  opacity: showLeftArrow ? 1 : 0,
                  transition: "opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />

              <div
                className="absolute right-0 top-0 bottom-0 w-[48px] z-[25] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(270deg, #020814 0%, rgba(2,8,20,.85) 50%, transparent 100%)",
                  opacity: showRightArrow ? 1 : 0,
                  transition: "opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />

              <div
                ref={categoryScrollRef}
                onScroll={checkCategoryScroll}
                className="tpl-cat-scroll flex gap-3"
                style={{
                  overflowX: "auto",
                  overflowY: "hidden",
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  padding: "4px",
                  minWidth: 0,
                }}
              >
                {categoriesLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="tpl-shimmer h-[165px] md:h-[185px] shrink-0 rounded-[14px]"
                        style={{
                          width: 180,
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,0))",
                          border: "1px solid rgba(255,255,255,.06)",
                        }}
                      />
                    ))
                  : displayCategories.map((cat) => (
                      <div
                        key={cat.slug}
                        className="shrink-0"
                        style={{ width: 180 }}
                      >
                        <CategoryButton
                          cat={cat}
                          isActive={activeCategory === cat.slug}
                          onSelect={handleCategorySelect}
                        />
                      </div>
                    ))}
              </div>
            </div>

            {/* ============================================================
                SECTION HEADING
                ============================================================ */}
            <div
              className="flex items-end justify-between mt-10 mb-5 pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="grid place-items-center w-10 h-10 rounded-[11px] shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(214,66,255,.18), rgba(141,67,255,.18))",
                    border: "1px solid rgba(214,66,255,.3)",
                  }}
                >
                  <Flame size={18} className="text-[#e07cff]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-[20px] font-semibold leading-none text-[#f2f6ff] tracking-[-0.3px]">
                      {sectionTitle}
                    </h2>
                    {!initialLoading && (
                      <span
                        className="text-[11px] font-medium px-2.5 py-[4px] rounded-full text-[#9cb4d4]"
                        style={{
                          background: "rgba(255,255,255,.05)",
                          border: "1px solid rgba(255,255,255,.08)",
                        }}
                      >
                        {templates.length}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[12.5px] text-[#7d90ac] mt-1.5"
                    style={{
                      opacity: refetching ? 0.55 : 1,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    {initialLoading
                      ? "Loading templates..."
                      : "Browse templates in this category."}
                  </p>
                </div>
              </div>

              <button className="group flex items-center gap-1 text-[13px] font-medium text-[#9db4d4] hover:text-white transition-colors shrink-0">
                <span className="relative">
                  View All
                  <span className="absolute left-0 -bottom-[3px] h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                </span>
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
                />
              </button>
            </div>

            {/* ============================================================
                TEMPLATE GRID
                ============================================================ */}
            {!initialLoading && templates.length === 0 ? (
              <div
                className="rounded-[16px] p-12 text-center flex flex-col items-center gap-3"
                style={{
                  border: "1px solid rgba(255,255,255,.07)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,.025), rgba(255,255,255,0))",
                }}
              >
                <div
                  className="grid place-items-center w-14 h-14 rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(123,47,247,.18), rgba(52,131,255,.18))",
                    border: "1px solid rgba(150,120,255,.3)",
                  }}
                >
                  <Search size={22} className="text-[#a98bff]" />
                </div>
                <p className="text-[15px] font-medium text-[#dbe6f7]">
                  No templates found
                </p>
                <p className="text-[13px] text-[#7d90ac] max-w-[380px] leading-[1.6]">
                  Try a different category or search term to find what you're
                  looking for.
                </p>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                style={{
                  opacity: refetching ? 0.55 : 1,
                  minHeight: initialLoading ? 260 : "auto",
                  transition: "opacity 0.3s ease",
                }}
              >
                {initialLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={`sk-${i}`}
                        className="tpl-shimmer h-[280px] rounded-[16px]"
                        style={{
                          background:
                            "linear-gradient(180deg, #07182f, #04101f 65%)",
                          border: "1px solid rgba(255,255,255,.06)",
                        }}
                      />
                    ))
                  : templates.map((t, i) => (
                      <TemplateCard
                        key={t.id}
                        template={t}
                        onUse={handleUseTemplate}
                        index={i}
                      />
                    ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}