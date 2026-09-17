# Dokumentasi Komprehensif Sistem Wisma Apollo
**Nuxt 4 • Cloudflare Pages • Google Ads & GA4 Tracking • Meta CAPI • Google Sheets & Email Reporting • WhatsApp Flow**

---

## 1. Arsitektur Keseluruhan Sistem (High-Level Architecture)

Sistem Wisma Apollo dirancang sebagai **Hybrid Static Web App** berkecepatan tinggi (skor PageSpeed/Lighthouse 95–100) yang tetap memiliki kapabilitas marketing enterprise, tracking iklan akurat, pengumpulan lead otomatis, pelaporan email instan ke admin/CS, serta pengalihan reservasi ke WhatsApp.

```mermaid
flowchart TD
    subgraph PENGUNJUNG["🖥️ Perangkat Pengunjung (Browser)"]
        A["Landing / Artikel SEO (Nuxt 4)"] -->|Scroll / Interaksi| B["GTM Stealth Loader (Proxy /px/gtm)"]
        A -->|Klik Tombol Booking| C["Modal Reservasi (BookingModal.vue)"]
        C -->|Isi Nama & No WA Valid| D["Event ATC & SHA-256 Phone Hash"]
        C -->|Klik 'Lanjut ke WhatsApp'| E["Submit Form Reservasi"]
    end

    subgraph TRACKING["📊 Tracking & Attribution Layer"]
        B -->|wisma_pv, wisma_vc, wisma_kontak| GTM["GTM Container GTM-5995VJ5B"]
        D -->|wisma_atc, wisma_user_data| GTM
        E -->|wisma_lead| GTM
        GTM -->|Enhanced Conversion| GADS["Google Ads (AW-18107085431)"]
        GTM -->|Key Events| GA4["Google Analytics 4 (G-24RFWGMFY8)"]
        E -->|Browser Pixel 'Lead'| META_PX["Meta Pixel (2098215477608895)"]
    end

    subgraph BACKEND["☁️ Cloudflare Pages Functions (Edge Serverless)"]
        E -->|POST FormData (Non-Blocking)| API_LEAD["/api/booking-lead"]
        API_LEAD -->|Event Lead Server-Side| META_CAPI["Meta Conversions API (Graph v23.0)"]
        API_LEAD -->|Forward Payload via Secret URL| GAS_WEBHOOK["Google Apps Script Webhook"]
    end

    subgraph DATABASE_DAN_NOTIFIKASI["📋 Google Workspace & Notifikasi CS"]
        GAS_WEBHOOK -->|Append Row 30+ Kolom| GSHEET["Google Sheets (Tab BOOKING_PENDING)"]
        GAS_WEBHOOK -->|Kirim Email Instan HTML| GMAIL["Email Alert CS/Admin (MailApp)"]
    end

    subgraph USER_EXPERIENCE["📲 WhatsApp & Konfirmasi"]
        E -->|Buka Tab Baru dengan Pesan Tersusun| WA["WhatsApp Admin (0818-232-021)"]
        E -->|Redirect Halaman Utama| THANKS["Halaman /thanks (Konfirmasi & Copy WA)"]
    end
```

---

## 2. Tracking Google Ads, GA4, & Meta (End-to-End)

### 2.1. Spesifikasi Identitas Iklan & Container
* **GTM Container ID**: `GTM-5995VJ5B`
* **Google Ads Conversion ID**: `AW-18107085431`
* **GA4 Measurement ID**: `G-24RFWGMFY8`
* **Meta Pixel ID**: `2098215477608895`
* **Meta Graph API Version**: `v23.0`
* **First-Party Proxy GTM**: `/px/gtm/gtm.js?id=GTM-5995VJ5B` (di-proxy oleh Cloudflare Pages Functions di `functions/px/gtm/[file].js` agar tidak diblokir oleh AdBlocker dan tidak mengurangi Core Web Vitals).

### 2.2. Funnel Event & Google Ads Conversion Mapping
Semua event dikirimkan melalui custom event `dataLayer` dengan identifier unik `TRX-[timestamp]-[rand]` untuk menjamin deduplikasi:

