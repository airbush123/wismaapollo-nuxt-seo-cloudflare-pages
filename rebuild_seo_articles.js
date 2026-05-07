const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'dist', 'blog');
const templatePath = path.join(blogDir, 'kuliner-kuala-kurun', 'index.html');
const templateHtml = fs.readFileSync(templatePath, 'utf8');

// Helper to replace content inside a tag or section
function replaceMeta(html, name, newContent) {
    const regex = new RegExp(`(<meta name="${name}"\\s+content=")([^"]*)(">)`, 'g');
    if (html.match(regex)) html = html.replace(regex, `$1${newContent}$3`);

    // Also try checking property for og tags
    const ogRegex = new RegExp(`(<meta property="${name}"\\s+content=")([^"]*)(">)`, 'g');
    if (html.match(ogRegex)) html = html.replace(ogRegex, `$1${newContent}$3`);

    return html;
}

function buildArticle(slug, title, desc, keywords, date, readTime, imageSrc, imageAlt, contentHtml) {
    let html = templateHtml;

    // 1. Meta & Title
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

    // 2. Extract Header Section (Article Title, Date, Hero Image)
    const h1Regex = /<h1>.*?<\/h1>/;
    html = html.replace(h1Regex, `<h1>${title}</h1>`);

    const dateRegex = /<p class="article-date">.*?<\/p>/;
    html = html.replace(dateRegex, `<p class="article-date">${date} • ${readTime} menit baca</p>`);

    const imgRegex = /<img src="[^"]*" alt="[^"]*" class="article-hero"[^>]*>/;
    html = html.replace(imgRegex, `<img src="${imageSrc}" alt="${imageAlt}" class="article-hero"\n            width="480" height="220" loading="eager">`);

    const tagRegex = /<a href="\/blog\/\?category=kuliner" class="article-tag">Kuliner<\/a>/;
    html = html.replace(tagRegex, `<a href="/blog/?category=info" class="article-tag">Info</a>`);

    // 3. Replace Article Content
    // In `kuliner-kuala-kurun`, content is right after `<img class="article-hero"...>` and ends before `<div class="related-articles-box"`
    const heroImgEnd = html.indexOf('loading="eager">') + 16;
    const relatedBoxStart = html.indexOf('<div class="related-articles-box"');

    if (heroImgEnd > 15 && relatedBoxStart > -1) {
        html = html.substring(0, heroImgEnd) +
            `\n\n${contentHtml}\n\n    `
            + html.substring(relatedBoxStart);
    } else {
        console.error('Failed to find replace boundaries for content in', slug);
    }

    // 4. Update JSON-LD
    html = html.replace(/"headline": "[^"]*"/, `"headline": "${title.replace(/"/g, '\\"')}"`);
    html = html.replace(/"image": "\/images\/gallery\/hotel-murah-kuala-kurun\.webp"/, `"image": "https://wisma-apollo.my.id${imageSrc}"`);
    html = html.replace(/"datePublished": "[^"]*"/, `"datePublished": "2026-03-07T08:00:00+07:00"`);
    html = html.replace(/"dateModified": "[^"]*"/, `"dateModified": "2026-03-07T08:00:00+07:00"`);
    html = html.replace(/"url": "https:\/\/wisma-apollo\.my\.id\/blog\/kuliner-kuala-kurun\/"/, `"url": "https://wisma-apollo.my.id/blog/${slug}/"`);

    // 5. Save the file
    const targetDir = path.join(blogDir, slug);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
    console.log(`Rebuilt ${slug}/index.html`);
}

// ----------------------------------------------------
// Article 1: Penginapan Murah di Kuala Kurun
// ----------------------------------------------------
const contentMurah = `
<p>Kuala Kurun, pusat pemerintahan dan ekonomi Kabupaten Gunung Mas di Kalimantan Tengah, sering menjadi tujuan bagi para pebisnis, aparatur negara, maupun wisatawan. Jika Anda sedang mencari <a href="https://wisma-apollo.my.id/"><strong>penginapan murah di Kuala Kurun</strong></a>, hal utama yang kerap menjadi perhatian adalah menemukan tempat yang menawarkan harga bersahabat namun tidak mengorbankan kenyamanan dan fasilitas.</p>

<p>Kenyataannya, menginap di pusat kota tidak selalu berarti Anda harus merogoh kocek terlalu dalam. <a href="https://wisma-apollo.my.id/"><strong>Wisma Apollo</strong></a> hadir sebagai solusi utama dan rekomendasi penginapan termurah namun berkualitas tinggi di Kuala Kurun. Kami membuktikan bahwa harga murah tetap bisa memberikan pengalaman menginap setara dengan hotel berbintang.</p>

<h2>Kenapa Memilih Wisma Apollo sebagai Penginapan Murah Anda?</h2>

<p>Faktor harga memang menjadi daya tarik utama. Mulai dari <strong>Rp200.000,- per malam</strong>, Anda sudah bisa menikmati kamar privat (Single Bed) yang sangat ideal bagi para <em>solo traveler</em>, dinas luar kota, atau <em>backpacker</em>. Harga Rp250.000,- juga tersedia untuk kamar Double Bed bagi Anda yang membawa pasangan atau keluarga.</p>

<ul>
  <li><strong>Fasilitas Lengkap Tanpa Biaya Tambahan</strong>: Walaupun dikategorikan sebagai penginapan murah, kami menawarkan fasilitas premium. Setiap kamar sudah dilengkapi dengan Air Conditioner (AC) yang sejuk, koneksi WiFi gratis yang super cepat, dan TV Android 32" untuk menemani malam Anda.</li>
  <li><strong>Kamar Mandi Dalam &amp; Kebersihan Terjamin</strong>: Faktor higienitas tidak pernah kami kompromikan. Semua tipe kamar di Wisma Apollo memiliki kamar mandi dalam dengan shower, serta dilengkapi dengan peralatan mandi dasar (amenities) dan handuk baru setiap harinya. Sprei serta sarung bantal diganti secara teratur dan harum.</li>
  <li><strong>Dinding Kedap Suara (Soundproof)</strong>: Di harga 200 ribuan, fitur kedap suara adalah hal yang langka. Kami merancang kamar dengan plafon dan partisi dinding peredam untuk memastikan jam istirahat tamu tidak terganggu oleh kebisingan luar.</li>
</ul>

<h2>Lokasi Strategis yang Menghemat Ongkos</h2>

<p>Mencari penginapan murah seringkali berakhir dengan mendapatkan lokasi yang jauh di pinggiran. Di Wisma Apollo, hal tersebut tidak berlaku. Wisma ini beralamat di Jl. Letjen Soeprapto No.56—jantung ring 1 pusat Kota Kuala Kurun. Anda bisa berjalan kaki menuju puluhan cafe hits, serta akses cepat ke perkantoran dan area taman kota Bundaran Kuala Kurun. Hal ini tentu saja akan <strong>menghemat biaya transportasi lokal Anda</strong> secara drastis.</p>

<h2>Tempat Istirahat Ideal Untuk Berbagai Keperluan</h2>

<p>Wisma Apollo tidak hanya sekadar tempat singgah, melainkan sebuah akomodasi yang dirancang untuk mendukung berbagai keperluan tamu. Bagi Anda yang sedang dalam tugas luar kota atau perjalanan bisnis, fasilitas kamar seperti meja kerja minimalis, kursi yang nyaman, dan sinyal internet yang stabil akan sangat membantu produktivitas. Sementara itu, bagi wisatawan yang ingin mengeksplorasi keindahan pesona alam di sekitar Kabupaten Gunung Mas—mulai dari Air Terjun Batu Mahasur hingga panorama Desa Upon Batu—lokasi kami di pusat kota membuatnya menjadi titik awal keberangkatan (starting point) yang sangat sempurna.</p>

<p>Selain fokus pada fasilitas internal, Wisma Apollo juga menawarkan kemudahan akses wisata kuliner lokal. Beranjak beberapa ratus meter dari penginapan, berbagai pilihan warung makan tradisional maupun restoran modern dapat dijangkau dengan mudah. Anda tidak perlu repot menyewa kendaraan tambahan untuk sekedar mencari makan siang atau makan malam, karena semua kebutuhan bersantap tersedia dalam jarak berjalan kaki (walking distance).</p>

<h2>Cara Memesan</h2>

<p>Sebagai rekomendasi penginapan murah Kuala Kurun terbaik, kamar-kamar kami juga sering <em>fully booked</em> (penuh) terutama pada hari kerja atau akhir pekan. Oleh karena itu, langkah terbaik adalah dengan melakukan reservasi kamar Anda jauh-jauh hari. Staf resepsionis kami siap melayani dan membantu proses pemesanan melalui WhatsApp atau Call Center yang merespon dengan cepat dan ramah.</p>

<p>Harga yang terjangkau dipadukan dengan kenyamanan tanpa batas membuat Wisma Apollo menjadi pilihan rasional bagi setiap pelancong di Kuala Kurun. Tunggu apa lagi? Rasakan sensasi tidur yang sangat pulas tanpa rasa khawatir akan dompet Anda!</p>
`;

buildArticle(
    'penginapan-murah-kuala-kurun',
    'Penginapan Murah di Kuala Kurun – Rekomendasi 200 Ribuan Terbaik',
    'Cari penginapan murah di Kuala Kurun? Wisma Apollo menawarkan kenyamanan setara hotel dengan harga mulai Rp200.000/malam. AC, WiFi, TV Android & lokasi strategis.',
    'penginapan murah kuala kurun, penginapan kuala kurun, hotel murah kuala kurun, wisma apollo',
    '7 Maret 2026',
    '3',
    '/images/gallery/penginapan-murah-kuala-kurun.webp',
    'Penginapan Murah Kuala Kurun Wisma Apollo',
    contentMurah
);

// ----------------------------------------------------
// Article 2: Hotel di Kuala Kurun, Kalimantan Tengah
// ----------------------------------------------------
const contentHotelKalteng = `
<p>Bagi pendatang baru, berwisata atau melaksanakan dinas pekerjaan di Kalimantan Tengah sering kali membutuhkan persiapan, terutama mengenai tempat tinggal sementara. Memilih <a href="https://wisma-apollo.my.id/"><strong>hotel di Kuala Kurun, Kalimantan Tengah</strong></a> yang ideal tidak perlu membingungkan jika Anda mengetahui kriteria kenyamanan dan keamanan yang pas. Kuala Kurun adalah ibu kota dari Kabupaten Gunung Mas—sebuah kabupaten yang tengah berkembang pesat baik secara ekonomi maupun infrastrukturnya.</p>

<p>Di antara berbagai opsi yang tersebar, terdapat satu rekomendasi penginapan dan hotel yang selalu konsisten berada di puncak <em>review</em> para tamu: <a href="https://wisma-apollo.my.id/"><strong>Wisma Apollo Kuala Kurun</strong></a>.</p>

<h2>Kenyamanan Premium di Pusat Gunung Mas</h2>

<p>Hotel di Kalimantan Tengah sering kali identik dengan letaknya yang tersebar. Namun, jika Anda menetapkan <em>base</em> dan kegiatan di area Kuala Kurun, maka posisi strategis menjadi penentu kelancaran akivitas Anda. Wisma Apollo berlokasi tepat di jalan utama (Jl. Letjen Soeprapto), sebuah poros utama lalu lintas komersial dan pemerintahan lokal Gunung Mas.</p>

<p>Dari sisi standar fasilitas perhotelan, Apollo memberikan hal yang amat esensial yang kerap kali dirindukan pelancong setelah menempuh perjalanan darat yang panjang:</p>

<ul>
  <li><strong>Tempat Tidur Nyaman (Bedding Quality)</strong>: Jika tidur malam tidak berkualitas, produktivitas esok hari sudah pasti menurun. Karena itu, kasur <em>Spring Bed</em> dan bantal bulu angsa kualitas hotel berbintang telah menjadi elemen wajib di semua kamar Apollo.</li>
  <li><strong>Free WiFi &amp; Android TV</strong>: Akses komunikasi dan hiburan tanpa batas! Tersedia koneksi nirkabel kuat bagi para pekerja lepas maupun abdi negara yang membawa pekerjaan mereka, serta TV pintar untuk bersantai dan melonggarkan urat syaraf.</li>
  <li><strong>Kamar Luas dan Tematik</strong>: Penataan ruang dikerjakan sangat rapi, terang, serta bersih. Kamar berkonsep minimalis namun memiliki ruang bernapas yang cukup agar tamu tidak merasa pengap.</li>
</ul>

<h2>Keamanan 24 Jam Penuh</h2>

<p>Aspek keamanan adalah harga mati untuk sebuah hotel. Terlebih bagi Anda yang singgah bersama keluarga atau rekan bisnis. Kami menyadari bahwa perasaan aman adalah bagian dari istirahat yang sesungguhnya. Oleh sebab itu, area bangunan kami dilengkapi oleh sistem kamera CCTV, ditambah dengan staf operasional yang berjaga selama 24 jam. Area parkir yang disiapkan juga dirancang berada dalam jangkauan dan aman dari lalu-lalang sembarangan.</p>

<h2>Tempat Istirahat Utama Para Pelancong</h2>

<p>Seberapa jauh Anda menjelajah wisata hutan dan sungai di Kabupaten Gunung Mas, Anda tetap akan kembali untuk beristirahat di perkotaan Kuala Kurun. Inilah yang menjadikan referensi tempat tidur ini sebuah investasi energi perjalanan yang sangat penting.</p>

<p>Lebih dari sekadar tempat menumpang tidur, menginap di pusat kota memberikan kepraktisan mobilitas. Jika Anda berencana melakukan pertemuan dinas di pagi hari atau agenda keliling kota, akses transportasi dari penginapan kami sangatlah mudah. Dengan staf yang terampil dan berpengetahuan luas tentang seluk-beluk Gunung Mas, Anda bahkan bisa meminta rekomendasi destinasi wisata atau kuliner lokal secara langsung. Kami memastikan setiap tamu mendapatkan lebih dari sekadar sewa kamar, melainkan pengalaman menginap yang utuh dan tak terlupakan.</p>

<p>Percayakan penginapan Anda di Kalimantan Tengah pada Wisma Apollo. Kepuasan, harga terukur, serta memori perjalanan yang mulus akan selalu Anda bawa pulang dengan senyuman.</p>
`;

buildArticle(
    'hotel-kuala-kurun-kalimantan-tengah',
    'Hotel di Kuala Kurun, Kalimantan Tengah – Referensi Terbaik',
    'Sedang mencari hotel dan penginapan di Kuala Kurun, Kalimantan Tengah? Temukan akomodasi terpercaya yang nyaman, strategis, dan murah di Wisma Apollo.',
    'hotel kuala kurun kalimantan tengah, hotel kuala kurun, penginapan kuala kurun, hotel gunung mas, wisma apollo kalimantan tengah',
    '7 Maret 2026',
    '3',
    '/images/gallery/hotel-kuala-kurun-gunung-mas.webp',
    'Hotel di Kuala Kurun Kalimantan Tengah Wisma Apollo',
    contentHotelKalteng
);
