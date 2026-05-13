export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const decodedPathname = safeDecodePath(pathname);
  const normalizedPathname = stripLocalePrefix(pathname);
  const normalizedDecodedPathname = stripLocalePrefix(decodedPathname);
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
    ['/hotel-di-kuala-kurun-rekomendasi-penginapan-nyaman-dan-strategis/', '/blog/hotel-di-kuala-kurun/'],
    ['/hotel-di-kuala-kurun-rekomendasi-penginapan-nyaman-dan-strategis', '/blog/hotel-di-kuala-kurun/'],
    ['/penginapan-murah-kuala-kurun/', '/blog/penginapan-murah-kuala-kurun/'],
    ['/penginapan-murah-kuala-kurun', '/blog/penginapan-murah-kuala-kurun/'],
    ['/air-terjun-batu-mahasur-keindahan-tersembunyi-di-kuala-kurun/', '/blog/air-terjun-batu-mahasur/'],
    ['/air-terjun-batu-mahasur-keindahan-tersembunyi-di-kuala-kurun', '/blog/air-terjun-batu-mahasur/'],
    ['/%E2%98%95-5-cafe-kopi-terbaik-di-kuala-kurun-spot-wajib-kunjung-di-sekitar-wisma-apollo-%E2%98%95/', '/blog/5-cafe-kopi-terbaik-di-kuala-kurun/'],
    ['/%E2%98%95-5-cafe-kopi-terbaik-di-kuala-kurun-spot-wajib-kunjung-di-sekitar-wisma-apollo-%E2%98%95', '/blog/5-cafe-kopi-terbaik-di-kuala-kurun/'],
    ['/menikmati-keindahan-alam-batu-suli-di-desa-upon-batu-kabupaten-gunung-mas/', '/blog/batu-suli-desa-upon-batu/'],
    ['/menikmati-keindahan-alam-batu-suli-di-desa-upon-batu-kabupaten-gunung-mas', '/blog/batu-suli-desa-upon-batu/'],
    ['/bundaran-kuala-kurun-simbol-kota-yang-menyimpan-pesona/', '/blog/bundaran-kuala-kurun/'],
    ['/bundaran-kuala-kurun-simbol-kota-yang-menyimpan-pesona', '/blog/bundaran-kuala-kurun/'],
    ['/icon-tugu-selamat-datang-di-kuala-kurun-simbol-identitas-dan-keramahan-kota/', '/blog/bundaran-kuala-kurun/'],
    ['/icon-tugu-selamat-datang-di-kuala-kurun-simbol-identitas-dan-keramahan-kota', '/blog/bundaran-kuala-kurun/'],
    ['/harga/', '/hotel-kuala-kurun/'],
    ['/harga', '/hotel-kuala-kurun/'],
    ['/hotel-murah-kuala-kurun/', '/hotel-kuala-kurun/'],
    ['/hotel-murah-kuala-kurun', '/hotel-kuala-kurun/'],
    ['/guest-house-kurun/', '/guest-house-kuala-kurun/'],
    ['/guest-house-kurun', '/guest-house-kuala-kurun/'],
    ['/penginapan-kurun/', '/penginapan-kuala-kurun/'],
    ['/penginapan-kurun', '/penginapan-kuala-kurun/'],
    ['/faq-wisma/', '/faq/'],
    ['/faq-wisma', '/faq/'],
    ['/tentang-kami/', '/'],
    ['/tentang-kami', '/'],
    ['/2024/10/', '/blog/'],
    ['/2024/10', '/blog/'],
    ['/2025/06/', '/blog/'],
    ['/2025/06', '/blog/'],
    ['/category/hotel-kuala-kurun/', '/blog/'],
    ['/category/hotel-kuala-kurun', '/blog/'],
    ['/category/penginapan-kuala-kurun/', '/blog/'],
    ['/category/penginapan-kuala-kurun', '/blog/'],
    ['/tag/guest-house-kurun/', '/guest-house-kuala-kurun/'],
    ['/tag/guest-house-kurun', '/guest-house-kuala-kurun/'],
    ['/tag/staycation-kuala-kurun/', '/staycation-kuala-kurun/'],
    ['/tag/staycation-kuala-kurun', '/staycation-kuala-kurun/'],
    ['/tag/penginapan-di-kuala-kurun/', '/penginapan-kuala-kurun/'],
    ['/tag/penginapan-di-kuala-kurun', '/penginapan-kuala-kurun/'],
    ['/tag/kuala-kurun/', '/blog/'],
    ['/tag/kuala-kurun', '/blog/'],
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

  const redirectTarget = legacyRedirects.get(pathname) ||
    legacyRedirects.get(decodedPathname) ||
    legacyRedirects.get(normalizedPathname) ||
    legacyRedirects.get(normalizedDecodedPathname);
  if (redirectTarget) {
    url.pathname = redirectTarget;
    url.search = '';
    return Response.redirect(url.toString(), 301);
  }

  if (url.searchParams.has('s')) {
    url.pathname = '/blog/';
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

  if (
    lowerPath === '/*' ||
    (lowerPath.startsWith('/wp-') && lowerPath.endsWith('.php')) ||
    spamSignals.some((signal) => lowerPath.includes(signal))
  ) {
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

function safeDecodePath(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function stripLocalePrefix(pathname) {
  return pathname.replace(/^\/(?:en|zh)(?=\/)/, '');
}
