// frontend/src/pages/MyPodcasts.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Film,
  Search,
  X,
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

// ================================================================
// STATUS BADGE
// ================================================================
function StatusBadge({ status }) {
  const map = {
    queued: {
      color: "#f59e0b",
      bg: "rgba(245,158,11,.15)",
      border: "rgba(245,158,11,.35)",
      label: "Queued",
    },
    processing: {
      color: "#3b82f6",
      bg: "rgba(59,130,246,.15)",
      border: "rgba(59,130,246,.35)",
      label: "Processing",
    },
    completed: {
      color: "#0ce4bd",
      bg: "rgba(12,228,189,.15)",
      border: "rgba(12,228,189,.35)",
      label: "Completed",
    },
    failed: {
      color: "#f87171",
      bg: "rgba(248,113,113,.15)",
      border: "rgba(248,113,113,.35)",
      label: "Failed",
    },
  };
  const s = map[status] || map.queued;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-[4px] rounded-full text-[10.5px] font-semibold"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
      }}
    >
      {status === "processing" && <Loader2 size={11} className="animate-spin" />}
      {status === "completed" && <CheckCircle2 size={11} />}
      {status === "failed" && <XCircle size={11} />}
      {status === "queued" && <Clock size={11} />}
      {s.label}
    </span>
  );
}