| Nama Funnel | DataLayer Event | Google Ads Conversion Label | GAds Value (IDR) | GA4 Event Name | Meta Event (Browser/CAPI) | Trigger Aktivasi |
|---|---|---|---|---|---|---|
| **PV (Page View)** | `wisma_pv` | `DLj_COy4rrgcEPfkkLpD` | Rp 100 | `wisma_pv` | CAPI Server-Only | User membuka halaman web (diaktifkan setelah interaksi awal/idle). |
| **VC (View Content)** | `wisma_vc` | `FrBUCM3jr7gcEPfkkLpD` | Rp 200 | `wisma_vc` | CAPI Server-Only | User scroll $\ge 50\%$ atau elemen `#kamar` / `#fasilitas` terlihat di viewport. |
| **Kontak (Contact)** | `wisma_kontak` | `gH-uCLSVsLgcEPfkkLpD` | Rp 300 | `wisma_kontak` *(Key Event)* | Browser Pixel & CAPI | User klik tombol WhatsApp floating atau membuka modal reservasi. |
| **ATC (Add To Cart)** | `wisma_atc` | `45vBCNiPrrgcEPfkkLpD` | Rp 500 | `wisma_atc` *(Key Event)* | Browser Pixel & CAPI | Form booking terisi lengkap (Nama $\ge 2$ char, No WA valid $\ge 10$ digit, tgl check-in/out, min 1 kamar). |
| **Lead (Konversi)** | `wisma_lead` | `bo-PCNi5sLgcEPfkkLpD` | Rp 5.000 | `wisma_lead` *(Key Event)* | Browser Pixel & CAPI | User menekan tombol submit modal reservasi untuk menuju WhatsApp. |
| **User Data** | `wisma_user_data` | *(Enhanced Conv)* | Rp 0 | - | - | Dikirimkan saat No WA valid terdeteksi, membawa SHA-256 hash. |

### 2.3. Mekanisme Enhanced Conversion & Hashing Phone
Untuk memaksimalkan akurasi smart bidding Google Ads & Meta CAPI:
1. **Google Ads Enhanced Conversion**:
   * Nomor telepon dinormalisasi ke format E.164: `081234567890` $\rightarrow$ `+6281234567890`.
   * Di-hash menggunakan algoritma **SHA-256** di client-side:
     ```javascript
     const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('+6281234567890'));
     ```
   * Dikirim via `dataLayer`:
     ```javascript
     dataLayer.push({
       event: 'wisma_user_data',
       hashed_phone: sha256_result,
       user_data: {
         sha256_phone_number: [sha256_result]
       }
     });
     ```
2. **Meta CAPI**:
   * Nomor telepon dinormalisasi tanpa tanda plus: `6281234567890`.
   * Di-hash SHA-256 dan dikirim ke endpoint `user_data.ph: [hash]`.
   * Disertakan pula cookie browser `_fbp` dan `_fbc` (dari parameter `fbclid`).

### 2.4. Manajemen Click ID (GCLID, WBRAID, GBRAID) & Enhanced Conversions
Diatur di dalam `nuxt-app/app/composables/useTracking.ts`, `lead_form.js`, dan GTM Container:
* **Trio Google Click ID**:
  * `gclid`: Klik dari Google Search / Display Web Desktop dan browser Android standar.
  * `wbraid`: Klik dari Web-to-App atau landing web pada iOS 14.5+ (memenuhi aturan privasi Apple ATT).
  * `gbraid`: Klik dari App-to-Web (aplikasi Google seperti YouTube app, Gmail app, Google Maps app) pada iOS/Android.
* **Penyimpanan & Cross-Page Passthrough**:
  * Disimpan di `localStorage` dan `sessionStorage` dengan TTL **90 Hari** (`ATTRIBUTION_TTL_MS = 90 * 24 * 60 * 60 * 1000`).
  * `Conversion Linker` di GTM diatur dengan `enableUrlPassthrough: true` dan `enableCrossDomain: true` sehingga parameter `wbraid` dan `gbraid` tidak hilang jika terjadi navigasi antar halaman atau jika browser membatasi cookie pihak ketiga.
