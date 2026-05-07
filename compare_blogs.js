const fs = require('fs');
const path = require('path');

// List all blog articles in dist/blog
const blogDir = path.join(__dirname, 'dist', 'blog');
const articles = fs.readdirSync(blogDir).filter(f => {
    const fp = path.join(blogDir, f);
    return fs.statSync(fp).isDirectory() && fs.existsSync(path.join(fp, 'index.html'));
});

console.log('Found', articles.length, 'blog articles:\n');

for (const article of articles) {
    const html = fs.readFileSync(path.join(blogDir, article, 'index.html'), 'utf8');
    const hasBackBtn = html.includes('back-btn');
    const hasArticleTag = html.includes('article-tag');
    const hasBlogHero = html.includes('blog-hero');
    const hasNavId = html.includes('id="nav"');
    const hasNavClass = html.includes('class="nav"');
    const hasArticleBody = html.includes('article-body');
    const hasContainerArticle = html.includes('container');
    const bodyStart = html.indexOf('<body');
    const bodySnippet = html.substring(bodyStart, bodyStart + 500).replace(/\s+/g, ' ');

    console.log(`=== ${article} ===`);
    console.log(`  back-btn: ${hasBackBtn}`);
    console.log(`  article-tag: ${hasArticleTag}`);
    console.log(`  blog-hero: ${hasBlogHero}`);
    console.log(`  nav id="nav": ${hasNavId}`);
    console.log(`  nav class="nav": ${hasNavClass}`);
    console.log(`  article-body: ${hasArticleBody}`);
    console.log(`  Length: ${html.length}`);
    console.log('');
}
