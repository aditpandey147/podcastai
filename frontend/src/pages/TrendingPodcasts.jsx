// frontend/src/pages/TrendingPodcasts.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Loader2,
  Sparkles,
  X,
  TrendingUp,
  Star,
  Headphones,
  Award,
  Zap,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import bannerBg from "../assets/images/tranding-banner-bg.png";
import youtubeLogo from "../assets/images/platforms/youtube.svg";
import spotifyLogo from "../assets/images/platforms/spotify.svg";
import applePodcastsLogo from "../assets/images/platforms/apple-podcasts.svg";
import amazonMusicLogo from "../assets/images/platforms/amazon-music.png";
import googlePodcastsLogo from "../assets/images/platforms/google-podcasts.png";

// ================================================================
// CONSTANTS
// ================================================================
const TRENDING_STORAGE_KEY = "podcastai_trending";
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
const TOKEN_KEY = "token";

const PLATFORMS = [
  { name: "YouTube", logo: youtubeLogo, color: "#ff0033" },
  { name: "Spotify", logo: spotifyLogo, color: "#1db954" },
  { name: "Apple Podcasts", logo: applePodcastsLogo, color: "#a855f7" },
  { name: "Amazon Music", logo: amazonMusicLogo, color: "#25d1da" },
  { name: "Google Podcasts", logo: googlePodcastsLogo, color: "#4285f4" },
];

const getPlatform = (name) => PLATFORMS.find((p) => p.name === name);

const CATEGORIES = [
  "All",
  "Business",
  "Technology",
  "Comedy",
  "Health",
  "True Crime",
  "News",
  "Sports",
  "Education",
  "Lifestyle",
  "Self Help",
];

// ================================================================
// CARD STYLES — used repeatedly
// ================================================================
const panelClass =
  "rounded-[14px] border border-[#12436f] overflow-hidden bg-gradient-to-b from-[rgba(6,29,58,.85)] to-[rgba(4,22,43,.95)]";
const panelHeaderClass =
  "px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b border-[#0e2c4d]";

