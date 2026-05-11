const GTM_ORIGIN = 'https://www.googletagmanager.com'
const ALLOWED_GTM_IDS = new Set(['GTM-5995VJ5B'])

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

export async function onRequestGet({ request, params }) {
  const file = params.file || ''
  const url = new URL(request.url)
  const id = url.searchParams.get('id') || ''

  if (file !== 'gtm.js') {
    return jsonResponse({ ok: false, error: 'Not found' }, 404)
  }

  if (!ALLOWED_GTM_IDS.has(id)) {
    return jsonResponse({ ok: false, error: 'Invalid GTM container' }, 400)
  }

  const originUrl = new URL('/gtm.js', GTM_ORIGIN)
  originUrl.searchParams.set('id', id)

  const response = await fetch(originUrl.toString(), {
    headers: {
      'user-agent': request.headers.get('user-agent') || 'Mozilla/5.0',
      accept: 'application/javascript,text/javascript,*/*;q=0.8',
    },
    cf: {
      cacheTtl: 300,
      cacheEverything: true,
    },
  })

  const headers = new Headers(response.headers)
  headers.set('content-type', 'application/javascript; charset=utf-8')
  headers.set('cache-control', 'public, max-age=300, s-maxage=300')
  headers.set('x-robots-tag', 'noindex')

  return new Response(response.body, {
    status: response.status,
    headers,
  })
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'GET, OPTIONS',
      'Cache-Control': 'no-store',
    },
  })
}
