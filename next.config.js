const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  images: {
    domains: ["localhost"],
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  poweredByHeader: false,

  // ✅ Hotfix build: ignore ESLint errors during `next build`
  // (Prettier rule tries to read tailwindcss/theme.css and crashes)
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config) => {
    // ================================================================
    // 🟡 ALIAS LGD
    // ================================================================
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "app"),
      canvas: false,
      "canvas-prebuilt": false,
    };

    // ================================================================
    // 🟡 Empêche Konva de charger sa version Node
    // ================================================================
    config.externals = [
      ...(config.externals || []),
      { canvas: "commonjs canvas" },
    ];

    // ================================================================
    // 🟡 Fix FINAL — Webpack fallback
    // ================================================================
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      canvas: false,
    };

    return config;
  },
};

module.exports = nextConfig;
