// frontend/src/pages/CreateProduct.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  LayoutPanelTop,
  User,
  Users,
  Check,
  Replace,
  ArrowRight,
  Loader2,
  FileText,
  Monitor,
  Smartphone,
  Wand2,
  Settings,
  Music2,
  Sparkles,
  Mic,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import toast from "react-hot-toast";
import bannerBg from "../assets/images/createvideo-banner-bg.png";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_URL}${cleanPath}`;
};

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "dramatic", label: "Dramatic" },
];

const MUSIC_OPTIONS = [
  { id: "none", label: "No Music" },
  { id: "subtle", label: "Subtle" },
  { id: "energetic", label: "Energetic" },
];

// ================================================================
// PAGE
// ================================================================
export default function CreateProduct() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    templateId,
    templateTitle = "Interrogation Room",
    templateCategory = "True Crime & Mystery",
    coverImage,
    dialog,
  } = location.state || {};

  // ---- Core form ----
  const [hostLine, setHostLine] = useState(
    dialog?.host || "Welcome to the show..."
  );
  const [guestLine, setGuestLine] = useState(
    dialog?.guest || "What really happened that night?"
  );
  const [format, setFormat] = useState("16:9");

  // ---- Additional settings ----
  const [tone, setTone] = useState("professional");
  const [music, setMusic] = useState("subtle");

  // ---- AI enhance loading ----
  const [enhancingHost, setEnhancingHost] = useState(false);
  const [enhancingGuest, setEnhancingGuest] = useState(false);

  // ---- Generation ----
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ---- Redirect guard ----
  useEffect(() => {
    if (!templateId) {
      toast.error("No template selected. Redirecting...");
      const t = setTimeout(() => navigate("/templates"), 800);
      return () => clearTimeout(t);
    }
  }, [templateId, navigate]);

  // ================================================================
  // AI ENHANCE
  // ================================================================
  const handleEnhance = async (role) => {
    const isHost = role === "host";
    const text = isHost ? hostLine : guestLine;
    const setText = isHost ? setHostLine : setGuestLine;
    const setLoading = isHost ? setEnhancingHost : setEnhancingGuest;

    if (!text.trim()) {
      toast.error(`Please write something in the ${role} box first`);
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/ai/enhance", {
        text: text.trim(),
        role,
      });

      const polished = res.data?.text || "";
      if (!polished) throw new Error("Empty response");

      setText(polished);
      toast.success(`${isHost ? "Host" : "Guest"} line enhanced!`);
    } catch (err) {
      console.error("Enhance failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to enhance. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
  // GENERATE
  // ================================================================
  const handleGenerate = async () => {
    if (!hostLine.trim() || !guestLine.trim()) {
      toast.error("Please fill in both host and guest lines");
      return;
    }
    if (!coverImage) {
      toast.error("Template has no cover image — cannot generate video");
      return;
    }

    try {
      setGenerating(true);
      setShowLoader(true);
      setStatusMsg("");

      const imageUrl = getImageUrl(coverImage);

      // Fire the request
      const res = await api.post("/video/generate", {
        imageUrl,
        hostLine: hostLine.trim(),
        guestLine: guestLine.trim(),
        tone,
        music,
        format,
        templateId,
        templateTitle,
        templateCategory,
        coverImage,
      });

      if (!res.data?.success) throw new Error("Generation failed");

      // Keep loader visible for a full 10 seconds
      setTimeout(() => {
        setShowLoader(false);
        setShowSuccess(true);
        setGenerating(false);

        // Auto redirect after showing success modal
        setTimeout(() => {
          navigate("/my-podcasts");
        }, 2500);
      }, 10000);
    } catch (err) {
      console.error("Generate failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to generate. Try again."
      );
      setShowLoader(false);
      setGenerating(false);
    }
  };

  const handleChangeTemplate = () => {
    navigate("/templates");
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
        background:
          "radial-gradient(circle at 68% 20%, rgba(8,42,91,.18), transparent 30%), linear-gradient(180deg, #020a17, #010914)",
        color: "#edf4ff",
        overflowX: "hidden",
      }}
    >
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col h-screen">
        <Navbar />

        <main className="flex-1 px-3 md:px-[18px] py-4 md:py-5 overflow-y-auto">
          <div>
            {/* ==========================================
                TOP BANNER
                ========================================== */}
            <div
              className="relative overflow-hidden rounded-[10px] border border-[#153c6d] mb-5"
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
                  AI VIDEO GENERATION
                </div>

                <h1 className="text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.4px] font-semibold mt-3 text-[#eef4ff]">
                  Create Your Podcast
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #b65bff, #7855ff, #338dff)",
                      WebkitBackgroundClip: "text",
                    }}
                  >
                    With AI in Minutes.
                  </span>
                </h1>

                <p className="text-[14px] leading-[1.6] text-[#aebfd5] mt-4 max-w-[640px]">
                  {templateTitle
                    ? `Using template: "${templateTitle}". Write your dialog and let AI generate a professional podcast video.`
                    : "Write your dialog and let AI generate a professional podcast video in minutes."}
                </p>
              </div>
            </div>

            {/* ==========================================
                2 COLUMNS
                ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
              {/* ==========================================
                  LEFT PANEL — PREVIEW
                  ========================================== */}
              <section
                className="rounded-[12px] p-4 md:p-[16px]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(4,20,40,.85), rgba(2,15,30,.88))",
                  border: "1px solid #124171",
                }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="grid place-items-center w-7 h-7 rounded-[8px] shrink-0"
                    style={{
                      background: "rgba(110,53,237,.2)",
                      border: "1px solid rgba(150,120,255,.4)",
                    }}
                  >
                    <LayoutGrid size={13} className="text-[#a080ff]" />
                  </div>
                  <div>
                    <h2 className="text-[13px] font-semibold text-[#edf4ff] leading-none">
                      Video Preview
                    </h2>
                    <p className="text-[10px] text-[#7d90ac] mt-0.5">
                      Selected template scene
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-[10px] overflow-hidden"
                  style={{
                    background: "linear-gradient(180deg, #03172f, #031326)",
                    border: "1px solid #18518c",
                  }}
                >
                  {/* Preview scene */}
                  <div
                    className="relative h-[220px] md:h-[260px] overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(180deg, #07111b, #071521 47%, #02070c)",
                    }}
                  >
                    {coverImage ? (
                      <>
                        <img
                          src={getImageUrl(coverImage)}
                          alt={templateTitle}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(2,7,12,.35) 0%, transparent 30%, transparent 70%, rgba(2,7,12,.55) 100%)",
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(90deg, rgba(0,0,0,.85), transparent 18%, transparent 80%, rgba(0,0,0,.7)), repeating-linear-gradient(90deg, rgba(66,93,119,.12) 0 2px, transparent 2px 72px)",
                          }}
                        />
                        <div
                          className="absolute"
                          style={{
                            top: 14,
                            left: "48%",
                            width: 62,
                            height: 34,
                            transform: "translateX(-50%)",
                            background:
                              "radial-gradient(ellipse, #ffe9b0 0, #ffd782 13%, #303238 15%, #0b1015 55%, transparent 56%)",
                            filter:
                              "drop-shadow(0 0 25px rgba(255,210,117,.6))",
                          }}
                        />
                        <div
                          className="absolute"
                          style={{
                            left: "50%",
                            top: 56,
                            transform: "translateX(-50%)",
                            width: 220,
                            height: 165,
                            border: "2px solid #0c2438",
                            background:
                              "linear-gradient(90deg, transparent 0 48%, rgba(42,64,93,.38) 49% 51%, transparent 52%), linear-gradient(180deg, #142536, #07111b 70%)",
                            boxShadow: "inset 0 0 50px #000",
                          }}
                        />
                        <div
                          className="absolute"
                          style={{
                            left: "50%",
                            top: 76,
                            transform: "translateX(-50%)",
                            width: 56,
                            height: 90,
                            background: "#02070b",
                            border: "1px solid #294057",
                          }}
                        />
                        <div
                          className="absolute"
                          style={{
                            bottom: -14,
                            left: "13%",
                            width: 110,
                            height: 145,
                            borderRadius: "70px 70px 15px 15px",
                            background:
                              "linear-gradient(145deg, #172b3c, #03070b 68%)",
                            boxShadow: "0 -5px 35px rgba(0,0,0,.5)",
                            transform: "rotate(9deg)",
                          }}
                        />
                        <div
                          className="absolute"
                          style={{
                            bottom: -14,
                            right: "13%",
                            width: 110,
                            height: 145,
                            borderRadius: "70px 70px 15px 15px",
                            background:
                              "linear-gradient(145deg, #172432, #02060a 70%)",
                            boxShadow: "0 -5px 35px rgba(0,0,0,.5)",
                            transform: "rotate(-9deg)",
                          }}
                        />
                        <div
                          className="absolute"
                          style={{
                            left: "-4%",
                            right: "-4%",
                            bottom: -8,
                            height: 58,
                            background:
                              "linear-gradient(180deg, #1c211f, #090b0b)",
                            borderTop: "2px solid #282d2c",
                            boxShadow: "0 -5px 30px rgba(0,0,0,.6)",
                          }}
                        />
                      </>
                    )}

                    <div
                      className="absolute right-3 top-3 z-20 flex items-center gap-1.5 px-3 h-[26px] rounded-[14px] text-[11px] font-medium text-white"
                      style={{
                        background: "linear-gradient(100deg, #4768ff, #05a4ff)",
                        boxShadow: "0 0 16px rgba(29,126,255,.35)",
                      }}
                    >
                      <Check size={12} />
                      Selected
                    </div>
                  </div>

                  {/* Info bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-3 md:px-[14px] py-3 md:py-0 md:h-[70px]">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-[38px] h-[38px] rounded-[9px] grid place-items-center shrink-0 overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(145deg, #713cff, #2c61ff)",
                          boxShadow: "0 0 14px rgba(67,60,255,.4)",
                        }}
                      >
                        {coverImage ? (
                          <img
                            src={getImageUrl(coverImage)}
                            alt={templateTitle}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <LayoutPanelTop size={18} className="text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-[12.5px] font-medium text-[#edf4ff]">
                          {templateTitle}
                        </div>
                        <div className="text-[10.5px] text-[#aebed3] mt-0.5">
                          {templateCategory}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleChangeTemplate}
                      className="h-[36px] px-4 rounded-[9px] text-[11.5px] text-[#dbe7f7] flex items-center gap-1.5 transition-colors hover:bg-[#0a2952]"
                      style={{
                        border: "1px solid #1d568e",
                        background: "#061b37",
                      }}
                    >
                      <Replace size={13} />
                      Change
                    </button>
                  </div>
                </div>

                {/* Template details */}
                <div className="mt-4 flex gap-2.5">
                  <div className="text-[#b455ff] shrink-0 mt-0.5">
                    <FileText size={15} />
                  </div>
                  <div>
                    <div className="text-[12px] font-medium text-[#edf4ff]">
                      Template Details
                    </div>
                    <p className="text-[10.5px] leading-[1.55] text-[#bdcadc] mt-1.5 max-w-[500px]">
                      A cinematic interrogation room setup with realistic
                      lighting and atmosphere, perfect for true crime and
                      mystery conversations.
                    </p>
                  </div>
                </div>
              </section>

              {/* ==========================================
                  RIGHT PANEL — FORM
                  ========================================== */}
              <section
                className="rounded-[12px] p-4 md:p-[18px] flex flex-col"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(4,20,40,.85), rgba(2,15,30,.88))",
                  border: "1px solid #124171",
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-4">
                  <LayoutPanelTop
                    size={22}
                    className="text-[#c35bff] shrink-0"
                  />
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#edf4ff]">
                      Video Dialogue
                    </h2>
                    <p className="text-[10.5px] text-[#b0bfd3] mt-0.5">
                      Write the script and configure your video.
                    </p>
                  </div>
                </div>

                {/* ================= HOST ================= */}
                <div className="flex items-center gap-2.5 mb-2">
                  <Users size={16} className="text-[#5f8eff]" />
                  <span className="text-[11.5px] font-semibold tracking-[0.5px] text-[#edf4ff]">
                    HOST
                  </span>
                </div>

                <div
                  className="w-full rounded-[10px] p-2.5"
                  style={{
                    background: "linear-gradient(180deg, #082550, #062047)",
                    border: "1px solid #1760a2",
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-[40px] h-[40px] rounded-full shrink-0 flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #d99570, #28384c)",
                        border: "2px solid #2d5b88",
                      }}
                    >
                      <User size={17} className="text-white" />
                    </div>

                    <textarea
                      value={hostLine}
                      onChange={(e) => setHostLine(e.target.value)}
                      placeholder="What does the host say?"
                      rows={3}
                      className="w-full bg-transparent outline-none resize-none text-[12.5px] text-white leading-[1.5]"
                      style={{ minHeight: 60 }}
                    />
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => handleEnhance("host")}
                      disabled={enhancingHost}
                      className="h-[30px] px-3 rounded-[8px] flex items-center gap-1.5 text-[11px] font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(100deg, #6e35ed, #3483ff)",
                        boxShadow: "0 4px 12px rgba(58,90,255,.28)",
                      }}
                      aria-label="AI enhance host line"
                    >
                      {enhancingHost ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          AI Enhance
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div
                  className="my-4"
                  style={{ height: 1, background: "#0b2949" }}
                />

                {/* ================= GUEST ================= */}
                <div className="flex items-center gap-2.5 mb-2">
                  <Users size={16} className="text-[#8d7dff]" />
                  <span className="text-[11.5px] font-semibold tracking-[0.5px] text-[#edf4ff]">
                    GUEST
                  </span>
                </div>

                <div
                  className="w-full rounded-[10px] p-2.5"
                  style={{
                    background: "linear-gradient(180deg, #082550, #062047)",
                    border: "1px solid #1760a2",
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-[40px] h-[40px] rounded-full shrink-0 flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #f0b08d, #473c4a)",
                        border: "2px solid #2d5b88",
                      }}
                    >
                      <User size={17} className="text-white" />
                    </div>

                    <textarea
                      value={guestLine}
                      onChange={(e) => setGuestLine(e.target.value)}
                      placeholder="What does the guest say?"
                      rows={3}
                      className="w-full bg-transparent outline-none resize-none text-[12.5px] text-white leading-[1.5]"
                      style={{ minHeight: 60 }}
                    />
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => handleEnhance("guest")}
                      disabled={enhancingGuest}
                      className="h-[30px] px-3 rounded-[8px] flex items-center gap-1.5 text-[11px] font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(100deg, #6e35ed, #3483ff)",
                        boxShadow: "0 4px 12px rgba(58,90,255,.28)",
                      }}
                      aria-label="AI enhance guest line"
                    >
                      {enhancingGuest ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          AI Enhance
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div
                  className="my-4"
                  style={{ height: 1, background: "#0b2949" }}
                />

                {/* ================= ADDITIONAL SETTINGS ================= */}
                <div className="flex items-center gap-2.5 mb-3">
                  <Settings size={16} className="text-[#6ddcff]" />
                  <span className="text-[13px] font-medium text-[#edf4ff]">
                    Additional Settings
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* Tone */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-[#b7c9df] mb-1.5">
                      <Mic size={12} className="text-[#b59aff]" />
                      Tone
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {TONES.map((t) => {
                        const isActive = tone === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTone(t.id)}
                            className="h-[34px] rounded-[8px] text-[11px] font-medium transition-all duration-200"
                            style={
                              isActive
                                ? {
                                    background:
                                      "linear-gradient(135deg, #241d73, #0750a5)",
                                    border: "1px solid #6d42ff",
                                    color: "#eef4ff",
                                    boxShadow: "0 0 14px rgba(51,83,255,.3)",
                                  }
                                : {
                                    background:
                                      "linear-gradient(180deg, #082452, #061b38)",
                                    border: "1px solid #1b4d84",
                                    color: "#a9b8d0",
                                  }
                            }
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Background Music */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-[#b7c9df] mb-1.5">
                      <Music2 size={12} className="text-[#ff67bf]" />
                      Background Music
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {MUSIC_OPTIONS.map((m) => {
                        const isActive = music === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMusic(m.id)}
                            className="h-[34px] rounded-[8px] text-[11px] font-medium transition-all duration-200"
                            style={
                              isActive
                                ? {
                                    background:
                                      "linear-gradient(135deg, #241d73, #0750a5)",
                                    border: "1px solid #6d42ff",
                                    color: "#eef4ff",
                                    boxShadow: "0 0 14px rgba(51,83,255,.3)",
                                  }
                                : {
                                    background:
                                      "linear-gradient(180deg, #082452, #061b38)",
                                    border: "1px solid #1b4d84",
                                    color: "#a9b8d0",
                                  }
                            }
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div
                  className="my-4"
                  style={{ height: 1, background: "#0b2949" }}
                />

                {/* ================= VIDEO FORMAT ================= */}
                <div className="flex items-center gap-2.5 mb-3">
                  <LayoutPanelTop size={17} className="text-[#bd57ff]" />
                  <span className="text-[13px] font-medium text-[#edf4ff]">
                    Video Format
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Landscape */}
                  <button
                    type="button"
                    onClick={() => setFormat("16:9")}
                    className="h-[74px] rounded-[10px] flex items-center gap-3 px-4 text-left transition-all duration-200"
                    style={
                      format === "16:9"
                        ? {
                            background:
                              "linear-gradient(135deg, #241d73, #0750a5)",
                            border: "2px solid #6d42ff",
                            boxShadow: "0 0 20px rgba(51,83,255,.35)",
                          }
                        : {
                            background:
                              "linear-gradient(180deg, #082452, #061b38)",
                            border: "1px solid #1b4d84",
                          }
                    }
                  >
                    <div
                      className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: format === "16:9" ? "#1a2158" : "#0c3170",
                      }}
                    >
                      <Monitor
                        size={17}
                        className={
                          format === "16:9"
                            ? "text-[#b59aff]"
                            : "text-[#9d64ff]"
                        }
                      />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-[#edf4ff]">
                        16:9
                      </div>
                      <div className="text-[10.5px] text-[#b5c4d9] mt-0.5">
                        Landscape
                      </div>
                    </div>
                  </button>

                  {/* Portrait */}
                  <button
                    type="button"
                    onClick={() => setFormat("9:16")}
                    className="h-[74px] rounded-[10px] flex items-center gap-3 px-4 text-left transition-all duration-200"
                    style={
                      format === "9:16"
                        ? {
                            background:
                              "linear-gradient(135deg, #241d73, #0750a5)",
                            border: "2px solid #6d42ff",
                            boxShadow: "0 0 20px rgba(51,83,255,.35)",
                          }
                        : {
                            background:
                              "linear-gradient(180deg, #082452, #061b38)",
                            border: "1px solid #1b4d84",
                          }
                    }
                  >
                    <div
                      className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: format === "9:16" ? "#1a2158" : "#0b2c5b",
                      }}
                    >
                      <Smartphone
                        size={17}
                        className={
                          format === "9:16"
                            ? "text-[#b59aff]"
                            : "text-[#9d64ff]"
                        }
                      />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-[#edf4ff]">
                        9:16
                      </div>
                      <div className="text-[10.5px] text-[#b5c4d9] mt-0.5">
                        Portrait
                      </div>
                    </div>
                  </button>
                </div>

                {/* ================= GENERATE BUTTON ================= */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="mt-6 md:mt-8 w-full h-[52px] md:h-[56px] rounded-[12px] text-[13.5px] md:text-[14.5px] font-semibold text-white flex items-center justify-center gap-2.5 transition-all hover:brightness-110 hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{
                    background:
                      "linear-gradient(100deg, #5831f3, #314fff 48%, #069df0)",
                    boxShadow:
                      "0 8px 26px rgba(39,84,255,.35), 0 0 0 1px rgba(255,255,255,.06) inset",
                  }}
                >
                  {generating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Generating Video...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={17} />
                      <span>Generate Video</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                {statusMsg && (
                  <div className="text-center text-[10.5px] text-[#9fb5d1] mt-2.5">
                    {statusMsg}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* ============ 10-SECOND FULLSCREEN LOADER ============ */}
      {showLoader && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: "rgba(2,7,19,.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="text-center px-6 max-w-[420px]">
            {/* Animated rings */}
            <div
              className="relative mx-auto mb-6"
              style={{ width: 100, height: 100 }}
            >
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  border: "3px solid rgba(141,67,255,.15)",
                  borderTopColor: "#8d43ff",
                  animationDuration: "1.2s",
                }}
              />
              <div
                className="absolute inset-2 rounded-full animate-spin"
                style={{
                  border: "3px solid rgba(52,131,255,.15)",
                  borderTopColor: "#3483ff",
                  animationDuration: "1.6s",
                  animationDirection: "reverse",
                }}
              />
              <div
                className="absolute inset-4 rounded-full grid place-items-center"
                style={{
                  background:
                    "radial-gradient(circle, rgba(141,67,255,.3), transparent 70%)",
                }}
              >
                <Loader2 size={28} className="text-[#a080ff] animate-spin" />
              </div>
            </div>

            <h3 className="text-[18px] font-semibold text-[#eef4ff] mb-2">
              Generating Your Podcast
            </h3>
            <p className="text-[13px] text-[#9bb0ca] leading-[1.6]">
              AI is analyzing your template, crafting a cinematic prompt, and
              rendering your video. This takes a few moments...
            </p>

            {/* Progress shimmer bar */}
            <div
              className="mt-6 h-[3px] rounded-full overflow-hidden"
              style={{ background: "rgba(58,91,132,.4)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #8d43ff, #3483ff, #8d43ff)",
                  backgroundSize: "200% 100%",
                  animation: "shimmerMove 2s linear infinite",
                  width: "100%",
                }}
              />
            </div>

            <style>{`
              @keyframes shimmerMove {
                0% { background-position: 0% 50%; }
                100% { background-position: 200% 50%; }
              }
            `}</style>
          </div>
        </div>
      )}

      {/* ============ SUCCESS MODAL ============ */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: "rgba(2,7,19,.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div
            className="rounded-[16px] p-8 max-w-[440px] w-full mx-4 text-center"
            style={{
              background:
                "linear-gradient(180deg, rgba(4,20,40,.98), rgba(2,15,30,.98))",
              border: "1px solid rgba(12,228,189,.35)",
              boxShadow:
                "0 24px 80px rgba(0,0,0,.6), 0 0 40px rgba(12,228,189,.15)",
            }}
          >
            {/* Success icon with glow */}
            <div
              className="relative grid place-items-center w-20 h-20 rounded-full mx-auto mb-5"
              style={{
                background:
                  "radial-gradient(circle, rgba(12,228,189,.25), transparent 70%)",
              }}
            >
              <div
                className="grid place-items-center w-16 h-16 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #0ce4bd, #3483ff)",
                  boxShadow: "0 0 30px rgba(12,228,189,.5)",
                }}
              >
                <Check size={30} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <h3 className="text-[20px] font-semibold text-[#eef4ff] mb-2">
              Queued Successfully!
            </h3>
            <p className="text-[13px] text-[#9bb0ca] leading-[1.6]">
              Your podcast video has been added to the generation queue.
              You&apos;ll see it on your My Podcasts page as it processes.
            </p>

            {/* Animated queue dots */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[8px] h-[8px] rounded-full"
                  style={{
                    background: "#0ce4bd",
                    animation: `queueDot 1.4s ease-in-out ${i * 0.2}s infinite`,
                    boxShadow: "0 0 10px rgba(12,228,189,.6)",
                  }}
                />
              ))}
            </div>

            <p className="text-[11px] text-[#5f7391] mt-4">
              Redirecting to My Podcasts...
            </p>

            <style>{`
              @keyframes queueDot {
                0%, 100% { opacity: .3; transform: translateY(0); }
                50%      { opacity: 1;  transform: translateY(-4px); }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}