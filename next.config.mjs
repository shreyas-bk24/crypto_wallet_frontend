/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BACKEND_URL ?? 'http://localhost:8080'}/:path*`
      }
    ];
  }
};

export default nextConfig;