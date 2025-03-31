/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  compiler: {
    styledComponents: true,
  },
  typescript: {
    // Ignorar erros de tipo durante o build (use com cautela)
    ignoreBuildErrors: true
  },
  eslint: {
    // Ignorar erros de lint durante o build (use com cautela)
    ignoreDuringBuilds: true
  },
  staticPageGenerationTimeout: 120,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;