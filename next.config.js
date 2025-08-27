
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          }
        ],
      },
    ];
  },
  // Fix cross-origin issues for Replit
  async rewrites() {
    return [
      {
        source: '/_next/:path*',
        destination: '/_next/:path*',
      },
    ];
  },
  // Configure allowed dev origins for Replit
  experimental: {
    allowedDevOrigins: ['*.replit.dev', '*.replit.co'],
  }
}

export default nextConfig
