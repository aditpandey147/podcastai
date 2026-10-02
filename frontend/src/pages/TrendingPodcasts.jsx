// frontend/src/pages/TrendingPodcasts.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Sparkles, X } from "lucide-react";
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
const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
const TOKEN_KEY = "token"; // change if your app uses a different key

const PLATFORMS = [
  { name: "YouTube", logo: youtubeLogo },
  { name: "Spotify", logo: spotifyLogo },
  { name: "Apple Podcasts", logo: applePodcastsLogo },
  { name: "Amazon Music", logo: amazonMusicLogo },
  { name: "Google Podcasts", logo: googlePodcastsLogo },
];

const getPlatformLogo = (name) =>
  PLATFORMS.find((p) => p.name === name)?.logo;

const CATEGORIES = [
  "All",
  "Business",
  "Technology",
  "Health",
  "Comedy",
  "True Crime",
  "News",
  "Sports",
  "Education",
  "Lifestyle",
  "Self Help",
];

const TOPLIST = [
  { rank: "1", name: "The Joe Rogan Experience", src: "YouTube" },
  { rank: "2", name: "On Purpose with Jay Shetty", src: "Spotify" },
  { rank: "3", name: "The Daily", src: "Apple Podcasts" },
  { rank: "4", name: "Call Her Daddy", src: "Spotify" },
  { rank: "5", name: "Stuff You Should Know", src: "YouTube" },
];

const CATS_SIDE = [
  { icon: "▥", name: "Business", count: "12.4K", pct: "+12%" },
  { icon: "▤", name: "Technology & AI", count: "10.8K", pct: "+18%" },
  { icon: "♧", name: "True Crime", count: "8.9K", pct: "+11%" },
  { icon: "♜", name: "Comedy", count: "7.6K", pct: "+9%" },
  { icon: "♡", name: "Health & Fitness", count: "6.3K", pct: "+14%" },
  { icon: "▣", name: "News & Politics", count: "5.8K", pct: "+7%" },
  { icon: "▦", name: "Education", count: "4.9K", pct: "+6%" },
  { icon: "♢", name: "Lifestyle", count: "4.2K", pct: "+5%" },
];

// ================================================================
// STYLES
// ================================================================
const CSS = `
.pa-page *{box-sizing:border-box}
.pa-page{background:radial-gradient(circle at 60% 10%,#0a234022,transparent 32%),#020914;color:#eef5ff}
.pa-hero{position:relative;overflow:hidden}
.pa-orb{position:absolute;right:90px;top:10px;width:230px;height:200px;border:1px solid #398cff66;border-radius:50%;box-shadow:0 0 60px #2064ff55,inset 0 0 35px #0080ff22;pointer-events:none}
.pa-mic{position:absolute;right:170px;top:22px;width:70px;height:125px;border-radius:40px 40px 25px 25px;background:linear-gradient(100deg,#142d52,#070c1b 45%,#263b68);border:3px solid #294b83;box-shadow:0 0 28px #4a8fff66;pointer-events:none}
.pa-mic:before{content:"";position:absolute;left:9px;right:9px;top:9px;height:65px;border-radius:35px;background:repeating-linear-gradient(0deg,#0d1425 0 4px,#293d68 4px 6px)}
.pa-platform,.pa-chip,.pa-panel,.pa-card,.pa-cat{border:1px solid #12436f;background:linear-gradient(180deg,#061d3a,#04162b)}
.pa-platform{background:#061b39aa;border-color:#16518c}
.pa-chip{background:#06224a;border-radius:999px;cursor:pointer}
.pa-chip.active{background:linear-gradient(100deg,#7040f4,#6552ff);border-color:#7d7cff;box-shadow:0 0 20px #563bff66;color:#fff}
.pa-card{transition:.18s;cursor:pointer}
.pa-card:hover{transform:translateY(-2px);border-color:#2976bb;box-shadow:0 10px 28px #0008}
.pa-thumb{height:142px;border-radius:9px;overflow:hidden;position:relative;background:#0a1a30}
.pa-art-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pa-rank{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#183b5c;border:1px solid #2c5b82;font-weight:700;font-size:11px}
.pa-gold{background:linear-gradient(145deg,#ffe99a,#b77b0b);color:#291900}
.pa-purple{background:linear-gradient(145deg,#8d61ff,#4525a4)}
.pa-coral{background:linear-gradient(145deg,#ff9a84,#8d3025)}
.pa-tag{background:#102b55;border:1px solid #214c80}
.pa-cat{border-color:#123e68;cursor:pointer;transition:.18s}
.pa-cat:hover{border-color:#3175ae}
.pa-up{background:linear-gradient(150deg,#12104f,#3d20a9 52%,#088fe8);border:1px solid #724fff;box-shadow:0 0 30px #432cff33}
.pa-topic-input:focus-within{border-color:rgba(80,150,255,.9) !important;box-shadow:0 0 0 3px rgba(43,128,255,.14) !important}
.pa-skeleton{background:linear-gradient(90deg,#071d38 0%,#0a2952 50%,#071d38 100%);background-size:200% 100%;animation:pulse 1.4s ease-in-out infinite}
@keyframes pulse{0%{background-position:200% 0}100%{background-position:-200% 0}}
.pa-img-shimmer{position:absolute;inset:0;background:linear-gradient(90deg,#071d38 0%,#0a2952 50%,#071d38 100%);background-size:200% 100%;animation:pulse 1.4s ease-in-out infinite}

/* Responsive: 4 → 3 → 2 → 1 columns */
@media(max-width:1300px){.pa-gridmain{grid-template-columns:1fr!important}.pa-right{display:grid;grid-template-columns:1fr 1fr}}
@media(max-width:1150px){.pa-cards{grid-template-columns:repeat(3,1fr)!important}}
@media(max-width:800px){.pa-right{display:block}.pa-cards{grid-template-columns:repeat(2,1fr)!important}.pa-orb,.pa-mic{opacity:.3}}
@media(max-width:550px){.pa-cards{grid-template-columns:1fr!important}.pa-orb,.pa-mic{display:none}}
`;

