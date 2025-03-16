/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/pdf-highlight-parser',
  assetPrefix: '/pdf-highlight-parser/',
  images: { unoptimized: true },
  eslint: {
    // 빌드 시 ESLint 검사 비활성화
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 