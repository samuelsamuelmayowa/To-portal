export function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        rounded-xl px-5 py-2.5
        text-sm font-semibold
        bg-white text-black
        hover:opacity-90
        disabled:opacity-50 disabled:cursor-not-allowed
        transition
        ${className}
      `}
    >
      {children}
    </button>
  );
}
