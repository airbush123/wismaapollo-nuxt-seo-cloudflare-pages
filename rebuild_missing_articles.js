const fs = require('fs');
const path = require('path');

async function rebuildArticle(slug, oldUrl, category) {
    const templatePath = path.join(__dirname, 'dist', 'blog', 'kuliner-kuala-kurun', 'index.html');
    const tmpl = fs.readFileSync(templatePath, 'utf8');

    // Fetch from old deployment
    const resp = await fetch(oldUrl);
    const old = await resp.text();

    // Extract article HTML
    const abStart = old.indexOf('<div class="article-body">');
    const firstPIdx = old.indexOf('<p>', abStart);

    // They either end at CTA Box, Artikel Terkait, or FOOTER
    let endIdx = old.indexOf('<!-- CTA Box -->');
    if (endIdx === -1) endIdx = old.indexOf('<!-- Artikel Terkait');
    if (endIdx === -1) endIdx = old.indexOf('<div class="related-articles-box"');
    if (endIdx === -1) endIdx = old.indexOf('<!-- FOOTER');

    let articleContent = old.substring(firstPIdx, endIdx).trim();

    // BALANCE DIVS
    let opens = (articleContent.match(/<div(\s|>)/g) || []).length;
    let closes = (articleContent.match(/<\/div>/g) || []).length;

    while (closes > opens && articleContent.endsWith('</div>')) {
        articleContent = articleContent.substring(0, articleContent.lastIndexOf('</div>')).trim();
        closes--;
    }
    while (closes > opens) {
        const lastIdx = articleContent.lastIndexOf('</div>');
        if (lastIdx > -1) {
            articleContent = articleContent.substring(0, lastIdx) + articleContent.substring(lastIdx + 6);
            closes--;
        } else break;
    }
    while (closes < opens) {
        articleContent += '\n</div>';
        closes++;
    }

    // Use the template split points
    const heroTagEnd = tmpl.indexOf('loading="eager">');
    const split1Idx = tmpl.indexOf('\n', heroTagEnd) + 1;
    const split2Idx = tmpl.indexOf('<div class="related-articles-box"');

    let newHtml = tmpl.substring(0, split1Idx) + '\n' + articleContent + '\n\n    ' + tmpl.substring(split2Idx);

    // META TAGS / TITLE REPLACEMENTS
    // Extract real h1
    const h1Match = old.match(/<h1>(.*?)<\/h1>/s);
    const h1Text = h1Match ? h1Match[1].trim() : '';

    newHtml = newHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${h1Text} | Wisma Apollo</title>`);
    newHtml = newHtml.replace(/<meta name="description"[\s\S]*?content="[^"]*">/,
        `<meta name="description"\n        content="${h1Text}. Baca panduan lengkapnya di blog Wisma Apollo Kuala Kurun.">`);
    newHtml = newHtml.replace(/<meta name="keywords"[\s\S]*?content="[^"]*">/,
        `<meta name="keywords"\n        content="${slug.split('-').join(' ')}, kuala kurun, gunung mas, kalimantan tengah">`);

    newHtml = newHtml.replace(/rel="canonical" href="[^"]*"/, `rel="canonical" href="https://wisma-apollo.my.id/blog/${slug}/"`);

    newHtml = newHtml.replace(/og:title" content="[^"]*"/, `og:title" content="${h1Text}"`);
    newHtml = newHtml.replace(/og:description"[\s\S]*?content="[^"]*"/, `og:description"\n        content="${h1Text}. Baca panduan lengkapnya."`);
    newHtml = newHtml.replace(/og:url" content="[^"]*"/, `og:url" content="https://wisma-apollo.my.id/blog/${slug}/"`);
    // Same hero img handling
    newHtml = newHtml.replace(/og:image" content="[^"]*"/, `og:image" content="https://wisma-apollo.my.id/images/blog/${slug}.webp"`);

    // Category Link handling (We need to convert template's Kuliner to <a href... class="article-tag">)
    const catSlug = category.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    newHtml = newHtml.replace(/<a href="\/blog\/\?category=[^"]*"[^>]*>[^<]*<\/a>/i, `<a href="/blog/?category=${catSlug}" class="article-tag">${category}</a>`);
    // If template still had the un-linked <span> version for some reason
    newHtml = newHtml.replace(/<span class="article-tag">[^<]*<\/span>/, `<a href="/blog/?category=${catSlug}" class="article-tag">${category}</a>`);

    // Rest
    newHtml = newHtml.replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${h1Text}</h1>`);
    newHtml = newHtml.replace(/src="\/images\/gallery\/hotel-murah-kuala-kurun\.webp"\s+alt="Kuliner Kuala Kurun"\s+class="article-hero"/,
        `src="/images/blog/${slug}.webp" alt="${h1Text}" class="article-hero"`);

    // JSON-LD
    newHtml = newHtml.replace(/"headline":\s*"Kuliner[^"]*"/, `"headline": "${h1Text}"`);
    newHtml = newHtml.replace(/"description":\s*"Kuliner[^"]*"/, `"description": "${h1Text}"`);
    newHtml = newHtml.replace(/"image":\s*"[^"]*"/, `"image": "https://wisma-apollo.my.id/images/blog/${slug}.webp"`);

    newHtml = newHtml.split('wisma-apollo.pages.dev').join('wisma-apollo.my.id');

    const outPath = path.join(__dirname, 'dist', 'blog', slug, 'index.html');
    fs.writeFileSync(outPath, newHtml, 'utf8');
    console.log(`[SUCCESS] Rebuilt ${slug}. Content length: ${articleContent.length}, Final HTML: ${newHtml.length}`);
}

async function run() {
    await rebuildArticle('batu-suli-desa-upon-batu', 'https://47826b2c.wisma-apollo.pages.dev/blog/batu-suli-desa-upon-batu/', 'Wisata');
    await rebuildArticle('bundaran-kuala-kurun', 'https://47826b2c.wisma-apollo.pages.dev/blog/bundaran-kuala-kurun/', 'Info');
    await rebuildArticle('icon-tugu-selamat-datang-kuala-kurun', 'https://47826b2c.wisma-apollo.pages.dev/blog/icon-tugu-selamat-datang-kuala-kurun/', 'Info');
}

run().catch(e => console.error(e));
