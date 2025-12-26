import withMDX from '@next/mdx'

const withMDXConfig = withMDX({ extension: /\.(md|mdx)$/ })

const nextConfig = withMDXConfig({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true
})

export default nextConfig
