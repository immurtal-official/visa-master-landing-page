/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/pitch", destination: "/pitch/index.html" },
      { source: "/luya-market", destination: "/luya-market/index.html" },
    ];
  },
};

export default nextConfig;
