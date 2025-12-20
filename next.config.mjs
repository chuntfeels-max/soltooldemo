/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 确保服务器端正确处理外部依赖
      config.externals = config.externals || [];
    }
    return config;
  },
};

export default nextConfig;

