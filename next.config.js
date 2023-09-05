/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'icons.iconarchive.com',
				port: '',
				pathname: '/icons/**'
			}]
	}
}

module.exports = nextConfig
