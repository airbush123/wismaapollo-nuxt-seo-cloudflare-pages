const fs = require('fs');
const path = require('path');

async function main() {
    const templatePath = path.join(__dirname, 'dist', 'blog', 'kuliner-kuala-kurun', 'index.html');
    const tmpl = fs.readFileSync(templatePath, 'utf8');

    // Fetch full content deployment
    const resp = await fetch('https://1d2f9d07.wisma-apollo.pages.dev/blog/hotel-di-kuala-kurun/');
    const old = await resp.text();

    // We want to extract just the inner P/H2 tags, avoiding the wrapper divs.
    // Content starts at the first <p> after article-body
    const abStart = old.indexOf('<div class="article-body">');
    const firstPIdx = old.indexOf('<p>', abStart);

    // Content ends right before the CTA Box or FOOTER
    // Let's find the closing of the last actual content paragraph/div before CTA
    const ctaIdx = old.indexOf('<!-- CTA Box -->');
    const endIdx = ctaIdx > -1 ? ctaIdx : old.indexOf('<!-- FOOTER');

    // The actual text content
    const hotelContent = old.substring(firstPIdx, endIdx).trim();

    // Template modifications
    const heroTagEnd = tmpl.indexOf('loading="eager">');
    const split1Idx = tmpl.indexOf('\n', heroTagEnd) + 1;
    const split2Idx = tmpl.indexOf('<div class="related-articles-box"');

    const part1 = tmpl.substring(0, split1Idx);
    const part2 = '\n' + hotelContent + '\n\n    ';
    const part3 = tmpl.substring(split2Idx);

    let newHtml = part1 + part2 + part3;

    // Let's verify newHtml div count:
    const opens = (newHtml.match(/<div(\s|>)/g) || []).length;
    const closes = (newHtml.match(/<\/div>/g) || []).length;
    console.log('Final DIV count -> opened:', opens, 'closed:', closes);

    // Apply meta tag updates again
    newHtml = newHtml.replace(/<title>[\s\S]*?<\/title>/, '<title>Hotel di Kuala Kurun: Penginapan Nyaman &amp; Strategis | Wisma Apollo</title>');
    newHtml = newHtml.replace(/<meta name="description"[\s\S]*?content="[^"]*">/,
        '<meta name="description"\n        content="Cari penginapan strategis di Kuala Kurun? Wisma Apollo menawarkan harga mulai Rp200.000, dekat Cafe Rumah Teduh, dengan kamar mandi dalam, AC dingin, dan WiFi kencang!">');
    newHtml = newHtml.replace(/<meta name="keywords"[\s\S]*?content="[^"]*">/,
        '<meta name="keywords"\n        content="hotel murah kuala kurun, penginapan kuala kurun, wisma apollo kuala kurun, hotel gunung mas">');
    newHtml = newHtml.replace(/rel="canonical" href="[^"]*"/, 'rel="canonical" href="https://wisma-apollo.my.id/blog/hotel-di-kuala-kurun/"');
    newHtml = newHtml.replace(/og:title" content="[^"]*"/, 'og:title" content="Hotel di Kuala Kurun: Penginapan Nyaman &amp; Strategis"');
    newHtml = newHtml.replace(/og:description"[\s\S]*?content="[^"]*"/, 'og:description"\n        content="Wisma Apollo: Hotel murah Rp200.000/malam di Kuala Kurun. AC, TV, WiFi, lokasi strategis."');
    newHtml = newHtml.replace(/og:url" content="[^"]*"/, 'og:url" content="https://wisma-apollo.my.id/blog/hotel-di-kuala-kurun/"');
    newHtml = newHtml.replace(/og:image" content="[^"]*"/, 'og:image" content="https://wisma-apollo.my.id/images/blog/hotel-di-kuala-kurun.webp"');
    newHtml = newHtml.replace(/class="article-tag">Kuliner<\/span>/, 'class="article-tag">Tips</span>');
    newHtml = newHtml.replace(/<h1>[\s\S]*?<\/h1>/, '<h1>Hotel di Kuala Kurun: Rekomendasi Penginapan Nyaman dan Strategis</h1>');
    newHtml = newHtml.replace(/<p class="article-date">[\s\S]*?<\/p>/, '<p class="article-date">17 April 2025 &bull; 7 menit baca</p>');
    newHtml = newHtml.replace(/src="\/images\/gallery\/hotel-murah-kuala-kurun\.webp"\s+alt="Kuliner Kuala Kurun"\s+class="article-hero"/,
        'src="/images/blog/hotel-di-kuala-kurun.webp" alt="Rekomendasi Hotel Kuala Kurun" class="article-hero"');
    newHtml = newHtml.replace(/"headline":\s*"Kuliner[^"]*"/, '"headline": "Hotel di Kuala Kurun: Rekomendasi Penginapan Nyaman dan Strategis"');
    newHtml = newHtml.replace(/"description":\s*"Kuliner[^"]*"/, '"description": "Cari penginapan strategis di Kuala Kurun? Wisma Apollo menawarkan harga mulai Rp200.000."');
    newHtml = newHtml.replace(/"image":\s*"[^"]*"/, '"image": "https://wisma-apollo.my.id/images/blog/hotel-di-kuala-kurun.webp"');
    newHtml = newHtml.replace(/"datePublished":\s*"[^"]*"/, '"datePublished": "2025-04-17"');
    newHtml = newHtml.split('wisma-apollo.pages.dev').join('wisma-apollo.my.id');

    fs.writeFileSync(path.join(__dirname, 'dist', 'blog', 'hotel-di-kuala-kurun', 'index.html'), newHtml, 'utf8');
}

main().catch(e => console.error(e));
