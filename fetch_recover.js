const fs = require('fs');
const path = require('path');

const baseUrl = 'https://30d05367.wisma-apollo.pages.dev';
const targetDomain = 'https://wisma-apollo.my.id';
const oldDomain = 'https://wisma-apollo.pages.dev';

const routes = [
    '/',
    '/faq-wisma/',
    '/blog/',
    '/blog/5-cafe-kopi-terbaik-di-kuala-kurun/',
    '/blog/air-terjun-batu-mahasur/',
    '/blog/batu-suli-desa-upon-batu/',
    '/blog/bundaran-kuala-kurun/',
    '/blog/hotel-di-kuala-kurun/',
    '/blog/hotel-kuala-kurun-kalimantan-tengah/',
    '/blog/icon-tugu-selamat-datang-kuala-kurun/',
    '/blog/kuliner-kuala-kurun/',
    '/blog/penginapan-murah-kuala-kurun/',
    '/blog/tips-menginap-kuala-kurun/',
    '/blog/wisata-gunung-mas/',
    '/guest-house-kuala-kurun/',
    '/homestay-kuala-kurun/',
    '/hotel-kuala-kurun/',
    '/penginapan-kuala-kurun/',
    '/staycation-kuala-kurun/',
    '/tempat-istirahat-kuala-kurun/'
];

async function recoverFiles() {
    for (const route of routes) {
        console.log(`Fetching ${route}...`);
        try {
            const resp = await fetch(baseUrl + route);
            if (!resp.ok) {
                console.error(`Status ${resp.status} for ${route}`);
                continue;
            }
            let html = await resp.text();

            // Perform the domain swap ONLY, leaving all UTF-8 characters pristine
            html = html.split(oldDomain).join(targetDomain);

            // Determine save path
            let localPath = path.join(__dirname, 'dist', route, 'index.html');
            if (route === '/') {
                localPath = path.join(__dirname, 'dist', 'index.html');
                // also save to root
                fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');
            }

            // Ensure dir exists
            fs.mkdirSync(path.dirname(localPath), { recursive: true });
            fs.writeFileSync(localPath, html, 'utf8');
            console.log(`-> Saved ${localPath}`);

        } catch (e) {
            console.error(`Failed ${route}:`, e);
        }
    }
}

recoverFiles();
