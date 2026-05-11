import { handleMetaEventRequest, handleOptions } from '../_meta-capi-core.js'

export async function onRequestPost(context) {
  return handleMetaEventRequest(context)
}

export function onRequestOptions() {
  return handleOptions()
}
