import { jsonResponse, sendMetaEvent } from '../_meta-capi-core.js'

const GOOGLE_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2g1_ZDFhthbNDepnazQJu3hze_Cz24odh0Yjj8nf9xppSCQisS3ZK233EQW2s0wflOw/exec'

async function forwardToAppsScript(fields) {
  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, String(value ?? ''))
  })

  try {
    const response = await fetch(GOOGLE_APP_SCRIPT_URL, {
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

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON payload' }, 400)
  }

  const fields = body.fields || {}
  const metaEvent = body.metaEvent || {}
  const [sheetResult, metaResult] = await Promise.all([
    forwardToAppsScript(fields),
    sendMetaEvent({
      request,
      env,
      body: {
        ...metaEvent,
        event_name: 'Lead',
      },
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