* **Integrasi pada Konversi & Konversi yang Disempurnakan (Enhanced Conversions)**:
  * Pada tag `GAds - Lead Wisma` dan `GAds - ATC Wisma`, variabel `{{User Data EC}}` ditautkan langsung (`provideEnhancedConversionData: true`).
  * Parameter unik `orderId: {{dlv_transaction_id}}` dipasang pada semua tag konversi (`Lead`, `ATC`, `Kontak`, `VC`, `PV`) untuk deduplikasi transaksi.
  * Custom parameters `wbraid`, `gbraid`, dan `gclid` dikirimkan secara eksplisit pada setiap event konversi Google Ads.
  * Ketika user mengisi nomor WhatsApp, SHA-256 hash dikirimkan bersama `wbraid`/`gbraid` ke Google Ads untuk mencocokkan konversi dengan akun Google pengguna yang sedang aktif di perangkat iPhone maupun Android.
* **Temporary Booking Data** (`trx_id`, `hashed_phone`, `meta_hashed_phone`):
  * Disimpan dengan TTL **24 Jam** (`BOOKING_TTL_MS = 24 * 60 * 60 * 1000`).
  * Dibersihkan saat user menyelesaikan alur di halaman `/thanks` agar kunjungan di hari berikutnya tidak dianggap sebagai duplikasi transaksi.

### 2.5. Stealth / Interaction-Based Loading (Menjaga PageSpeed 100)
Script GTM eksternal tidak dimuat langsung saat `DOM ready` agar tidak merusak metrik TBT (Total Blocking Time) dan LCP (Largest Contentful Paint):
1. **Traffic Iklan Aktif**: Jika URL mengandung `gclid`, `wbraid`, `gbraid`, atau `fbclid`, GTM dimuat otomatis melalui `requestIdleCallback` (timeout 1.000ms).
2. **Traffic Organik**: GTM hanya dimuat saat user melakukan interaksi pertama (`click`, `keydown`, `scroll`).
3. **Mode Preview GTM**: Jika URL mengandung `gtm_debug` atau `gtm_preview`, script langsung memuat origin `googletagmanager.com` secara real-time.

---

## 3. Alur Pelaporan Leads, Google Sheets, & Notifikasi Email

### 3.1. Endpoint First-Party (`/api/booking-lead`)
Lokasi file: `functions/api/booking-lead.js` (Cloudflare Pages Function).
* **Keamanan URL**: URL Google Apps Script **TIDAK PERNAH** diekspos ke browser pengunjung. URL tersimpan di Cloudflare Environment Variables: `GOOGLE_APP_SCRIPT_URL`.
* **Non-Blocking Architecture**: Pengiriman lead ke backend menggunakan mode `keepalive: true`. Jika koneksi lemot, tamu tetap dialihkan ke WhatsApp tanpa jeda/hang.
* **Dual Forwarding**: Cloudflare Function secara paralel:
  1. Melakukan HTTP POST ke Google Apps Script Webhook.
  2. Melakukan HTTP POST Meta CAPI Server-Side `Lead` event ke Graph API Meta.

### 3.2. Struktur Database Google Sheet (30+ Kolom)
Berikut adalah daftar field yang dikirimkan ke Google Apps Script dan dicatat ke tab **`BOOKING_PENDING`**:

