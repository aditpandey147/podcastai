// frontend/src/pages/AIDialogue.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Clock,
  Save,
  ArrowRight,
  Loader2,
  Check,
  ChevronDown,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import toast from "react-hot-toast";
import bannerBg from "../assets/images/aidialoge-banner-bg.png";

const STORAGE_KEY = "podcastai_saved_dialogues";

// ================================================================
// GLASS DROPDOWN — animated, no clipping
// ================================================================
function GlassDropdown({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      className="relative"
      style={{ zIndex: open ? 100 : 1, isolation: "isolate" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between transition-all duration-200"
        style={{
          height: 42,
          padding: "0 14px",
          borderRadius: 10,
          border: open
            ? "1px solid rgba(80,150,255,.9)"
            : "1px solid rgba(23,96,160,.6)",
          background: "rgba(6,34,74,.55)",
          boxShadow: open ? "0 0 0 3px rgba(43,128,255,.14)" : "none",
          color: "#eaf1ff",
          fontSize: 12.5,
          cursor: "pointer",
        }}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          size={14}
          className="shrink-0"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 220ms cubic-bezier(.4,0,.2,1)",
            color: "#7d8fa8",
          }}
        />
      </button>

      <div
        style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          right: 0,
          zIndex: 999,
          borderRadius: 10,
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(6,20,42,.98), rgba(3,10,24,.98))",
          border: "1px solid rgba(80,150,255,.4)",
          boxShadow:
            "0 20px 45px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03) inset",
          maxHeight: 240,
          overflowY: "auto",
          opacity: open ? 1 : 0,
          transform: open
            ? "translateY(0) scale(1)"
            : "translateY(-8px) scale(0.98)",
          transformOrigin: "top center",
          pointerEvents: open ? "auto" : "none",
          transition:
            "opacity 200ms cubic-bezier(.4,0,.2,1), transform 220ms cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div className="py-1">
          {options.map((opt, i) => {
            const isActive = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className="w-full text-left transition-colors flex items-center justify-between"
                style={{
                  padding: "9px 14px",
                  fontSize: 12.5,
                  color: isActive ? "#eaf1ff" : "#a9b8d0",
                  background: isActive
                    ? "linear-gradient(90deg, rgba(110,53,237,.28), rgba(52,131,255,.18))"
                    : "transparent",
                  cursor: "pointer",
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0)" : "translateY(-4px)",
                  transition: `opacity 180ms ease ${i * 25}ms, transform 200ms ease ${i * 25}ms, background 150ms ease`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background =
                      "rgba(59,130,246,.14)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <span>{opt}</span>
                {isActive && <Check size={12} style={{ color: "#6fa8ff" }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// AVATARS
// ================================================================
function HostAvatar({ size = 34 }) {
  return (
    <div
      className="shrink-0 rounded-full relative overflow-hidden"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(145deg, #e7a77c, #172232)",
        border: "2px solid #71849a",
        boxShadow: "0 4px 12px rgba(0,0,0,.4)",
      }}
    >
      <span
        className="absolute rounded-full bg-[#c98f6e]"
        style={{ width: "40%", height: "40%", left: "30%", top: "18%" }}
      />
      <span
        className="absolute"
        style={{
          width: "66%",
          height: "45%",
          left: "17%",
          bottom: "-4%",
          borderRadius: "50% 50% 0 0",
          background: "#1c2836",
        }}
      />
    </div>
  );
}

function GuestAvatar({ size = 34 }) {
  return (
    <div
      className="shrink-0 rounded-full relative overflow-hidden"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(145deg, #f0a9d3, #7047c8)",
        border: "2px solid #9d55ff",
        boxShadow: "0 4px 12px rgba(157,85,255,.4)",
      }}
    >
      <span
        className="absolute rounded-full bg-[#f2b7d6]"
        style={{ width: "40%", height: "40%", left: "30%", top: "18%" }}
      />
      <span
        className="absolute"
        style={{
          width: "66%",
          height: "45%",
          left: "17%",
          bottom: "-4%",
          borderRadius: "50% 50% 0 0",
          background: "#5b3b95",
        }}
      />
    </div>
  );
}

// ================================================================
// STEP CARD
// ================================================================
function StepCard({ number, title, subtitle, optional, children }) {
  return (
    <div
      className="rounded-[12px]"
      style={{
        padding: 14,
        marginBottom: 8,
        background:
          "linear-gradient(180deg, rgba(4,26,53,.5), rgba(3,23,46,.6))",
        border: "1px solid rgba(80,150,255,.18)",
        boxShadow: "0 1px 0 rgba(255,255,255,.04) inset",
      }}
    >
      <div className="flex gap-3.5">
        <div
          className="w-[30px] h-[30px] rounded-full grid place-items-center shrink-0 text-[13px] font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #4e43f7, #237cff)",
            boxShadow:
              "0 0 16px rgba(49,95,255,.4), 0 1px 0 rgba(255,255,255,.15) inset",
          }}
        >
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-[#edf4ff]">
            {title}
            {optional && (
              <span className="ml-1.5 font-normal text-[11.5px] text-[#7d8fa8]">
                (Optional)
              </span>
            )}
          </div>
          <div className="text-[11.5px] text-[#8fa0ba] mt-0.5">{subtitle}</div>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// SPEAKER ROW
// ================================================================
function SpeakerRow({ role, text }) {
  const isHost = role === "Host";
  return (
    <div className="flex gap-2.5 items-start">
      {isHost ? <HostAvatar size={32} /> : <GuestAvatar size={32} />}
      <div className="flex-1 min-w-0">
        <div
          className="text-[10.5px] font-semibold tracking-[0.4px] mb-1"
          style={{ color: isHost ? "#6fa8ff" : "#b59aff" }}
        >
          {role.toUpperCase()}
        </div>
        <div
          className="rounded-[9px] px-3 py-2 text-[12px] leading-[1.5] text-[#e4ecf9]"
          style={
            isHost
              ? {
                  background:
                    "linear-gradient(100deg, rgba(6,38,80,.6), rgba(8,42,86,.7))",
                  border: "1px solid rgba(13,59,105,.9)",
                }
              : {
                  background:
                    "linear-gradient(100deg, rgba(23,24,106,.5), rgba(26,27,112,.6))",
                  border: "1px solid rgba(53,58,160,.7)",
                }
          }
        >
          {text}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// CONTENT BOX
// ================================================================
function ContentBox({ index, host, guest, topic, category }) {
  const [justSaved, setJustSaved] = useState(false);
  const [alreadySaved, setAlreadySaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : [];
      setAlreadySaved(
        saved.some(
          (s) =>
            s.contentIndex === index && s.host === host && s.guest === guest
        )
      );
    } catch {}
  }, [index, host, guest]);

  const handleSaveCard = () => {
    const entry = {
      contentIndex: index,
      topic,
      category,
      host,
      guest,
      savedAt: new Date().toISOString(),
    };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : [];
      const filtered = saved.filter(
        (s) =>
          !(s.contentIndex === index && s.host === host && s.guest === guest)
      );
      filtered.push(entry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      setJustSaved(true);
      setAlreadySaved(true);
      toast.success(`Content-${index} saved`);
      setTimeout(() => setJustSaved(false), 1200);
    } catch {
      toast.error("Failed to save");
    }
  };

  const isSaved = justSaved || alreadySaved;

  return (
    <div
      className="rounded-[12px] transition-all duration-300"
      style={{
        padding: 14,
        background:
          "linear-gradient(180deg, rgba(4,26,53,.5), rgba(3,17,38,.65))",
        border: isSaved
          ? "1px solid rgba(12,228,189,.5)"
          : "1px solid rgba(80,150,255,.22)",
        boxShadow: isSaved
          ? "0 8px 28px rgba(0,0,0,.35), 0 0 0 1px rgba(12,228,189,.15) inset"
          : "0 8px 28px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.04) inset",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="grid place-items-center w-[22px] h-[22px] rounded-[6px] text-[10.5px] font-bold text-white shrink-0"
            style={{
              background: "linear-gradient(135deg, #4e43f7, #237cff)",
              boxShadow: "0 0 10px rgba(49,95,255,.5)",
            }}
          >
            {index}
          </div>
          <span className="text-[12.5px] font-semibold text-[#eaf1ff] tracking-[-0.1px]">
            Content-{index}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {alreadySaved && !justSaved && (
            <span
              className="flex items-center gap-1 text-[9.5px] px-2 py-[3px] rounded-full"
              style={{
                background: "rgba(12,228,189,.15)",
                border: "1px solid rgba(12,228,189,.4)",
                color: "#0ce4bd",
              }}
            >
              <Check size={9} />
              Saved
            </span>
          )}

          <span
            className="text-[9.5px] px-2 py-[3px] rounded-full"
            style={{
              background: "rgba(16,28,96,.6)",
              border: "1px solid rgba(96,70,201,.5)",
              color: "#c9b5ff",
            }}
          >
            Host + Guest
          </span>
        </div>
      </div>

      <SpeakerRow role="Host" text={host} />

      <div
        className="my-2.5"
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(80,150,255,.3), transparent)",
        }}
      />

      <SpeakerRow role="Guest" text={guest} />

      <div
        className="flex justify-end mt-3 pt-2.5"
        style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}
      >
        <button
          type="button"
          onClick={handleSaveCard}
          className="flex items-center gap-1.5 text-[11px] font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
          style={{
            height: 28,
            padding: "0 12px",
            borderRadius: 8,
            background: isSaved
              ? "linear-gradient(100deg, #0ce4bd, #059c82)"
              : "linear-gradient(100deg, #6e35ed, #3483ff)",
            boxShadow: isSaved
              ? "0 4px 12px rgba(12,228,189,.3)"
              : "0 4px 12px rgba(58,90,255,.28)",
          }}
        >
          {justSaved ? (
            <>
              <Check size={11} />
              Saved
            </>
          ) : (
            <>
              <Save size={11} />
              Save dialogue
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ================================================================
// PLACEHOLDER BOX
// ================================================================
function PlaceholderBox({ index }) {
  return (
    <div
      className="rounded-[12px] opacity-75"
      style={{
        padding: 14,
        background:
          "linear-gradient(180deg, rgba(4,26,53,.3), rgba(3,17,38,.4))",
        border: "1px dashed rgba(80,150,255,.35)",
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="grid place-items-center w-[22px] h-[22px] rounded-[6px] text-[10.5px] font-bold text-white shrink-0"
          style={{
            background: "linear-gradient(135deg, #4e43f7, #237cff)",
            opacity: 0.55,
          }}
        >
          {index}
        </div>
        <span className="text-[12.5px] font-semibold text-[#7d90ac]">
          Content-{index}
        </span>
      </div>

      <div
        className="rounded-[9px] flex items-center gap-2 text-[11.5px] text-[#5f7391]"
        style={{
          padding: "11px 12px",
          background: "rgba(4,14,27,.35)",
          border: "1px dashed rgba(80,150,255,.3)",
        }}
      >
        <Sparkles size={12} className="text-[#6a7ea3]" />
        <span>Waiting for AI to generate…</span>
      </div>
    </div>
  );
}

// ================================================================
// PAGE
// ================================================================
export default function AIDialogue() {
  const [topic, setTopic] = useState("The Future of Artificial Intelligence");
  const [category, setCategory] = useState("Technology & AI");
  const [details, setDetails] = useState(
    "• What are the biggest opportunities and challenges?\n• How will it impact the future of work?\n• What should people be aware of?"
  );
  const [tone, setTone] = useState("Professional");
  const [style, setStyle] = useState("Conversational");
  const [generating, setGenerating] = useState(false);
  const [contents, setContents] = useState([]);
  const [generated, setGenerated] = useState(false);

  // ================================================================
  // GENERATE — sends form to backend, renders real response
  // ================================================================
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setGenerating(true);
    setGenerated(false);
    setContents([]);

    try {
      const res = await api.post("/ai/dialogue", {
        topic: topic.trim(),
        category,
        details: details.trim(),
        tone,
        style,
      });

      const data = res.data?.contents || [];

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No dialogue returned from AI");
      }

      setContents(data.slice(0, 2));
      setGenerated(true);
      toast.success("Dialogue generated!");
    } catch (err) {
      console.error("Generate failed:", err);

      // Fallback so the UI never breaks
      const fallback = [
        {
          host: "Welcome to the show! Today we're exploring an exciting topic with our guest.",
          guest:
            "Thanks for having me. I'm looking forward to this conversation — there's a lot to unpack.",
        },
        {
          host: "Let's dive into the first big question — what's really at stake here?",
          guest:
            "The biggest shift is how quickly things are evolving, and what that means for people day to day.",
        },
      ];

      setContents(fallback);
      setGenerated(true);

      toast.error(
        err.response?.data?.message ||
          "AI call failed — showing sample dialogue"
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
        background:
          "radial-gradient(circle at 65% 15%, rgba(11,40,80,.2), transparent 32%), radial-gradient(circle at 20% 80%, rgba(110,53,237,.10), transparent 40%), #020914",
        color: "#edf4ff",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          top: "10%",
          right: "5%",
          width: 380,
          height: 380,
          background:
            "radial-gradient(circle, rgba(90,140,255,.10), transparent 70%)",
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          bottom: "5%",
          left: "20%",
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle, rgba(160,100,255,.10), transparent 70%)",
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />

      <Sidebar />

      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col h-screen relative z-10">
        <Navbar />

        <main className="flex-1 px-3 md:px-5 py-4 md:py-5 overflow-y-auto">
          <div className="mx-auto">
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
                  AI DIALOGUE GENERATOR
                </div>
                <h1 className="text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.4px] font-semibold mt-3 text-[#eef4ff]">
                  Generate Natural
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #b65bff, #7855ff, #338dff)",
                      WebkitBackgroundClip: "text",
                    }}
                  >
                    Podcast Conversations.
                  </span>
                </h1>
                <p className="text-[14px] leading-[1.6] text-[#aebfd5] mt-4 max-w-[640px]">
                  Enter a topic, pick a tone, and let AI craft a natural
                  host-and-guest dialogue — ready for your podcast video.
                </p>
                <div className="flex flex-wrap gap-3 mt-7">
                  <button
                    onClick={() => {
                      const el = document.querySelector("[data-generate]");
                      if (el)
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }}
                    className="h-[46px] px-6 rounded-[10px] text-white text-[13.5px] font-semibold transition-all duration-200 hover:brightness-110"
                    style={{
                      background: "linear-gradient(100deg, #6c36ed, #3477ff)",
                      boxShadow: "0 8px 24px rgba(108,54,237,.35)",
                    }}
                  >
                    ✨ Start Generating
                  </button>
                  <button
                    onClick={() => {
                      const el = document.querySelector("[data-generate]");
                      if (el)
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }}
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

            {/* 2-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-4">
              {/* LEFT — FORM */}
              <section
                className="rounded-[14px]"
                style={{
                  padding: 12,
                  background:
                    "linear-gradient(180deg, rgba(3,23,45,.55), rgba(2,17,38,.7))",
                  border: "1px solid rgba(80,150,255,.25)",
                  boxShadow:
                    "0 16px 48px rgba(0,0,0,.4), 0 1px 0 rgba(255,255,255,.05) inset",
                }}
              >
                <div className="px-2 pt-2 pb-4 flex items-center gap-2.5">
                  <Sparkles
                    size={24}
                    className="text-[#c25bff] shrink-0"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(194,91,255,.55))",
                    }}
                  />
                  <h2 className="text-[18px] font-semibold">
                    Generate{" "}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, #9860ff, #6f62ff)",
                      }}
                    >
                      Dialogue
                    </span>
                  </h2>
                </div>

                {/* STEP 1 */}
                <StepCard
                  number={1}
                  title="Select Topic"
                  subtitle="Choose a topic for your podcast."
                >
                  <div
                    className="flex items-center transition"
                    style={{
                      height: 42,
                      padding: "0 14px",
                      borderRadius: 10,
                      background: "rgba(6,34,74,.55)",
                      border: "1px solid rgba(23,96,160,.6)",
                    }}
                  >
                    <input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value.slice(0, 200))}
                      className="w-full bg-transparent outline-none text-[12.5px] text-white placeholder:text-[#6b7c93]"
                      placeholder="e.g. The Future of AI"
                    />
                    <span className="text-[10px] text-[#7d8fa8] whitespace-nowrap ml-2">
                      {topic.length}/200
                    </span>
                  </div>
                </StepCard>

                {/* STEP 2 */}
                <StepCard
                  number={2}
                  title="Choose Category"
                  subtitle="Select the best category for your topic."
                >
                  <GlassDropdown
                    value={category}
                    onChange={setCategory}
                    options={[
                      "Technology & AI",
                      "Business & Entrepreneurship",
                      "Health & Wellness",
                      "Education & Self-Improvement",
                    ]}
                    placeholder="Pick a category"
                  />
                </StepCard>

                {/* STEP 3 */}
                <StepCard
                  number={3}
                  title="Additional Details"
                  subtitle="Add extra context to make the conversation relevant."
                  optional
                >
                  <div
                    className="p-3 transition"
                    style={{
                      borderRadius: 10,
                      background: "rgba(6,34,74,.55)",
                      border: "1px solid rgba(23,96,160,.6)",
                    }}
                  >
                    <textarea
                      value={details}
                      onChange={(e) =>
                        setDetails(e.target.value.slice(0, 500))
                      }
                      className="w-full bg-transparent outline-none resize-none text-[12px] leading-[1.5] text-white placeholder:text-[#6b7c93]"
                      style={{ height: 70 }}
                      placeholder="Any extra details?"
                    />
                    <div className="text-right text-[9.5px] text-[#7d8fa8] mt-1">
                      {details.length}/500
                    </div>
                  </div>
                </StepCard>

                {/* STEP 4 */}
                <StepCard
                  number={4}
                  title="AI Settings"
                  subtitle="Choose the tone and style."
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    <GlassDropdown
                      value={tone}
                      onChange={setTone}
                      options={["Professional", "Casual", "Educational"]}
                    />
                    <GlassDropdown
                      value={style}
                      onChange={setStyle}
                      options={["Conversational", "Interview", "Storytelling"]}
                    />
                  </div>
                </StepCard>

                {/* GENERATE */}
                <button
                  data-generate
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2.5 text-white font-semibold transition-all hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    marginTop: 4,
                    height: 52,
                    borderRadius: 12,
                    fontSize: 14,
                    background:
                      "linear-gradient(100deg, #6432f3, #235eff 55%, #08a5ee)",
                    boxShadow:
                      "0 8px 24px rgba(49,95,255,.4), 0 1px 0 rgba(255,255,255,.15) inset",
                  }}
                >
                  {generating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating Dialogue...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Dialogue
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </section>

              {/* RIGHT — OUTPUT */}
              <section
                className="rounded-[14px] flex flex-col"
                style={{
                  padding: 14,
                  background:
                    "linear-gradient(180deg, rgba(5,27,58,.6), rgba(6,23,51,.7))",
                  border: "1px solid rgba(80,150,255,.25)",
                  boxShadow:
                    "0 16px 48px rgba(0,0,0,.4), 0 1px 0 rgba(255,255,255,.05) inset",
                  minHeight: 560,
                }}
              >
                <div className="flex items-start justify-between mb-3.5 flex-wrap gap-2">
                  <div className="flex gap-2.5">
                    <Sparkles
                      size={20}
                      className="text-[#c25bff] shrink-0 mt-0.5"
                      style={{
                        filter: "drop-shadow(0 0 8px rgba(194,91,255,.55))",
                      }}
                    />
                    <div>
                      <h2 className="text-[15px] font-semibold text-[#eaf1ff]">
                        {generated ? "Generated Content" : "Content Preview"}
                      </h2>
                      <p className="text-[11.5px] text-[#8fa0ba] mt-0.5">
                        {generated
                          ? "Your AI-generated host & guest dialogue."
                          : "Click Generate to create dialogue."}
                      </p>
                    </div>
                  </div>
                  <span
                    className="flex items-center gap-1.5"
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      fontSize: 10,
                      background: generated
                        ? "rgba(16,28,96,.7)"
                        : "rgba(16,28,96,.35)",
                      border: generated
                        ? "1px solid rgba(96,70,201,.7)"
                        : "1px solid rgba(96,70,201,.3)",
                      color: generated ? "#c9b5ff" : "#8a7ad6",
                    }}
                  >
                    <Sparkles size={9} />
                    {generated ? "AI Generated" : "Not Generated"}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {!generated
                    ? [1, 2].map((i) => <PlaceholderBox key={i} index={i} />)
                    : contents.slice(0, 2).map((c, i) => (
                        <ContentBox
                          key={i}
                          index={i + 1}
                          host={c.host}
                          guest={c.guest}
                          topic={topic}
                          category={category}
                        />
                      ))}
                </div>

                <div className="mt-3.5">
                  <div
                    className="flex items-center gap-2.5"
                    style={{
                      height: 52,
                      padding: "0 14px",
                      borderRadius: 10,
                      background: "rgba(7,29,58,.7)",
                      border: "1px solid rgba(26,79,133,.7)",
                    }}
                  >
                    <Clock size={18} className="text-[#6fa8ff] shrink-0" />
                    <div>
                      <div className="text-[9.5px] text-[#7d8fa8]">
                        Estimated conversation length
                      </div>
                      <div className="text-[11.5px] text-[#eaf1ff] mt-0.5 font-medium">
                        {generated ? "~ 3–5 minutes" : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}