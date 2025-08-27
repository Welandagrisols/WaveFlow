
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: true
  },

}

export default nextConfig
