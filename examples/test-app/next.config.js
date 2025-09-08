// examples/test-app/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ['itangbao-auth-react', 'itangbao-aut-sdk', 'itangbao-auth-types'],
};

module.exports = nextConfig;
