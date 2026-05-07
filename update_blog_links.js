const fs = require('fs');
const path = require('path');

// 1. ADD REDIRECT FOR BATU SULI AND AIR TERJUN IF MISSING
const redirectsPath = path.join(__dirname, 'dist', '_redirects');
let redirects = fs.readFileSync(redirectsPath, 'utf8');

const newRedirects = `
/batu-suli-desa-upon-batu-wisata-alam-kalimantan-tengah /blog/batu-suli-desa-upon-batu/ 301
/batu-suli-desa-upon-batu-wisata-alam-kalimantan-tengah/ /blog/batu-suli-desa-upon-batu/ 301

/air-terjun-batu-mahasur-pesona-alam-tersembunyi-di-kuala-kurun /blog/air-terjun-batu-mahasur/ 301
/air-terjun-batu-mahasur-pesona-alam-tersembunyi-di-kuala-kurun/ /blog/air-terjun-batu-mahasur/ 301
`;

if (!redirects.includes('/blog/batu-suli-desa-upon-batu/')) {
    redirects += newRedirects;
    fs.writeFileSync(redirectsPath, redirects, 'utf8');
    console.log('Added redirects for Batu Suli and Air Terjun.');
} else {
    console.log('Redirects for Batu Suli and Air Terjun already exist.');
}

// 2. MAKE ARTICLE TAGS CLICKABLE LINKS
const blogDir = path.join(__dirname, 'dist', 'blog');
const articles = fs.readdirSync(blogDir).filter(f => fs.statSync(path.join(blogDir, f)).isDirectory());

let updated = 0;
for (const dir of articles) {
    const htmlPath = path.join(blogDir, dir, 'index.html');
    if (!fs.existsSync(htmlPath)) continue;

    let html = fs.readFileSync(htmlPath, 'utf8');
    let originalHtml = html;

    // Convert `<span class="article-tag">Category</span>` TO `<a href="/blog/?category=category-slug" class="article-tag">Category</a>`
    // Make sure we only replace <span> not <a> if it's already an <a>
    html = html.replace(/<span class="article-tag">([^<]+)<\/span>/g, (match, category) => {
        // Create a URL-friendly slug for the category
        // E.g., "Wisata Alam" -> "wisata-alam", "Kuliner" -> "kuliner"
        const slug = category.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        return `<a href="/blog/?category=${slug}" class="article-tag">${category}</a>`;
    });

    // Add text-decoration: none and hover state to .article-tag css
    // We add it just before </style> to ensure we don't mess up existing indentation
    if (!html.includes('.article-tag:hover') && html.includes('</style>')) {
        const hoverCss = `\n
        .article-tag {
            text-decoration: none !important;
            transition: background 0.2s, color 0.2s;
        }
        .article-tag:hover {
            background: #E86A33;
            color: #fff;
        }\n`;
        html = html.replace('</style>', hoverCss + '</style>');
    }

    if (html !== originalHtml) {
        fs.writeFileSync(htmlPath, html, 'utf8');
        updated++;
        console.log(`Updated tag to link in: ${dir}`);
    }
}

console.log(`Updated ${updated} formatting/tag links. Homepage was NOT touched.`);
