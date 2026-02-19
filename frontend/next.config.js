const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Cloudflare Workers 로컬 개발 바인딩 에뮬레이션
// Cloudflare Workers 로컬 개발 바인딩 에뮬레이션
// import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) =>
//   initOpenNextCloudflareForDev(),
// );

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
  // Cloudflare Workers 배포를 위한 설정
  // @opennextjs/cloudflare를 사용
};

module.exports = withNextIntl(nextConfig);
