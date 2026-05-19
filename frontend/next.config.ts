import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [], // thêm domain cloudinary sau nếu dùng
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
