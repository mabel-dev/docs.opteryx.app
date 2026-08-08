const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reactStrictMode: true,
  // The site is served as static files from Firebase Hosting, not by `next
  // start`. Every route already builds ahead of time (each dynamic segment
  // has generateStaticParams and revalidate: false), so exporting loses
  // nothing. `trailingSlash` is deliberately left at its default: with
  // Firebase's cleanUrls, `/docs/reference/sql/functions` keeps working
  // exactly as it does today.
  output: 'export',
  // The image optimiser is a server; there isn't one. Both call sites render
  // a static SVG, which the optimiser passes through untouched anyway.
  images: { unoptimized: true }
}

export default nextConfig
