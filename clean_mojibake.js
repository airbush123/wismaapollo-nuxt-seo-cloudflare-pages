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
            if (file.endsWith('.html') && !file.includes('temp_') && !file.includes('lighthouse')) {
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

    // Replace mojibake equivalents of dashes and quotes
    content = content.replace(/â€“/g, '-');
    content = content.replace(/â€”/g, '-');
    content = content.replace(/â€™/g, "'");
    content = content.replace(/â€œ|â€/g, '"');
    content = content.replace(/â€¦/g, '...');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        filesModified++;
        console.log('Fixed mojibake in ' + file);
    }
}

console.log('Done cleaning mojibake. Modified ' + filesModified + ' files.');
