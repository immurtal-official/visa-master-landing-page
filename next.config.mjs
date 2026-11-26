/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/pitch", destination: "/pitch/index.html" },
      { source: "/pitch-vm2luya", destination: "/pitch-vm2luya/index.html" },
      { source: "/pitch-vm2luya/en", destination: "/pitch-vm2luya/en/index.html" },
    ];
  },
};

export default nextConfig;
