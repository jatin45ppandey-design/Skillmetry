/**
 * Some clients request /favicon.ico even though the app uses the branded SVG
 * metadata icon. Redirecting keeps that request on a real, cacheable asset.
 */
export function GET(request: Request) {
  return Response.redirect(new URL("/icon.svg", request.url), 307);
}
