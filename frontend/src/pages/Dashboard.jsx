// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import bannerBg from "../assets/images/banner-bg.png";
import { Plus, LayoutGrid, Sparkles, Images, Rocket } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SERVER_URL}${path}`;
};

// ================================================================
// STATIC DATA
// ================================================================
const quickActions = [
  {
    title: "Create New Podcast",
    sub: "Start from scratch with AI",
    icon: Plus,
  },
  {
    title: "Browse Templates",
    sub: "Explore 50+ podcast templates",
    icon: LayoutGrid,
  },
  {
    title: "Create AI Shorts",
    sub: "Turn podcasts into viral shorts",
    icon: Sparkles,
  },
  { title: "Brand Kit", sub: "Customize your brand style", icon: Images },
];

const socials = [
  { name: "YouTube", count: 22, icon: "▶", color: "text-red-500" },
  { name: "TikTok", count: 16, icon: "♪", color: "text-white" },
  { name: "Instagram", count: 8, icon: "◎", color: "text-pink-500" },
  { name: "Facebook", count: 2, icon: "f", color: "text-blue-500" },
];

// ================================================================
// CHART DATA
// ================================================================
const PLATFORM_DATA = [
  { name: "YouTube", value: 38, color: "#ff3838" },
  { name: "Spotify", value: 26, color: "#1DB954" },
  { name: "Apple", value: 18, color: "#9933CC" },
  { name: "Amazon", value: 11, color: "#25D1DA" },
  { name: "Google", value: 7, color: "#4285F4" },
];

// Line chart series — daily plays for the last 7 days
const LINE_SERIES = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  series: [
    { name: "YouTube", color: "#ff3838", data: [42, 55, 48, 68, 82, 95, 110] },
    { name: "Spotify", color: "#1DB954", data: [28, 35, 40, 52, 60, 72, 88] },
    { name: "TikTok", color: "#25f4ee", data: [18, 24, 30, 42, 55, 68, 84] },
  ],
};

// ================================================================
// ANIMATED LINE CHART
// ================================================================
function AnimatedLineChart({ title, height = 220 }) {
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const duration = 1400;
    const start = performance.now();
    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setProgress(eased);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const width = 500;
  const padL = 44;
  const padR = 18;
  const padT = 20;
  const padB = 32;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const allValues = LINE_SERIES.series.flatMap((s) => s.data);
  const maxY = Math.ceil(Math.max(...allValues) / 20) * 20;
  const labels = LINE_SERIES.labels;

  const xFor = (i) => padL + (i / (labels.length - 1)) * innerW;
  const yFor = (v) => padT + innerH - (v / maxY) * innerH;

  return (
    <div
      className="rounded-[12px] p-4 transition-all duration-300 hover:-translate-y-[2px]"
      style={{
        background:
          "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
        border: "1px solid rgba(80,150,255,.25)",
        boxShadow:
          "0 8px 24px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.05) inset",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13.5px] font-semibold text-[#eaf1ff]">{title}</h3>
        <div className="flex items-center gap-3">
          {LINE_SERIES.series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span
                className="w-[8px] h-[8px] rounded-full"
                style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }}
              />
              <span className="text-[10.5px] text-[#aebfd5]">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative w-full" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const y = padT + innerH * t;
            return (
              <line
                key={i}
                x1={padL}
                x2={width - padR}
                y1={y}
                y2={y}
                stroke="rgba(80,150,255,.1)"
                strokeDasharray="3 4"
              />
            );
          })}

          {/* Y axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const y = padT + innerH * t;
            const value = Math.round(maxY * (1 - t));
            return (
              <text
                key={i}
                x={padL - 8}
                y={y + 3}
                textAnchor="end"
                fontSize="9.5"
                fill="#7d8fa8"
              >
                {value}
              </text>
            );
          })}

          {/* X axis labels */}
          {labels.map((label, i) => (
            <text
              key={i}
              x={xFor(i)}
              y={height - 10}
              textAnchor="middle"
              fontSize="10"
              fill="#7d8fa8"
            >
              {label}
            </text>
          ))}

          {/* Series */}
          {LINE_SERIES.series.map((s, sIdx) => {
            // Build the path with progress
            const totalLen = labels.length - 1;
            const visibleLen = totalLen * progress;

            const points = [];
            for (let i = 0; i <= visibleLen; i++) {
              const x = xFor(i);
              const y = yFor(s.data[i]);
              points.push([x, y]);
            }

            // Partial last segment for smooth draw-in
            if (visibleLen < totalLen && Math.floor(visibleLen) < totalLen) {
              const i0 = Math.floor(visibleLen);
              const frac = visibleLen - i0;
              const x0 = xFor(i0);
              const y0 = yFor(s.data[i0]);
              const x1 = xFor(i0 + 1);
              const y1 = yFor(s.data[i0 + 1]);
              points.push([x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac]);
            }

            const pathD = points
              .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`)
              .join(" ");

            // Fill area under line
            const areaD =
              pathD +
              ` L ${points[points.length - 1][0]} ${padT + innerH}` +
              ` L ${points[0][0]} ${padT + innerH} Z`;

            return (
              <g key={s.name}>
                {/* Soft area fill */}
                <path
                  d={areaD}
                  fill={s.color}
                  opacity={0.08}
                  style={{ transition: "opacity .3s" }}
                />
                {/* Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={hovered === sIdx ? 3 : 2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    filter: `drop-shadow(0 0 6px ${s.color}80)`,
                    transition: "stroke-width .2s",
                  }}
                />
                {/* Points */}
                {labels.map((_, i) => {
                  if (i > visibleLen) return null;
                  const x = xFor(i);
                  const y = yFor(s.data[i]);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={hovered === sIdx ? 4.5 : 3}
                      fill="#04101f"
                      stroke={s.color}
                      strokeWidth={2}
                      style={{ transition: "r .2s" }}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer stats */}
      <div
        className="flex items-center justify-between mt-2 pt-2"
        style={{ borderTop: "1px solid rgba(80,150,255,.1)" }}
      >
        <span className="text-[10px] text-[#7d8fa8]">Last 7 days</span>
        <span className="text-[10.5px] font-semibold text-[#4ef0ae]">
          ↗ +34% this week
        </span>
      </div>
    </div>
  );
}

// ================================================================
// ANIMATED DONUT
// ================================================================
function AnimatedDonut({ data, size = 200, thickness = 24, title }) {
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [animatedValues, setAnimatedValues] = useState(data.map(() => 0));
  const rafRef = useRef(null);

  useEffect(() => {
    const duration = 1400;
    const start = performance.now();
    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setProgress(eased);
      setAnimatedValues(data.map((d) => d.value * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [data]);

  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const radius = size / 2 - thickness / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const arcs = data.map((d, i) => {
    const fraction = d.value / total;
    const arcLength = circumference * fraction * progress;
    const dash = `${arcLength} ${circumference - arcLength}`;
    const offset = -cumulative * circumference * progress;
    cumulative += fraction;
    return { ...d, dash, offset, index: i };
  });

  return (
    <div
      className="rounded-[12px] p-4 transition-all duration-300 hover:-translate-y-[2px]"
      style={{
        background:
          "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
        border: "1px solid rgba(80,150,255,.25)",
        boxShadow:
          "0 8px 24px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.05) inset",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13.5px] font-semibold text-[#eaf1ff]">{title}</h3>
        <span
          className="text-[9.5px] font-semibold tracking-[0.5px] px-2 py-[3px] rounded-full"
          style={{
            background: "rgba(110,53,237,.2)",
            border: "1px solid rgba(150,120,255,.4)",
            color: "#c9b5ff",
          }}
        >
          LIVE
        </span>
      </div>

      <div className="flex items-center gap-5 flex-wrap sm:flex-nowrap">
        {/* Donut */}
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="rgba(80,150,255,.08)"
              strokeWidth={thickness}
            />

            {arcs.map((arc) => (
              <circle
                key={arc.index}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={hovered === arc.index ? thickness + 4 : thickness}
                strokeLinecap="round"
                strokeDasharray={arc.dash}
                strokeDashoffset={arc.offset}
                style={{
                  filter:
                    hovered === arc.index
                      ? `drop-shadow(0 0 12px ${arc.color})`
                      : `drop-shadow(0 0 4px ${arc.color}40)`,
                  transition: "stroke-width .2s ease, filter .2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHovered(arc.index)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
          </svg>

          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            {hovered !== null ? (
              <div className="text-center">
                <div
                  className="text-[11px] font-semibold"
                  style={{ color: data[hovered].color }}
                >
                  {data[hovered].name}
                </div>
                <div
                  className="text-[24px] font-bold leading-tight"
                  style={{ color: "#eaf1ff" }}
                >
                  {Math.round(animatedValues[hovered])}%
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-[0.5px] text-[#7d8fa8]">
                  Total
                </div>
                <div className="text-[24px] font-bold text-[#eaf1ff] leading-tight">
                  100%
                </div>
                <div className="text-[9px] text-[#7d8fa8] mt-0.5">
                  {data.length} platforms
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {data.map((d, i) => (
            <div
              key={d.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="flex items-center gap-2.5 px-2 py-1 rounded-md cursor-pointer transition-colors"
              style={{
                background:
                  hovered === i ? "rgba(110,53,237,.12)" : "transparent",
              }}
            >
              <span
                className="w-[8px] h-[8px] rounded-full shrink-0"
                style={{ background: d.color, boxShadow: `0 0 8px ${d.color}` }}
              />
              <span className="text-[11.5px] text-[#c9d5e8] flex-1 truncate">
                {d.name}
              </span>
              <span
                className="text-[11.5px] font-semibold tabular-nums"
                style={{ color: d.color }}
              >
                {Math.round(animatedValues[i])}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// TRENDING CATEGORIES (unchanged)
// ================================================================
function TrendingCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get("/categories");
        if (!cancelled) setCategories((res.data?.data || []).slice(0, 4));
      } catch (err) {
        console.error("Failed to load categories:", err);
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section>
        <div className="flex justify-between items-center mb-[15px] h-[24px]">
          <h2 className="text-[18px] font-bold text-[#edf4ff]">
            Trending Categories
          </h2>
          <span className="text-[13px] text-[#91a9c8] cursor-pointer">
            View all →
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[12px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[160px] rounded-[9px] bg-[#0a1b36] animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section>
        <div className="flex justify-between items-center mb-[15px] h-[24px]">
          <h2 className="text-[18px] font-bold text-[#edf4ff]">
            Trending Categories
          </h2>
          <span className="text-[13px] text-[#91a9c8] cursor-pointer">
            View all →
          </span>
        </div>
        <div className="border border-[#17385f] rounded-[10px] bg-gradient-to-b from-[#06162b] to-[#041124] p-8 text-center">
          <p className="text-[13px] text-[#8198b6]">No categories yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-[15px] h-[24px]">
        <h2 className="text-[18px] font-bold text-[#edf4ff]">
          Trending Categories
        </h2>
        <span className="text-[13px] text-[#91a9c8] cursor-pointer hover:text-[#edf4ff] transition-colors">
          View all →
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[12px]">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              navigate("/templates", {
                state: { categoryId: cat.id, categorySlug: cat.slug },
              })
            }
            className="group border border-[#173d6d] rounded-[9px] overflow-hidden bg-[#061427] flex flex-col text-left transition-all duration-200 hover:border-[#6b38ed] hover:-translate-y-[2px] hover:shadow-lg"
          >
            <div className="relative h-[170px]  shrink-0 bg-[#0a1b36] overflow-hidden">
              {cat.image ? (
                <img
                  src={getImageUrl(cat.image)}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-[28px] opacity-60">
                  📁
                </div>
              )}
            </div>
            <div className="p-[11px] flex flex-col flex-1">
              <div className="text-[13px] font-semibold text-[#edf4ff] group-hover:text-[#a080ff] transition-colors leading-[1.35]">
                {cat.name}
              </div>
              {cat.description && (
                <p className="text-[11px] text-[#8198b6] mt-[6px] leading-[1.4] line-clamp-2">
                  {cat.description}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

// ================================================================
// MAIN DASHBOARD
// ================================================================
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#020713]">
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen bg-[#020713]">
        <Navbar />

        <main className="flex-1 p-3 md:p-6 overflow-y-auto">
          {/* HERO BANNER */}
          <section
            className="relative border border-[#153c6d] rounded-[10px] overflow-hidden"
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
                WELCOME BACK, {(user?.name || "ADIT").toUpperCase()}
              </div>
              <h1 className="text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.4px] font-semibold mt-3 text-[#eef4ff]">
                Create Amazing Podcasts
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #b65bff, #7855ff, #338dff)",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  with the Power of AI.
                </span>
              </h1>
              <p className="text-[14px] leading-[1.6] text-[#aebfd5] mt-4 max-w-[640px]">
                Turn your ideas into professional podcast videos in minutes.
                Choose a template, add your topic, and let AI do the magic — no
                equipment, no editing required.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <button
                  onClick={() => navigate("/create-podcast")}
                  className="h-[46px] px-6 rounded-[10px] text-white text-[13.5px] font-semibold transition-all duration-200 hover:brightness-110"
                  style={{
                    background: "linear-gradient(100deg, #6c36ed, #3477ff)",
                    boxShadow: "0 8px 24px rgba(108,54,237,.35)",
                  }}
                >
                  ＋ Create New Podcast
                </button>
                <button
                  onClick={() => navigate("/templates")}
                  className="h-[46px] px-6 rounded-[10px] text-[13.5px] transition-colors duration-200 hover:bg-[#0a2952]"
                  style={{
                    border: "1px solid #1d568e",
                    background: "#061b37",
                    color: "#dbe7f7",
                  }}
                >
                  Browse Templates
                </button>
              </div>
            </div>
          </section>

          {/* MAIN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_385px] gap-[18px] mt-[21px]">
            {/* LEFT COLUMN */}
            <div className="min-w-0">
              <TrendingCategories />

              {/* 👇 NEW — one line chart + one donut chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <AnimatedLineChart
                  title="Podcast Plays — Last 7 Days"
                  height={230}
                />
                <AnimatedDonut
                  data={PLATFORM_DATA}
                  title="Trending Podcasts — Platform Split"
                  size={180}
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <aside className="min-w-0 flex flex-col gap-4">
              <div>
                <div
                  className="hidden lg:block mb-[15px] h-[24px]"
                  aria-hidden="true"
                />
                <div className="border border-[#17385f] rounded-[10px] bg-gradient-to-b from-[#06162b] to-[#041124] p-[13px]">
                  <h3 className="text-[16px] font-bold text-[#edf4ff] mb-[13px]">
                    Quick Actions
                  </h3>
                  {quickActions.map((a, idx) => {
                    const Icon = a.icon;
                    return (
                      <div
                        key={idx}
                        className="h-[62px] rounded-[9px] bg-[#0a1b36] mb-[8px] last:mb-0 flex items-center gap-[10px] px-[10px] cursor-pointer hover:bg-[#0c2043] transition-colors"
                        onClick={() =>
                          a.title === "Create New Podcast" &&
                          navigate("/create-product")
                        }
                      >
                        <div
                          className="w-[37px] h-[37px] rounded-full grid place-items-center shrink-0"
                          style={{
                            background: "#181e63",
                            border: "1px solid #2a40ae",
                            color: "#a080ff",
                          }}
                        >
                          <Icon size={16} strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] font-medium text-[#edf4ff] truncate">
                            {a.title}
                          </div>
                          <div className="text-[10px] text-[#8096b6] mt-[5px] truncate">
                            {a.sub}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-[#17385f] rounded-[10px] bg-gradient-to-b from-[#06162b] to-[#041124] p-[16px]">
                <div className="text-[13px] text-[#edf4ff]">
                  AI Shorts Performance
                </div>
                <div className="flex items-center gap-[25px] h-[125px] mt-3">
                  <div className="relative w-[105px] h-[105px] rounded-full grid place-items-center shrink-0">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "conic-gradient(#7d3cff 0 28%, #2868ff 28%)",
                      }}
                    />
                    <div
                      className="absolute rounded-full"
                      style={{ inset: 9, background: "#041124" }}
                    />
                    <span className="relative z-[1] text-center text-[12px] text-[#edf4ff]">
                      <b className="block text-[22px]">48</b>
                      Shorts
                    </span>
                  </div>
                  <div className="grid gap-[9px] min-w-0">
                    {socials.map((s, i) => (
                      <div
                        key={i}
                        className="grid gap-[10px] text-[12px] text-[#edf4ff]"
                        style={{ gridTemplateColumns: "20px 65px 25px" }}
                      >
                        <b className={s.color}>{s.icon}</b>
                        <span>{s.name}</span>
                        <span className="text-right text-[#c9d5e8]">
                          {s.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* BOTTOM CTA */}
          <section
            className="h-[83px] mt-[16px] border border-[#5334b4] rounded-[10px] overflow-hidden flex items-center px-[24px] gap-[17px]"
            style={{
              background:
                "radial-gradient(ellipse at 65% 100%, rgba(62,57,255,.7), transparent 35%), linear-gradient(90deg, #071329, #08112b 55%, #07152d)",
            }}
          >
            <div
              className="w-[40px] h-[40px] rounded-full grid place-items-center shrink-0"
              style={{ background: "#27165e", color: "#b977ff" }}
            >
              <Rocket size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-[17px] font-semibold text-[#edf4ff]">
                You&apos;re Creating. Now Scale.
              </div>
              <div className="text-[12px] text-[#94a3b8] mt-1">
                Power users publish 10× more with unlimited runs, viral shorts,
                growth tools and branded templates.
              </div>
            </div>
            <button
              onClick={() => navigate("/upgrades")}
              className="ml-auto h-[40px] px-[22px] rounded-[12px] text-white text-[13px] font-medium shrink-0"
              style={{
                background: "linear-gradient(100deg, #7735ee, #2f78ff)",
              }}
            >
              Scale My Studio →
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
