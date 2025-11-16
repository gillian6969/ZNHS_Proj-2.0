/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize images for production
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.onrender.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
    ],
    // Reduce image quality to save memory
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    // Limit image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  // Reduce memory usage
  swcMinify: true,
  // Optimize bundle size
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig

