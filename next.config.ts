import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@fullcalendar/common', '@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/interaction'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
