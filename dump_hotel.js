const fs = require('fs');
async function main() {
    const resp = await fetch('https://1d2f9d07.wisma-apollo.pages.dev/blog/hotel-di-kuala-kurun/');
    const old = await resp.text();
    const abStart = old.indexOf('<div class="article-body">');
    const firstPIdx = old.indexOf('<p>', abStart);
    const ctaIdx = old.indexOf('<!-- CTA Box -->');
    const endIdx = ctaIdx > -1 ? ctaIdx : old.indexOf('<!-- FOOTER');

    const hotelContent = old.substring(firstPIdx, endIdx).trim();
    fs.writeFileSync('temp_hotel_content.html', hotelContent, 'utf8');
    console.log('Saved to temp_hotel_content.html');
}
main();