// ================================================================
// PAGE
// ================================================================
export default function TrendingPodcasts() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState("All");
  const [selectedTpl, setSelectedTpl] = useState(null);

  const [topicInput, setTopicInput] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [podcasts, setPodcasts] = useState([]);

  const esRef = useRef(null);

  // ---- Restore last set from localStorage ----
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

  // ---- Cleanup EventSource on unmount ----
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

  // ================================================================
  // GENERATE (SSE streaming)
  // ================================================================
  const handleGenerate = () => {
    const topic = topicInput.trim();
    console.log("🚀 handleGenerate — topic:", topic);

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

    console.log("🌐 SSE URL:", url);

    let es;
    try {
      es = new EventSource(url);
    } catch (err) {
      console.error("❌ EventSource failed:", err);
      toast.error("Failed to connect to server");
      setGenerating(false);
      return;
    }

    esRef.current = es;
    let receivedPodcasts = false;

    es.onopen = () => console.log("✅ SSE opened");

    es.addEventListener("podcasts", (e) => {
      try {
        const data = JSON.parse(e.data);
        const list = data.podcasts || [];
        console.log("📦 received podcasts:", list.length);
        const enriched = list.map((p, i) => ({
          ...p,
          rankClass:
            i === 0 ? "gold" : i === 2 ? "purple" : i < 5 ? "coral" : "",
          image: null,
        }));
        setPodcasts(enriched);
        receivedPodcasts = true;
        toast.success(`Found ${enriched.length} trending podcasts`);
      } catch (err) {
        console.error("parse podcasts:", err);
      }
    });

    es.addEventListener("image", (e) => {
      try {
        const { rank, imageUrl } = JSON.parse(e.data);
        setPodcasts((prev) =>
          prev.map((p) => (p.rank === rank ? { ...p, image: imageUrl } : p))
        );
      } catch (err) {
        console.error("parse image:", err);
      }
    });

    es.addEventListener("image-error", (e) => {
      try {
        const { rank } = JSON.parse(e.data);
        console.log(`❌ image failed for rank ${rank}`);
      } catch {}
    });

    es.addEventListener("done", () => {
      console.log("✅ stream done");
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

    es.addEventListener("error", (e) => {
      console.error("❌ SSE error — readyState:", es.readyState);
      if (es.readyState === EventSource.CLOSED || !receivedPodcasts) {
        es.close();
        esRef.current = null;
        setGenerating(false);
        if (!receivedPodcasts) {
          toast.error("Stream failed — check login and server");
        }
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
    <>
      <style>{CSS}</style>

      <div className="pa-page flex min-h-screen">
        <Sidebar />

        <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen bg-[#020814]">
          <Navbar />

          <div className="flex-1 p-3 md:p-6 overflow-y-auto">
            {/* HERO */}
            <div
              className="pa-hero relative border border-[#153c6d] rounded-[10px] overflow-hidden mb-5"
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
              <div className="pa-orb" style={{ opacity: 0.5 }} />
              <div className="pa-mic" style={{ opacity: 0.55 }} />

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

                <p className="text-[14px] leading-[1.6] text-[#aebfd5] mt-4 max-w-[640px]">
                  Enter any topic — our AI scans what's trending across YouTube,
                  Spotify, Apple Podcasts, Amazon Music and Google Podcasts.
                </p>

                <div className="flex flex-wrap gap-2 mt-6">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.name}
                      className="pa-platform rounded-full px-3 h-[32px] text-[10px] text-[#dbe7f7] hover:brightness-110 transition flex items-center gap-2"
                    >
                      <img
                        src={p.logo}
                        alt={p.name}
                        className="w-[16px] h-[16px] object-contain shrink-0"
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
              className="rounded-[14px] p-4 md:p-5 mb-5"
              style={{
                background:
                  "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.7))",
                border: "1px solid rgba(80,150,255,.25)",
                boxShadow:
                  "0 16px 48px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.05) inset",
              }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="grid place-items-center w-8 h-8 rounded-[9px] shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(110,53,237,.35), rgba(52,131,255,.35))",
                    border: "1px solid rgba(150,120,255,.5)",
                  }}
                >
                  <Sparkles size={14} className="text-[#c9b5ff]" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#eaf1ff]">
                    Generate Trending Podcasts
                  </div>
                  <div className="text-[11px] text-[#8fa0ba] mt-0.5">
                    Type any topic — we'll generate 12 trending podcasts with
                    AI cover art.
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div
                  className="pa-topic-input flex-1 flex items-center gap-2 transition-all"
                  style={{
                    height: 48,
                    padding: "0 14px",
                    borderRadius: 11,
                    background: "rgba(6,34,74,.65)",
                    border: "1px solid rgba(23,96,160,.7)",
                  }}
                >
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
                      aria-label="Clear"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center justify-center gap-2 text-white font-semibold transition-all hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
                  style={{
                    height: 48,
                    padding: "0 26px",
                    borderRadius: 11,
                    fontSize: 13,
                    background: "linear-gradient(100deg, #6c36ed, #3477ff)",
                    boxShadow:
                      "0 10px 24px rgba(108,54,237,.35), 0 1px 0 rgba(255,255,255,.12) inset",
                  }}
                >
                  {generating ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Generate
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[11px]"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(110,53,237,.22), rgba(52,131,255,.18))",
                      border: "1px solid rgba(150,120,255,.4)",
                      color: "#c9b5ff",
                    }}
                  >
                    <Sparkles size={10} />
                    {currentTopic}
                    <button
                      onClick={handleClear}
                      className="ml-1 hover:text-white transition"
                      aria-label="Remove"
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

            {/* FILTER CHIPS */}
            {podcasts.length > 0 && (
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    className={`pa-chip ${
                      activeCat === c ? "active" : ""
                    } px-5 h-[34px] text-[10px] text-[#cbd8ec] whitespace-nowrap`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {/* MAIN GRID */}
            <div className="pa-gridmain grid grid-cols-[minmax(0,1fr)_315px] gap-4">
              {/* LEFT */}
              <section className="min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[17px] font-semibold">
                    🔥 Trending Podcasts
                  </h2>
                  <span className="text-[10px] text-[#7f9abd]">
                    {podcasts.length > 0 ? "AI Generated" : "Updated just now"}{" "}
                    ↻
                  </span>
                </div>

                {generating && podcasts.length === 0 ? (
                  /* Skeleton — 12 tiles (4 × 3) */
                  <div className="pa-cards grid grid-cols-4 gap-[13px]">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="pa-card rounded-[10px] p-2"
                        style={{
                          background:
                            "linear-gradient(180deg,#061d3a,#04162b)",
                          border: "1px solid #12436f",
                        }}
                      >
                        <div className="pa-thumb pa-skeleton" />
                        <div
                          className="mt-2 h-3 rounded pa-skeleton"
                          style={{ width: "80%" }}
                        />
                        <div
                          className="mt-2 h-2 rounded pa-skeleton"
                          style={{ width: "55%" }}
                        />
                        <div
                          className="mt-2 h-2 rounded pa-skeleton"
                          style={{ width: "40%" }}
                        />
                      </div>
                    ))}
                  </div>
                ) : podcasts.length === 0 ? (
                  /* Empty state */
                  <div
                    className="rounded-[12px] py-14 text-center flex flex-col items-center gap-3"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(4,26,53,.45), rgba(3,17,38,.55))",
                      border: "1px dashed rgba(80,150,255,.35)",
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
                      <Sparkles size={22} className="text-[#a98bff]" />
                    </div>
                    <p className="text-[14px] font-medium text-[#dbe6f7]">
                      No trending podcasts yet
                    </p>
                    <p className="text-[12px] text-[#7d90ac] max-w-[380px]">
                      Enter a topic above and click{" "}
                      <b className="text-[#c9b5ff]">Generate</b> — AI will find
                      what's trending and create cover art for each one.
                    </p>
                  </div>
                ) : filtered.length === 0 ? (
                  /* No match */
                  <div
                    className="rounded-[12px] py-12 text-center flex flex-col items-center gap-3"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(4,26,53,.45), rgba(3,17,38,.55))",
                      border: "1px dashed rgba(80,150,255,.35)",
                    }}
                  >
                    <Search size={22} className="text-[#a98bff]" />
                    <p className="text-[14px] font-medium text-[#dbe6f7]">
                      No podcasts in "{activeCat}"
                    </p>
                    <button
                      onClick={() => setActiveCat("All")}
                      className="mt-1 h-[36px] px-5 rounded-[10px] text-[12px] font-semibold text-white transition-all hover:brightness-110"
                      style={{
                        background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                      }}
                    >
                      Show All
                    </button>
                  </div>
                ) : (
                  /* Cards grid — 4 per row × 3 rows = 12 */
                  <div className="pa-cards grid grid-cols-4 gap-[13px]">
                    {filtered.map((p, i) => (
                      <PodcastCard
                        key={`${p.title}-${i}`}
                        p={p}
                        selected={selectedTpl === p.rank}
                        onSelect={() => {
                          setSelectedTpl(p.rank);
                          setTimeout(() => setSelectedTpl(null), 1000);
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* RIGHT */}
              <aside className="pa-right space-y-[13px] min-w-0">
                <section className="pa-panel rounded-[12px] overflow-hidden">
                  <div className="px-4 pt-4 pb-2">
                    <h2 className="text-[14px] font-semibold">
                      Top Trending on All Platforms
                    </h2>
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {["Overall", "YouTube", "Spotify", "Apple", "Amazon"].map(
                        (t, i) => (
                          <button
                            key={t}
                            className={`pa-chip ${
                              i === 0 ? "active" : ""
                            } px-3 h-7 text-[9px] text-[#cbd8ec] whitespace-nowrap`}
                          >
                            {t}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    {TOPLIST.map((t, i) => (
                      <div
                        key={t.rank}
                        className="flex items-center gap-3 px-4 py-2 border-b border-[#12304f]"
                      >
                        <span className="pa-rank text-[11px]">{t.rank}</span>
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-[#693521] to-[#102235]" />
                        <div className="flex-1 text-[9px] text-[#eaf1ff]">
                          {t.name}
                          <div className="flex items-center gap-1.5 text-[8px] text-[#a4bad5] mt-1">
                            <img
                              src={getPlatformLogo(t.src)}
                              alt={t.src}
                              className="w-[10px] h-[10px] object-contain shrink-0"
                              loading="lazy"
                            />
                            <span>{t.src}</span>
                          </div>
                        </div>
                        <b className="text-[9px] text-orange-300">
                          🔥 #{i + 1}
                        </b>
                      </div>
                    ))}
                  </div>

                  <button className="w-full h-[34px] border-t border-[#12385c] text-[9px] text-[#58b1ff]">
                    View All Top Charts →
                  </button>
                </section>

                <section className="pa-panel rounded-[12px] overflow-hidden">
                  <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <h2 className="text-[14px] font-semibold">
                      Trending Categories
                    </h2>
                    <button className="text-[9px] text-[#55adff]">
                      View All →
                    </button>
                  </div>

                  <div>
                    {CATS_SIDE.map((c) => (
                      <div
                        key={c.name}
                        className="pa-cat mx-3 my-1.5 rounded-[9px] h-12 flex items-center px-3 gap-3"
                      >
                        <span className="w-8 h-8 rounded-full bg-[#12355e] border border-[#27537d] grid place-items-center text-[12px]">
                          {c.icon}
                        </span>
                        <div className="flex-1 text-[10px] text-[#eaf1ff]">
                          {c.name}
                          <div className="text-[8px] text-[#8da6c3] mt-1">
                            {c.count} podcasts
                          </div>
                        </div>
                        <b className="text-[9px] text-[#4ef0ae]">
                          ↗ {c.pct}
                        </b>
                      </div>
                    ))}
                  </div>

                  <div className="pa-up mx-3 my-4 rounded-[12px] p-4 h-[142px] relative">
                    <div className="text-[28px]">〽</div>
                    <div className="absolute left-[67px] top-4 text-[11px] font-semibold text-white">
                      Want to create a trending podcast?
                    </div>
                    <p className="absolute left-[67px] top-9 text-[8px] leading-4 text-blue-100/80">
                      Use our AI to generate your own
                      <br />
                      podcast with trending topics.
                    </p>
                    <button
                      onClick={() => navigate("/create-podcast")}
                      className="absolute left-[67px] bottom-4 rounded-full h-[30px] px-5 bg-gradient-to-r from-[#6540f4] to-[#12a3ee] text-[9px] text-white"
                    >
                      Create Podcast →
                    </button>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ================================================================
// CARD
// ================================================================
function PodcastCard({ p, selected, onSelect }) {
  const logo = getPlatformLogo(p.platform);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [p.image]);

  return (
    <article className="pa-card rounded-[10px] p-2">
      <div className="pa-thumb">
        {(!p.image || !imgLoaded || imgError) && (
          <div className="pa-img-shimmer" />
        )}

        {p.image && !imgError && (
          <img
            src={p.image}
            alt={p.title}
            className="pa-art-img transition-opacity duration-500"
            style={{ opacity: imgLoaded ? 1 : 0 }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}

        <span
          className={`pa-rank pa-${p.rankClass || ""} absolute left-2 top-2 z-10`}
        >
          {p.rank}
        </span>

        {logo && (
          <span
            className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-[9px] px-2 py-[4px]"
            style={{
              background: "rgba(6,20,42,.85)",
              border: "1px solid rgba(80,150,255,.35)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            <img
              src={logo}
              alt={p.platform}
              className="w-[12px] h-[12px] object-contain shrink-0"
              loading="lazy"
            />
            <span className="text-[8px] font-semibold text-[#dbe7f7] whitespace-nowrap">
              {p.platform}
            </span>
          </span>
        )}
      </div>

      <h3 className="text-[11px] font-semibold mt-2 truncate text-[#eaf1ff]">
        {p.title}
      </h3>
      <p className="text-[9px] text-[#91a9c8] mt-1 truncate">{p.host}</p>
      <span className="pa-tag inline-block rounded-full px-2 py-1 text-[8px] mt-2 text-[#cbd8ec] truncate max-w-full">
        {p.category}
      </span>
      <div className="flex items-center gap-2 text-[8px] text-[#9bb2d0] mt-2">
        ◉ {p.listeners}&nbsp;&nbsp; ◇ {p.rating}&nbsp;&nbsp; ◷ 5s
      </div>
      <button
        onClick={onSelect}
        className="w-full h-[27px] mt-2 rounded-full bg-[#082c59] text-[9px] text-[#cbd8ec] hover:bg-[#0a376e] transition"
      >
        {selected ? "✓ Template Selected" : "View Template →"}
      </button>
    </article>
  );
}