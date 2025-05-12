// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [
            'drive.google.com',
            'lh3.googleusercontent.com',
            'docs.google.com',
        ],
    },
    env: {
        SITE_NAME: 'ToolUp Store',
    },
};

module.exports = nextConfig;