const fs = require('fs');

const p = 'dist/blog/air-terjun-batu-mahasur/index.html';
let html = fs.readFileSync(p, 'utf8');

if (!html.includes('article-tag')) {
    html = html.replace('<h1>', '<a href="/blog/?category=wisata" class="article-tag">Wisata</a>\n        <h1>');
    fs.writeFileSync(p, html, 'utf8');
    console.log('Added article-tag to air terjun');
} else {
    console.log('Already has article-tag');
}
