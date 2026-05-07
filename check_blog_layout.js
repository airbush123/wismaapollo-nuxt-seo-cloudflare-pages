const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'dist', 'blog');
const articles = fs.readdirSync(blogDir).filter(f => {
    const fp = path.join(blogDir, f);
    return fs.statSync(fp).isDirectory() && fs.existsSync(path.join(fp, 'index.html'));
});

// Check first article for the back-btn / article-tag layout
const html = fs.readFileSync(path.join(blogDir, articles[0], 'index.html'), 'utf8');

// Find the back-btn and article-tag context
const backIdx = html.indexOf('back-btn');
if (backIdx > -1) {
    console.log('=== HTML around back-btn ===');
    console.log(html.substring(backIdx - 50, backIdx + 300));
}

console.log('\n=== CSS for back-btn and article-tag ===');
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
    const css = styleMatch[1];
    const lines = css.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('back-btn') || lines[i].includes('article-tag')) {
            for (let j = Math.max(0, i - 1); j < Math.min(lines.length, i + 10); j++) {
                console.log((j + 1) + ': ' + lines[j].trim());
            }
            console.log('---');
        }
    }
}
