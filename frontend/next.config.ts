import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    dirs: ["app", "pages", "components", "hooks", "lib", "types"],
  },
  /* config options here */
};

export default nextConfig;
