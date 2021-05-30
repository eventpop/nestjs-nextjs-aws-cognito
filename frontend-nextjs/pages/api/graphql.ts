import { createProxyMiddleware } from 'http-proxy-middleware'

export default createProxyMiddleware({
  target: process.env.NEXT_PUBLIC_GRAPHQL_SERVER_URL,
  changeOrigin: true,
})

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}
