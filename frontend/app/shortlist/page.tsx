"use client";

import { useState, useEffect } from "react";
import { getShortlist, ShortlistEntry, formatMarketValue, getPlayerForecast } from "@/lib/api";
import PlayerCard from "@/components/PlayerCard";
import PlotlyChart from "@/components/PlotlyChart";

const TACTICAL_SYSTEMS = [
  "Tiki-Taka / Possession",
  "Gegenpressing / Counter-Attack",
  "Low Block / Defensive",
  "Wing Play",
];

export default function ShortlistPage() {
  const [shortlist, setShortlist] = useState<ShortlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [compareData, setCompareData] = useState<
    { player: string; currentValue: number; forecastValue: number }[]
  >([]);
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getShortlist();
        setShortlist(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleRemove(player: string) {
    setShortlist((prev) => prev.filter((p) => p.player !== player));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(player);
      return next;
    });
  }

  function toggleSelect(player: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(player)) {
        next.delete(player);
      } else {
        next.add(player);
      }
      return next;
    });
  }

  async function handleCompare() {
    const players = Array.from(selected);
    if (players.length < 2) return;
    setCompareLoading(true);
    try {
      const results = await Promise.all(players.map((p) => getPlayerForecast(p)));
      setCompareData(
        results.map((r) => ({
          player: r.player,
          currentValue: r.meta?.currentMarketValue ?? 0,
          forecastValue: r.forecast[r.forecast.length - 1]?.["Forecasted Market Value"] ?? 0,
        }))
      );
    } finally {
      setCompareLoading(false);
    }
  }

  const compareChartData = compareData.length > 0
    ? [
        {
          type: "bar" as const,
          name: "Current Value",
          x: compareData.map((d) => d.player),
          y: compareData.map((d) => d.currentValue),
          marker: { color: "#3b82f6" },
          hovertemplate: "<b>%{x}</b><br>Current: €%{y:,.0f}<extra></extra>",
        },
        {
          type: "bar" as const,
          name: "5-Year Forecast",
          x: compareData.map((d) => d.player),
          y: compareData.map((d) => d.forecastValue),
          marker: { color: "#10b981" },
          hovertemplate: "<b>%{x}</b><br>Forecast: €%{y:,.0f}<extra></extra>",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="text-slate-400 animate-pulse text-center py-16">Loading shortlist…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Player Shortlist</h1>
          <p className="text-slate-400 mt-1">
            Your saved players. Add players from the Archetypes or Tactical Fit pages.
          </p>
        </div>
        {selected.size >= 2 && (
          <button
            onClick={handleCompare}
            disabled={compareLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {compareLoading ? "Loading…" : `Compare ${selected.size} Players`}
          </button>
        )}
      </div>

      {shortlist.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-5xl">📋</p>
          <p className="text-slate-400">Your shortlist is empty.</p>
          <p className="text-slate-500 text-sm">
            Go to the Archetypes or Tactical Fit pages and click &quot;+ Shortlist&quot; on any player.
          </p>
        </div>
      ) : (
        <>
          {/* Selection hint */}
          <p className="text-xs text-slate-500">
            Click a player card to select it for comparison (select 2+).
          </p>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {shortlist.map((entry) => (
              <div
                key={entry.player}
                onClick={() => toggleSelect(entry.player)}
                className={`cursor-pointer rounded-xl transition-all ${
                  selected.has(entry.player)
                    ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950"
                    : ""
                }`}
              >
                <PlayerCard entry={entry} onRemove={handleRemove} />
              </div>
            ))}
          </div>

          {/* Market value comparison chart */}
          {compareData.length >= 2 && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
              <h2 className="text-base font-semibold text-white">Market Value Comparison</h2>
              <PlotlyChart
                data={compareChartData}
                layout={{
                  height: 320,
                  barmode: "group",
                  yaxis: { title: { text: "Value (€)" }, tickformat: ",.0f" },
                  legend: { orientation: "h", y: -0.2 },
                }}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {compareData.map((d) => (
                  <div
                    key={d.player}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm"
                  >
                    <p className="font-semibold text-white truncate">{d.player}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Current: <span className="text-blue-300">{formatMarketValue(d.currentValue)}</span>
                    </p>
                    <p className="text-slate-400 text-xs">
                      5-Yr: <span className="text-emerald-300">{formatMarketValue(d.forecastValue)}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
