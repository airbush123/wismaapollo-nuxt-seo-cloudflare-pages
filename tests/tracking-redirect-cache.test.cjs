const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { stripTypeScriptTypes } = require('node:module');

const middlewareSource = fs.readFileSync('functions/_middleware.js', 'utf8');
const importSource = source => import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const middleware = importSource(middlewareSource);
const proxy = importSource(fs.readFileSync('functions/px/gtm/[file].js', 'utf8'));
const legacyRoutes = vm.runInNewContext(middlewareSource.match(/const legacyRedirects = new Map\((\[[\s\S]*?\])\);/)[1]);
const attributionKeys = ['gclid', 'GCLID', 'wbraid', 'gbraid', 'fbclid', 'p'];
const request = (url) => ({ request: new Request(url), next: () => new Response('next', { status: 202 }) });

test('all legacy destinations, including locale aliases, retain every click ID separately and stay 301', async () => {
  const { onRequest } = await middleware;
  for (const [path, target] of legacyRoutes) {
    for (const prefix of ['', '/en', '/zh']) {
      for (const key of attributionKeys) {
        const url = new URL('https://wisma-apollo.my.id' + prefix + path);
        url.searchParams.set(key, 'fixture+' + key + '&/?=%');
        const response = await onRequest(request(url));
        const location = new URL(response.headers.get('location'));
        assert.equal(response.status, 301);
        assert.equal(location.pathname, new URL(target, 'https://wisma-apollo.my.id').pathname);
        assert.equal(location.hash, new URL(target, 'https://wisma-apollo.my.id').hash);
        assert.deepEqual([...location.searchParams], [[key, 'fixture+' + key + '&/?=%']]);
      }
    }
  }
});

test('all legacy destinations remain query-free without attribution', async () => {
  const { onRequest } = await middleware;
  for (const [path, target] of legacyRoutes) {
    for (const suffix of ['', '?s=old+query&unrelated=discard']) {
      const response = await onRequest(request('https://wisma-apollo.my.id' + path + suffix));
      assert.equal(response.status, 301);
      const location = new URL(response.headers.get('location'));
      assert.equal(location.pathname, new URL(target, 'https://wisma-apollo.my.id').pathname);
      assert.equal(location.hash, new URL(target, 'https://wisma-apollo.my.id').hash);
      assert.equal(location.search, '');
    }
  }
});

test('s redirects to the same blog destination, retains each attribution key and removes s', async () => {
  const { onRequest } = await middleware;
  for (const path of ['/', '/en/', '/zh/', '/hotel-kuala-kurun/']) {
    for (const key of attributionKeys) {
      const url = new URL('https://wisma-apollo.my.id' + path);
      url.searchParams.set('s', 'hotel Kuala Kurun & 中文');
      url.searchParams.set(key, 'fixture-' + key);
      const response = await onRequest(request(url));
      const location = new URL(response.headers.get('location'));
      assert.equal(response.status, 301);
      assert.equal(location.pathname, '/blog/');
      assert.deepEqual([...location.searchParams], [[key, 'fixture-' + key]]);
    }
  }
  for (const query of ['s=', 's=hotel', 's=hotel&s=second']) {
    const response = await onRequest(request('https://wisma-apollo.my.id/?' + query));
    assert.equal(response.headers.get('location'), 'https://wisma-apollo.my.id/blog/');
  }
});

