/** @type {import('next').NextConfig} */
const nextConfig = {

webpack: (config) => {
   config.externals = [...config.externals, 'tfjs-node'];
    return config;
  },
}
module.exports = nextConfig
