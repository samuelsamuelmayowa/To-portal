import { useState, useEffect } from "react";

export default function TOAnnouncementBar() {
  const [visible, setVisible] = useState(true);

  // optional: auto-slide-down after load
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        background: "linear-gradient(135deg,#3b82f6,#9333ea)",
        color: "white",
        textAlign: "center",
        padding: "12px 18px",
        fontFamily: "system-ui",
        fontWeight: 600,
        letterSpacing: "0.5px",
        boxShadow: "0 4px 18px rgba(0,0,0,.35)",
        transform: "translateY(0)",
        animation: "slideDown 0.7s ease forwards",
      }}
    >
      <div style={{ fontSize: "1.2rem" }}>💜 TO — Stock & Options Hub</div>
      <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
        Live US Equities • Candles • Options Chain • Market Intelligence
      </div>

      <button
        onClick={() => setVisible(false)}
        style={{
          marginTop: "6px",
          fontSize: "0.8rem",
          padding: "4px 14px",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,0.5)",
          background: "rgba(0,0,0,0.2)",
          color: "white",
          cursor: "pointer",
          transition: "0.25s",
        }}
      >
        Dismiss
      </button>

      {/* animation */}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
