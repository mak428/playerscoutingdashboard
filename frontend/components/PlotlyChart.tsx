"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface PlotlyChartProps {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  className?: string;
}

export default function PlotlyChart({ data, layout, className }: PlotlyChartProps) {
  return (
    <Plot
      data={data}
      layout={{
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: { color: "#e2e8f0", family: "Inter, sans-serif" },
        margin: { t: 40, r: 20, b: 60, l: 60 },
        ...layout,
      }}
      config={{ responsive: true, displayModeBar: false }}
      useResizeHandler
      style={{ width: "100%" }}
      className={className}
    />
  );
}
