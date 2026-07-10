/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'graph.instagram.com' },
    ],
    unoptimized: false,
  },
  async rewrites() {
    return [
      {
        source: '/uploads/previews/:name',
        destination: '/api/preview/:name',
      },
    ]
  },
}

module.exports = nextConfig