// ================================================================
// ROW COMPONENT
// ================================================================
function PodcastRow({ p, index }) {
  const platform = getPlatform(p.platform);
  const platformColor = platform?.color || "#6c36ed";

  const growthNum = parseFloat(String(p.growth).replace(/[^\d.-]/g, "")) || 0;
  const trendScore = Math.min(
    100,
    Math.round(
      (Number(p.rating) / 5) * 50 +
        Math.min(Math.abs(growthNum) * 2, 30) +
        (13 - p.rank) * 1.5
    )
  );

  const ringSize = 52;
  const stroke = 4.5;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (trendScore / 100) * circumference;

  const isTop = index < 3;
  const rankBg =
    index === 0
      ? "linear-gradient(135deg,#ffe99a,#b77b0b)"
      : index === 1
        ? "linear-gradient(135deg,#e2e8f0,#94a3b8)"
        : index === 2
          ? "linear-gradient(135deg,#ffb27a,#b45309)"
          : "linear-gradient(135deg,#1e3a5f,#0e2240)";

  return (
    <article
      className="rounded-[14px] p-3 md:p-4 grid gap-4 items-center relative overflow-hidden transition-all duration-200 hover:translate-x-[3px] hover:border-[#2976bb] hover:shadow-[0_12px_32px_rgba(0,0,0,.5)] border border-[#12436f] bg-gradient-to-br from-[rgba(6,29,58,.85)] to-[rgba(4,22,43,.95)]"
      style={{ gridTemplateColumns: "56px 1fr 320px 72px" }}
    >
      {/* RANK BADGE */}
      <div className="flex items-center justify-center shrink-0">
        <div
          className="w-[46px] h-[46px] rounded-xl grid place-items-center font-bold text-base shadow-lg"
          style={{
            background: rankBg,
            color: isTop ? "#1a1200" : "#cbd8ec",
            border: isTop
              ? "1px solid rgba(255,255,255,.35)"
              : "1px solid #2c5b82",
          }}
        >
          {isTop ? <Award size={20} strokeWidth={2.4} /> : <span>{p.rank}</span>}
        </div>
      </div>

      {/* INFO */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-[15px] md:text-base font-semibold text-[#eaf1ff] truncate">
            {p.title}
          </h3>
          {isTop && (
            <span
              className="text-[9px] px-2 py-[3px] rounded-full font-bold whitespace-nowrap"
              style={{ background: rankBg, color: "#1a1200" }}
            >
              #{p.rank} TRENDING
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 text-[11px] text-[#91a9c8] flex-wrap">
          <span className="flex items-center gap-1.5">
            <Headphones size={11} />
            {p.host}
          </span>
          <span className="text-[#4a5f7a]">•</span>
          <span
            className="flex items-center gap-1.5 px-2 py-[2px] rounded-full"
            style={{
              background: `${platformColor}22`,
              border: `1px solid ${platformColor}55`,
              color: platformColor,
            }}
          >
            {platform?.logo && (
              <img
                src={platform.logo}
                alt={p.platform}
                className="w-[11px] h-[11px] object-contain"
              />
            )}
            {p.platform}
          </span>
          <span className="text-[#4a5f7a]">•</span>
          <span className="text-[#a98bff]">{p.category}</span>
        </div>

        {p.description && (
          <p className="text-[11.5px] text-[#8fa0ba] mt-2 leading-[1.5]">
            {p.description}
          </p>
        )}

        {p.tags && p.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {p.tags.map((t) => (
              <span
                key={t}
                className="rounded-full px-2 py-[3px] text-[9px] bg-[#102b55] border border-[#214c80] text-[#cbd8ec]"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* STATS */}
      <div className="flex items-center gap-4 justify-start md:justify-center">
        <div className="text-center">
          <div className="flex items-center gap-1 text-sm font-bold text-[#eaf1ff]">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            {Number(p.rating).toFixed(1)}
          </div>
          <div className="text-[9px] text-[#7d90ac] mt-0.5 uppercase tracking-wider">
            Rating
          </div>
        </div>

        <div className="w-px h-8 bg-[#12304f]" />

        <div className="text-center">
          <div className="text-sm font-bold text-[#eaf1ff]">{p.listeners}</div>
          <div className="text-[9px] text-[#7d90ac] mt-0.5 uppercase tracking-wider">
            Listeners
          </div>
        </div>

        <div className="w-px h-8 bg-[#12304f]" />

        <div className="text-center">
          <div
            className="flex items-center gap-1 text-sm font-bold"
            style={{ color: growthNum >= 0 ? "#4ef0ae" : "#f87171" }}
          >
            <TrendingUp size={12} />
            {p.growth}
          </div>
          <div className="text-[9px] text-[#7d90ac] mt-0.5 uppercase tracking-wider">
            Growth
          </div>
        </div>
      </div>

      {/* CIRCULAR PROGRESS */}
      <div className="flex flex-col items-center justify-center">
        <svg
          width={ringSize}
          height={ringSize}
          style={{ transform: "rotate(-90deg)", overflow: "visible" }}
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="#0d2a4a"
            strokeWidth={stroke}
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke={`url(#trendGrad${index})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
          />
          <defs>
            <linearGradient
              id={`trendGrad${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#6c36ed" />
              <stop offset="50%" stopColor="#7855ff" />
              <stop offset="100%" stopColor="#3477ff" />
            </linearGradient>
          </defs>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(90 ${ringSize / 2} ${ringSize / 2})`}
            fill="#eaf1ff"
            fontSize="13"
            fontWeight="700"
          >
            {trendScore}
          </text>
        </svg>
        <div className="text-[8px] text-[#7d90ac] mt-1 uppercase tracking-wider font-semibold">
          Trend
        </div>
      </div>
    </article>
  );
}

// ================================================================
// STICKY RIGHT PANEL
// ================================================================
function StickyPanel({ podcasts, filtered, onNavigate }) {
  const total = podcasts.length;

  const avgRating =
    total > 0
      ? (
          podcasts.reduce((s, p) => s + (Number(p.rating) || 0), 0) / total
        ).toFixed(2)
      : "—";

  const totalListeners = podcasts.reduce((sum, p) => {
    const raw = String(p.listeners || "").toUpperCase();
    const num = parseFloat(raw) || 0;
    if (raw.includes("M")) return sum + num * 1_000_000;
    if (raw.includes("K")) return sum + num * 1_000;
    return sum + num;
  }, 0);

  const formatListeners = (n) => {
    if (n === 0) return "—";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(Math.round(n));
  };

  const topThree = [...podcasts].sort((a, b) => a.rank - b.rank).slice(0, 3);

  const platformCounts = {};
  podcasts.forEach((p) => {
    if (p.platform)
      platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1;
  });
  const platformList = Object.entries(platformCounts).sort(
    (a, b) => b[1] - a[1]
  );

  const catCounts = {};
  podcasts.forEach((p) => {
    if (p.category) catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  });
  const catList = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const fastestGrowing = [...podcasts]
    .sort((a, b) => {
      const ga = parseFloat(String(a.growth).replace(/[^\d.-]/g, "")) || 0;
      const gb = parseFloat(String(b.growth).replace(/[^\d.-]/g, "")) || 0;
      return gb - ga;
    })
    .slice(0, 3);

  const rankBg = (i) =>
    i === 0
      ? "linear-gradient(135deg,#ffe99a,#b77b0b)"
      : i === 1
        ? "linear-gradient(135deg,#e2e8f0,#94a3b8)"
        : "linear-gradient(135deg,#ffb27a,#b45309)";

  return (
    <aside className="sticky top-4 overflow-y-auto flex flex-col gap-3.5 pr-1">
      {/* SNAPSHOT */}
      <div className={panelClass}>
        <div className={panelHeaderClass}>
          <div className="text-[13px] font-semibold text-[#eaf1ff] flex items-center gap-2">
            <Zap size={13} className="text-[#a98bff]" />
            Snapshot
          </div>
          <span className="text-[9px] px-2 py-[3px] rounded-full font-semibold border border-[rgba(201,181,255,.35)] bg-[rgba(201,181,255,.08)] text-[#c9b5ff]">
            Live
          </span>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between py-2 border-b border-[#0e2c4d]">
            <span className="text-[11px] text-[#8fa0ba] flex items-center gap-2">
              <TrendingUp size={12} className="text-[#7dc4ff]" />
              Total Trending
            </span>
            <span className="text-[13px] font-bold text-[#eaf1ff]">
              {total || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#0e2c4d]">
            <span className="text-[11px] text-[#8fa0ba] flex items-center gap-2">
              <Star size={12} className="text-amber-400" />
              Avg Rating
            </span>
            <span className="text-[13px] font-bold text-[#eaf1ff]">
              {avgRating}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#0e2c4d]">
            <span className="text-[11px] text-[#8fa0ba] flex items-center gap-2">
              <Headphones size={12} className="text-[#4ef0ae]" />
              Combined Listeners
            </span>
            <span className="text-[13px] font-bold text-[#eaf1ff]">
              {formatListeners(totalListeners)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[11px] text-[#8fa0ba] flex items-center gap-2">
              <Sparkles size={12} className="text-[#c9b5ff]" />
              Showing
            </span>
            <span className="text-[13px] font-bold text-[#eaf1ff]">
              {filtered.length}/{total || 0}
            </span>
          </div>
        </div>
      </div>

      {/* TOP 3 */}
      {topThree.length > 0 && (
        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <div className="text-[13px] font-semibold text-[#eaf1ff] flex items-center gap-2">
              <Award size={13} className="text-amber-400" />
              Top 3 This Week
            </div>
          </div>
          <div className="px-4 py-3">
            {topThree.map((p, i) => (
              <div
                key={p.rank}
                className="flex items-center gap-2.5 py-2 border-b border-[#0e2c4d] last:border-b-0"
              >
                <span
                  className="w-[26px] h-[26px] rounded-lg grid place-items-center font-bold text-[11px] flex-shrink-0"
                  style={{
                    background: rankBg(i),
                    color: "#1a1200",
                    border: "1px solid rgba(255,255,255,.35)",
                  }}
                >
                  #{p.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] text-[#eaf1ff] font-medium leading-tight line-clamp-2">
                    {p.title}
                  </div>
                  <div className="text-[9.5px] text-[#7d90ac] mt-0.5">
                    {p.host} • {p.platform}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FASTEST GROWING */}
      {fastestGrowing.length > 0 && (
        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <div className="text-[13px] font-semibold text-[#eaf1ff] flex items-center gap-2">
              <TrendingUp size={13} className="text-[#4ef0ae]" />
              Fastest Growing
            </div>
          </div>
          <div className="px-4 py-3">
            {fastestGrowing.map((p) => (
              <div
                key={p.rank}
                className="flex items-center gap-2.5 py-2 border-b border-[#0e2c4d] last:border-b-0"
              >
                <span
                  className="w-[26px] h-[26px] rounded-lg grid place-items-center font-bold text-[11px] flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(78,240,174,.25),rgba(78,240,174,.05))",
                    color: "#4ef0ae",
                    border: "1px solid rgba(78,240,174,.4)",
                  }}
                >
                  ↗
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] text-[#eaf1ff] font-medium leading-tight line-clamp-2">
                    {p.title}
                  </div>
                  <div className="text-[9.5px] text-[#7d90ac] mt-0.5">
                    {p.growth} • {p.platform}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PLATFORMS */}
      {platformList.length > 0 && (
        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <div className="text-[13px] font-semibold text-[#eaf1ff] flex items-center gap-2">
              <Headphones size={13} className="text-[#7dc4ff]" />
              Platforms
            </div>
          </div>
          <div className="px-4 py-3">
            {platformList.map(([name, count]) => {
              const meta = getPlatform(name);
              const color = meta?.color || "#6c36ed";
              const pct = Math.round((count / total) * 100);
              return (
                <div key={name} className="flex items-center gap-2.5 py-1.5">
                  <span
                    className="w-[30px] h-[30px] rounded-lg grid place-items-center flex-shrink-0"
                    style={{
                      background: `${color}22`,
                      border: `1px solid ${color}55`,
                    }}
                  >
                    {meta?.logo && (
                      <img
                        src={meta.logo}
                        alt={name}
                        className="w-[15px] h-[15px] object-contain"
                      />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#eaf1ff] font-medium truncate">
                      {name}
                    </div>
                    <div className="h-1 rounded-full mt-1.5 overflow-hidden bg-[#0d2a4a]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-[12px] font-bold text-[#eaf1ff]">
                      {count}
                    </div>
                    <div className="text-[10px] text-[#7d90ac]">{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CATEGORIES */}
      {catList.length > 0 && (
        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <div className="text-[13px] font-semibold text-[#eaf1ff] flex items-center gap-2">
              <Sparkles size={13} className="text-[#c9b5ff]" />
              Categories
            </div>
          </div>
          <div className="px-4 py-3">
            {catList.map(([name, count]) => (
              <div
                key={name}
                className="flex items-center justify-between py-2 border-b border-[#0e2c4d] last:border-b-0"
              >
                <span className="text-[11px] text-[#8fa0ba]">• {name}</span>
                <span className="text-[9px] px-2 py-[3px] rounded-full font-semibold border border-[rgba(125,196,255,.35)] bg-[rgba(125,196,255,.08)] text-[#7dc4ff]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-[14px] p-4 relative overflow-hidden bg-gradient-to-br from-[#12104f] via-[#3d20a9] to-[#088fe8] border border-[#724fff] shadow-[0_0_30px_rgba(67,44,255,.2)]">
        <div className="text-2xl leading-none">〽</div>
        <div className="mt-3 text-xs font-semibold text-white">
          Want to create a trending podcast?
        </div>
        <p className="mt-1.5 text-[10px] leading-[1.5] text-blue-100/80">
          Use our AI to find your own podcast with trending topics.
        </p>
        <button
          onClick={() => onNavigate && onNavigate("/create-podcast")}
          className="mt-3 w-full h-8 rounded-full bg-gradient-to-r from-[#6540f4] to-[#12a3ee] text-[10px] font-semibold text-white hover:brightness-110 transition"
        >
          Create Podcast →
        </button>
      </div>

      {/* EMPTY */}
      {total === 0 && (
        <div className={panelClass}>
          <div className="text-center py-6 px-4">
            <Sparkles size={20} className="text-[#a98bff] mx-auto mb-2" />
            <p className="text-xs text-[#8fa0ba]">
              Find podcasts to see live stats here.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

// ================================================================
// PAGE
// ================================================================
export default function TrendingPodcasts() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState("All");

  const [topicInput, setTopicInput] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [podcasts, setPodcasts] = useState([]);

  const esRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TRENDING_STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.podcasts)) {
          setPodcasts(data.podcasts);
          setCurrentTopic(data.topic || "");
          setTopicInput(data.topic || "");
        }
      }
    } catch (err) {
      console.error("Failed to load saved trending:", err);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, []);

  const filtered = useMemo(() => {
    return podcasts.filter((p) => {
      if (activeCat === "All") return true;
      return (
        p.category === activeCat ||
        p.category === `${activeCat} & AI` ||
        p.category?.toLowerCase().includes(activeCat.toLowerCase())
      );
    });
  }, [podcasts, activeCat]);

  const handleGenerate = () => {
    const topic = topicInput.trim();
    if (!topic) {
      toast.error("Enter a topic first");
      return;
    }

    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    setGenerating(true);
    setCurrentTopic(topic);
    setPodcasts([]);

    const token = localStorage.getItem(TOKEN_KEY) || "";
    const url =
      `${SERVER_URL}/api/ai/trending-stream` +
      `?topic=${encodeURIComponent(topic)}` +
      `&token=${encodeURIComponent(token)}`;

    let es;
    try {
      es = new EventSource(url);
    } catch (err) {
      console.error("EventSource failed:", err);
      toast.error("Failed to connect to server");
      setGenerating(false);
      return;
    }

    esRef.current = es;
    let received = false;

    es.addEventListener("podcasts", (e) => {
      try {
        const data = JSON.parse(e.data);
        const list = data.podcasts || [];
        setPodcasts(list);
        received = true;
        toast.success(`Found ${list.length} trending podcasts`);
      } catch (err) {
        console.error("parse podcasts:", err);
      }
    });

    es.addEventListener("done", () => {
      es.close();
      esRef.current = null;
      setGenerating(false);

      setPodcasts((current) => {
        if (current.length > 0) {
          try {
            localStorage.setItem(
              TRENDING_STORAGE_KEY,
              JSON.stringify({
                topic,
                podcasts: current,
                savedAt: new Date().toISOString(),
              })
            );
          } catch (err) {
            console.error("Save failed:", err);
          }
        }
        return current;
      });
    });

    es.addEventListener("error", () => {
      if (es.readyState === EventSource.CLOSED || !received) {
        es.close();
        esRef.current = null;
        setGenerating(false);
        if (!received) toast.error("Stream failed — check login and server");
      }
    });
  };

  const handleClear = () => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setTopicInput("");
    setCurrentTopic("");
    setPodcasts([]);
    setActiveCat("All");
    setGenerating(false);
    localStorage.removeItem(TRENDING_STORAGE_KEY);
  };

  return (
    <div className="flex min-h-screen bg-[#020914] text-[#eef5ff]">
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen bg-[#020814]">
        <Navbar />

        <div className="flex-1 p-3 md:p-6 overflow-y-auto">
          {/* HERO */}
          <div
            className="relative rounded-[14px] overflow-hidden mb-5 border border-[#153c6d]"
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
              <div className="inline-flex rounded-full px-3 py-1 border border-[#a84eff] bg-[#211b65] text-[10px] text-[#e0c9ff] mb-3">
                🔥 Trending Now
              </div>

              <h1 className="text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.4px] font-semibold mt-3 text-[#eef4ff]">
                Top Trending{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #b65bff, #7855ff, #338dff)",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  Podcasts
                </span>
                <br />
                Across All Platforms
              </h1>

              <p className="text-sm leading-[1.6] text-[#aebfd5] mt-4 max-w-[640px]">
                Enter any topic — our AI scans what's trending across YouTube,
                Spotify, Apple Podcasts, Amazon Music and Google Podcasts.
              </p>

              <div className="flex flex-wrap gap-2 mt-6">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.name}
                    className="rounded-full px-3 h-8 text-[10px] text-[#dbe7f7] hover:brightness-110 transition flex items-center gap-2 bg-[#061b39aa] border border-[#16518c]"
                  >
                    <img
                      src={p.logo}
                      alt={p.name}
                      className="w-4 h-4 object-contain shrink-0"
                      loading="lazy"
                    />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SEARCH PANEL */}
          <div
            className="rounded-[14px] p-4 md:p-5 mb-5 border border-[rgba(80,150,255,.25)]"
            style={{
              background:
                "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.7))",
              boxShadow:
                "0 16px 48px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.05) inset",
            }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="grid place-items-center w-8 h-8 rounded-lg shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(110,53,237,.35), rgba(52,131,255,.35))",
                  border: "1px solid rgba(150,120,255,.5)",
                }}
              >
                <Sparkles size={14} className="text-[#c9b5ff]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#eaf1ff]">
                  Find Trending Podcasts
                </div>
                <div className="text-[11px] text-[#8fa0ba] mt-0.5">
                  Type any topic — AI finds 12 trending podcasts with full
                  details.
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 h-12 px-3.5 rounded-[11px] bg-[rgba(6,34,74,.65)] border border-[rgba(23,96,160,.7)] focus-within:border-[rgba(80,150,255,.9)] focus-within:shadow-[0_0_0_3px_rgba(43,128,255,.14)] transition-all">
                <Search size={16} className="text-[#7d8fa8] shrink-0" />
                <input
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !generating) handleGenerate();
                  }}
                  placeholder="e.g. Artificial Intelligence, Crypto, Fitness…"
                  className="w-full bg-transparent outline-none text-[13px] text-white placeholder:text-[#6b7c93]"
                />
                {topicInput && (
                  <button
                    onClick={() => setTopicInput("")}
                    className="text-[#7d8fa8] hover:text-white transition shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center justify-center gap-2 text-white font-semibold transition-all hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed h-12 px-6 rounded-[11px] text-[13px] bg-gradient-to-r from-[#6c36ed] to-[#3477ff] shadow-[0_10px_24px_rgba(108,54,237,.35),0_1px_0_rgba(255,255,255,.12)_inset] shrink-0"
              >
                {generating ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Find
                  </>
                )}
              </button>
            </div>

            {currentTopic && podcasts.length > 0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-[11px] text-[#8fa0ba]">
                  Showing results for:
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[11px] text-[#c9b5ff]"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(110,53,237,.22), rgba(52,131,255,.18))",
                    border: "1px solid rgba(150,120,255,.4)",
                  }}
                >
                  <Sparkles size={10} />
                  {currentTopic}
                  <button
                    onClick={handleClear}
                    className="ml-1 hover:text-white transition"
                  >
                    <X size={11} />
                  </button>
                </span>
                <span className="text-[10.5px] text-[#7d8fa8]">
                  — {filtered.length} of {podcasts.length} shown
                </span>
              </div>
            )}
          </div>

          {/* 2-COLUMN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
            {/* LEFT */}
            <div className="min-w-0">
              {/* FILTER CHIPS */}
              {podcasts.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCat(c)}
                      className={`px-4 h-8 rounded-full text-[10px] whitespace-nowrap transition border cursor-pointer ${
                        activeCat === c
                          ? "bg-gradient-to-r from-[#7040f4] to-[#6552ff] border-[#7d7cff] text-white shadow-[0_0_20px_rgba(86,59,255,.4)]"
                          : "bg-[#06224a] border-[#12436f] text-[#cbd8ec] hover:border-[#3b7ec0]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {/* HEADER */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Zap size={16} className="text-[#a98bff]" />
                  Trending Podcasts
                </h2>
                <span className="text-[10px] text-[#7f9abd]">
                  {podcasts.length > 0 ? `${podcasts.length} results` : ""}
                </span>
              </div>

              {/* ROWS */}
              {generating && podcasts.length === 0 ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-[14px] p-4 grid gap-4 items-center border border-[#12436f] bg-gradient-to-br from-[rgba(6,29,58,.85)] to-[rgba(4,22,43,.95)]"
                      style={{ gridTemplateColumns: "56px 1fr 320px 72px" }}
                    >
                      <div className="w-[46px] h-[46px] rounded-xl bg-gradient-to-r from-[#071d38] via-[#0a2952] to-[#071d38] animate-pulse" />
                      <div className="flex flex-col gap-2">
                        <div className="h-3.5 rounded bg-gradient-to-r from-[#071d38] via-[#0a2952] to-[#071d38] animate-pulse w-3/5" />
                        <div className="h-2.5 rounded bg-gradient-to-r from-[#071d38] via-[#0a2952] to-[#071d38] animate-pulse w-2/5" />
                        <div className="h-2.5 rounded bg-gradient-to-r from-[#071d38] via-[#0a2952] to-[#071d38] animate-pulse w-4/5" />
                      </div>
                      <div className="h-8 rounded bg-gradient-to-r from-[#071d38] via-[#0a2952] to-[#071d38] animate-pulse" />
                      <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-r from-[#071d38] via-[#0a2952] to-[#071d38] animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : podcasts.length === 0 ? (
                <div className="rounded-[14px] py-14 text-center flex flex-col items-center gap-3 border border-dashed border-[rgba(80,150,255,.35)] bg-gradient-to-b from-[rgba(4,26,53,.45)] to-[rgba(3,17,38,.55)]">
                  <div
                    className="grid place-items-center w-14 h-14 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(123,47,247,.18), rgba(52,131,255,.18))",
                      border: "1px solid rgba(150,120,255,.3)",
                    }}
                  >
                    <Sparkles size={22} className="text-[#a98bff]" />
                  </div>
                  <p className="text-sm font-medium text-[#dbe6f7]">
                    No trending podcasts yet
                  </p>
                  <p className="text-xs text-[#7d90ac] max-w-[380px]">
                    Enter a topic above and click{" "}
                    <b className="text-[#c9b5ff]">Find</b> — AI will find
                    what's trending right now.
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-[14px] py-12 text-center flex flex-col items-center gap-3 border border-dashed border-[rgba(80,150,255,.35)] bg-gradient-to-b from-[rgba(4,26,53,.45)] to-[rgba(3,17,38,.55)]">
                  <Search size={22} className="text-[#a98bff]" />
                  <p className="text-sm font-medium text-[#dbe6f7]">
                    No podcasts in "{activeCat}"
                  </p>
                  <button
                    onClick={() => setActiveCat("All")}
                    className="mt-1 h-9 px-5 rounded-[10px] text-xs font-semibold text-white transition-all hover:brightness-110 bg-gradient-to-r from-[#6e35ed] to-[#3483ff]"
                  >
                    Show All
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filtered.map((p, i) => (
                    <PodcastRow key={`${p.title}-${i}`} p={p} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <StickyPanel
              podcasts={podcasts}
              filtered={filtered}
              onNavigate={navigate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
