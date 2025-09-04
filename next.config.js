/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Avoid bundling Node polyfills for exceljs browser build
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        stream: false,
        crypto: false,
        path: false,
      }
    }
    return config
  },
}

module.exports = nextConfig