test('combined IDs, arbitrary utm_* fields, repeats and reserved/unicode encoding survive without s or junk', async () => {
  const { onRequest } = await middleware;
  const query = 's=hotel%20%26%20%22Apollo%22&s=second&gclid=a%2Bb%26c%3Dd%2F%3F%23%25&GCLID=upper&wbraid=wb&gbraid=gb&fbclid=fb&utm_source=google&utm_medium=cpc&utm_campaign=Kuala%20Kurun%20%26%20Apollo&utm_term=%E9%85%92%E5%BA%97&utm_custom=a%2Fb&utm_campaign=repeat&p=a%2Fb%3Fc%3Dd&junk=discard';
  const expected = [...new URLSearchParams(query)].filter(([key]) => attributionKeys.includes(key) || key.startsWith('utm_'));
  for (const path of ['/', '/harga/', '/chat/wisma-apollo/', '/en/penginapan-murah-kuala-kurun/', '/%E2%98%95-5-cafe-kopi-terbaik-di-kuala-kurun-spot-wajib-kunjung-di-sekitar-wisma-apollo-%E2%98%95/']) {
    const response = await onRequest(request('https://wisma-apollo.my.id' + path + '?' + query));
    const location = new URL(response.headers.get('location'));
    assert.deepEqual([...location.searchParams], expected);
    assert.equal(location.searchParams.get('gclid'), 'a+b&c=d/?#%');
    assert.equal(location.searchParams.get('utm_term'), '酒店');
    assert.equal(location.searchParams.has('s'), false);
    assert.equal(location.searchParams.has('junk'), false);
  }
  const repeated = await onRequest(request('https://wisma-apollo.my.id/harga?gclid=one&gclid=two'));
  assert.deepEqual(new URL(repeated.headers.get('location')).searchParams.getAll('gclid'), ['one', 'two']);
});

test('legacy chat resolves in one hop to rooms, retains attribution and uses a real fragment', async () => {
  const { onRequest } = await middleware;
  for (const path of ['/chat/wisma-apollo/', '/chat/wisma-apollo', '/en/chat/wisma-apollo/', '/zh/chat/wisma-apollo/']) {
    for (const suffix of ['', '#old', '?gclid=a%2Bb%26c&utm_campaign=two%20nights&s=discard&junk=discard#old']) {
      const response = await onRequest(request('https://wisma-apollo.my.id' + path + suffix));
      assert.equal(response.status, 301);
      const location = new URL(response.headers.get('location'));
      assert.equal(location.pathname, '/');
      assert.equal(location.hash, '#kamar');
      assert.equal(location.toString().includes('%23kamar'), false);
      assert.deepEqual([...location.searchParams], suffix.includes('?') ? [['gclid', 'a+b&c'], ['utm_campaign', 'two nights']] : []);
      assert.equal((await onRequest(request(location))).status, 202, 'Destination must not redirect again');
    }
  }
});

test('normal pages, pages.dev attribution and spam status keep their existing behavior', async () => {
  const { onRequest } = await middleware;
  for (const url of ['https://wisma-apollo.my.id/', 'https://wisma-apollo.my.id/hotel-kuala-kurun/?gclid=fixture']) {
    assert.equal((await onRequest(request(url))).status, 202);
  }
  const pages = await onRequest(request('https://wismaapollo.pages.dev/hotel-kuala-kurun/?wbraid=fixture&utm_source=google'));
  assert.equal(pages.status, 301);
  assert.equal(pages.headers.get('location'), 'https://wisma-apollo.my.id/hotel-kuala-kurun/?wbraid=fixture&utm_source=google');
  const spam = await onRequest(request('https://wisma-apollo.my.id/wp-admin/'));
  assert.equal(spam.status, 410);
  assert.equal(spam.headers.get('x-robots-tag'), 'noindex, nofollow');
});

test('proxy bypasses upstream cache and returns no-store across browser/CDN headers for success and errors', async () => {
  const { onRequestGet } = await proxy;
  const originalFetch = global.fetch;
  const calls = [];
  try {
    global.fetch = async (url, options) => {
      calls.push({ url, options });
      return new Response('fixture-' + calls.length, { status: [200, 404, 503][calls.length - 1], headers: {
        'cache-control': 'public, max-age=31536000, immutable',
        'cdn-cache-control': 'max-age=31536000', 'age': '100000',
        'expires': 'Wed, 01 Jan 2031 00:00:00 GMT',
        'surrogate-control': 'max-age=31536000',
      } });
    };
    for (const [i, status] of [200, 404, 503].entries()) {
      const result = await onRequestGet({ request: new Request('https://wisma-apollo.my.id/px/gtm/gtm.js?id=GTM-5995VJ5B&v=20261007-cache-policy-1'), params: { file: 'gtm.js' } });
      assert.equal(result.status, status);
      assert.equal(await result.text(), 'fixture-' + (i + 1));
      for (const key of ['cache-control', 'cdn-cache-control', 'cloudflare-cdn-cache-control']) assert.equal(result.headers.get(key), 'no-store');
      assert.equal(result.headers.get('age'), null);
      assert.equal(result.headers.get('expires'), null);
      assert.equal(result.headers.get('surrogate-control'), null);
      assert.equal(calls[i].options.cache, 'no-store');
      assert.equal(calls[i].options.cf, undefined);
      const upstream = new URL(calls[i].url);
      assert.equal(upstream.origin, 'https://www.googletagmanager.com');
      assert.equal(upstream.searchParams.get('id'), 'GTM-5995VJ5B');
      assert.equal(upstream.searchParams.get('v'), '20261007-cache-policy-1');
    }
    assert.equal(calls.length, 3);
  } finally { global.fetch = originalFetch; }
});

