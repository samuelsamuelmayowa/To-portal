import PropTypes from "prop-types";

export function GlassCard({ className = "", children }) {
  return (
    <div
      className={[
        "bg-[#171321] border border-[#3a2a43]",
        "rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.18)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
GlassCard.propTypes = { className: PropTypes.string, children: PropTypes.node };

export function Pill({ children, className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs",
        "bg-[#c418ac]/10 border border-[#c418ac]/35 text-fuchsia-200",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
Pill.propTypes = { children: PropTypes.node, className: PropTypes.string };

export function SoftButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "px-4 py-2 rounded-lg text-sm border transition-all",
        "border-[#493a50] bg-[#211a2b] hover:bg-[#30243a] hover:border-[#765071]",
        "active:scale-[0.98]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
SoftButton.propTypes = { children: PropTypes.node, className: PropTypes.string };

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "px-5 py-2 rounded-lg text-sm font-semibold",
        "bg-[#c418ac] shadow-lg shadow-[#c418ac]/15",
        "hover:opacity-90 active:scale-[0.98] transition",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
PrimaryButton.propTypes = { children: PropTypes.node, className: PropTypes.string };
