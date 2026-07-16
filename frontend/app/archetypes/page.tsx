"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getArchetypeList,
  getArchetypePlayers,
  getArchetypeDistribution,
  addToShortlist,
  ArchetypeInfo,
  ArchetypePlayer,
  ArchetypeCount,
} from "@/lib/api";
import PlotlyChart from "@/components/PlotlyChart";

const POSITIONS = [
  { key: "GK", label: "Goalkeeper" },
  { key: "DEF", label: "Defender" },
  { key: "MID", label: "Midfielder" },
  { key: "FWD", label: "Forward" },
];

export default function ArchetypesPage() {
  const [position, setPosition] = useState("GK");
  const [archetypes, setArchetypes] = useState<ArchetypeInfo[]>([]);
  const [selectedArchetype, setSelectedArchetype] = useState<string>("");
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<ArchetypePlayer[]>([]);
  const [distribution, setDistribution] = useState<ArchetypeCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Load archetypes for position
  useEffect(() => {
    getArchetypeList(position).then((list) => {
      setArchetypes(list);
      setSelectedArchetype(list[0]?.archetype ?? "");
    });
    getArchetypeDistribution(position).then(setDistribution);
  }, [position]);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getArchetypePlayers(position, selectedArchetype, search);
      setPlayers(data);
    } finally {
      setLoading(false);
    }
  }, [position, selectedArchetype, search]);

  useEffect(() => {
    if (selectedArchetype) fetchPlayers();
  }, [fetchPlayers, selectedArchetype]);

  const currentDescription = archetypes.find((a) => a.archetype === selectedArchetype)?.description ?? "";

  const chartData = [
    {
      type: "bar" as const,
      x: distribution.map((d) => d.archetype),
      y: distribution.map((d) => d.count),
      marker: { color: "#10b981" },
      hovertemplate: "<b>%{x}</b><br>Players: %{y}<extra></extra>",
    },
  ];

  async function handleAddToShortlist(player: ArchetypePlayer) {
    try {
      await addToShortlist({
        player: player.Player,
        pos: player.Pos,
        team: player.Team,
        comp: player.Comp,
        age: player.Age,
        archetype: player["Ideal Archetype"],
      });
      showToast(`${player.Player} added to shortlist!`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      showToast(msg.includes("already") ? `${player.Player} is already in your shortlist` : msg);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {toastMsg}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-white">Player Archetypes</h1>
        <p className="text-slate-400 mt-1">
          Ideal tactical roles identified via K-Means clustering on FBRef statistics.
        </p>
      </div>

      {/* Position tabs */}
      <div className="flex gap-2 flex-wrap">
        {POSITIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPosition(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              position === key
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Archetype selector + description */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm text-slate-400 font-medium">Archetype</label>
          <select
            value={selectedArchetype}
            onChange={(e) => setSelectedArchetype(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {archetypes.map((a) => (
              <option key={a.archetype} value={a.archetype}>
                {a.archetype}
              </option>
            ))}
          </select>
          {currentDescription && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
              {currentDescription}
            </div>
          )}
        </div>

        {/* Distribution chart */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 min-h-[220px]">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
            Players by Archetype
          </p>
          <PlotlyChart
            data={chartData}
            layout={{
              height: 180,
              margin: { t: 10, r: 10, b: 80, l: 40 },
              xaxis: { tickangle: -30, tickfont: { size: 10 } },
              yaxis: { tickfont: { size: 10 } },
            }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search by player name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchPlayers()}
          className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
        />
        <button
          onClick={fetchPlayers}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Search
        </button>
      </div>

      {/* Results table */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-300">
            {loading ? "Loading…" : `${players.length} players`}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr>
                {["Player", "Pos", "Age", "Team", "League", "Archetype", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs text-slate-400 uppercase tracking-wider font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {players.map((p, i) => (
                <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{p.Player}</td>
                  <td className="px-4 py-3 text-slate-400">{p.Pos ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{p.Age ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{p.Team ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{p.Comp ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-emerald-900/60 text-emerald-300 text-xs px-2 py-0.5 rounded-full">
                      {p["Ideal Archetype"] ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleAddToShortlist(p)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800 hover:border-emerald-500 px-2 py-1 rounded-lg transition-colors"
                    >
                      + Shortlist
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && players.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No players found. Try a different archetype or search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
