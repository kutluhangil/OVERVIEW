/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: 'asset/source',
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'earthquake.usgs.gov',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'three'],
  },
};

module.exports = nextConfig;
