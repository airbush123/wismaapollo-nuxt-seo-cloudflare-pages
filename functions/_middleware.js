export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

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
