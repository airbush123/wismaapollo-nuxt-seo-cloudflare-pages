const fs = require('fs');
const path = require('path');

// Check multiple deployments for hotel-di-kuala-kurun
const deployments = [
    '30d05367', 'b57a94ea', '36b970bc', '1d2f9d07',
    'dee927f4', '5ef64a2f', '47826b2c'
];

async function check() {
    for (const dep of deployments) {
        try {
            const url = `https://${dep}.wisma-apollo.pages.dev/blog/hotel-di-kuala-kurun/`;
            const resp = await fetch(url);
            const html = await resp.text();
            const hasBackBtn = html.includes('back-btn');
            const hasArticleTag = html.includes('article-tag');
            const hasNavId = html.includes('id="nav"');
            const hasArticleContent = html.includes('Wisma Apollo') && html.includes('Lokasi Super Strategis') || html.includes('penginapan');
            const bodyIdx = html.indexOf('<body');
            const footerIdx = html.indexOf('FOOTER');
            const contentBetween = footerIdx > bodyIdx ? html.substring(bodyIdx, footerIdx).length : 0;

            console.log(`${dep}: back-btn=${hasBackBtn} tag=${hasArticleTag} navId=${hasNavId} contentLen=${contentBetween} totalLen=${html.length}`);
        } catch (e) {
            console.log(`${dep}: ERROR ${e.message}`);
        }
    }
}

check();
