/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BACKEND_URL ?? 'https://crypto-wallet-gse7.onrender.com'}/:path*`
      }
    ];
  }
};

export default nextConfig;