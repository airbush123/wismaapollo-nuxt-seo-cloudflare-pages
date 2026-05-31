import { jsonResponse, sendMetaEvent } from '../_meta-capi-core.js'

async function forwardToAppsScript(fields, env) {
  const appsScriptUrl = env.GOOGLE_APP_SCRIPT_URL
  if (!appsScriptUrl) {
    return {
      ok: false,
      status: 500,
      error: 'GOOGLE_APP_SCRIPT_URL is not configured',
    }
  }

  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, String(value ?? ''))
  })

  try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      body: formData,
    })

    return {
      ok: response.ok,
      status: response.status,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Apps Script request failed',
    }
  }
}

async function parseLeadRequest(request) {
  const contentType = request.headers.get('Content-Type') || ''

  if (contentType.includes('application/json')) {
    const body = await request.json()
    return {
      fields: body.fields || {},
      metaEvent: body.metaEvent || {},
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    return {
      fields: Object.fromEntries(formData.entries()),
      metaEvent: {},
    }
  }

  throw new Error('Unsupported payload')
}

function buildMetaEvent(fields, metaEvent) {
  if (Object.keys(metaEvent).length > 0) {
    return {
      ...metaEvent,
      event_name: 'Lead',
    }
  }

  const hashedPhone = fields.metaHashedPhone || fields.hashedPhone || fields.sha256_phone_number || ''

  return {
    event_name: 'Lead',
    event_id: fields.eventId || fields.transactionId || '',
    event_source_url: fields.pageLocation || '',
    action_source: 'website',
    user_data: {
      ph: hashedPhone ? [hashedPhone] : undefined,
      fbp: fields.fbp || undefined,
      fbc: fields.fbc || undefined,
    },
    custom_data: {
      content_name: 'Wisma Apollo Booking Lead',
      content_category: fields.roomType || '',
      value: Number(fields.totalValue || 0) || undefined,
      currency: 'IDR',
      lead_source: fields.source || '',
      room_summary: fields.roomSummary || '',
      room_count: fields.roomCount || '',
      stay_nights: fields.stayNights || '',
    },
  }
}

export async function onRequestPost({ request, env }) {
  let parsedBody
  try {
    parsedBody = await parseLeadRequest(request)
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid booking lead payload' }, 400)
  }

  const fields = parsedBody.fields || {}
  const metaEvent = buildMetaEvent(fields, parsedBody.metaEvent || {})
  const [sheetResult, metaResult] = await Promise.all([
    forwardToAppsScript(fields, env),
    sendMetaEvent({
      request,
      env,
      body: metaEvent,
    }).then((response) => response.json()).catch((error) => ({
      ok: false,
      error: error instanceof Error ? error.message : 'Meta CAPI request failed',
    })),
  ])

  return jsonResponse({
    ok: sheetResult.ok,
    sheet: sheetResult,
    meta: metaResult,
  }, sheetResult.ok ? 200 : 502)
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
