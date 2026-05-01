import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 運動記録のスクショアップロード用。クライアント側で長辺 1280px に縮小してから送るが、念のため余裕を持たせる
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
