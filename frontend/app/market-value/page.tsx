"use client";

import { useState, useEffect, useRef } from "react";
import {
  searchMarketValuePlayers,
  getPlayerForecast,
  PlayerForecast,
  formatMarketValue,
} from "@/lib/api";
import PlotlyChart from "@/components/PlotlyChart";
import StatCard from "@/components/StatCard";

export default function MarketValuePage() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [forecast, setForecast] = useState<PlayerForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await searchMarketValuePlayers(search);
      setSuggestions(results);
      setShowSuggestions(true);
    }, 300);
  }, [search]);

  async function selectPlayer(player: string) {
    setSelectedPlayer(player);
    setSearch(player);
    setShowSuggestions(false);
    setLoading(true);
    try {
      const data = await getPlayerForecast(player);
      setForecast(data);
    } finally {
      setLoading(false);
    }
  }

  const meta = forecast?.meta;
  const forecastRows = forecast?.forecast ?? [];

  const chartData = [
    {
      type: "scatter" as const,
      mode: "lines+markers" as const,
      x: forecastRows.map((r) => r["Forecast Date"]),
      y: forecastRows.map((r) => r["Forecasted Market Value"]),
      line: { color: "#3b82f6", width: 2.5 },
      marker: { color: "#60a5fa", size: 8 },
      hovertemplate: "<b>%{x}</b><br>€%{y:,.0f}<extra></extra>",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Transfer Market Value Predictions</h1>
        <p className="text-slate-400 mt-1">
          5-year forecasts using an ensemble of Exponential Smoothing, Linear Regression, SARIMA,
          and Prophet.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <label className="block text-sm text-slate-400 mb-1">Search for a player</label>
        <input
          type="text"
          placeholder="e.g. Haaland, Salah…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedPlayer(null);
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-52 overflow-y-auto">
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

      {loading && (
        <div className="text-slate-400 text-sm animate-pulse">Loading forecast…</div>
      )}

      {!loading && forecast && meta && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Current Value"
              value={formatMarketValue(meta.currentMarketValue)}
            />
            <StatCard
              label="5-Year Forecast"
              value={formatMarketValue(forecastRows[forecastRows.length - 1]?.["Forecasted Market Value"])}
            />
            <StatCard
              label="Peak Estimate"
              value={formatMarketValue(meta.estimatedPeakValue)}
              sub="Estimated career peak"
            />
            <StatCard
              label="Best Model"
              value={meta.bestModel ?? "N/A"}
              sub={`${meta.lastKnownTeam ?? ""} · Age ${meta.lastKnownAge ?? "?"}`}
            />
          </div>

          {/* Chart */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">
              {selectedPlayer} — 5-Year Market Value Forecast
            </h2>
          <PlotlyChart
            data={chartData}
            layout={{
              height: 320,
              xaxis: { title: { text: "Forecast Date" } },
              yaxis: {
                title: { text: "Market Value (€)" },
                tickformat: ",.0f",
              },
              hovermode: "x unified",
            }}
          />
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-sm font-medium text-slate-300">Forecast Data</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-800">
                <tr>
                  {["Year", "Forecast Date", "Forecasted Value"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs text-slate-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {forecastRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-slate-300">Year {r["Forecast Year Ahead"]}</td>
                    <td className="px-4 py-3 text-slate-300">{r["Forecast Date"]}</td>
                    <td className="px-4 py-3 font-medium text-blue-300">
                      {formatMarketValue(r["Forecasted Market Value"])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !forecast && !selectedPlayer && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-3">📈</p>
          <p>Search for a player to view their market value forecast.</p>
        </div>
      )}
    </div>
  );
}
