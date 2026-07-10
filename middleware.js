/** EdgeOne 边缘反代：同源 /api 转发到云托管，避免浏览器跨域 */
const API_ORIGIN = 'https://detective-engine-api-279923-8-1450903261.sh.run.tcloudbase.com';

export function middleware(context) {
  const { request, rewrite, next } = context;
  const url = new URL(request.url);
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    return rewrite(`${API_ORIGIN}${url.pathname}${url.search}`);
  }
  return next();
}

export const config = {
  matcher: ['/api', '/api/:path*'],
};
