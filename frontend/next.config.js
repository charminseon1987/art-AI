/** @type {import('next').NextConfig} */
const path = require('path');

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
  turbopack: {
    // Cloudflare Pages 빌드 환경에서 프로젝트 루트 명시적 지정
    // frontend 디렉토리가 루트이므로 __dirname을 사용하여 절대 경로로 설정
    root: __dirname,
  },
};

module.exports = nextConfig;
