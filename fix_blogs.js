const fs = require('fs');
const path = require('path');

async function main() {
    // 1. Restore hotel-di-kuala-kurun from deployment with full content
    console.log('=== Restoring hotel-di-kuala-kurun ===');
    const resp = await fetch('https://1d2f9d07.wisma-apollo.pages.dev/blog/hotel-di-kuala-kurun/');
    let hotelHtml = await resp.text();
    hotelHtml = hotelHtml.split('wisma-apollo.pages.dev').join('wisma-apollo.my.id');

    // This deployment doesn't have back-btn/article-tag - we need to add them
    // First check what tag/category it should have
    // Looking at other articles, they have a back-btn link and article-tag before the h1
    // Let's insert them right after the nav closes

    const navEnd = hotelHtml.indexOf('</nav>');
    const containerStart = hotelHtml.indexOf('<div class="container">', navEnd);

    // Insert back-btn and article-tag after nav, before main content
    const backBtnHtml = `
    <div class="container">
        <a href="/blog/" class="back-btn">&larr; Kembali ke Blog</a>
    </div>
    <div class="container">
        <span class="article-tag">Hotel</span>`;

    // We need to add the back-btn CSS too
    const backBtnCss = `
        .back-btn {
            display: block;
            font-size: .85rem;
            font-weight: 600;
            color: #1B4332;
            padding: 8px 0;
            margin-top: 80px;
            margin-bottom: 16px;
            transition: color .2s
        }
        .back-btn:hover { color: #40916C }
        .article-tag {
            display: inline-block;
            font-size: .6rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #E86A33;
            border: 1px solid #E86A33;
            padding: 3px 10px;
            border-radius: 50px;
            margin-bottom: 12px
        }`;

    // Insert CSS before </style>
    hotelHtml = hotelHtml.replace('</style>', backBtnCss + '\n</style>');
    // Insert HTML after </nav>
    hotelHtml = hotelHtml.replace('</nav>', '</nav>\n' + backBtnHtml);

    fs.writeFileSync(
        path.join(__dirname, 'dist', 'blog', 'hotel-di-kuala-kurun', 'index.html'),
        hotelHtml, 'utf8'
    );
    console.log('hotel-di-kuala-kurun restored with full content + back-btn. Length:', hotelHtml.length);

    // 2. Fix ALL blog articles: make article-tag appear on its own line below back-btn
    console.log('\n=== Fixing category tag placement ===');
    const blogDir = path.join(__dirname, 'dist', 'blog');
    const articles = fs.readdirSync(blogDir).filter(f => {
        const fp = path.join(blogDir, f);
        return fs.statSync(fp).isDirectory() && fs.existsSync(path.join(fp, 'index.html'));
    });

    let fixed = 0;
    for (const article of articles) {
        const filePath = path.join(blogDir, article, 'index.html');
        let html = fs.readFileSync(filePath, 'utf8');
        let original = html;

        // Fix: change .back-btn from inline-flex to block so tag goes below
        html = html.replace(
            /\.back-btn\s*\{[^}]*display:\s*inline-flex;/g,
            (match) => match.replace('display: inline-flex;', 'display: inline-flex;\n            width: 100%;')
        );

        // Alternative: just add display:block to .back-btn
        html = html.replace(
            /\.back-btn\s*\{\s*\n\s*display:\s*inline-flex;/g,
            '.back-btn {\n            display: flex;'
        );

        if (html !== original) {
            fs.writeFileSync(filePath, html, 'utf8');
            fixed++;
            console.log('Fixed:', article);
        }
    }
    console.log('Fixed', fixed, 'articles');
}

main();
