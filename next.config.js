/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  basePath: process.env.GITHUB_ACTIONS ? "/network-editor" : "",
  trailingSlash: true,
  images: {
    loader: 'imgix',
    path: '/',
  },
}
