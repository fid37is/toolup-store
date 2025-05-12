// next.config.js - Updated to allow Google Drive image domains
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [
            'drive.google.com',
            'lh3.googleusercontent.com',
            'googleusercontent.com'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'drive.google.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
                pathname: '/**',
            },
        ],
    },
}

module.exports = nextConfig