// ================================================================
// VIDEO MODAL
// ================================================================
function VideoModal({ video, onClose }) {
  const modalRef = useRef(null);

  // Close on ESC key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!video) return null;

  const playableUrl = video.localVideoUrl || video.videoUrl;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: "rgba(2,7,19,.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-[960px] rounded-[16px] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #06162b, #041124)",
          border: "1px solid rgba(150,120,255,.35)",
          boxShadow: "0 24px 90px rgba(0,0,0,.7), 0 0 40px rgba(141,67,255,.15)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: "1px solid rgba(58,91,132,.35)" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="grid place-items-center w-7 h-7 rounded-[8px] shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(110,53,237,.35), rgba(52,131,255,.35))",
                border: "1px solid rgba(150,120,255,.5)",
              }}
            >
              <Play size={12} fill="white" className="text-white ml-[1px]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[13.5px] font-semibold text-[#edf4ff] truncate">
                {video.title}
              </h3>
              <p className="text-[10.5px] text-[#9c8bff] truncate">
                {video.category || "Podcast"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid place-items-center w-8 h-8 rounded-full text-[#b7c9df] transition-colors hover:bg-[#0a1a32] shrink-0 ml-3"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Video */}
        <div className="aspect-video bg-[#020713]">
          <video
            src={getImageUrl(playableUrl)}
            poster={getImageUrl(video.coverImage)}
            controls
            autoPlay
            className="w-full h-full object-contain bg-black"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 flex-wrap gap-3">
          <span className="text-[10.5px] text-[#5f7391]">
            {new Date(video.createdAt).toLocaleString()}
          </span>

          <div className="flex items-center gap-2">
            <a
              href={getImageUrl(playableUrl)}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="h-[34px] px-4 rounded-[9px] flex items-center gap-2 text-[12px] font-semibold text-white transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                boxShadow: "0 6px 18px rgba(58,90,255,.3)",
              }}
            >
              <Download size={13} />
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// PAGE
// ================================================================
export default function MyPodcasts() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  const fetchVideos = useCallback(async () => {
    try {
      const res = await api.get("/video/my-videos");
      setVideos(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, []);

  // ---- Initial fetch ----
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // ---- Poll every 5s if any video is still processing/queued ----
  useEffect(() => {
    const hasPending = videos.some(
      (v) => v.status === "queued" || v.status === "processing"
    );
    if (!hasPending) return;

    const interval = setInterval(fetchVideos, 5000);
    return () => clearInterval(interval);
  }, [videos, fetchVideos]);

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
                  YOUR PODCAST LIBRARY
                </div>
                <h1 className="text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.4px] font-semibold mt-3 text-[#eef4ff]">
                  My Podcasts
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #b65bff, #7855ff, #338dff)",
                      WebkitBackgroundClip: "text",
                    }}
                  >
                    All Your Videos In One Place.
                  </span>
                </h1>
                <p className="text-[14px] leading-[1.6] text-[#aebfd5] mt-4 max-w-[640px]">
                  Browse, preview, and download every podcast video you&apos;ve
                  generated. Videos processing in the background will appear
                  here automatically.
                </p>
              </div>
            </div>

            {/* HEADER ROW */}
            <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="grid place-items-center w-8 h-8 rounded-[9px] shrink-0"
                  style={{
                    background: "rgba(110,53,237,.2)",
                    border: "1px solid rgba(150,120,255,.4)",
                  }}
                >
                  <Film size={14} className="text-[#a080ff]" />
                </div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[16px] font-semibold text-[#edf4ff] leading-none">
                    Your Videos
                  </h2>
                  {!loading && (
                    <span
                      className="text-[11px] font-medium px-2.5 py-[4px] rounded-full text-[#9cb4d4]"
                      style={{
                        background: "rgba(255,255,255,.05)",
                        border: "1px solid rgba(255,255,255,.08)",
                      }}
                    >
                      {videos.length}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate("/create-podcast")}
                className="h-[40px] px-4 rounded-[10px] text-[12px] font-semibold text-white transition-all hover:-translate-y-[1px] hover:brightness-110"
                style={{
                  background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                  boxShadow: "0 6px 20px rgba(58,90,255,.3)",
                }}
              >
                + Create New
              </button>
            </div>

            {/* LOADING / EMPTY / GRID */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[240px] rounded-[12px] animate-pulse"
                    style={{
                      background: "linear-gradient(180deg, #06162b, #041124)",
                      border: "1px solid #17385f",
                    }}
                  />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div
                className="rounded-[14px] p-12 text-center flex flex-col items-center gap-3"
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
                  <Film size={22} className="text-[#a98bff]" />
                </div>
                <p className="text-[15px] font-medium text-[#dbe6f7]">
                  No podcasts yet
                </p>
                <p className="text-[12.5px] text-[#7d90ac] max-w-[380px]">
                  Generate your first podcast video from a template to see it
                  here.
                </p>
                <button
                  onClick={() => navigate("/templates")}
                  className="mt-2 h-[40px] px-5 rounded-[10px] text-[12.5px] font-semibold text-white transition-all hover:-translate-y-[1px] hover:brightness-110"
                  style={{
                    background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                    boxShadow: "0 6px 20px rgba(58,90,255,.3)",
                  }}
                >
                  Browse Templates
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {videos.map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    onRefresh={fetchVideos}
                    onPlay={() => setActiveVideo(v)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL */}
      {activeVideo && (
        <VideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}

// ================================================================
// VIDEO CARD
// ================================================================
function VideoCard({ video, onRefresh, onPlay }) {
  const isProcessing =
    video.status === "queued" || video.status === "processing";
  const isCompleted = video.status === "completed";
  const isFailed = video.status === "failed";

  const playableUrl = video.localVideoUrl || video.videoUrl;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    onPlay();
  };

  return (
    <div
      className="rounded-[12px] overflow-hidden transition-all duration-300 hover:-translate-y-[2px] group"
      style={{
        background: "linear-gradient(180deg, #06162b, #041124)",
        border: "1px solid #17385f",
        boxShadow: "0 4px 20px rgba(0,0,0,.3)",
      }}
    >
      <div className="relative aspect-video bg-[#020713] overflow-hidden">
        {isCompleted && playableUrl ? (
          <>
            {/* Poster / thumbnail */}
            <img
              src={getImageUrl(video.coverImage)}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />

            {/* Dark overlay on hover */}
            <div
              className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(2,7,19,.55), rgba(2,7,19,.85))",
              }}
            />

            {/* Play button */}
            <button
              type="button"
              onClick={handlePlayClick}
              className="absolute inset-0 grid place-items-center z-10 cursor-pointer"
              aria-label="Play video"
            >
              <span
                className="grid place-items-center w-[58px] h-[58px] rounded-full transition-all duration-300 group-hover:scale-110"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(110,53,237,.95), rgba(52,131,255,.95))",
                  border: "2px solid rgba(255,255,255,.35)",
                  boxShadow:
                    "0 12px 40px rgba(58,90,255,.55), 0 0 0 6px rgba(110,53,237,.15)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                <Play
                  size={22}
                  fill="white"
                  className="text-white ml-[2px]"
                />
              </span>
            </button>
          </>
        ) : isProcessing ? (
          <div className="absolute inset-0 grid place-items-center">
            {video.coverImage && (
              <img
                src={getImageUrl(video.coverImage)}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.35 }}
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(2,7,19,.6), rgba(2,7,19,.85))",
              }}
            />
            <div className="relative z-10 text-center px-4 w-full">
              <Loader2
                size={32}
                className="text-[#a080ff] animate-spin mx-auto mb-3"
              />
              <p className="text-[12px] font-medium text-[#eaf1ff] mb-2">
                {video.status === "queued"
                  ? "Queued..."
                  : "Generating video..."}
              </p>
              <div className="max-w-[200px] mx-auto">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#9bb0ca]">Progress</span>
                  <span className="text-[#b59aff] font-medium">
                    {video.progress || 0}%
                  </span>
                </div>
                <div
                  className="h-[4px] rounded-full overflow-hidden"
                  style={{ background: "rgba(58,91,132,.4)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${video.progress || 0}%`,
                      background: "linear-gradient(90deg, #8d43ff, #3483ff)",
                      boxShadow: "0 0 10px rgba(141,67,255,.6)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : isFailed ? (
          <div className="absolute inset-0 grid place-items-center px-4 text-center">
            <div>
              <XCircle size={32} className="text-[#f87171] mx-auto mb-2" />
              <p className="text-[12px] text-[#fca5a5] font-medium">
                Generation Failed
              </p>
              <p className="text-[10.5px] text-[#9bb0ca] mt-1">
                {video.errorMessage || "Something went wrong"}
              </p>
            </div>
          </div>
        ) : null}

        {/* Status badge top-left */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <StatusBadge status={video.status} />
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="text-[13.5px] font-semibold text-[#edf4ff] line-clamp-1">
          {video.title}
        </h3>
        <p className="text-[11px] text-[#9c8bff] mt-1 line-clamp-1">
          {video.category || "Podcast"}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
          <span className="text-[10.5px] text-[#5f7391]">
            {new Date(video.createdAt).toLocaleDateString()}
          </span>

          {isCompleted && (
            <a
              href={getImageUrl(playableUrl)}
              target="_blank"
              rel="noopener noreferrer"
              download
              onClick={(e) => e.stopPropagation()}
              className="h-[30px] px-3 rounded-[8px] flex items-center gap-1.5 text-[11px] font-medium text-white transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                boxShadow: "0 4px 12px rgba(58,90,255,.28)",
              }}
            >
              <Download size={12} />
              Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
}