/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable SWC minification for better performance
  swcMinify: true,
  // Environment variables that should be available on the client side
  env: {
    HELIUS_API_KEY: process.env.HELIUS_API_KEY,
    API_KEY: process.env.API_KEY,
  },
};

module.exports = nextConfig;

