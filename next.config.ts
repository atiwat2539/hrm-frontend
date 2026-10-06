import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@fullcalendar/common', '@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/interaction'],
};

export default nextConfig;
