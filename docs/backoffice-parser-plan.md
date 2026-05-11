# Backoffice Parser Booking Wisma Apollo

Tanggal catatan: 2026-05-11

## Tujuan

Membuat alur kerja untuk CS/admin agar data booking dari WhatsApp bisa dipaste ke backoffice, lalu otomatis diparsing menjadi field booking yang rapi.

Alur dasarnya:

1. User mengisi form booking di website.
2. Data masuk ke WhatsApp/chat dengan format tetap.
3. CS/admin copy pesan booking dari WhatsApp.
4. CS/admin paste ke kolom data parsing di backoffice.
5. Sistem otomatis mengisi field booking.
6. Admin verifikasi pembayaran/transfer.
7. Setelah valid, booking baru masuk ke data operasional/sheet utama.

## Keputusan Sementara

Jangan langsung memasukkan semua form booking ke sheet utama operasional/okupansi.

Alasan:

- Sheet utama saat ini dipakai sebagai laporan okupansi harian dan omset.
- Jika semua lead langsung masuk, data kamar bisa terlihat penuh padahal tamu belum transfer.
- Omset, okupansi, dan status kamar bisa menjadi kotor jika banyak lead belum valid.
- Funnel marketing tetap butuh semua lead tercatat, tapi operasional kamar butuh data yang sudah diverifikasi.

Rekomendasi:

- Form website boleh langsung masuk ke database/tab lead pending.
- Sheet utama harian hanya diisi setelah admin/CS verifikasi pembayaran.

## Flow Yang Disarankan

```text
Input user di website
  -> Pesan WhatsApp otomatis
  -> CS copy pesan WhatsApp
  -> Paste ke parser backoffice
  -> Auto-fill field booking
  -> Admin cek transfer
  -> Status jadi Confirmed
  -> Masuk sheet operasional harian
```

## Contoh Input Parser

```text
Halo Wisma Apollo, saya ingin reservasi kamar.

Nama: Bambang Irawan
Nomor WA: 081234567890
Check-in: 2026-05-11
Check-out: 2026-05-12
Tipe kamar: Single Bed - Rp200.000/malam
Catatan kamar: Semua kamar non-smoking. Merokok tersedia di area luar.
Jumlah kamar: 1
Jumlah tamu: 2
Sarapan: Ya, 2 pack/orang x 1 malam
Catatan: -

Terima kasih.
```

## Field Auto-Fill Backoffice

Parser minimal perlu mengisi:

- Nama
- Nomor WhatsApp
- Check-in
- Check-out
- Jumlah malam
- Tipe kamar
- Jumlah kamar
- Jumlah tamu
- Sarapan
- Catatan kamar
- Catatan tambahan
- Total estimasi
- Raw WhatsApp text

Field operasional/admin:

- Status pembayaran: `Pending`, `DP`, `Lunas`
- Status booking: `Pending`, `Confirmed`, `Cancelled`
- Admin/CS yang memverifikasi
- Waktu verifikasi

## Struktur Sheet Yang Disarankan

Buat tab baru:

```text
BOOKING_PENDING
```

Kolom awal:

- Timestamp
- Nama
- WA
- Check-in
- Check-out
- Malam
- Tipe kamar
- Jumlah kamar
- Jumlah tamu
- Sarapan
- Total estimasi
- Catatan kamar
- Catatan tambahan
- Status pembayaran
- Status booking
- Admin
- Raw WhatsApp Text

Sheet utama seperti `WISMA MEI 2026` tetap menjadi data final operasional.

## Rekomendasi Implementasi

Tahap 1:

- Buat textarea parser di backoffice.
- Parse format WhatsApp yang sekarang.
- Auto-fill field booking.
- Admin bisa edit field sebelum submit.

Tahap 2:

- Submit hasil parsing ke tab `BOOKING_PENDING`.
- Tambahkan status `Pending` default.
- Tambahkan tombol/aksi `Confirm`.

Tahap 3:

- Setelah `Confirmed`, data siap masuk ke sheet operasional harian.
- Bisa otomatis memilih tanggal dan slot kamar, atau dibuat semi-manual dulu untuk menghindari salah kamar.

## Catatan Risiko

- Jangan menganggap lead sama dengan booking confirmed.
- Jangan mengunci kamar sebelum admin verifikasi pembayaran, kecuali bisnis memang ingin memberi status hold.
- Jika nanti ada sistem hold, perlu batas waktu hold, misalnya 30 menit atau 1 jam.
- Parser harus tetap menyimpan raw text agar CS bisa audit jika hasil parsing meleset.

