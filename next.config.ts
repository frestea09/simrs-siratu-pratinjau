
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
   webpack: (config, { isServer }) => {
    // Exclude bcrypt and its dependency from server-side bundling
    if (isServer) {
      config.externals.push('@mapbox/node-pre-gyp');
      config.externals.push('bcrypt');
    }
    return config;
  },
};

export default nextConfig;
