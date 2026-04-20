import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 优化内存使用，适配 2G 服务器
  experimental: {
    optimizePackageImports: ['sharp', 'qrcode'],
  },
  // 生产环境优化
  poweredByHeader: false,
  compress: true,
  // Docker 部署需要 standalone 输出
  output: 'standalone',
  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
