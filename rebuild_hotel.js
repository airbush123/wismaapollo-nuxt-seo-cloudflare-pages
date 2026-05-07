const fs = require('fs');
const path = require('path');

async function main() {
    // Get template from kuliner
    const templatePath = path.join(__dirname, 'dist', 'blog', 'kuliner-kuala-kurun', 'index.html');
    const tmpl = fs.readFileSync(templatePath, 'utf8');

    // Get hotel content from deployment 1d2f9d07
    const resp = await fetch('https://1d2f9d07.wisma-apollo.pages.dev/blog/hotel-di-kuala-kurun/');
    const old = await resp.text();

    // Extract article body content from old deployment
    const abStart = old.indexOf('<div class="article-body">');
    const footerStart = old.indexOf('<!-- FOOTER');
    let hotelContent = '';

    if (abStart > -1 && footerStart > -1) {
        // Get everything from article-body to just before footer
        hotelContent = old.substring(abStart, footerStart).trim();
        // Remove the trailing </div></div> wrappers present in old template
        while (hotelContent.endsWith('</div>')) {
            hotelContent = hotelContent.substring(0, hotelContent.lastIndexOf('</div>')).trim();
        }
    }

    // Find exact split points in the new template
    const heroTagEnd = tmpl.indexOf('loading="eager">');
    const split1Idx = tmpl.indexOf('\n', heroTagEnd) + 1; // Start of content line

    // Find where the related articles box starts
    const split2Idx = tmpl.indexOf('<div class="related-articles-box"');

    const part1 = tmpl.substring(0, split1Idx);
    const part2 = '\n' + hotelContent + '\n\n    ';
    const part3 = tmpl.substring(split2Idx);

    console.log('Part1 length:', part1.length);
    console.log('Hotel Content length:', hotelContent.length);
    console.log('Part3 length:', part3.length);

    let newHtml = part1 + part2 + part3;

    // Fix ALL meta tags and titles specifically for Hotel article
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

    // Content details
    newHtml = newHtml.replace(/class="article-tag">Kuliner<\/span>/, 'class="article-tag">Tips</span>');
    newHtml = newHtml.replace(/<h1>[\s\S]*?<\/h1>/, '<h1>Hotel di Kuala Kurun: Rekomendasi Penginapan Nyaman dan Strategis</h1>');
    newHtml = newHtml.replace(/<p class="article-date">[\s\S]*?<\/p>/, '<p class="article-date">17 April 2025 &bull; 7 menit baca</p>');

    // Hero image
    newHtml = newHtml.replace(/src="\/images\/gallery\/hotel-murah-kuala-kurun\.webp"\s+alt="Kuliner Kuala Kurun"\s+class="article-hero"/,
        'src="/images/blog/hotel-di-kuala-kurun.webp" alt="Rekomendasi Hotel Kuala Kurun" class="article-hero"');

    // JSON-LD
    newHtml = newHtml.replace(/"headline":\s*"Kuliner[^"]*"/, '"headline": "Hotel di Kuala Kurun: Rekomendasi Penginapan Nyaman dan Strategis"');
    newHtml = newHtml.replace(/"description":\s*"Kuliner[^"]*"/, '"description": "Cari penginapan strategis di Kuala Kurun? Wisma Apollo menawarkan harga mulai Rp200.000."');
    newHtml = newHtml.replace(/"image":\s*"[^"]*"/, '"image": "https://wisma-apollo.my.id/images/blog/hotel-di-kuala-kurun.webp"');
    newHtml = newHtml.replace(/"datePublished":\s*"[^"]*"/, '"datePublished": "2025-04-17"');

    // URL fix
    newHtml = newHtml.split('wisma-apollo.pages.dev').join('wisma-apollo.my.id');

    // Save the result
    const outPath = path.join(__dirname, 'dist', 'blog', 'hotel-di-kuala-kurun', 'index.html');
    fs.writeFileSync(outPath, newHtml, 'utf8');
    console.log('\nSaved! Final HTML length:', newHtml.length);

    // Verification checks
    console.log('No Kuliner specific content remaining?', !newHtml.includes('ikan jelawat') && !newHtml.includes('Kue Cucur'));
    console.log('Has Hotel article content?', newHtml.includes('Lokasi Super Strategis') || newHtml.includes('Update Terbaru Penginapan'));
}

main().catch(e => console.error(e));
