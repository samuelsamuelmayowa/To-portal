import React from "react";

export function GlassCard({ className = "", children }) {
  return (
    <div
      className={[
        "bg-white/5 backdrop-blur-xl border border-white/10",
        "rounded-3xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function Pill({ children, className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs",
        "bg-cyan-500/10 border border-cyan-400/30 text-cyan-200",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function SoftButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "px-4 py-2 rounded-xl text-sm border transition-all",
        "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20",
        "active:scale-[0.98]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "px-5 py-2 rounded-xl text-sm font-medium",
        "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg",
        "hover:opacity-90 active:scale-[0.98] transition",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
