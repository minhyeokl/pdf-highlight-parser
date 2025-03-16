/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 배포를 위한 설정
  output: process.env.VERCEL ? undefined : 'export',
  // GitHub Pages를 위한 설정은 GITHUB_ACTIONS 환경변수로 확인
  ...(process.env.GITHUB_ACTIONS && {
    basePath: '/pdf-highlight-parser',
    trailingSlash: true,
  }),
  images: { unoptimized: true },
  eslint: {
    // 빌드 시 ESLint 검사 비활성화
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 