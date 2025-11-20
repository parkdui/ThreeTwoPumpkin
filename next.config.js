/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 정적 파일 최적화
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