| No | Nama Kolom | Contoh Data | Keterangan |
|---|---|---|---|
| 1 | `submittedAt` | `2026-09-17T00:45:00.000Z` | Timestamp ISO order masuk |
| 2 | `transactionId` | `TRX-1789571555-a8f3k` | ID unik transaksi (deduplikasi) |
| 3 | `eventId` | `TRX-1789571555-a8f3k-wisma_lead` | ID Event Meta & Google Ads |
| 4 | `name` | `Budi Santoso` | Nama lengkap tamu |
| 5 | `phone` | `'081234567890` | Nomor WhatsApp (diberi apostrof agar tidak terpotong) |
| 6 | `checkIn` | `2026-09-18` | Tanggal check-in |
| 7 | `checkOut` | `2026-09-20` | Tanggal check-out |
| 8 | `stayNights` | `2` | Jumlah malam |
| 9 | `roomType` | `single` / `double` / `mixed` | Kategori tipe kamar |
| 10 | `roomSummary` | `Single Bed: 2 kamar` | Rincian kamar yang dipilih |
| 11 | `roomCount` | `2` | Total jumlah kamar |
| 12 | `singleRoomCount` | `2` | Jumlah kamar Single Bed |
| 13 | `doubleRoomCount` | `0` | Jumlah kamar Double Bed |
| 14 | `guestCount` | `3` | Jumlah tamu dewasa |
| 15 | `breakfast` | `Ya` / `Tidak` | Pilihan sarapan |
| 16 | `breakfastValue` | `150000` | Nilai sarapan (pax x hari x 25.000) |
| 17 | `totalValue` | `950000` | Estimasi nilai total reservasi (IDR) |
| 18 | `notes` | `Minta kamar lantai 1 dekat parkir` | Catatan khusus dari tamu |
| 19 | `source` | `Google` / `Meta` / `Organic` | Sumber trafik |
| 20 | `clickId` | `Cj0KCQjww...` | ID klik iklan |
| 21 | `pageLocation` | `https://wisma-apollo.my.id/hotel-kuala-kurun` | URL halaman tempat form disubmit |
| 22 | `gclid` | `Cj0KCQ...` | Google Click ID (Desktop/Search) |
| 23 | `wbraid` | `...` | Google Click ID (iOS App Traffic) |
| 24 | `gbraid` | `...` | Google Click ID (Android App Traffic) |
| 25 | `fbclid` | `IwAR3...` | Meta Click ID |
| 26 | `fbp` | `fb.1.171...` | Browser Cookie Meta FBP |
| 27 | `fbc` | `fb.1.171.IwAR3...` | Browser Cookie Meta FBC |
| 28 | `campaign` | `promo-weekend` | Nama kampanye UTM |
| 29 | `hashedPhone` | `a1b2c3d4e5...` | SHA-256 hash no HP (Google Ads) |
| 30 | `metaHashedPhone`| `f6e5d4c3b2...` | SHA-256 hash no HP (Meta CAPI) |

---

### 3.3. Kode Google Apps Script Lengkap (Pencatat Sheet & Email Notifikasi)
Script ini dipasang pada Google Spreadsheet yang dituju (**Ekstensi** $\rightarrow$ **Apps Script**), lalu di-deploy sebagai Web App:

