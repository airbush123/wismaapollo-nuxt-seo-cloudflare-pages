export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const lowerPath = pathname.toLowerCase();

  const legacyRedirects = new Map([
    [
      '/hotel-di-kuala-kurun-kalimantan-tengah-wisma-apollo-pilihan-strategis-nyaman/',
      '/blog/hotel-kuala-kurun-kalimantan-tengah/',
    ],
    [
      '/hotel-di-kuala-kurun-kalimantan-tengah-wisma-apollo-pilihan-strategis-nyaman',
      '/blog/hotel-kuala-kurun-kalimantan-tengah/',
    ],
  ]);

  if (pathname === '/robots.txt') {
    return new Response([
      'User-agent: *',
      'Allow: /',
      'Disallow: /wp-admin/',
      'Disallow: /wp-content/',
      'Disallow: /wp-includes/',
      'Disallow: /wp-json/',
      'Disallow: /xmlrpc.php',
      'Disallow: /feed/',
      'Disallow: /category/',
      'Disallow: /tag/',
      'Disallow: /author/',
      'Disallow: /?s=',
      'Disallow: /search/',
      'Disallow: /shop/',
      'Disallow: /cart/',
      'Disallow: /checkout/',
      'Disallow: /product/',
      '',
      'Sitemap: https://wisma-apollo.my.id/sitemap_index.xml',
      '',
    ].join('\n'), {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    });
  }

  const redirectTarget = legacyRedirects.get(pathname);
  if (redirectTarget) {
    url.pathname = redirectTarget;
    url.search = '';
    return Response.redirect(url.toString(), 301);
  }

  const spamSignals = [
    '/wp-admin',
    '/wp-content',
    '/wp-includes',
    '/wp-json',
    '/xmlrpc.php',
    '/shop',
    '/cart',
    '/checkout',
    '/product',
    'ebay',
    'rakuten',
    'yahoo-shopping',
    'amazon',
    'mercari',
    'japan',
    'jepang',
    '%e6',
    '%e7',
    '%e8',
    '%e9',
  ];

  if (spamSignals.some((signal) => lowerPath.includes(signal))) {
    return new Response('Gone', {
      status: 410,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'x-robots-tag': 'noindex, nofollow',
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
