const fs = require('fs');
const path = require('path');

function getAllHtmlFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (file !== 'node_modules' && file !== '.wrangler' && file !== '.git') {
                arrayOfFiles = getAllHtmlFiles(dirPath + "/" + file, arrayOfFiles);
            }
        } else {
            if (file.endsWith('.html') && !file.includes('temp_')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });
    return arrayOfFiles;
}

const htmlFiles = getAllHtmlFiles(__dirname);
let filesModified = 0;

for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Fix blog date separators: <p class="article-date">17 Maret 2025 ?? 6 menit baca</p>
    // or <p class="article-date">17 Maret 2025  6 menit baca</p> etc.
    content = content.replace(/<p class="article-date">(\d{1,2} [A-Za-z]+ \d{4}).*?(\d+ menit baca)<\/p>/g, '<p class="article-date">$1 &bull; $2</p>');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        filesModified++;
        console.log('Fixed blog separator in ' + file);
    }
}

console.log('Done mapping blog separators. Modified ' + filesModified + ' files.');
