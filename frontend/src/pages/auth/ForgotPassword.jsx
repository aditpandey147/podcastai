// frontend/src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import loginBg from "../../assets/login-img.png";
import logo from "../../assets/nav-logo.png";
import {
  ArrowRight,
  Mail,
  LockKeyhole,
  Sparkles,
  Users,
  CheckCircle2,
} from "lucide-react";

// ================================================================
// GLOBAL ANIMATION + RESPONSIVE STYLES
// ================================================================
function LoginAnimationStyles() {
  return (
    <style>{`
      /* ================================
         KEYFRAMES
         ================================ */
      @keyframes loginFadeInUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes loginFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes loginFloatOrb {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50%      { transform: translate(-16px, 20px) scale(1.05); }
      }
      @keyframes loginFloatOrbAlt {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50%      { transform: translate(18px, -16px) scale(1.04); }
      }
      @keyframes loginShimmer {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes loginPulseGlow {
        0%, 100% { box-shadow: 0 8px 24px rgba(58,108,244,.28), 0 1px 0 rgba(255,255,255,.15) inset; }
        50%      { box-shadow: 0 8px 34px rgba(120,110,255,.45), 0 1px 0 rgba(255,255,255,.2) inset; }
      }
      @keyframes loginBarPulse {
        0%, 100% { opacity: 1; }
        50%      { opacity: .55; }
      }

      /* ================================
         ANIMATION UTILITIES
         ================================ */
      .login-anim-up {
        opacity: 0;
        animation: loginFadeInUp .7s cubic-bezier(.2,.7,.3,1) forwards;
      }
      .login-anim-fade {
        opacity: 0;
        animation: loginFadeIn .9s ease forwards;
      }
      .login-shimmer-text {
        background-size: 220% 220%;
        animation: loginShimmer 6s ease-in-out infinite;
      }
      .login-orb { animation: loginFloatOrb 9s ease-in-out infinite; }
      .login-orb-alt { animation: loginFloatOrbAlt 11s ease-in-out infinite; }
      .login-submit-btn { animation: loginPulseGlow 3.2s ease-in-out infinite; }
      .login-bar { animation: loginBarPulse 1.8s ease-in-out infinite; }

      @media (prefers-reduced-motion: reduce) {
        .login-anim-up, .login-anim-fade, .login-shimmer-text,
        .login-orb, .login-orb-alt, .login-submit-btn, .login-bar {
          animation: none !important;
          opacity: 1 !important;
        }
      }

      /* ================================
         ROOT WRAPPER
         Desktop: fixed 100vh, no scroll
         Mobile: auto height, page scrolls
         ================================ */
      .fp-root {
        position: relative;
        width: 100%;
        height: 100vh;
        overflow: hidden;
        background: #02050d;
      }

      .fp-grid {
        position: relative;
        z-index: 10;
        display: grid;
        height: 100vh;
        grid-template-columns: 54% 46%;
      }

      .fp-right {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        padding: 0 clamp(20px, 4vw, 40px);
        overflow-y: auto;
        background: transparent;
      }

      /* ================================
         TABLET & BELOW (≤1023px)
         ================================ */
      @media (max-width: 1023px) {
        .fp-root {
          height: auto;
          min-height: 100vh;
          overflow: visible;
        }
        .fp-grid {
          grid-template-columns: 1fr;
          height: auto;
          min-height: 100vh;
        }
        .fp-right {
          height: auto;
          min-height: 100vh;
          padding: 40px 24px;
          overflow-y: visible;
        }
        .fp-orb-deco {
          display: none;
        }
        .fp-bg-img {
          width: 100% !important;
          background-position: center center !important;
        }
        .fp-bg-fade {
          width: 100% !important;
        }
      }

      /* ================================
         MOBILE (≤600px)
         ================================ */
      @media (max-width: 600px) {
        .fp-right {
          padding: 28px 16px;
        }
      }

      /* ================================
         SMALL MOBILE (≤400px)
         ================================ */
      @media (max-width: 400px) {
        .fp-right {
          padding: 22px 12px;
        }
      }

      /* ================================
         EXTRA SMALL (≤340px) — iPhone SE / 320px
         ================================ */
      @media (max-width: 340px) {
        .fp-right {
          padding: 18px 10px;
        }
      }
    `}</style>
  );
}


