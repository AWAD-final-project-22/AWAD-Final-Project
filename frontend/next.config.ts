import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
