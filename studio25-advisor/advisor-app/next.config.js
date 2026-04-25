/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    // Dev uses Webpack filesystem caches under `.next/cache/webpack/*.pack.gz`, including
    // `edge-server-development` for middleware (Edge). On Windows, especially under
    // OneDrive, those packs can corrupt or lock and fail to deserialize ("type error").
    // In-memory cache avoids flaky pack reads; cold compile may be slightly slower.
    if (dev) {
      config.cache = { type: 'memory' }
    }
    return config
  },
}

module.exports = nextConfig
