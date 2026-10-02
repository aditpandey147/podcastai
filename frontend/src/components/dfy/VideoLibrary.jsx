import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

// ============================================================
// 🔑 API KEY VALIDATION
// ============================================================

const VALID_API_KEY =
  "563492ad6f91700001000001198295a089f440f88acf6b59786293eb";

const validateApiKey = (key) => {
  if (!key) return false;
  if (key === "YOUR_PEXELS_API_KEY") return false;
  if (key === "your_pexels_api_key_here") return false;
  if (key.length < 10) return false;
  return true;
};

// ============================================================
// 📦 API SERVICE - PEXELS VIDEOS
// ============================================================

const searchVideosAPI = async ({
  query,
  page = 1,
  perPage = 12,
  orientation = "all",
  apiKey,
}) => {
  const keyToUse = apiKey && validateApiKey(apiKey) ? apiKey : VALID_API_KEY;

  if (!validateApiKey(keyToUse)) {
    return {
      success: false,
      videos: [],
      total: 0,
      totalPages: 0,
      error: "Pexels API key is missing or invalid.",
    };
  }

  try {
    console.log("📡 Fetching videos from Pexels...");

    const response = await axios.get("https://api.pexels.com/videos/search", {
      params: {
        query: query,
        page: page,
        per_page: perPage,
        orientation: orientation === "all" ? undefined : orientation,
        size: "large",
      },
      headers: {
        Authorization: keyToUse,
      },
      timeout: 15000,
    });

    if (!response.data || !response.data.videos) {
      return {
        success: false,
        videos: [],
        total: 0,
        totalPages: 0,
        error: "No videos found",
      };
    }

    const mappedVideos = response.data.videos.map((video) => ({
      id: video.id,
      title: query,
      duration: video.duration || 0,
      width: video.width || 0,
      height: video.height || 0,
      thumbnail: video.image || "",
      user: video.user?.name || "Unknown",
      videoUrl:
        video.video_files?.find((f) => f.quality === "hd")?.link ||
        video.video_files?.find((f) => f.quality === "sd")?.link ||
        video.video_files?.[0]?.link ||
        "",
      thumbnailUrl:
        video.video_pictures?.find((p) => p.width >= 640)?.picture ||
        video.image ||
        "",
    }));

    return {
      success: true,
      videos: mappedVideos,
      total: response.data.total_results || 0,
      totalPages: Math.ceil((response.data.total_results || 0) / perPage),
    };
  } catch (error) {
    console.error("❌ Video search failed:", error);

    if (error.response?.status === 401) {
      return {
        success: false,
        videos: [],
        total: 0,
        totalPages: 0,
        error: "Invalid API key. Please check your Pexels API key.",
      };
    }

    if (error.response?.status === 429) {
      return {
        success: false,
        videos: [],
        total: 0,
        totalPages: 0,
        error: "Rate limit exceeded. Please wait a moment and try again.",
      };
    }

    return {
      success: false,
      videos: [],
      total: 0,
      totalPages: 0,
      error: error.message || "Failed to fetch videos. Please try again.",
    };
  }
};

// ============================================================
// 🎬 VIDEO LIBRARY - MAIN COMPONENT
// ============================================================

