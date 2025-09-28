/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
    responseLimit: false,
  },
}

module.exports = nextConfig
