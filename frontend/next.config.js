/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  },
  // Output configuration for static export (optional)
  // output: 'standalone', // Uncomment if using standalone build
}

module.exports = nextConfig

