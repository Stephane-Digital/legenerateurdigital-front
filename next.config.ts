import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // évite le double-montage en dev
  images: { domains: ["localhost"] },
  experimental: { optimizePackageImports: ["lucide-react", "framer-motion"] },
  poweredByHeader: false
};

export default nextConfig;
