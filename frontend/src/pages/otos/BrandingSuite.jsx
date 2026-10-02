// frontend/src/pages/BrandingSuite.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Palette,
  Sparkles,
  Loader2,
  Play,
  Check,
  Type,
  Mic,
  MessageSquare,
  PlayCircle,
  Camera,
  AtSign,
  Image,
  ListChecks,
  Copy,
  ChevronRight,
  Crown,
  Target,
  Users,
  Rocket,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import bannerBg from "../../assets/images/branding-suite-bg.png";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_URL}${cleanPath}`;
};

// ================================================================
// OPTIONS
// ================================================================
const VIBES = [
  { key: "modern", label: "Modern" },
  { key: "minimal", label: "Minimal" },
  { key: "bold", label: "Bold" },
  { key: "luxury", label: "Luxury" },
  { key: "retro", label: "Retro" },
  { key: "playful", label: "Playful" },
];

const AUDIENCES = [
  { key: "founders", label: "Founders" },
  { key: "creators", label: "Creators" },
  { key: "professionals", label: "Professionals" },
  { key: "students", label: "Students" },
];

const GOALS = [
  { key: "grow audience", label: "Grow Audience", icon: Users },
  { key: "build authority", label: "Build Authority", icon: Crown },
  { key: "monetize", label: "Monetize", icon: Target },
  { key: "community", label: "Build Community", icon: MessageSquare },
];

// ================================================================
// PAGE
// ================================================================
export default function BrandingSuite() {
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [vibe, setVibe] = useState("modern");
  const [audience, setAudience] = useState("creators");
  const [goal, setGoal] = useState("grow audience");

  const [generating, setGenerating] = useState(false);
  const [kit, setKit] = useState(null);

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

  const handleGenerate = useCallback(async () => {
    if (!selectedVideo) {
      toast.error("Select a podcast first");
      return;
    }

    setGenerating(true);
    setKit(null);

    try {
      const res = await api.post("/ai/brand-kit", {
        video: {
          title: selectedVideo.title,
          category: selectedVideo.category,
          hostLine: selectedVideo.hostLine,
          guestLine: selectedVideo.guestLine,
        },
        vibe,
        audience,
        goal,
      });

      setKit(res.data?.kit || null);
      toast.success("Brand kit ready!");
    } catch (err) {
      console.error("Brand kit failed:", err);
      toast.error("Failed to generate kit");
    } finally {
      setGenerating(false);
    }
  }, [selectedVideo, vibe, audience, goal]);

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
                <Palette size={11} />
                AI PODCAST BRANDING SUITE
              </div>

              <h1 className="text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.4px] font-semibold mt-3 text-[#eef4ff]">
                Your Brand.
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #b65bff, #7855ff, #338dff)",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  Codified by AI.
                </span>
              </h1>

              <p className="text-[14px] leading-[1.6] text-[#aebfd5] mt-4 max-w-[640px]">
                Name, tagline, colors, fonts, logo concept, voice, bios, and a
                launch checklist — a complete brand identity in 30 seconds.
              </p>

              <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full border border-[#ffcf70]/40 bg-[#ffcf70]/8">
                <Sparkles size={14} className="text-[#ffcf70]" />
                <span className="text-[12px] font-semibold text-[#ffcf70]">
                  Premium Suite · Brand Studio
                </span>
              </div>
            </div>
          </section>

          {/* STEP 1 — SELECT PODCAST */}
          <section className="mb-5">
            <StepHeader
              number={1}
              title="Select Your Podcast"
              subtitle="We'll build the brand around this show."
            />

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
              <EmptyState navigate={navigate} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[13px]">
                {videos.map((v) => (
                  <VideoCard
                    key={v.id}
                    v={v}
                    isSelected={selectedVideo?.id === v.id}
                    onSelect={() => {
                      setSelectedVideo(v);
                      setKit(null);
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* STEP 2 — SELECT VIBE */}
          <section className="mb-5">
            <StepHeader
              number={2}
              title="Brand Vibe"
              subtitle="Pick the personality of your brand."
            />

            <div className="grid grid-cols-3 md:grid-cols-6 gap-[10px]">
              {VIBES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => {
                    setVibe(v.key);
                    setKit(null);
                  }}
                  className="rounded-[10px] py-3 text-[12px] font-medium transition-all hover:-translate-y-[2px]"
                  style={{
                    background:
                      vibe === v.key
                        ? "linear-gradient(180deg, rgba(110,53,237,.25), rgba(52,131,255,.15))"
                        : "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.7))",
                    border:
                      vibe === v.key
                        ? "1.5px solid #6e35ed"
                        : "1px solid rgba(80,150,255,.25)",
                    color: vibe === v.key ? "#eaf1ff" : "#a0b0cd",
                    boxShadow:
                      vibe === v.key
                        ? "0 0 0 3px rgba(110,53,237,.25)"
                        : "none",
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </section>

          {/* STEP 3 — SELECT AUDIENCE */}
          <section className="mb-5">
            <StepHeader
              number={3}
              title="Target Audience"
              subtitle="Who are you speaking to?"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
              {AUDIENCES.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => {
                    setAudience(a.key);
                    setKit(null);
                  }}
                  className="rounded-[10px] py-3 text-[12px] font-medium transition-all hover:-translate-y-[2px]"
                  style={{
                    background:
                      audience === a.key
                        ? "linear-gradient(180deg, rgba(110,53,237,.25), rgba(52,131,255,.15))"
                        : "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.7))",
                    border:
                      audience === a.key
                        ? "1.5px solid #6e35ed"
                        : "1px solid rgba(80,150,255,.25)",
                    color: audience === a.key ? "#eaf1ff" : "#a0b0cd",
                    boxShadow:
                      audience === a.key
                        ? "0 0 0 3px rgba(110,53,237,.25)"
                        : "none",
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </section>

          {/* STEP 4 — SELECT GOAL */}
          <section className="mb-5">
            <StepHeader
              number={4}
              title="Primary Goal"
              subtitle="What matters most right now?"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
              {GOALS.map((g) => {
                const Icon = g.icon;
                const isSelected = goal === g.key;
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => {
                      setGoal(g.key);
                      setKit(null);
                    }}
                    className="rounded-[12px] p-3 flex items-center gap-2.5 transition-all hover:-translate-y-[2px] text-left"
                    style={{
                      background: isSelected
                        ? "linear-gradient(180deg, rgba(110,53,237,.25), rgba(52,131,255,.15))"
                        : "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.7))",
                      border: isSelected
                        ? "1.5px solid #6e35ed"
                        : "1px solid rgba(80,150,255,.25)",
                      boxShadow: isSelected
                        ? "0 0 0 3px rgba(110,53,237,.25)"
                        : "none",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-[9px] grid place-items-center shrink-0"
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
                        size={15}
                        style={{ color: isSelected ? "#fff" : "#c9b5ff" }}
                      />
                    </div>
                    <span
                      className="text-[12px] font-medium flex-1"
                      style={{ color: isSelected ? "#eaf1ff" : "#a0b0cd" }}
                    >
                      {g.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* GENERATE BUTTON */}
          <section className="mb-6">
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
                  Building your brand…
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate Brand Kit
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </section>

          {/* ============================================================
              RESULTS — 8 SECTIONS
              ============================================================ */}
          {kit && (
            <div className="space-y-5">
              {/* 1. IDENTITY */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div
                  className="rounded-[14px] p-6"
                  style={{
                    background:
                      "radial-gradient(circle at 100% 0%, rgba(110,53,237,.2), transparent 60%), linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
                    border: "1px solid rgba(150,120,255,.35)",
                  }}
                >
                  <div className="text-[10.5px] font-semibold tracking-[1px] text-[#a080ff] mb-2">
                    BRAND NAME
                  </div>
                  <div className="text-[26px] md:text-[30px] font-bold text-[#eaf1ff] leading-tight">
                    {kit.identity.name}
                  </div>

                  <div className="text-[10.5px] font-semibold tracking-[1px] text-[#a080ff] mt-5 mb-2">
                    TAGLINE
                  </div>
                  <div
                    className="text-[16px] font-semibold bg-clip-text text-transparent leading-snug"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #b65bff, #338dff)",
                      WebkitBackgroundClip: "text",
                    }}
                  >
                    {kit.identity.tagline}
                  </div>
                </div>

                <div
                  className="rounded-[14px] p-6"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
                    border: "1px solid rgba(80,150,255,.25)",
                  }}
                >
                  <SectionLabel
                    icon={Mic}
                    label="Elevator Pitch"
                    onCopy={() => handleCopy(kit.identity.pitch, "Pitch")}
                  />
                  <p className="text-[13.5px] leading-[1.65] text-[#c9d5e8] mb-4">
                    {kit.identity.pitch}
                  </p>

                  <SectionLabel icon={Rocket} label="Mission" />
                  <p className="text-[13px] leading-[1.6] text-[#c9d5e8] italic">
                    "{kit.identity.mission}"
                  </p>
                </div>
              </section>

              {/* 2. COLOR PALETTE */}
              <section
                className="rounded-[14px] p-5"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
                  border: "1px solid rgba(80,150,255,.25)",
                }}
              >
                <SectionLabel icon={Palette} label="Color Palette" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
                  {[
                    { name: "Primary", hex: kit.palette.primary },
                    { name: "Secondary", hex: kit.palette.secondary },
                    { name: "Background", hex: kit.palette.background },
                    { name: "Text", hex: kit.palette.text },
                    { name: "Highlight", hex: kit.palette.highlight },
                  ].map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleCopy(c.hex, c.name)}
                      className="rounded-[10px] overflow-hidden transition-all hover:-translate-y-[2px] text-left"
                      style={{
                        border: "1px solid rgba(80,150,255,.25)",
                      }}
                    >
                      <div
                        style={{
                          background: c.hex,
                          height: 80,
                          borderBottom: "1px solid rgba(255,255,255,.08)",
                        }}
                      />
                      <div className="p-2.5" style={{ background: "#04101f" }}>
                        <div className="text-[10.5px] font-semibold text-[#8fa0ba]">
                          {c.name.toUpperCase()}
                        </div>
                        <div className="text-[11.5px] font-mono text-[#eaf1ff] mt-1">
                          {c.hex}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {kit.palette.rationale && (
                  <p className="text-[12px] text-[#8fa0ba] italic mt-4">
                    {kit.palette.rationale}
                  </p>
                )}
              </section>

              {/* 3. TYPOGRAPHY */}
              <section
                className="rounded-[14px] p-5"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
                  border: "1px solid rgba(80,150,255,.25)",
                }}
              >
                <SectionLabel icon={Type} label="Typography System" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <TypographyCard
                    label="Heading"
                    value={kit.typography.heading}
                    sample="Build Bold"
                    size={28}
                    weight={700}
                    accent="#b65bff"
                  />
                  <TypographyCard
                    label="Body"
                    value={kit.typography.body}
                    sample="Body text stays readable at any size."
                    size={14}
                    weight={400}
                    accent="#6ddcff"
                  />
                  <TypographyCard
                    label="Accent"
                    value={kit.typography.accent}
                    sample="Quote pull"
                    size={22}
                    weight={500}
                    italic
                    accent="#ffcf70"
                  />
                </div>
                {kit.typography.usage && (
                  <p className="text-[12px] text-[#8fa0ba] italic mt-4">
                    {kit.typography.usage}
                  </p>
                )}
              </section>

              {/* 4. LOGO CONCEPT */}
              <section
                className="rounded-[14px] p-5"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
                  border: "1px solid rgba(80,150,255,.25)",
                }}
              >
                <SectionLabel
                  icon={Sparkles}
                  label="Logo Concept"
                  onCopy={() => handleCopy(kit.logo.imagePrompt, "Logo prompt")}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <MiniInfo
                    label="Style"
                    value={kit.logo.style}
                    accent="#b65bff"
                  />
                  <MiniInfo
                    label="Icon Idea"
                    value={kit.logo.iconIdea}
                    accent="#6ddcff"
                  />
                  <MiniInfo
                    label="Layout"
                    value={kit.logo.layoutNotes}
                    accent="#ffcf70"
                  />
                </div>
                <div
                  className="mt-4 rounded-[10px] p-3.5"
                  style={{
                    background: "rgba(6,20,42,.7)",
                    border: "1px dashed rgba(150,120,255,.4)",
                  }}
                >
                  <div className="text-[10.5px] font-semibold tracking-[0.4px] text-[#a080ff] mb-1.5">
                    IMAGE-GEN PROMPT
                  </div>
                  <p className="text-[12.5px] text-[#c9d5e8] leading-[1.6] font-mono">
                    {kit.logo.imagePrompt}
                  </p>
                </div>
              </section>

              {/* 5. VOICE & TONE */}
              <section
                className="rounded-[14px] p-5"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
                  border: "1px solid rgba(80,150,255,.25)",
                }}
              >
                <SectionLabel icon={MessageSquare} label="Voice & Tone" />

                <div className="flex flex-wrap gap-2 mt-4">
                  {kit.voice.toneWords.map((w, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-[11.5px] font-semibold text-[#c9b5ff]"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(110,53,237,.25), rgba(52,131,255,.15))",
                        border: "1px solid rgba(150,120,255,.5)",
                      }}
                    >
                      {w}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div
                    className="rounded-[10px] p-3.5"
                    style={{
                      background: "rgba(12,228,189,.08)",
                      border: "1px solid rgba(12,228,189,.3)",
                    }}
                  >
                    <div className="text-[10.5px] font-semibold tracking-[0.4px] text-[#0ce4bd] mb-2">
                      ✓ ALWAYS DO
                    </div>
                    <ul className="space-y-1.5">
                      {kit.voice.dos.map((d, i) => (
                        <li
                          key={i}
                          className="text-[12px] text-[#c9d5e8] flex items-start gap-2"
                        >
                          <Check
                            size={11}
                            className="text-[#0ce4bd] mt-[3px] shrink-0"
                          />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="rounded-[10px] p-3.5"
                    style={{
                      background: "rgba(255,95,126,.08)",
                      border: "1px solid rgba(255,95,126,.3)",
                    }}
                  >
                    <div className="text-[10.5px] font-semibold tracking-[0.4px] text-[#ff5f7e] mb-2">
                      ✗ NEVER DO
                    </div>
                    <ul className="space-y-1.5">
                      {kit.voice.donts.map((d, i) => (
                        <li
                          key={i}
                          className="text-[12px] text-[#c9d5e8] flex items-start gap-2"
                        >
                          <span className="text-[#ff5f7e] mt-[3px] shrink-0">
                            ✗
                          </span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {kit.voice.samples?.length > 0 && (
                  <div className="mt-4">
                    <div className="text-[10.5px] font-semibold tracking-[0.4px] text-[#8fa0ba] mb-2">
                      SAMPLE SENTENCES
                    </div>
                    <div className="space-y-2">
                      {kit.voice.samples.map((s, i) => (
                        <div
                          key={i}
                          className="rounded-[8px] p-3 text-[12.5px] text-[#eaf1ff] italic"
                          style={{
                            background: "rgba(6,20,42,.55)",
                            borderLeft: "3px solid #6e35ed",
                          }}
                        >
                          "{s}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* 6. SOCIAL BIOS */}
              <section>
                <SectionLabel
                  icon={PlayCircle}
                  label="Social Bios (Copy-Paste Ready)"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <BioCard
                    platform="YouTube"
                    icon={PlayCircle}
                    color="#FF0000"
                    text={kit.bios.youtube}
                    onCopy={() => handleCopy(kit.bios.youtube, "YouTube bio")}
                  />
                  <BioCard
                    platform="TikTok"
                    icon={MessageSquare}
                    color="#00e6e6"
                    text={kit.bios.tiktok}
                    onCopy={() => handleCopy(kit.bios.tiktok, "TikTok bio")}
                  />
                  <BioCard
                    platform="Instagram"
                    icon={Camera}
                    color="#E1306C"
                    text={kit.bios.instagram}
                    onCopy={() =>
                      handleCopy(kit.bios.instagram, "Instagram bio")
                    }
                  />
                  <BioCard
                    platform="X / Twitter"
                    icon={AtSign}
                    color="#1DA1F2"
                    text={kit.bios.twitter}
                    onCopy={() => handleCopy(kit.bios.twitter, "Twitter bio")}
                  />
                </div>
              </section>

              {/* 7. THUMBNAIL FORMULA */}
              <section
                className="rounded-[14px] p-5"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
                  border: "1px solid rgba(80,150,255,.25)",
                }}
              >
                <SectionLabel icon={Image} label="Thumbnail Formula" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <MiniInfo
                    label="Layout"
                    value={kit.thumbnail.layout}
                    accent="#b65bff"
                  />
                  <MiniInfo
                    label="Text Rules"
                    value={kit.thumbnail.textRules}
                    accent="#6ddcff"
                  />
                  <MiniInfo
                    label="Color Usage"
                    value={kit.thumbnail.colorUsage}
                    accent="#ffcf70"
                  />
                </div>
                <div
                  className="mt-4 rounded-[10px] p-3.5"
                  style={{
                    background: "rgba(6,20,42,.7)",
                    border: "1px dashed rgba(150,120,255,.4)",
                  }}
                >
                  <div className="text-[10.5px] font-semibold tracking-[0.4px] text-[#a080ff] mb-1.5">
                    REUSABLE IMAGE PROMPT
                  </div>
                  <p className="text-[12.5px] text-[#c9d5e8] leading-[1.6] font-mono">
                    {kit.thumbnail.prompt}
                  </p>
                </div>
              </section>

              {/* 8. LAUNCH CHECKLIST */}
              <section
                className="rounded-[14px] p-5"
                style={{
                  background:
                    "radial-gradient(circle at 100% 0%, rgba(12,228,189,.1), transparent 60%), linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
                  border: "1px solid rgba(12,228,189,.3)",
                }}
              >
                <SectionLabel icon={ListChecks} label="Launch Checklist" />
                <div className="space-y-2 mt-4">
                  {kit.checklist.map((task, i) => (
                    <ChecklistItem key={i} task={task} index={i} />
                  ))}
                </div>
              </section>

              {/* FINAL CTA */}
              <section
                className="relative rounded-[12px] overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5"
                style={{
                  background:
                    "radial-gradient(ellipse at 65% 100%, rgba(255,180,80,.35), transparent 45%), linear-gradient(90deg, #1a1140, #221a54 55%, #0b1a4a)",
                  border: "1px solid #7c5ce0",
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
                  <Palette size={24} className="text-[#ffcf70]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[19px] md:text-[22px] font-semibold text-[#eaf1ff]">
                    Brand Locked In
                  </div>
                  <div className="text-[12.5px] md:text-[13px] text-[#a0b0cd] mt-1.5">
                    Now let's publish episode 1 and grow it fast.
                  </div>
                </div>

                <button
                  onClick={() => navigate("/viral-shorts-ai")}
                  className="h-[48px] px-7 rounded-[12px] text-white text-[13.5px] font-semibold shrink-0 transition-all hover:-translate-y-[1px] hover:brightness-110 flex items-center gap-2"
                  style={{
                    background: "linear-gradient(100deg, #7735ee, #2f78ff)",
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
// SMALL COMPONENTS
// ================================================================
function StepHeader({ number, title, subtitle }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div
        className="grid place-items-center w-8 h-8 rounded-full shrink-0 text-[13px] font-bold text-white"
        style={{
          background: "linear-gradient(135deg, #4e43f7, #237cff)",
          boxShadow: "0 0 16px rgba(49,95,255,.4)",
        }}
      >
        {number}
      </div>
      <div>
        <h2 className="text-[15px] font-semibold text-[#eaf1ff]">{title}</h2>
        <p className="text-[11.5px] text-[#8fa0ba] mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function VideoCard({ v, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className="rounded-[12px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-[2px]"
      style={{
        background: "linear-gradient(180deg,#06162b,#041124)",
        border: isSelected ? "1.5px solid #6e35ed" : "1px solid #17385f",
        boxShadow: isSelected
          ? "0 0 0 3px rgba(110,53,237,.25), 0 8px 24px rgba(0,0,0,.4)"
          : "0 4px 18px rgba(0,0,0,.3)",
      }}
    >
      <div className="relative bg-[#0a1a30]" style={{ height: 110 }}>
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
              background: "linear-gradient(135deg, #6e35ed, #3483ff)",
            }}
          >
            <Check size={13} />
          </span>
        )}
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
}

function EmptyState({ navigate }) {
  return (
    <div
      className="rounded-[12px] py-12 text-center"
      style={{
        background:
          "linear-gradient(180deg, rgba(4,26,53,.45), rgba(3,17,38,.55))",
        border: "1px dashed rgba(80,150,255,.35)",
      }}
    >
      <Palette size={28} className="text-[#a98bff] mx-auto mb-2" />
      <p className="text-[13px] text-[#dbe6f7]">No videos yet</p>
      <p className="text-[11.5px] text-[#7d90ac] mt-1">
        Generate a podcast video first.
      </p>
      <button
        onClick={() => navigate("/create-podcast")}
        className="mt-3 h-[36px] px-5 rounded-[10px] text-[12px] font-semibold text-white"
        style={{ background: "linear-gradient(100deg, #6e35ed, #3483ff)" }}
      >
        Create Video
      </button>
    </div>
  );
}

function SectionLabel({ icon: Icon, label, onCopy }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-[#a080ff]" />
        <span className="text-[11px] font-semibold tracking-[0.6px] text-[#a080ff]">
          {label.toUpperCase()}
        </span>
      </div>
      {onCopy && <CopyButton onCopy={onCopy} />}
    </div>
  );
}

function CopyButton({ onCopy }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button
      type="button"
      onClick={handle}
      className="h-[26px] px-2.5 rounded-[7px] text-[10.5px] font-medium flex items-center gap-1"
      style={{
        background: copied ? "rgba(12,228,189,.15)" : "rgba(80,150,255,.1)",
        border: copied
          ? "1px solid rgba(12,228,189,.4)"
          : "1px solid rgba(80,150,255,.3)",
        color: copied ? "#0ce4bd" : "#9bb4d4",
      }}
    >
      {copied ? (
        <>
          <Check size={11} /> Copied
        </>
      ) : (
        <>
          <Copy size={11} /> Copy
        </>
      )}
    </button>
  );
}

function TypographyCard({ label, value, sample, size, weight, italic, accent }) {
  return (
    <div
      className="rounded-[10px] p-3.5"
      style={{
        background: "rgba(6,20,42,.55)",
        border: `1px solid ${accent}40`,
      }}
    >
      <div
        className="text-[10px] font-semibold tracking-[0.4px] mb-2"
        style={{ color: accent }}
      >
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontSize: size,
          fontWeight: weight,
          fontStyle: italic ? "italic" : "normal",
        }}
        className="text-[#eaf1ff] truncate leading-tight"
      >
        {sample}
      </div>
      <div className="text-[11px] text-[#8fa0ba] mt-2">{value}</div>
    </div>
  );
}

function MiniInfo({ label, value, accent }) {
  return (
    <div
      className="rounded-[10px] p-3.5"
      style={{
        background: "rgba(6,20,42,.55)",
        border: `1px solid ${accent}40`,
      }}
    >
      <div
        className="text-[10px] font-semibold tracking-[0.4px] mb-1.5"
        style={{ color: accent }}
      >
        {label.toUpperCase()}
      </div>
      <p className="text-[12.5px] text-[#eaf1ff] leading-[1.5]">{value}</p>
    </div>
  );
}

function BioCard({ platform, icon: Icon, color, text, onCopy }) {
  return (
    <div
      className="rounded-[12px] p-4"
      style={{
        background:
          "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.75))",
        border: "1px solid rgba(80,150,255,.25)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-[8px] grid place-items-center"
            style={{
              background: `${color}22`,
              border: `1px solid ${color}60`,
            }}
          >
            <Icon size={13} style={{ color }} />
          </div>
          <span className="text-[11.5px] font-semibold text-[#eaf1ff]">
            {platform}
          </span>
        </div>
        <CopyButton onCopy={onCopy} />
      </div>
      <p className="text-[12.5px] text-[#c9d5e8] leading-[1.6]">{text}</p>
    </div>
  );
}

function ChecklistItem({ task, index }) {
  const [checked, setChecked] = useState(false);
  return (
    <div
      onClick={() => setChecked((c) => !c)}
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] cursor-pointer transition-all hover:bg-[rgba(12,228,189,.05)]"
      style={{
        background: checked ? "rgba(12,228,189,.06)" : "rgba(6,20,42,.5)",
        border: checked
          ? "1px solid rgba(12,228,189,.3)"
          : "1px solid rgba(80,150,255,.15)",
      }}
    >
      <div
        className="grid place-items-center w-5 h-5 rounded-[6px] shrink-0 transition-all"
        style={{
          background: checked
            ? "linear-gradient(135deg, #0ce4bd, #059c82)"
            : "rgba(6,20,42,.8)",
          border: checked
            ? "1px solid rgba(12,228,189,.5)"
            : "1px solid rgba(80,150,255,.4)",
        }}
      >
        {checked && <Check size={12} className="text-white" />}
      </div>
      <span
        className="text-[12.5px] flex-1 transition-all"
        style={{
          color: checked ? "#8fa0ba" : "#eaf1ff",
          textDecoration: checked ? "line-through" : "none",
        }}
      >
        {task}
      </span>
      <span className="text-[10px] font-mono text-[#5f7391]">#{index + 1}</span>
    </div>
  );
}