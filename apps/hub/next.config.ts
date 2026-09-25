import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rn/brand', '@rn/db'],
};

export default nextConfig;
