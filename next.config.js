/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
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
