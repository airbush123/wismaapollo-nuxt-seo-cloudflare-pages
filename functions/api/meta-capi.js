const DEFAULT_META_PIXEL_ID = '1094160098707832'
const DEFAULT_META_GRAPH_VERSION = 'v23.0'
const ALLOWED_EVENTS = new Set(['AddToCart', 'Lead'])

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

function cleanObject(value) {
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined && item !== null && item !== '')
      .map(([key, item]) => [key, Array.isArray(item) ? item.filter(Boolean) : item])
      .filter(([, item]) => !Array.isArray(item) || item.length > 0),
  )
}

export async function onRequestPost({ request, env }) {
  const accessToken = env.META_CAPI_ACCESS_TOKEN
  const pixelId = env.META_PIXEL_ID || DEFAULT_META_PIXEL_ID
  const graphVersion = env.META_GRAPH_VERSION || DEFAULT_META_GRAPH_VERSION

  if (!accessToken) {
    return jsonResponse({ ok: false, error: 'META_CAPI_ACCESS_TOKEN is not configured' }, 500)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON payload' }, 400)
  }

  const eventName = String(body.event_name || '')
  if (!ALLOWED_EVENTS.has(eventName)) {
    return jsonResponse({ ok: false, error: 'Unsupported event_name' }, 400)
  }

  const forwardedFor = request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')
    || ''
  const userAgent = request.headers.get('User-Agent') || ''
  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: String(body.event_id || ''),
    action_source: body.action_source || 'website',
    event_source_url: body.event_source_url || request.headers.get('Referer') || '',
    user_data: cleanObject({
      ...cleanObject(body.user_data),
      client_ip_address: forwardedFor.split(',')[0]?.trim(),
      client_user_agent: userAgent,
    }),
    custom_data: cleanObject(body.custom_data),
  }

  const metaPayload = {
    data: [event],
  }

  if (env.META_TEST_EVENT_CODE) {
    metaPayload.test_event_code = env.META_TEST_EVENT_CODE
  }

  const metaUrl = `https://graph.facebook.com/${graphVersion}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`
  const response = await fetch(metaUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metaPayload),
  })
  const result = await response.json().catch(() => ({}))

  return jsonResponse({
    ok: response.ok,
    status: response.status,
    result,
  }, response.ok ? 200 : 502)
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
      'Cache-Control': 'no-store',
    },
  })
}
