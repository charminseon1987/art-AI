/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.railway.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "prod.spline.design",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.pages.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudflare.com",
        pathname: "/**",
      },
      // 다른 프로덕션 도메인 추가 시 여기에 추가
    ],
  },
  // Cloudflare Pages 배포를 위한 설정
  // @cloudflare/next-on-pages를 사용하므로 output 설정 제거
};

module.exports = nextConfig;
