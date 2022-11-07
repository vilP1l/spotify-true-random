/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    runtime: 'nodejs',
    externalDir: true
  },
  images: {
    domains: ["i.scdn.co"],
  }
}

module.exports = nextConfig