// ================================================================
// FEATURE ICON (left hero)
// ================================================================
function FeatureIcon({ children }) {
  return (
    <div
      className="grid place-items-center rounded-[13px]"
      style={{
        width: 50,
        height: 50,
        border: "1px solid rgba(45,133,255,.55)",
        background: "rgba(2,13,29,.55)",
        boxShadow: "inset 0 0 20px rgba(18,86,170,.07)",
        flexShrink: 0,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        transition: "transform .25s ease, box-shadow .25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow =
          "inset 0 0 20px rgba(18,86,170,.07), 0 10px 22px -8px rgba(49,140,255,.45)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(18,86,170,.07)";
      }}
    >
      <div
        className="text-[#318cff]"
        style={{ filter: "drop-shadow(0 0 5px rgba(49,140,255,.45))" }}
      >
        {children}
      </div>
    </div>
  );
}

// ================================================================
// LEFT HERO — reset-themed copy, same visual layout as Login
// ================================================================
function LeftHero() {
  const features = [
    {
      title: "Secure Reset Link",
      icon: <LockKeyhole size={22} strokeWidth={1.7} />,
    },
    {
      title: "Quick & Easy Process",
      icon: <Sparkles size={22} strokeWidth={1.7} />,
    },
    {
      title: "24/7 Human Support",
      icon: <Users size={22} strokeWidth={1.7} />,
    },
    {
      title: "Encrypted Delivery",
      icon: <Mail size={22} strokeWidth={1.7} />,
    },
  ];

  return (
    <section
      className="relative hidden overflow-hidden lg:block"
      style={{
        height: "100vh",
        background: "transparent",
      }}
    >
      <div
        className="relative z-10 flex h-full flex-col"
        style={{ padding: "5vh 6% 4vh" }}
      >
        {/* Brand */}
        <div
          className="login-anim-up flex shrink-0 items-center gap-3"
          style={{ animationDelay: ".05s" }}
        >
         <img src={logo} alt="Podcast AI" />
        </div>

        {/* Middle */}
        <div className="flex flex-1 flex-col justify-center">
          <div style={{ maxWidth: 520 }}>
            {/* Eyebrow */}
            <div
              className="login-anim-up font-medium text-[#9cb4d5]"
              style={{
                fontSize: "clamp(11px, 0.9vw, 13px)",
                letterSpacing: "2.2px",
                marginBottom: "2.2vh",
                animationDelay: ".15s",
              }}
            >
              SECURE&nbsp;&nbsp;→&nbsp;&nbsp; VERIFY&nbsp;&nbsp;→&nbsp;&nbsp;
              RESET
            </div>

            {/* Title */}
            <h1
              className="login-anim-up font-bold text-white"
              style={{
                fontSize: "clamp(28px, 3vw, 44px)",
                lineHeight: 1.13,
                letterSpacing: "-1.5px",
                maxWidth: 560,
                animationDelay: ".28s",
              }}
            >
              Forgot Your
              <br />
              Password? We&apos;ve
              <br />
              Got You —{" "}
              <span
                className="login-shimmer-text"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #9a62ff 0%, #218fff 50%, #9a62ff 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Covered
              </span>
            </h1>

            {/* Copy */}
            <p
              className="login-anim-up text-[#aebbd0]"
              style={{
                fontSize: "clamp(13px, 1.05vw, 16px)",
                lineHeight: 1.55,
                maxWidth: 500,
                marginTop: "2vh",
                animationDelay: ".4s",
              }}
            >
              Enter your email and we&apos;ll send a secure reset link within
              seconds.
              <br />
              No waiting. No hassle. Just click and reset.
            </p>

            {/* Features */}
            <div
              className="grid grid-cols-4"
              style={{ gap: "1.4vw", maxWidth: 520, marginTop: "3.5vh" }}
            >
              {features.map((f, i) => (
                <div
                  key={i}
                  className="login-anim-up flex flex-col items-center"
                  style={{ animationDelay: `${0.52 + i * 0.1}s` }}
                >
                  <FeatureIcon>{f.icon}</FeatureIcon>
                  <div
                    className="text-center text-[#9eb3ce]"
                    style={{
                      fontSize: "clamp(10px, 0.85vw, 12.5px)",
                      lineHeight: 1.35,
                      marginTop: 9,
                    }}
                  >
                    {f.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ================================================================
// FORGOT PASSWORD CARD — dark glassmorphic (matches LoginCard)
// ================================================================
function ForgotPasswordCard({ email, setEmail, loading, handleSubmit, sent }) {
  return (
    <div
      className="login-anim-up w-full max-w-[460px]"
      style={{
        borderRadius: 20,
        border: "1px solid rgba(50,130,226,.55)",
        background:
          "radial-gradient(circle at 50% 0%, rgba(24,72,135,.14), transparent 50%), linear-gradient(180deg, rgba(4,14,28,.85), rgba(2,8,18,.92))",
        boxShadow:
          "0 24px 80px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.02) inset, 0 1px 0 rgba(255,255,255,.04) inset",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        padding: "clamp(22px, 4.5vw, 36px) clamp(16px, 5vw, 34px)",
        animationDelay: ".1s",
      }}
    >
      {/* LOGO */}
      <div className="flex items-center justify-center" style={{ gap: 10 }}>
        <img src={logo} alt="Podcast AI" />
      </div>

      {/* HEADER */}
      <div
        style={{ marginTop: "clamp(18px, 2.6vh, 28px)" }}
        className="text-center"
      >
        <h2
          className="font-semibold text-white"
          style={{
            fontSize: "clamp(23px, 2vw, 28px)",
            letterSpacing: "-0.9px",
            lineHeight: 1.2,
          }}
        >
          Reset Password
        </h2>
        <p
          className="text-slate-400"
          style={{ fontSize: 13.5, lineHeight: 1.55, marginTop: 7 }}
        >
          Enter your email to receive a reset link.
          <br className="hidden sm:block" /> We&apos;ll take care of the rest.
        </p>
      </div>

      {/* SUCCESS BADGE */}
      {sent && (
        <div
          className="login-anim-fade flex w-full items-center justify-center"
          style={{
            marginTop: 16,
            padding: "9px 12px",
            gap: 8,
            borderRadius: 10,
            border: "1px solid rgba(34,197,94,.35)",
            background:
              "linear-gradient(90deg, rgba(34,197,94,.18), rgba(16,185,129,.18))",
          }}
        >
          <CheckCircle2 size={14} style={{ color: "#86efac", flexShrink: 0 }} />
          <span
            className="font-medium text-green-100"
            style={{ fontSize: 12, letterSpacing: ".2px" }}
          >
            Reset link sent! Check your email.
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        autoComplete="on"
        style={{ marginTop: "clamp(18px, 2.6vh, 26px)" }}
      >
        {/* EMAIL */}
        <div>
          <label
            htmlFor="email"
            className="block font-medium text-slate-200"
            style={{ fontSize: 12.5, marginBottom: 7, letterSpacing: ".1px" }}
          >
            Email Address
          </label>
          <div
            className="group flex items-center transition-all duration-200"
            style={{
              height: 50,
              padding: "0 15px",
              gap: 11,
              borderRadius: 11,
              border: "1px solid rgba(58,91,132,.7)",
              background: "rgba(4,14,27,.65)",
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = "rgba(80,150,255,.9)";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(43,128,255,.12)";
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = "rgba(58,91,132,.7)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <Mail
              size={18}
              strokeWidth={1.7}
              style={{ color: "#7d8fa8", flexShrink: 0 }}
            />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              style={{
                height: "100%",
                width: "100%",
                minWidth: 0,
                border: 0,
                outline: 0,
                background: "transparent",
                color: "#eaf1ff",
                fontSize: 13.5,
              }}
              className="placeholder:text-[#6b7c93]"
            />
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="login-submit-btn flex w-full items-center justify-center text-white transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            marginTop: 22,
            height: 50,
            gap: 9,
            borderRadius: 11,
            border: 0,
            fontSize: 13.5,
            fontWeight: 600,
            letterSpacing: ".2px",
            background:
              "linear-gradient(100deg, #2698ef 0%, #526cf1 48%, #a451ec 100%)",
          }}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin"
                width="18"
                height="18"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  opacity="0.25"
                />
                <path
                  fill="currentColor"
                  opacity="0.75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send Reset Link</span>
              <ArrowRight size={18} strokeWidth={2.2} />
            </>
          )}
        </button>

        {/* BACK TO LOGIN */}
        <div
          className="text-center text-slate-400"
          style={{ paddingTop: 18, fontSize: 12.5 }}
        >
          Remembered it?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-400 transition hover:text-blue-300"
            style={{ marginLeft: 3 }}
          >
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}

// ================================================================
// MAIN COMPONENT (logic unchanged)
// ================================================================
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/password/forgot", { email });
      setSent(true);
      toast.success("Reset link sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-root font-sans text-white">
      <LoginAnimationStyles />

      {/* LAYER 1 — base */}
      <div
        className="absolute inset-0"
        style={{ background: "#02050d", zIndex: 0 }}
      />

      {/* LAYER 2 — background image */}
      <div
        className="fp-bg-img login-anim-fade"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: "90%",
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "35% center",
          backgroundRepeat: "no-repeat",
          zIndex: 1,
        }}
      />

      {/* LAYER 3 — left dark gradient for text visibility */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(2,5,13,.94) 0%, rgba(2,5,13,.85) 22%, rgba(2,5,13,.68) 40%, rgba(2,5,13,.4) 55%, rgba(2,5,13,.12) 68%, transparent 78%)",
          zIndex: 2,
        }}
      />

      {/* LAYER 3B — soft vignette over image subject area */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 70% at 78% 45%, rgba(2,5,13,.35), transparent 70%)",
          zIndex: 2,
        }}
      />

      {/* LAYER 4 — fade right edge of image */}
      <div
        className="fp-bg-fade pointer-events-none"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: "90%",
          background:
            "linear-gradient(90deg, transparent 0%, transparent 40%, rgba(2,5,13,.4) 60%, rgba(2,5,13,.78) 82%, #02050d 100%)",
          zIndex: 3,
        }}
      />

      {/* Floating ambient orbs (hidden on mobile via .fp-orb-deco) */}
      <div
        className="login-orb fp-orb-deco pointer-events-none absolute rounded-full"
        style={{
          top: "8%",
          left: "6%",
          width: 260,
          height: 260,
          background:
            "radial-gradient(circle, rgba(80,140,255,.16), transparent 70%)",
          filter: "blur(30px)",
          zIndex: 4,
        }}
      />
      <div
        className="login-orb-alt fp-orb-deco pointer-events-none absolute rounded-full"
        style={{
          bottom: "10%",
          left: "18%",
          width: 220,
          height: 220,
          background:
            "radial-gradient(circle, rgba(160,100,255,.14), transparent 70%)",
          filter: "blur(28px)",
          zIndex: 4,
        }}
      />

      {/* CONTENT GRID */}
      <div className="fp-grid">
        <LeftHero />

        <section className="fp-right">
          <ForgotPasswordCard
            email={email}
            setEmail={setEmail}
            loading={loading}
            handleSubmit={handleSubmit}
            sent={sent}
          />
        </section>
      </div>
    </div>
  );
};

export default ForgotPassword;