test('invalid proxy requests and OPTIONS stay restricted and uncached', async () => {
  const { onRequestGet, onRequestOptions } = await proxy;
  const originalFetch = global.fetch;
  try {
    global.fetch = () => { throw new Error('Unexpected upstream fetch'); };
    for (const [file, id, status] of [['other.js', 'GTM-5995VJ5B', 404], ['gtm.js', 'GTM-OTHER', 400]]) {
      const response = await onRequestGet({ request: new Request('https://wisma-apollo.my.id/px/gtm/' + file + '?id=' + id), params: { file } });
      assert.equal(response.status, status);
      assert.equal(response.headers.get('cache-control'), 'no-store');
    }
    assert.equal(onRequestOptions().status, 204);
    assert.equal(onRequestOptions().headers.get('cache-control'), 'no-store');
  } finally { global.fetch = originalFetch; }
});

function loaderEnvironment(search = '', outcome = 'onload') {
  const scripts = [];
  const location = new URL('https://wisma-apollo.my.id/' + search);
  const window = { location, dataLayer: [] };
  const document = { cookie: '', querySelector: () => scripts[0] || null,
    createElement: () => ({ dataset: {} }), head: { appendChild: script => { scripts.push(script); script[outcome](); } } };
  const storage = { getItem: () => null, setItem() {}, removeItem() {} };
  const source = fs.readFileSync('nuxt-app/app/composables/useTracking.ts', 'utf8');
  const js = stripTypeScriptTypes(source, { mode: 'transform' }).replace('export function useTracking', 'function useTracking');
  const context = vm.createContext({ window, document, localStorage: storage, sessionStorage: storage, URL, URLSearchParams, Date, Math, Set, Promise, console });
  vm.runInContext(js + '\nthis.first = useTracking(); this.second = useTracking();', context);
  return { scripts, window, first: context.first, second: context.second };
}

test('concurrent composables keep one GTM script/bootstrap, including Preview and existing error behavior', async () => {
  for (const [search, outcome] of [['', 'onload'], ['?gtm_preview=env-fixture&gtm_auth=fixture&gtm_debug=x', 'onload'], ['', 'onerror']]) {
    const env = loaderEnvironment(search, outcome);
    await Promise.all([env.first.loadGtm(), env.first.loadGtm(), env.second.loadGtm()]);
    await env.second.loadGtm();
    assert.equal(env.scripts.length, 1);
    assert.equal(env.window.dataLayer.filter(x => x.event === 'gtm.js').length, 1);
    assert.equal(env.window.dataLayer.length, 1, 'Cache changes must not introduce funnel events');
    const url = new URL(env.scripts[0].src, 'https://wisma-apollo.my.id');
    if (search) {
      assert.equal(url.origin, 'https://www.googletagmanager.com');
      assert.equal(url.searchParams.has('v'), false);
      assert.equal(url.searchParams.get('gtm_preview'), 'env-fixture');
    } else {
      assert.equal(url.pathname, '/px/gtm/gtm.js');
      assert.equal(url.searchParams.get('v'), '20261007-cache-policy-1');
    }
  }
});

test('tracking source changes only the loader cache version, preserving funnel and all other behavior', () => {
  const file = 'nuxt-app/app/composables/useTracking.ts';
  const baseline = execFileSync('git', ['show', 'HEAD:' + file], { encoding: 'utf8' }).replace(/\r\n/g, '\n');
  const current = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const withoutCacheVersion = text => text.replace(/const GTM_CACHE_VERSION = '[^']*'/, "const GTM_CACHE_VERSION = '<version>'");
  assert.equal(withoutCacheVersion(current), withoutCacheVersion(baseline));
});
