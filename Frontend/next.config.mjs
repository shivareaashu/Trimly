/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 800, // Check for changes every 800ms
        aggregateTimeout: 300, // Delay rebuild slightly for consecutive saves
        ignored: /node_modules/, // Do not watch node_modules
      };
    }
    return config;
  },
};

export default nextConfig;
