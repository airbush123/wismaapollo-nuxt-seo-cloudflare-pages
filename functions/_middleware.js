export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  if (url.pathname === '/robots.txt') {
    return new Response('User-agent: *\nAllow: /\n\nSitemap: https://wisma-apollo.my.id/sitemap.xml\n', {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    });
  }

  // If the hostname is the default pages.dev domain
  if (url.hostname.endsWith('.pages.dev')) {
    // Switch to our custom domain
    url.hostname = 'wisma-apollo.my.id';
    // 301 Permanent Redirect
    return Response.redirect(url.toString(), 301);
  }

  // Continue to next middleware or static asset
  return context.next();
}
