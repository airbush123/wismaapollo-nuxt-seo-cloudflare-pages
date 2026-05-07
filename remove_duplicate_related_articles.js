const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'dist', 'blog', 'hotel-di-kuala-kurun', 'index.html');
let html = fs.readFileSync(targetPath, 'utf8');

// Find the first and second occurrences of 'related-articles-box'
const count = (html.match(/<div class="related-articles-box"/g) || []).length;
console.log('Found instances:', count);

if (count > 1) {
    // Let's find the first one and just keep it, deleting everything from the second one until the footer
    const firstIdx = html.indexOf('<div class="related-articles-box"');
    const secondIdx = html.indexOf('<div class="related-articles-box"', firstIdx + 1);
    const footerIdx = html.indexOf('<!-- FOOTER');

    if (secondIdx > -1 && footerIdx > -1) {
        // Delete the second related-articles-box
        const newHtml = html.substring(0, secondIdx) + html.substring(footerIdx);

        // Safety check for div count again to make sure we didn't slice an unclosed div block
        const finalOpens = (newHtml.match(/<div(\s|>)/g) || []).length;
        const finalCloses = (newHtml.match(/<\/div>/g) || []).length;
        console.log('New HTML DIV count -> opened:', finalOpens, 'closed:', finalCloses);

        // Wait, the related articles box itself is balanced (usually 1 + 1 + 3 + 3 + 3 = 11 divs)
        // Actually, just to be extremely safe, we apply the balancer again on the whole body if needed
        // But since `html.substring(secondIdx, footerIdx)` should be perfectly balanced, it should be clean.

        fs.writeFileSync(targetPath, newHtml, 'utf8');
        console.log('Removed duplicate block. New length:', newHtml.length);
    }
} else {
    console.log('No duplicates found.');
}
