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
let foundQs = false;
for (const file of htmlFiles) {
    if (file.includes('lighthouse') || file.includes('test.html') || file.includes('temp_hotel_check')) continue;
    let content = fs.readFileSync(file, 'utf8');
    let lines = content.split('\n');
    lines.forEach((line, i) => {
        if (line.includes('')) {
            console.log(`${file}:${i + 1} : ${line.trim()}`);
            foundQs = true;
        }
    });
}
if (!foundQs) console.log("No obvious mojibakes found.");
