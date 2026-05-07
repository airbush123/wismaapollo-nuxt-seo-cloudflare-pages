const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'dist', 'blog');
const dirs = fs.readdirSync(blogDir).filter(f => fs.statSync(path.join(blogDir, f)).isDirectory());

let articles = [];

for (const dir of dirs) {
    const htmlPath = path.join(blogDir, dir, 'index.html');
    if (!fs.existsSync(htmlPath)) continue;

    const html = fs.readFileSync(htmlPath, 'utf8');

    // Extract Metadata
    let title = '';
    const h1Match = html.match(/<h1>(.*?)<\/h1>/);
    if (h1Match) title = h1Match[1].trim();

    let desc = '';
    const descMatch = html.match(/<meta name="description"[\s\S]*?content="([^"]*)">/);
    if (descMatch) desc = descMatch[1].trim();

    let image = '';
    // E.g. <img src="/images/blog/air-terjun-batu-mahasur.webp" alt="..." class="article-hero"
    const imgMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*class="article-hero"/);
    if (imgMatch) {
        image = imgMatch[1];
    } else {
        const ogImg = html.match(/og:image" content="([^"]*)"/);
        if (ogImg) image = new URL(ogImg[1]).pathname;
    }

    let dateStr = '';
    const dateMatch = html.match(/<p class="article-date">([0-9]+ [A-Za-z]+ [0-9]{4}) •/);
    if (dateMatch) {
        dateStr = dateMatch[1].trim();
    }

    let categoryName = 'Info';
    let categorySlug = 'info';
    // <a href="/blog/?category=wisata" class="article-tag">Wisata</a>
    const catMatch = html.match(/class="article-tag">([^<]+)<\//);
    if (catMatch) {
        // e.g "Info" or "Kuliner"
        categoryName = catMatch[1].trim();
        categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    if (!title || !image) {
        console.log(`Skipping ${dir} - missing title or image`);
        continue;
    }

    articles.push({
        dir,
        title,
        desc,
        image,
        categoryName,
        categorySlug,
        dateStr
    });
}

// Convert Indonesian month names to JS dates for sorting
const monthMap = { 'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11 };
articles.forEach(a => {
    let d = new Date(0);
    if (a.dateStr) {
        const parts = a.dateStr.split(' ');
        if (parts.length === 3) {
            d = new Date(parseInt(parts[2]), monthMap[parts[1]] || 0, parseInt(parts[0]));
        }
    }
    a.timestamp = d.getTime();
});

// Sort newest first
articles.sort((a, b) => b.timestamp - a.timestamp);

let cardsHtml = '';
for (const a of articles) {
    cardsHtml += `
        <!-- Blog Card: ${a.title} -->
        <a href="/blog/${a.dir}/" class="blog-card" data-category="${a.categorySlug}">
            <img src="${a.image}" alt="${a.title.replace(/"/g, '&quot;')}" width="480" height="180" loading="lazy" style="object-fit:cover;">
            <div class="blog-card-body">
                <span class="blog-card-tag">${a.categoryName}</span>
                <h2>${a.title}</h2>
                <p>${a.desc}</p>
                <span class="read-more">Baca Selengkapnya &rarr;</span>
            </div>
        </a>`;
}

// Now replace the cards in dist/blog/index.html
const blogIndexPath = path.join(blogDir, 'index.html');
let indexHtml = fs.readFileSync(blogIndexPath, 'utf8');

// The marker starts from the first <!-- Blog Card:
const markerStart = indexHtml.indexOf('<!-- Blog Card:');
const markerEnd = indexHtml.indexOf('<div class="no-results" id="noResults">');

if (markerStart > -1 && markerEnd > -1) {
    indexHtml = indexHtml.substring(0, markerStart) + cardsHtml.trim() + '\n        ' + indexHtml.substring(markerEnd);
    fs.writeFileSync(blogIndexPath, indexHtml, 'utf8');
    console.log('Successfully rebuilt blog index with all ' + dirs.length + ' articles.');
} else {
    // We can fallback to the category-chips / no-results regex
    const newHtml = indexHtml.replace(/(<\/div>\s*)(<!-- Blog Card:[\s\S]*?)(\s*<div class="no-results")/i, `$1${cardsHtml}$3`);
    if (newHtml !== indexHtml) {
        fs.writeFileSync(blogIndexPath, newHtml, 'utf8');
        console.log('Successfully rebuilt blog index using regex replace.');
    } else {
        console.log('Failed to find replace boundaries in blog index.html');
    }
}
