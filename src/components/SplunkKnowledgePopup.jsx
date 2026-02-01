import { useEffect, useState } from "react";

const todayKey = () =>
  `splunk_tip_seen_${new Date().toISOString().slice(0, 10)}`;

export default function SplunkKnowledgePopup() {
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(null);

  useEffect(() => {
    const seenToday = localStorage.getItem(todayKey());
    if (seenToday) return;

    const tips = [
      {
        title: "SPL Tip of the Day",
        level: "Beginner",
        content:
          "Always limit your search early using index, sourcetype, and time range to improve performance.",
        example: `index=security sourcetype=firewall earliest=-24h`,
      },
      {
        title: "Splunk Performance Insight",
        level: "Intermediate",
        content:
          "Avoid using wildcards at the beginning of search terms. They significantly slow searches.",
        example: `❌ *error\n✅ error*`,
      },
      {
        title: "SOC Analyst Insight",
        level: "Advanced",
        content:
          "Use tstats for faster searches on indexed fields instead of raw events.",
        example: `| tstats count where index=security by sourcetype`,
      },
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setTip(randomTip);
    setOpen(true);
  }, []);

  const close = () => {
    localStorage.setItem(todayKey(), "true");
    setOpen(false);
  };

  if (!open || !tip) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="
        w-full max-w-lg rounded-2xl
        bg-slate-950 border border-slate-800
        shadow-2xl p-6 relative
      ">
        {/* Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-blue-600/20 blur-xl" />

        <div className="relative">
          <h3 className="text-sm uppercase tracking-wide text-blue-400">
            Splunk Knowledge of the Day
          </h3>

          <h2 className="text-xl font-bold mt-2 text-slate-100">
            {tip.title}
          </h2>

          <span className="
            inline-block mt-2 px-3 py-1 text-xs rounded-full
            bg-slate-800 text-slate-300
          ">
            {tip.level}
          </span>

          <p className="mt-4 text-slate-300 leading-relaxed">
            {tip.content}
          </p>

          {tip.example && (
            <pre className="
              mt-4 p-3 rounded-xl
              bg-slate-900 text-green-400
              text-sm overflow-x-auto
            ">
{tip.example}
            </pre>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={close}
              className="px-4 py-2 rounded-xl text-sm
              bg-slate-800 text-slate-300
              hover:bg-slate-700 transition"
            >
              Close
            </button>

            <button
              onClick={close}
              className="px-4 py-2 rounded-xl text-sm font-medium
              bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Got it 👍
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
