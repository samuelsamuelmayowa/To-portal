import React, { useMemo, useState } from "react";
import { Play, Trash2, Plus } from "lucide-react";
import { GlassCard, PrimaryButton, SoftButton } from "./Glass";

export default function SavedSearches({ saved, onAdd, onRun, onDelete }) {
  const [name, setName] = useState("");
  const [spl, setSpl] = useState("index=_internal");

  const canAdd = useMemo(() => name.trim().length >= 2 && spl.trim().length > 0, [name, spl]);

  return (
    <div className="grid lg:grid-cols-[420px_1fr] gap-8">
      <GlassCard className="p-6">
        <div className="text-lg font-semibold mb-1">Saved Searches</div>
        <div className="text-xs text-gray-400 mb-5">
          Like Splunk “Saved Searches” — store SPL and reuse anytime.
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-400 mb-1">Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm outline-none"
              placeholder="My report: counts by sourcetype"
            />
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-1">SPL</div>
            <textarea
              value={spl}
              onChange={(e) => setSpl(e.target.value)}
              className="w-full min-h-[90px] bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm font-mono outline-none"
              placeholder="index=_internal | stats count by sourcetype"
            />
          </div>

          <PrimaryButton
            onClick={() => {
              if (!canAdd) return;
              onAdd({ name: name.trim(), spl: spl.trim() });
              setName("");
            }}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Save Search
          </PrimaryButton>

          <div className="text-xs text-gray-500">
            Tip: Saved searches can become Dashboard panels and Alert searches.
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-semibold">Your Library</div>
            <div className="text-xs text-gray-400">{saved.length} saved searches</div>
          </div>
          <SoftButton onClick={() => onRun?.("index=_internal")}>Run sample</SoftButton>
        </div>

        {saved.length === 0 ? (
          <div className="text-sm text-gray-400">
            No saved searches yet. Add your first search on the left.
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="mt-2 text-[11px] text-gray-300 font-mono break-all">
                      {s.spl}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <SoftButton onClick={() => onRun?.(s.spl)} title="Run">
                      <Play size={16} />
                    </SoftButton>
                    <SoftButton onClick={() => onDelete?.(s.id)} title="Delete">
                      <Trash2 size={16} />
                    </SoftButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
