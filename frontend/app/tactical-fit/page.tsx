"use client";

import { useState, useEffect, useRef } from "react";
import {
  searchTacticalFitPlayers,
  getPlayerTacticalFit,
  getTacticalFitPlayers,
  addToShortlist,
  TacticalFitDetail,
  TacticalFitPlayer,
} from "@/lib/api";
import PlotlyChart from "@/components/PlotlyChart";

const SYSTEMS = [
  "Tiki-Taka / Possession",
  "Gegenpressing / Counter-Attack",
  "Low Block / Defensive",
  "Wing Play",
];

const SYSTEM_COLORS: Record<string, string> = {
  "Tiki-Taka / Possession": "#10b981",
  "Gegenpressing / Counter-Attack": "#f59e0b",
  "Low Block / Defensive": "#3b82f6",
  "Wing Play": "#a855f7",
};

function FitBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color = SYSTEM_COLORS[label] ?? "#10b981";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span className="font-mono">{pct}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function TacticalFitPage() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [detail, setDetail] = useState<TacticalFitDetail | null>(null);
  const [tablePlayers, setTablePlayers] = useState<TacticalFitPlayer[]>([]);
  const [tableSearch, setTableSearch] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await searchTacticalFitPlayers(search);
      setSuggestions(results);
      setShowSuggestions(true);
    }, 300);
  }, [search]);

  async function selectPlayer(player: string) {
    setSelectedPlayer(player);
    setSearch(player);
    setShowSuggestions(false);
    const data = await getPlayerTacticalFit(player);
    setDetail(data);
  }

  async function fetchTable() {
    setTableLoading(true);
    try {
      const data = await getTacticalFitPlayers(tableSearch);
      setTablePlayers(data);
    } finally {
      setTableLoading(false);
    }
  }

  useEffect(() => {
    fetchTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddToShortlist(p: TacticalFitPlayer) {
    try {
      await addToShortlist({
        player: p.Player,
        pos: p.Pos,
        team: p.Team,
        comp: p.Comp,
        age: p.Age,
        archetype: p["Ideal Archetype"],
      });
      showToast(`${p.Player} added to shortlist!`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      showToast(msg.includes("already") ? `${p.Player} is already in your shortlist` : msg);
    }
  }

  // Radar chart
  const radarData =
    detail?.fitScores
      ? [
          {
            type: "scatterpolar" as const,
            r: SYSTEMS.map((s) => (detail.fitScores[s] ?? 0) * 100),
            theta: SYSTEMS,
            fill: "toself" as const,
            fillcolor: "rgba(16,185,129,0.2)",
            line: { color: "#10b981", width: 2 },
            name: detail.player,
            hovertemplate: "<b>%{theta}</b><br>%{r:.1f}%<extra></extra>",
          },
        ]
      : [];

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {toastMsg}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-white">Tactical System Fit</h1>
        <p className="text-slate-400 mt-1">
          Fit scores estimating how well each player suits different tactical systems.
        </p>
      </div>

      {/* Player detail search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search + radar */}
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm text-slate-400 mb-1">Search a player</label>
            <input
              type="text"
              placeholder="e.g. Rodri, De Bruyne…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedPlayer(null); }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {suggestions.map((p) => (
                  <li
                    key={p}
                    onClick={() => selectPlayer(p)}
                    className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {detail && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-white text-lg">{detail.player}</p>
                  <p className="text-sm text-slate-400">
                    {detail.pos} · {detail.team} · {detail.comp}
                    {detail.age ? ` · Age ${detail.age}` : ""}
                  </p>
                  {detail.archetype && (
                    <span className="inline-block mt-1 text-xs bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full">
                      {detail.archetype}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {SYSTEMS.map((s) => (
                  <FitBar key={s} label={s} value={detail.fitScores[s] ?? 0} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Radar chart */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col">
          <p className="text-sm font-medium text-slate-300 mb-2">
            {detail ? `${detail.player} — Radar Chart` : "Select a player to view radar chart"}
          </p>
          {detail ? (
            <PlotlyChart
              data={radarData}
              layout={{
                height: 320,
                polar: {
                  radialaxis: {
                    visible: true,
                    range: [0, 100],
                    tickfont: { size: 9, color: "#94a3b8" },
                    gridcolor: "#334155",
                  },
                  angularaxis: { tickfont: { size: 10, color: "#e2e8f0" } },
                  bgcolor: "rgba(0,0,0,0)",
                },
                margin: { t: 20, r: 20, b: 20, l: 20 },
                showlegend: false,
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-5xl">
              🎯
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Filter table by player name…"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchTable()}
            className="flex-1 max-w-sm bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
          />
          <button
            onClick={fetchTable}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Filter
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm font-medium text-slate-300">
              {tableLoading ? "Loading…" : `${tablePlayers.length} players`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800">
                <tr>
                  {["Player", "Pos", "Team", "Archetype", ...SYSTEMS, ""].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-xs text-slate-400 uppercase tracking-wider font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tablePlayers.map((p, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => selectPlayer(p.Player)}
                  >
                    <td className="px-3 py-3 font-medium text-white whitespace-nowrap">{p.Player}</td>
                    <td className="px-3 py-3 text-slate-400">{p.Pos ?? "—"}</td>
                    <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{p.Team ?? "—"}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {p["Ideal Archetype"] ?? "—"}
                      </span>
                    </td>
                    {SYSTEMS.map((s) => {
                      const val = p[s as keyof TacticalFitPlayer] as number | undefined;
                      const pct = val != null ? Math.round(val * 100) : null;
                      return (
                        <td key={s} className="px-3 py-3 text-slate-300 font-mono text-xs">
                          {pct != null ? (
                            <span
                              style={{ color: SYSTEM_COLORS[s] }}
                              className="font-semibold"
                            >
                              {pct}%
                            </span>
                          ) : "—"}
                        </td>
                      );
                    })}
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleAddToShortlist(p)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800 hover:border-emerald-500 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                      >
                        + Shortlist
                      </button>
                    </td>
                  </tr>
                ))}
                {!tableLoading && tablePlayers.length === 0 && (
                  <tr>
                    <td colSpan={8 + SYSTEMS.length} className="px-4 py-8 text-center text-slate-500">
                      No players found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