```javascript
/**
 * Google Apps Script - Webhook Receiver & Email Alert Wisma Apollo
 * Menerima FormData dari Cloudflare Pages (/api/booking-lead)
 */

const CONFIG = {
  NOTIFICATION_EMAIL: "admin@wisma-apollo.my.id, reservasi.apollo@gmail.com", // Ganti dengan email CS/Admin Anda
  SHEET_NAME: "BOOKING_PENDING"
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const params = e.parameter || {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    // Buat Sheet jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
      const headers = [
        "Submitted At", "TRX ID", "Event ID", "Nama Tamu", "No WhatsApp",
        "Check-In", "Check-Out", "Malam", "Tipe Kamar", "Rincian Kamar",
        "Total Kamar", "Single Bed", "Double Bed", "Jumlah Tamu", "Sarapan",
        "Biaya Sarapan", "Total Estimasi", "Catatan Tamu", "Source", "Click ID",
        "Page Location", "GCLID", "WBRAID", "GBRAID", "FBCLID", "FBP", "FBC",
        "Campaign", "Hashed Phone (GAds)", "Hashed Phone (Meta)", "Status Booking"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1B4332").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    const submittedAt = params.submittedAt || new Date().toISOString();
    const trxId = params.transactionId || "";
    const eventId = params.eventId || "";
    const name = params.name || "-";
    const phone = params.phone || "-";
    const checkIn = params.checkIn || "-";
    const checkOut = params.checkOut || "-";
    const stayNights = params.stayNights || "1";
    const roomType = params.roomType || "-";
    const roomSummary = params.roomSummary || "-";
    const roomCount = params.roomCount || "1";
    const singleRoomCount = params.singleRoomCount || "0";
    const doubleRoomCount = params.doubleRoomCount || "0";
    const guestCount = params.guestCount || "1";
    const breakfast = params.breakfast || "Tidak";
    const breakfastValue = Number(params.breakfastValue || 0);
    const totalValue = Number(params.totalValue || 0);
    const notes = params.notes || "-";
    const source = params.source || "Organic";
    const clickId = params.clickId || "";
    const pageLocation = params.pageLocation || "";
    const gclid = params.gclid || "";
    const wbraid = params.wbraid || "";
    const gbraid = params.gbraid || "";
    const fbclid = params.fbclid || "";
    const fbp = params.fbp || "";
    const fbc = params.fbc || "";
    const campaign = params.campaign || "";
    const hashedPhone = params.hashedPhone || "";
    const metaHashedPhone = params.metaHashedPhone || "";

    // 1. Simpan ke Google Sheets
    sheet.appendRow([
      submittedAt, trxId, eventId, name, "'" + phone.replace(/^'/, ''),
      checkIn, checkOut, stayNights, roomType, roomSummary,
      roomCount, singleRoomCount, doubleRoomCount, guestCount, breakfast,
      breakfastValue, totalValue, notes, source, clickId,
      pageLocation, gclid, wbraid, gbraid, fbclid, fbp, fbc,
      campaign, hashedPhone, metaHashedPhone, "PENDING"
    ]);

    // 2. Kirim Notifikasi Email HTML Instan ke Admin/CS
    sendEmailNotification({
      name, phone, checkIn, checkOut, stayNights, roomSummary,
      roomCount, guestCount, breakfast, totalValue, notes, source, trxId
    });

    return ContentService.createTextOutput(JSON.stringify({ ok: true, message: "Lead recorded successfully" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Format email pemberitahuan lead baru dengan desain modern & tombol WhatsApp langsung
 */
function sendEmailNotification(data) {
  const cleanPhone = data.phone.replace(/[^0-9]/g, '');
  const waLink = "https://wa.me/" + (cleanPhone.startsWith("0") ? "62" + cleanPhone.substring(1) : cleanPhone);
  const formattedTotal = "Rp" + Number(data.totalValue).toLocaleString("id-ID");

  const subject = "🛎️ [LEAD RESERVASI BARU] " + data.name + " (" + data.stayNights + " Malam) - " + formattedTotal;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; color: #333;">
      <div style="background-color: #1B4332; color: #ffffff; padding: 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px;">Wisma Apollo Kuala Kurun</h2>
        <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Pemberitahuan Reservasi Masuk dari Website</p>
      </div>
      <div style="padding: 24px; line-height: 1.6;">
        <p style="font-size: 16px; margin-top: 0;">Halo Tim Admin & CS,</p>
        <p>Ada calon tamu baru yang baru saja mengirimkan formulir reservasi via website:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold; width: 40%;">Nama Tamu:</td>
            <td style="padding: 8px 0;">${data.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold;">Nomor WhatsApp:</td>
            <td style="padding: 8px 0;"><a href="${waLink}" style="color: #25D366; font-weight: bold;">${data.phone}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold;">Jadwal Menginap:</td>
            <td style="padding: 8px 0;">${data.checkIn} s/d ${data.checkOut} (${data.stayNights} malam)</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold;">Pilihan Kamar:</td>
            <td style="padding: 8px 0;">${data.roomSummary} (Total: ${data.roomCount} kamar)</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold;">Jumlah Tamu:</td>
            <td style="padding: 8px 0;">${data.guestCount} orang</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold;">Sarapan:</td>
            <td style="padding: 8px 0;">${data.breakfast}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee; background-color: #f9fbf9;">
            <td style="padding: 10px 0; font-weight: bold; font-size: 15px; color: #1B4332;">Total Estimasi:</td>
            <td style="padding: 10px 0; font-weight: bold; font-size: 15px; color: #1B4332;">${formattedTotal}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold;">Catatan Khusus:</td>
            <td style="padding: 8px 0;">${data.notes}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Sumber Trafik / TRX:</td>
            <td style="padding: 8px 0;">${data.source} | <small style="color: #888;">${data.trxId}</small></td>
          </tr>
        </table>

        <div style="text-align: center; margin: 30px 0 10px 0;">
          <a href="${waLink}" style="background-color: #25D366; color: #ffffff; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37,211,102,0.3);">
            📲 Chat Tamu di WhatsApp
          </a>
        </div>
      </div>
      <div style="background-color: #f4f6f4; padding: 14px; text-align: center; font-size: 12px; color: #777;">
        Sistem Otomasi Website Wisma Apollo Kuala Kurun • Mohon verifikasi pembayaran sebelum lock kamar di sheet utama.
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}
```

