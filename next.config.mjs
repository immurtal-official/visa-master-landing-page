/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/pitch", destination: "/pitch/index.html" },
    ];
  },
};

export default nextConfig;
