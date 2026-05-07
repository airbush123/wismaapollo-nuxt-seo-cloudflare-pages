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
            if (file.endsWith('.html')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const htmlFiles = getAllHtmlFiles(__dirname);
console.log('Found ' + htmlFiles.length + ' HTML files.');

const replacements = [
    { p: /<span class="promo-fire">.*?<\/span>/g, r: '<span class="promo-fire">🔥</span>' },
    { p: /<div class="usp-icon">.*?<\/div>\s*<h3>Lokasi Strategis<\/h3>/g, r: '<div class="usp-icon">📍</div>\n                    <h3>Lokasi Strategis</h3>' },
    { p: /<div class="usp-icon">.*?<\/div>\s*<h3>Kedap Suara<\/h3>/g, r: '<div class="usp-icon">🔇</div>\n                    <h3>Kedap Suara</h3>' },
    { p: /<div class="usp-icon">.*?<\/div>\s*<h3>Kasur Premium<\/h3>/g, r: '<div class="usp-icon">🛏️</div>\n                    <h3>Kasur Premium</h3>' },
    { p: /<div class="usp-icon">.*?<\/div>\s*<h3>Kebersihan<\/h3>/g, r: '<div class="usp-icon">🧹</div>\n                    <h3>Kebersihan</h3>' },
    { p: /<span>.*?<\/span>Air Conditioner/g, r: '<span>❄️</span>Air Conditioner' },
    { p: /<span>.*?<\/span>TV Android/g, r: '<span>📺</span>TV Android' },
    { p: /<span>.*?<\/span>Handuk/g, r: '<span>🛁</span>Handuk' },
    { p: /<span>.*?<\/span>Bathroom Amenities/g, r: '<span>🧴</span>Bathroom Amenities' },
    { p: /<span>.*?<\/span>Kamar Mandi Dalam/g, r: '<span>🚿</span>Kamar Mandi Dalam' },
    { p: /<span>.*?<\/span>Kamar Bersih,/g, r: '<span>🔇</span>Kamar Bersih,' },
    { p: /<span>.*?<\/span>Free Wi-Fi/g, r: '<span>📶</span>Free Wi-Fi' },
    { p: /<span>.*?<\/span>Free Coffee/g, r: '<span>☕</span>Free Coffee' },
    { p: /<span>.*?<\/span>Air Mineral/g, r: '<span>💧</span>Air Mineral' },
    { p: /<span>.*?<\/span>Parkir Luas/g, r: '<span>🅿️</span>Parkir Luas' },
    { p: /<span>.*?<\/span>Keamanan/g, r: '<span>🛡️</span>Keamanan' },
    { p: /<span>.*?<\/span>Resepsionis/g, r: '<span>😊</span>Resepsionis' },
    { p: /<span>.*?<\/span>Sarapan/g, r: '<span>🍳</span>Sarapan' },
    { p: /<span>.*?<\/span>Tambahan/g, r: '<span>🛌</span>Tambahan' },
    { p: /<div class="testi-stars">.*?<\/div>/g, r: '<div class="testi-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>' },
    { p: /<span class="date">.*?(?:2024|2025|2026).*?<\/span>/g, r: (match) => { return '<span class="date">📅 ' + match.replace(/<span class="date">.*?(\d{1,2} [A-Za-z]+ \d{4})/, '$1'); } }
];

let filesModified = 0;

for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    for (const { p, r } of replacements) {
        if (typeof r === 'function') {
            content = content.replace(p, r);
        } else {
            content = content.replace(p, r);
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        filesModified++;
        console.log('Fixed ' + file);
    }
}

console.log('Done mapping emojis. Modified ' + filesModified + ' files.');
