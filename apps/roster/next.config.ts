import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@rn/brand', '@rn/auth', '@rn/db'],
  reactStrictMode: true,
};

export default nextConfig;
