"use client";

import { ShortlistEntry, removeFromShortlist } from "@/lib/api";

interface PlayerCardProps {
  entry: ShortlistEntry;
  onRemove: (player: string) => void;
}

export default function PlayerCard({ entry, onRemove }: PlayerCardProps) {
  async function handleRemove() {
    try {
      await removeFromShortlist(entry.player);
      onRemove(entry.player);
    } catch {
      onRemove(entry.player);
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 hover:border-emerald-500 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white text-base leading-tight">{entry.player}</p>
          {entry.archetype && (
            <span className="inline-block mt-1 text-xs bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full">
              {entry.archetype}
            </span>
          )}
        </div>
        <span className="shrink-0 text-slate-400 text-xs font-mono bg-slate-700 px-2 py-1 rounded">
          {entry.pos ?? "—"}
        </span>
      </div>
      <div className="text-sm text-slate-400 space-y-0.5">
        {entry.team && <p>🏟 {entry.team}</p>}
        {entry.comp && <p>🏆 {entry.comp}</p>}
        {entry.age != null && <p>🎂 Age {entry.age}</p>}
      </div>
      <button
        onClick={handleRemove}
        className="mt-auto text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-500 rounded-lg py-1.5 transition-colors"
      >
        Remove
      </button>
    </div>
  );
}
