# GTM Wisma Apollo

Setup final untuk container `GTM-5995VJ5B`:

- Google Ads dan Enhanced Conversion berjalan lewat GTM.
- Script GTM dimuat lewat first-party proxy `/px/gtm/gtm.js?id=GTM-5995VJ5B`.
- Meta Pixel berjalan langsung dari kode website.
- Meta CAPI berjalan lewat Cloudflare Pages Functions first-party endpoint.
- Jangan memasang Meta Pixel lewat GTM selama Meta masih aktif langsung dari kode website, supaya event tidak dobel.

## File Import

Gunakan file berikut untuk import GTM:

```text
GTM_Wisma_Apollo_Google_Final_import.json
```

File ini berisi tag:

- `Tag Google AW-11473033484`
- `Conversion Linker`
- `GAds - PV Wisma`
- `GAds - VC Wisma`
- `GAds - Kontak Wisma`
- `GAds - ATC Wisma`
- `GAds - Lead Wisma`
- `Tag Enhanced Conversion`

## Trigger

Trigger yang dipakai berasal dari custom event `dataLayer`:

- `wisma_pv`
- `wisma_vc`
- `wisma_kontak`
- `wisma_atc`
- `wisma_lead`
- `wisma_user_data`
- `All Pages`

Variable built-in GTM boleh tetap kosong karena tracking tidak memakai trigger klik/form bawaan GTM.

## Variable

Variable user yang dibutuhkan:

- `dlv_phone`
- `dlv_value`
- `User Data EC`

## Catatan Meta

Meta tidak perlu di-import ke GTM. Kode website sudah menangani:

- `fbclid` dari URL.
- `_fbc` dan `_fbp`.
- phone hash.
- browser Pixel event.
- server CAPI event untuk `AddToCart` dan `Lead`.

Dengan pemisahan ini, performa lebih ringan dan risiko event dobel lebih kecil.

## Test Setelah Publish

Uji lewat GTM Preview dan Meta Test Events:

- Masuk homepage: `wisma_pv`.
- Scroll 50%: `wisma_vc`.
- Klik reservasi/WhatsApp: `wisma_kontak`.
- Isi data sampai pilih kamar: `wisma_atc`.
- Klik lanjut WhatsApp: `wisma_lead`.

Di Meta Test Events, event tetap harus muncul dari jalur website/CAPI, bukan dari tag Meta GTM.

Catatan lokal: `nuxt dev` biasa tidak menjalankan Pages Functions, jadi proxy `/px/gtm/gtm.js` bisa `404` di localhost. Untuk menguji proxy first-party, gunakan domain live/Pages preview setelah deploy atau jalankan lewat Cloudflare Pages dev.
