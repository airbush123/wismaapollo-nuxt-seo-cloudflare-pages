const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const baseUrl = 'https://wisma-apollo.my.id';

function getAllHtmlFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllHtmlFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.html')) {
                arrayOfFiles.push(path.join(dirPath, file));
            }
        }
    });

    return arrayOfFiles;
}

const htmlFiles = getAllHtmlFiles(distDir);
let urls = [];

htmlFiles.forEach(filePath => {
    // Relative path from dist
    const relPath = path.relative(distDir, filePath).replace(/\\/g, '/');
    let urlPath = '/' + relPath;

    // Remove index.html
    urlPath = urlPath.replace(/\/index\.html$/, '/');
    if (urlPath === '/index.html') {
        urlPath = '/';
    }

    // We don't want to include 404 or other weird utility pages if any
    if (urlPath.includes('404')) return;

    // Determine priority and frequency
    let priority = '0.7';
    let freq = 'monthly';

    if (urlPath === '/') {
        priority = '1.0';
        freq = 'weekly';
    } else if (urlPath.startsWith('/blog/')) {
        if (urlPath === '/blog/') {
            priority = '0.9';
            freq = 'weekly';
        } else {
            priority = '0.8';
        }
    } else if (urlPath.split('/').length === 3) {
        // e.g /hotel-kuala-kurun/
        priority = '0.9';
    }

    // Attempt to get last modified from file stat
    const stat = fs.statSync(filePath);
    const mdate = new Date(stat.mtime);
    const lastmod = mdate.toISOString().split('T')[0]; // YYYY-MM-DD

    urls.push(`
  <url>
    <loc>${baseUrl}${urlPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
});

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
console.log('Successfully generated complete sitemap.xml with ' + urls.length + ' URLs');