const VideoLibrary = ({ apiKey, defaultQuery = "Podcast", perPage = 12 }) => {
  const [query, setQuery] = useState(defaultQuery);
  const [orientation, setOrientation] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const searchTimeout = useRef(null);

  const popularKeywords = [
    "Podcast",
    "Interview",
    "Studio",
    "Microphone",
    "Radio",
    "Talk Show",
    "Music",
    "Business",
  ];

  const collections = [
    {
      title: "Podcast Studio",
      keyword: "Podcast",
      count: "1,254 Videos",
      icon: "fa-podcast",
      image:
        "https://images.pexels.com/photos/7586659/pexels-photo-7586659.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      title: "Interview Setup",
      keyword: "Interview",
      count: "1,102 Videos",
      icon: "fa-microphone",
      image:
        "https://images.pexels.com/photos/7479633/pexels-photo-7479633.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      title: "Radio Broadcast",
      keyword: "Radio",
      count: "853 Videos",
      icon: "fa-broadcast-tower",
      image:
        "https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      title: "Talk Show",
      keyword: "Talk Show",
      count: "842 Videos",
      icon: "fa-comments",
      image:
        "https://images.pexels.com/photos/7648057/pexels-photo-7648057.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      title: "Audio Recording",
      keyword: "Recording",
      count: "1,036 Videos",
      icon: "fa-headphones",
      image:
        "https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      title: "Content Creator",
      keyword: "Creator",
      count: "768 Videos",
      icon: "fa-video",
      image:
        "https://images.pexels.com/photos/4974915/pexels-photo-4974915.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  ];

  const searchVideos = useCallback(
    async (searchQuery, page = 1, orient = orientation) => {
      if (!searchQuery.trim()) {
        setVideos([]);
        setTotal(0);
        setTotalPages(0);
        setSearchPerformed(false);
        return;
      }

      const cacheKey = `pexels_videos_${searchQuery}_${orient}_${page}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const data = JSON.parse(cached);
          if (data.timestamp && Date.now() - data.timestamp < 300000) {
            setVideos(data.videos);
            setTotal(data.total);
            setTotalPages(data.totalPages);
            setSearchPerformed(true);
            return;
          }
        }
      } catch (e) {}

      setLoading(true);
      setError(null);
      setSearchPerformed(true);

      try {
        const result = await searchVideosAPI({
          query: searchQuery,
          page,
          perPage,
          orientation: orient,
          apiKey,
        });

        if (result.success) {
          setVideos(result.videos);
          setTotal(result.total);
          setTotalPages(result.totalPages);
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              videos: result.videos,
              total: result.total,
              totalPages: result.totalPages,
              timestamp: Date.now(),
            }),
          );
        } else {
          setError(result.error);
          setVideos([]);
          setTotal(0);
          setTotalPages(0);
        }
      } catch (err) {
        setError("An error occurred while searching for videos.");
        setVideos([]);
        setTotal(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [apiKey, perPage, orientation],
  );

  useEffect(() => {
    if (defaultQuery) {
      searchVideos(defaultQuery, 1);
    }
  }, []);

  const debouncedSearch = useCallback(
    (value) => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => searchVideos(value, 1), 500);
    },
    [searchVideos],
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    searchVideos(query, 1);
  };

  const handleOrientationChange = (newOrientation) => {
    setOrientation(newOrientation);
    setCurrentPage(1);
    searchVideos(query, 1, newOrientation);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    searchVideos(query, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleKeywordClick = (keyword) => {
    setQuery(keyword);
    setCurrentPage(1);
    searchVideos(keyword, 1);
  };

  const handleCollectionClick = (keyword) => {
    setQuery(keyword);
    setCurrentPage(1);
    searchVideos(keyword, 1);
  };

  const downloadVideo = (url) => {
    if (url) window.open(url, "_blank");
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ============================================================
  // VIDEO PLAYER MODAL
  // ============================================================
  const VideoModal = ({ video, onClose }) => {
    if (!video) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(2,7,19,.92)", backdropFilter: "blur(10px)" }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #06162b, #041124)",
            border: "1px solid rgba(150,120,255,.35)",
            boxShadow:
              "0 24px 90px rgba(0,0,0,.7), 0 0 40px rgba(141,67,255,.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition"
            style={{
              background: "rgba(6,20,42,.75)",
              border: "1px solid rgba(150,120,255,.4)",
            }}
          >
            <i className="fas fa-times text-lg"></i>
          </button>

          <div className="aspect-video" style={{ background: "#020713" }}>
            {video.videoUrl ? (
              <video
                src={video.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                poster={video.thumbnail}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ color: "rgba(201,181,255,.3)" }}
              >
                <i className="fas fa-video text-4xl"></i>
                <p className="ml-3">No video available</p>
              </div>
            )}
          </div>

          <div className="p-4 text-white">
            <h3 className="text-lg font-semibold" style={{ color: "#eaf1ff" }}>
              {video.title}
            </h3>
            <div
              className="flex items-center gap-4 mt-1 text-sm"
              style={{ color: "#8fa0ba" }}
            >
              <span>
                <i className="fas fa-user mr-1"></i> {video.user}
              </span>
              <span>
                <i className="fas fa-clock mr-1"></i>{" "}
                {formatDuration(video.duration)}
              </span>
              <span>
                <i className="fas fa-expand mr-1"></i> {video.width}x
                {video.height}
              </span>
            </div>
            <button
              onClick={() => downloadVideo(video.videoUrl)}
              className="mt-3 px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 text-white"
              style={{
                background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                boxShadow: "0 6px 18px rgba(110,53,237,.35)",
              }}
            >
              <i className="fas fa-download"></i> Download Video
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="mx-auto px-4 sm:px-6 py-8 min-h-screen"
      style={{ background: "#020914" }}
    >
      {/* ===== HERO SECTION ===== */}
      <div
        className="relative rounded-3xl p-8 md:p-12 mb-8 overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, rgba(110,53,237,.20), transparent 40%), radial-gradient(circle at 100% 100%, rgba(52,131,255,.15), transparent 40%), linear-gradient(135deg, #06162b 0%, #041124 100%)",
          border: "1px solid rgba(80,150,255,.25)",
          boxShadow:
            "0 22px 70px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03) inset",
        }}
      >
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "rgba(110,53,237,.12)" }}
        ></div>
        <div
          className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "rgba(52,131,255,.10)" }}
        ></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: "rgba(110,53,237,.15)",
                border: "1px solid rgba(150,120,255,.4)",
                color: "#c9b5ff",
                backdropFilter: "blur(10px)",
              }}
            >
              <i className="fas fa-video" style={{ color: "#c9b5ff" }}></i> DFY
              Video Library
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2">
            Done For You{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #b65bff, #7855ff, #338dff)",
                WebkitBackgroundClip: "text",
              }}
            >
              Podcast
            </span>{" "}
            Assets
          </h1>
          <p className="text-base mb-6" style={{ color: "#aebfd5" }}>
            Find cinematic video clips for your next viral podcast project.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div
              className="flex flex-col sm:flex-row gap-2 rounded-2xl p-1.5 transition"
              style={{
                background: "rgba(6,20,42,.55)",
                border: "1px solid #17385f",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-center flex-1 px-3">
                <i
                  className="fas fa-search text-sm"
                  style={{ color: "#7d8fa8" }}
                ></i>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  placeholder="Search cinematic podcast videos..."
                  className="w-full bg-transparent border-0 px-3 py-2.5 text-sm focus:outline-none"
                  style={{
                    color: "#eaf1ff",
                    caretColor: "#c9b5ff",
                  }}
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 whitespace-nowrap hover:brightness-110"
                style={{
                  background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                  color: "#fff",
                  boxShadow: "0 6px 18px rgba(110,53,237,.35)",
                }}
              >
                <i className="fas fa-wand-magic-sparkles"></i> Instant Search
              </button>
            </div>

            {/* Keyword Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {popularKeywords.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => handleKeywordClick(keyword)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition"
                  style={
                    query === keyword
                      ? {
                          background:
                            "linear-gradient(100deg, rgba(110,53,237,.35), rgba(52,131,255,.25))",
                          border: "1px solid rgba(150,120,255,.5)",
                          color: "#eaf1ff",
                        }
                      : {
                          background: "rgba(6,20,42,.55)",
                          border: "1px solid #17385f",
                          color: "#8fa0ba",
                        }
                  }
                >
                  {keyword}
                </button>
              ))}
            </div>

            {/* Orientation Filter */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { value: "all", label: "All", icon: "fa-border-all" },
                {
                  value: "landscape",
                  label: "Landscape",
                  icon: "fa-arrows-alt-h",
                },
                {
                  value: "portrait",
                  label: "Portrait",
                  icon: "fa-arrows-alt-v",
                },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition"
                  style={
                    orientation === opt.value
                      ? {
                          background:
                            "linear-gradient(100deg, rgba(110,53,237,.35), rgba(52,131,255,.25))",
                          border: "1px solid rgba(150,120,255,.5)",
                          color: "#eaf1ff",
                        }
                      : {
                          background: "rgba(6,20,42,.55)",
                          border: "1px solid #17385f",
                          color: "#8fa0ba",
                        }
                  }
                >
                  <input
                    type="radio"
                    name="orientation"
                    value={opt.value}
                    checked={orientation === opt.value}
                    onChange={() => handleOrientationChange(opt.value)}
                    className="hidden"
                  />
                  <i className={`fas ${opt.icon}`}></i>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </form>
        </div>

        {/* Stats */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4"
            style={{
              background: "rgba(6,20,42,.55)",
              border: "1px solid rgba(150,120,255,.35)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(110,53,237,.3), rgba(52,131,255,.3))",
                border: "1px solid rgba(150,120,255,.4)",
              }}
            >
              <i className="fas fa-play" style={{ color: "#c9b5ff" }}></i>
            </div>
            <div>
              <div className="text-xl font-bold text-white">10M+</div>
              <div className="text-xs" style={{ color: "#8fa0ba" }}>
                Premium Videos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== COLLECTIONS ===== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg font-bold flex items-center gap-2"
            style={{ color: "#eaf1ff" }}
          >
            <i className="fas fa-fire" style={{ color: "#ff9f5b" }}></i>{" "}
            Featured Collections
          </h3>
          <span className="text-xs" style={{ color: "#7d8fa8" }}>
            Click any collection to search
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {collections.map((collection) => (
            <button
              key={collection.keyword}
              onClick={() => handleCollectionClick(collection.keyword)}
              className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-cover bg-center transition-all hover:scale-[1.02]"
              style={{
                backgroundImage: `url(${collection.image})`,
                border: "1px solid #17385f",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition"></div>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
                style={{ background: "rgba(110,53,237,.25)" }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center transition group-hover:scale-110"
                  style={{
                    background: "rgba(110,53,237,.35)",
                    backdropFilter: "blur(8px)",
                    border: "2px solid rgba(201,181,255,.5)",
                  }}
                >
                  <i className="fas fa-play text-white text-xl ml-1"></i>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <div className="text-white text-sm font-semibold truncate">
                  {collection.title}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "rgba(201,181,255,.6)" }}
                >
                  {collection.count}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===== RESULTS ===== */}
      <div>
        {/* Stats Bar */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl px-4 py-3 mb-4"
          style={{
            background: "#06162b",
            border: "1px solid #17385f",
            boxShadow: "0 4px 20px rgba(0,0,0,.35)",
          }}
        >
          <div className="flex items-center gap-3">
            <i className="fas fa-video" style={{ color: "#c9b5ff" }}></i>
            <span className="font-semibold" style={{ color: "#eaf1ff" }}>
              {total > 0
                ? query.charAt(0).toUpperCase() + query.slice(1)
                : "Ready To Discover"}
            </span>
            <span className="text-sm" style={{ color: "#8fa0ba" }}>
              {total > 0
                ? `${total} videos found`
                : "Search or choose a collection"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
              style={{
                background: "rgba(6,20,42,.7)",
                border: "1px solid #17385f",
                color: "#aebfd5",
              }}
            >
              <i className="fas fa-layer-group"></i>{" "}
              {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="w-10 h-10 rounded-full animate-spin"
              style={{
                border: "4px solid rgba(110,53,237,.15)",
                borderTopColor: "#6e35ed",
              }}
            ></div>
            <p className="text-sm" style={{ color: "#8fa0ba" }}>
              Searching for videos...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{
                background: "rgba(255,95,126,.15)",
                border: "1px solid rgba(255,95,126,.35)",
              }}
            >
              <i
                className="fas fa-exclamation-triangle text-2xl"
                style={{ color: "#ff8fa8" }}
              ></i>
            </div>
            <h4
              className="text-lg font-semibold mb-2"
              style={{ color: "#eaf1ff" }}
            >
              Something went wrong
            </h4>
            <p className="text-sm max-w-md" style={{ color: "#8fa0ba" }}>
              {error}
            </p>
            <button
              onClick={() => searchVideos(query, 1)}
              className="mt-4 px-6 py-2 rounded-xl text-sm font-medium text-white transition hover:brightness-110"
              style={{
                background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                boxShadow: "0 6px 18px rgba(110,53,237,.35)",
              }}
            >
              <i className="fas fa-rotate mr-2"></i> Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && videos.length === 0 && searchPerformed && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{
                background: "rgba(6,20,42,.7)",
                border: "1px solid #17385f",
              }}
            >
              <i
                className="fas fa-video-slash text-2xl"
                style={{ color: "#7d8fa8" }}
              ></i>
            </div>
            <h4
              className="text-lg font-semibold mb-2"
              style={{ color: "#eaf1ff" }}
            >
              No Videos Found
            </h4>
            <p className="text-sm max-w-md" style={{ color: "#8fa0ba" }}>
              Try searching with different keywords or choose a collection
              above.
            </p>
          </div>
        )}

        {/* Video Grid */}
        {!loading && !error && videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group relative rounded-xl overflow-hidden transition-all hover:-translate-y-1 cursor-pointer"
                style={{
                  background: "#06162b",
                  border: "1px solid #17385f",
                  boxShadow: "0 4px 20px rgba(0,0,0,.35)",
                }}
                onClick={() => setSelectedVideo(video)}
              >
                {/* Thumbnail */}
                <div
                  className="aspect-video relative"
                  style={{ background: "#020713" }}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600";
                    }}
                  />

                  {/* Play Button Overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(2,7,19,.3), rgba(2,7,19,.75))",
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(110,53,237,.9), rgba(52,131,255,.9))",
                        border: "2px solid rgba(201,181,255,.5)",
                        boxShadow: "0 8px 28px rgba(110,53,237,.5)",
                      }}
                    >
                      <i className="fas fa-play text-white text-2xl ml-1"></i>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div
                    className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-medium text-white"
                    style={{
                      background: "rgba(2,7,19,.75)",
                      border: "1px solid rgba(150,120,255,.3)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3" style={{ background: "#06162b" }}>
                  <h4
                    className="text-sm font-semibold truncate"
                    style={{ color: "#eaf1ff" }}
                  >
                    {video.title}
                  </h4>
                  <div
                    className="flex items-center gap-3 mt-1 text-xs"
                    style={{ color: "#8fa0ba" }}
                  >
                    <span className="truncate">
                      <i className="fas fa-user mr-1"></i> {video.user}
                    </span>
                    <span>
                      <i className="fas fa-expand mr-1"></i> {video.width}x
                      {video.height}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {currentPage > 1 && (
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition"
                style={{
                  background: "#06162b",
                  border: "1px solid #17385f",
                  color: "#aebfd5",
                }}
              >
                <i className="fas fa-chevron-left text-xs"></i>
              </button>
            )}
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum =
                totalPages <= 5
                  ? i + 1
                  : currentPage <= 3
                    ? i + 1
                    : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium transition"
                  style={
                    isActive
                      ? {
                          background:
                            "linear-gradient(100deg, #6e35ed, #3483ff)",
                          border: "1px solid rgba(150,120,255,.5)",
                          color: "#fff",
                          boxShadow: "0 4px 14px rgba(110,53,237,.35)",
                        }
                      : {
                          background: "#06162b",
                          border: "1px solid #17385f",
                          color: "#aebfd5",
                        }
                  }
                >
                  {pageNum}
                </button>
              );
            })}
            {currentPage < totalPages && (
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition"
                style={{
                  background: "#06162b",
                  border: "1px solid #17385f",
                  color: "#aebfd5",
                }}
              >
                <i className="fas fa-chevron-right text-xs"></i>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default VideoLibrary;