---

## 4. Template Greeting / Format Pesan WhatsApp Lengkap

Pesan WhatsApp dibuat secara otomatis oleh `useBookingStore.ts` saat pengunjung menekan tombol **"Lanjut ke WhatsApp"**. Pesan disusun dengan struktur profesional agar CS/Admin langsung mendapatkan ringkasan data tanpa harus bertanya ulang kepada tamu.

### 4.1. Template Bahasa Indonesia (Default)
```text
🏨 Reservasi Wisma Apollo

Halo admin Wisma Apollo, saya ingin reservasi kamar.

👤 Data Tamu
Nama: Budi Santoso
Nomor WA: 081234567890

📅 Jadwal Menginap
Check-in: 2026-09-18
Check-out: 2026-09-20
Durasi: 2 malam

🛏️ Detail Kamar
- Single Bed: 2 kamar
Jumlah kamar: 2
Jumlah tamu dewasa: 3

🍽️ Sarapan
Sarapan: Ya, 3 pack/orang x 2 hari

💰 Total Estimasi
Total: Rp950.000

📝 Catatan Tamu
Catatan: Mohon disiapkan kamar lantai 1 jika tersedia.

ℹ️ Info Kamar
Semua kamar non-smoking. Merokok tersedia di area luar.

✅ Status Reservasi
Mohon dibantu cek ketersediaan kamar untuk tanggal di atas.
Jika kamar tersedia, reservasi resmi diterima setelah pembayaran masuk dan dikonfirmasi admin.

Terima kasih.
```

### 4.2. Template Bahasa Inggris (English - Locale `/en`)
```text
🏨 Wisma Apollo Reservation

Hello Wisma Apollo admin, I would like to reserve a room.

👤 Guest Details
Name: John Doe
WhatsApp: +6281234567890

📅 Stay Schedule
Check-in: 2026-09-18
Check-out: 2026-09-20
Duration: 2 nights

🛏️ Room Details
- Single Bed: 1 room
- Double Bed: 1 room
Total rooms: 2
Adult guests: 3

🍽️ Breakfast
Breakfast: Yes, 3 pack/person x 2 days

💰 Total Estimate
Total: Rp1.050.000

📝 Guest Notes
Notes: Late check-in around 8 PM.

ℹ️ Room Policy
All rooms are non-smoking. Smoking area is available outside.

✅ Reservation Status
Please confirm room availability for the dates above.
Reservation is officially confirmed once payment is received and verified by the admin.

Thank you.
```

### 4.3. Skema Perhitungan Harga (Tarif Resmi)
* **Single Bed Room**: **Rp 200.000** / malam (Kapasitas maks: 2 dewasa/kamar, Limit: 3 kamar)
* **Double Bed Room**: **Rp 250.000** / malam (Kapasitas maks: 3 dewasa/kamar, Limit: 1 kamar)
* **Sarapan (Breakfast)**: **Rp 25.000** / orang / hari
* **Rumus Total**:
  $$\text{Total} = ((\text{Jml Single} \times 200.000) + (\text{Jml Double} \times 250.000)) \times \text{Malam} + (\text{Sarapan} \times 25.000 \times \text{Tamu} \times \text{Malam})$$

---

## 5. Alur Pengalaman Tamu (User Experience & Handoff Flow)

