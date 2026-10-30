// frontend/src/components/WinterEffect.jsx
import React, { useEffect, useState } from "react";

// ================================================================
// SNOWFLAKE BUTTON — fixed bottom-right, plus winter overlay
// ================================================================
export default function WinterEffect() {
  const [active, setActive] = useState(false);

  return (
    <>
      {/* 👇 Fixed bottom-right on every page */}
      <div className="fixed bottom-5 right-5 z-[9000]">
        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          className="relative grid place-items-center w-11 h-11 rounded-full transition-all hover:-translate-y-[1px] hover:scale-105"
          style={{
            background: active
              ? "linear-gradient(135deg, rgba(110,53,237,.55), rgba(52,131,255,.55))"
              : "rgba(6,22,43,.9)",
            border: active
              ? "1px solid rgba(141,67,255,.8)"
              : "1px solid rgba(80,150,255,.35)",
            boxShadow: active
              ? "0 0 24px rgba(141,67,255,.55), 0 8px 24px rgba(0,0,0,.4)"
              : "0 8px 24px rgba(0,0,0,.35)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          aria-label="Toggle winter magic"
          title="Winter Magic ❄️"
        >
          <Snowflake
            size={18}
            className={active ? "text-[#c9b5ff]" : "text-[#7d90ac]"}
          />
        </button>
      </div>

      {active && <WinterOverlay onClose={() => setActive(false)} />}
    </>
  );
}

// ================================================================
// SNOWFLAKE ICON
// ================================================================
function Snowflake({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
    </svg>
  );
}

// ================================================================
// WINTER OVERLAY — falling snow, glow, auto-close after 10s
// ================================================================
function WinterOverlay({ onClose }) {
  const [snowflakes, setSnowflakes] = useState([]);
  const [fading, setFading] = useState(false);

  // ---- Generate snowflakes ----
  useEffect(() => {
    const count = 60;
    const flakes = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 8 + Math.random() * 18,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 4,
      drift: (Math.random() - 0.5) * 80,
      opacity: 0.4 + Math.random() * 0.6,
    }));
    setSnowflakes(flakes);

    const t = setTimeout(() => setFading(true), 10000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(onClose, 800);
    return () => clearTimeout(t);
  }, [fading, onClose]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[500] pointer-events-none overflow-hidden"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 0.8s ease-out",
        background:
          "radial-gradient(circle at 30% 20%, rgba(122,190,255,.10), transparent 60%), radial-gradient(circle at 70% 80%, rgba(190,122,255,.08), transparent 60%)",
      }}
    >
      {snowflakes.map((f) => (
        <span
          key={f.id}
          className="absolute top-0 select-none"
          style={{
            left: `${f.left}%`,
            fontSize: `${f.size}px`,
            opacity: f.opacity,
            animation: `snowfall ${f.duration}s linear ${f.delay}s infinite`,
            filter: "drop-shadow(0 0 6px rgba(200,220,255,.8))",
            "--drift": `${f.drift}px`,
          }}
        >
          {f.size > 18 ? "❄️" : "❄"}
        </span>
      ))}

      <div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{ background: "rgba(255,207,112,.12)" }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{ background: "rgba(122,190,255,.10)" }}
      />

      {!fading && (
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-[12px] font-semibold"
          style={{
            background: "rgba(6,22,43,.85)",
            border: "1px solid rgba(150,120,255,.5)",
            color: "#e0e8ff",
            backdropFilter: "blur(10px)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,.3), 0 0 20px rgba(141,67,255,.15)",
            animation: "fadeIn 0.5s ease-out",
          }}
        >
          ❄️ Happy Holidays from Podcast AI ❄️
        </div>
      )}

      <style>{`
        @keyframes snowfall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
          }
          100% {
            transform: translate3d(var(--drift, 0px), 110vh, 0) rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}