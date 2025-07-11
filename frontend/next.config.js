/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: false, // Disable SWC minifier to avoid HeartbeatWorker issue
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }

        return config;
    },
    transpilePackages: ['@coinbase/wallet-sdk'],
    experimental: {
        esmExternals: 'loose',
    },
}

module.exports = nextConfig