1. **Pengisian Form**:
   * Tamu mengklik CTA *"Pesan Sekarang"* di navbar, hero, daftar kamar, atau floating WhatsApp.
   * `BookingModal.vue` terbuka dan otomatis menginisiasi tanggal check-in (hari ini) dan check-out (besok).
2. **Validasi Instan Client-Side**:
   * Nama min. 2 karakter.
   * Format nomor telepon min. 10 digit angka.
   * Check-out harus setelah check-in.
   * Kapasitas tamu dewasa tidak boleh melebihi kapasitas kombinasi kamar.
3. **Trigger Event ATC & User Data**:
   * Begitu form memenuhi syarat, background script otomatis mengirimkan event `wisma_atc` dan `wisma_user_data` (hashing nomor telepon) ke Google Ads.
4. **Handoff ke WhatsApp & Halaman `/thanks`**:
   * Tombol submit mengirim event `wisma_lead` dan melakukan HTTP POST ke `/api/booking-lead`.
   * Browser membuka tab baru `https://wa.me/62818232021?text=...` dengan pesan reservasi yang sudah diformat rapi.
   * Tab utama otomatis dialihkan ke halaman konfirmasi `/thanks`.
5. **Fungsi Halaman `/thanks`**:
   * Mengkonfirmasi bahwa pesanan sedang diproses.
   * Menyediakan tombol *"Buka WhatsApp Kembali"* jika aplikasi WA tidak sengaja tertutup.
   * Menampilkan nomor CS yang bisa di-copy dengan 1 klik.
   * Mengatur pembersihan session booking sementara (`trx_id`, hash) agar tidak bentrok dengan reservasi berikutnya.

---

## 6. Prosedur Standard Operating Procedure (SOP) Admin/CS

Untuk mencegah data okupansi kamar menjadi acak-acakan:
1. **Lead Masuk**:
   * Lead dari web otomatis tersimpan di tab sheet **`BOOKING_PENDING`**.
   * Notifikasi email masuk ke inbox admin dengan link chat WA tamu.
   * Tamu akan menyapa di WhatsApp dengan format reservasi baku.
2. **Pengecekan Ketersediaan**:
   * Admin mengecek ketersediaan fisik kamar pada tab sheet operasional bulanan (misal: `WISMA MEI 2026`).
3. **Konfirmasi & Pembayaran**:
   * CS menginformasikan nomor rekening resmi Wisma Apollo dan meminta bukti transfer DP / Pelunasan.
4. **Pembaruan Status (Lock Kamar)**:
   * **JANGAN** mengunci kamar di sheet utama sebelum transfer diterima.
   * Setelah bukti transfer valid, admin mengubah status di `BOOKING_PENDING` menjadi **`Confirmed` / `Lunas`** dan memasukkan data tamu ke slot kamar di sheet operasional harian.

---

## 7. Variabel Lingkungan & Konfigurasi Deployment (Cloudflare Pages)

Daftarkan variabel-variabel berikut di **Cloudflare Dashboard** $\rightarrow$ **Pages** $\rightarrow$ **Settings** $\rightarrow$ **Environment Variables**:

| Variable Key | Wajib? | Deskripsi & Contoh Nilai |
|---|---|---|
| `GOOGLE_APP_SCRIPT_URL` | **Wajib** | URL Deployment Web App Apps Script: `https://script.google.com/macros/s/AKfycbx.../exec` |
| `META_CAPI_ACCESS_TOKEN` | **Wajib** | Token Akses Conversions API dari Pengelola Acara Meta |
| `META_PIXEL_ID` | Opsional | Default: `2098215477608895` |
| `META_GRAPH_VERSION` | Opsional | Default: `v23.0` |
| `META_TEST_EVENT_CODE` | Opsional | Kode uji acara Meta saat debugging (misal: `TEST29643`), kosongkan saat produksi. |

### Build & Deploy Command
* **Framework**: Nuxt 4
* **Build Command**: `npm ci --prefix nuxt-app && npm run generate --prefix nuxt-app`
* **Build Output Directory**: `nuxt-app/dist` (atau `nuxt-app/.output/public`)
* **Node.js Version**: $\ge 20.x$
