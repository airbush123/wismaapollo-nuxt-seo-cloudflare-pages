const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brainDir = 'C:\\Users\\Asus\\.gemini\\antigravity\\brain\\3902ac05-0027-4d73-961c-9d0e753a366b';
// We will output to brainDir too so the user and I can view it as artifacts
const outputDir = path.join(brainDir, 'social_media_posts');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const posts = [
    {
        file: 'media__1772877206582.jpg',
        title: 'Fasad Malam Hari',
        headline: 'Tropical Vibes di Pusat Kota',
        subText: 'Staycation Nyaman di Kuala Kurun. Harga Mulai 200 Ribuan!',
        outName: 'slide_1_fasad.jpg'
    },
    {
        file: 'media__1772877209817.jpg',
        title: 'Kamar Twin Bed',
        headline: 'Istirahat Maksimal\nKantong Tetap Aman',
        subText: 'Kamar luas, kasur empuk, AC dingin, & Smart TV.',
        outName: 'slide_2_kamar.jpg'
    },
    {
        file: 'media__1772877198583.jpg',
        title: 'Lorong Hallway',
        headline: 'Suasana Tenang\n& Hangat',
        subText: 'Desain minimalis tropis yang bikin makin betah.',
        outName: 'slide_3_lorong.jpg'
    },
    {
        file: 'media__1772877198611.jpg',
        title: 'Resepsionis',
        headline: 'Kami Siap\nMenyambutmu!',
        subText: 'Resepsionis 24 Jam dengan pelayanan ramah.\nBooking sekarang!',
        outName: 'slide_4_resepsionis.jpg'
    }
];

// Helper to escape XML
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

async function processImage(post) {
    const inputPath = path.join(brainDir, post.file);
    const outputPath = path.join(outputDir, post.outName);

    const width = 1080;
    const height = 1350;

    // Ensure the text array
    const headlineLines = post.headline.split('\n');
    const subTextLines = post.subText.split('\n');

    const rectSvg = `
        <svg width="${width}" height="${height}">
            <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="black" stop-opacity="0" />
                    <stop offset="50%" stop-color="black" stop-opacity="0.6" />
                    <stop offset="100%" stop-color="black" stop-opacity="0.9" />
                </linearGradient>
            </defs>
            <rect x="0" y="${height * 0.4}" width="${width}" height="${height * 0.6}" fill="url(#grad)" />
            
            <text x="50%" y="${height - 200 - (subTextLines.length * 40)}" font-family="Arial, sans-serif" font-weight="bold" font-size="65" fill="#ffffff" text-anchor="middle">
                ${headlineLines.map((line, i) => `<tspan x="50%" dy="${i === 0 ? 0 : 80}">${escapeXml(line)}</tspan>`).join('')}
            </text>
            
            <text x="50%" y="${height - 120}" font-family="Arial, sans-serif" font-weight="normal" font-size="34" fill="#E86A33" text-anchor="middle">
                ${subTextLines.map((line, i) => `<tspan x="50%" dy="${i === 0 ? 0 : 50}">${escapeXml(line)}</tspan>`).join('')}
            </text>
        </svg>
    `;

    await sharp(inputPath)
        .resize(width, height, { fit: 'cover', position: 'center' })
        .composite([
            {
                input: Buffer.from(rectSvg),
                blend: 'over'
            }
        ])
        .jpeg({ quality: 90 })
        .toFile(outputPath);

    console.log(`Generated: ${outputPath}`);
}

(async () => {
    for (const post of posts) {
        if (fs.existsSync(path.join(brainDir, post.file))) {
            await processImage(post);
        } else {
            console.error(`Missing file: ${post.file}`);
        }
    }
})();
