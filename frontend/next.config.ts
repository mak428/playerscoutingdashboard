import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is default in Next.js 16; webpack fallback config is not needed
  // because Plotly is loaded client-side only via dynamic import (ssr: false)
  turbopack: {},
};

export default nextConfig;
