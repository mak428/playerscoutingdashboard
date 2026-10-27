import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Using Webpack (--no-turbopack) to avoid a Next.js 16 Turbopack HMR panic
  // that fires on every visit to pages containing dynamic() ssr:false imports
  // (e.g. react-plotly.js). Webpack handles these without issue.
};

export default nextConfig;
