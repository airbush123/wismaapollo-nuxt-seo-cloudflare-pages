const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'dist', 'blog');
const templatePath = path.join(blogDir, 'kuliner-kuala-kurun', 'index.html');
const templateHtml = fs.readFileSync(templatePath, 'utf8');

function replaceMeta(html, name, newContent) {
    const regex = new RegExp(`(<meta name="${name}"\\s+content=")([^"]*)(">)`, 'g');
    if (html.match(regex)) html = html.replace(regex, `$1${newContent}$3`);

    const ogRegex = new RegExp(`(<meta property="${name}"\\s+content=")([^"]*)(">)`, 'g');
    if (html.match(ogRegex)) html = html.replace(ogRegex, `$1${newContent}$3`);

    return html;
}

function buildArticle(slug, title, desc, keywords, date, readTime, imageSrc, imageAlt, contentHtml) {
    let html = templateHtml;

    html = replaceMeta(html, 'description', desc);
    html = replaceMeta(html, 'keywords', keywords);
    html = replaceMeta(html, 'og:title', title + ' - Wisma Apollo');
    html = replaceMeta(html, 'og:description', desc);
    html = replaceMeta(html, 'og:url', `https://wisma-apollo.my.id/blog/${slug}/`);
    html = replaceMeta(html, 'og:image', `https://wisma-apollo.my.id${imageSrc}`);

    const canonicalRegex = /<link rel="canonical" href="[^"]*">/;
    html = html.replace(canonicalRegex, `<link rel="canonical" href="https://wisma-apollo.my.id/blog/${slug}/">`);

    const titleRegex = /<title>.*?<\/title>/;
    html = html.replace(titleRegex, `<title>${title} - Blog Wisma Apollo</title>`);

    const h1Regex = /<h1>.*?<\/h1>/;
    html = html.replace(h1Regex, `<h1>${title}</h1>`);

    const dateRegex = /<p class="article-date">.*?<\/p>/;
    html = html.replace(dateRegex, `<p class="article-date">${date} • ${readTime} menit baca</p>`);

    const imgRegex = /<img src="[^"]*" alt="[^"]*" class="article-hero"[^>]*>/;
    html = html.replace(imgRegex, `<img src="${imageSrc}" alt="${imageAlt}" class="article-hero"\n            width="480" height="220" loading="eager">`);

    const tagRegex = /<a href="\/blog\/\?category=kuliner" class="article-tag">Kuliner<\/a>/;
    html = html.replace(tagRegex, `<a href="/blog/?category=info" class="article-tag">Info</a>`);

    const heroImgEnd = html.indexOf('loading="eager">') + 16;
    const relatedBoxStart = html.indexOf('<div class="related-articles-box"');

    if (heroImgEnd > 15 && relatedBoxStart > -1) {
        html = html.substring(0, heroImgEnd) +
            `\n\n${contentHtml}\n\n    `
            + html.substring(relatedBoxStart);
    } else {
        console.error('Failed to find replace boundaries for content in', slug);
    }

    const targetDir = path.join(blogDir, slug);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
    console.log(`Rebuilt ${slug}/index.html`);
}

const contentSekolah = `
<p>Kuala Kurun, ibu kota Kabupaten Gunung Mas, Kalimantan Tengah, terus berbenah dan mengukir sejarah baru dalam dunia pendidikannya. Salah satu cerita transformasi yang paling memikat perhatian masyarakat belakangan ini adalah beralih fungsinya sebuah bangunan hotel tertua di Gunung Mas menjadi fasilitas pendidikan yang mulia, yakni <strong>Sekolah Rakyat</strong>.</p>

<p>Bangunan yang dimaksud dulunya dikenal luas sebagai Hotel Gunung Mas. Bertahun-tahun lamanya, gedung ini menjadi salah satu wajah penyedia akomodasi paling awal bagi pelancong atau aparatur negara yang singgah di Kuala Kurun. Tempat ini merekam banyak jejak sejarah perkembangan ekonomi kota. Namun, seiring dengan berjalannya waktu dan munculnya kesadaran pemerintah daerah akan pentingnya pemerataan pendidikan, hotel bersejarah ini ditutup dan bertransformasi sepenuhnya menjadi sarana yang mendidik generasi penerus bangsa.</p>

<h2>Program Sekolah Rakyat di Kuala Kurun</h2>

<p>Keputusan Pemerintah Kabupaten Gunung Mas untuk mendirikan Sekolah Rakyat bukanlah tanpa alasan. Banyak anak-anak dari daerah pedalaman atau pelosok desa di Kalimantan Tengah yang terancam putus sekolah atau kesulitan mendapatkan akses pendidikan reguler akibat biaya dan jarak tempuh. Untuk memutus rantai kemiskinan dan memberikan mereka peluang yang sama, inisiatif Sekolah Rakyat Rintisan pun diluncurkan pada pertengahan 2025.</p>

<p>Alih-alih membangun fondasi dari nol yang membutuhkan waktu dan biaya fantastis, pemerintah dengan cerdas merehabilitasi aset gedung eks-Hotel Gunung Mas. Kamar-kamar yang dulunya disewakan kepada tamu, kini dialihfungsikan menjadi ruang kelas dan asrama (boarding school) bagi para siswa kurang mampu. Ruang makan hotel disulap menjadi ruang belajar komunal dan gedung serbaguna.</p>

<h2>Dampak Positif Bagi Anak Pedalaman</h2>

<p>Fasilitas asrama terpadu ini sangat penting bagi siswa yang berasal jauh dari pusat tata kota Kuala Kurun. Mereka tidak hanya diberikan pembebasan biaya pendidikan dasar atau sekolah gratis, melainkan juga tempat tinggal yang aman, makan sehari-hari, hingga seragam yang memadai. Kurikulum dasar tingkat SD hingga SMP menjadi fase rintisan awal sebelum nantinya pemerintah merencanakan gedung permanen yang lebih luas.</p>

<p>Keputusan transformasi dari hotel komersial menjadi sekolah ini telah menuai banyak decak kagum. Langkah ini membuktikan bahwa Kabupaten Gunung Mas memprioritaskan pendidikan di atas segalanya. Sisa-sisa bangunan pelintas masa lalu itu kini dikelilingi oleh tawa dan harapan baru para siswa yang menggantungkan cita-cita tinggi mereka.</p>

<p>Jika Anda kebetulan berkunjung atau menginap di <a href="https://wisma-apollo.my.id/"><strong>Wisma Apollo Kuala Kurun</strong></a>, bangunan eks-hotel ini bisa memicu cerita inspiratif lokal yang sangat memotivasi. Mari kita dukung terus program pendidikan seperti ini agar Kuala Kurun semakin maju dan mencetak sumber daya manusia unggul dari bumi Kalimantan Tengah!</p>
`;

buildArticle(
    'sejarah-hotel-gunung-mas-menjadi-sekolah-rakyat',
    'Transformasi Hotel Tertua di Gunung Mas Menjadi Sekolah Rakyat',
    'Sejarah luar biasa Hotel Gunung Mas (hotel tertua di Kuala Kurun) yang kini beralih fungsi menjadi Sekolah Rakyat untuk anak pedalaman. Simak cerita lengkapnya.',
    'hotel tertua gunung mas, sekolah rakyat kuala kurun, sejarah hotel gunung mas, penginapan kuala kurun, sekolah rakyat kalimantan tengah',
    '7 Maret 2026',
    '4',
    '/images/blog/sekolah-rakyat-gunung-mas.jpg', // Uploaded image
    'Eks Hotel Gunung Mas Sekolah Rakyat',
    contentSekolah
);
