# GTM Wisma Apollo

Setup final untuk container `GTM-5995VJ5B`:

- Google Ads dan Enhanced Conversion berjalan lewat GTM.
- GA4 berjalan lewat GTM dengan Measurement ID `G-24RFWGMFY8`.
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

- `Tag Google AW-18107085431`
- `Conversion Linker`
- `GAds - PV Wisma`
- `GAds - VC Wisma`
- `GAds - Kontak Wisma`
- `GAds - ATC Wisma`
- `GAds - Lead Wisma`
- `Tag Enhanced Conversion`
- `Tag Google G-24RFWGMFY8`
- `GA4 - PV Wisma`
- `GA4 - VC Wisma`
- `GA4 - Kontak Wisma`
- `GA4 - ATC Wisma`
- `GA4 - Lead Wisma`

## Google Ads Conversion Mapping

| Funnel | DataLayer event | Google Ads label | Value |
| --- | --- | --- | --- |
| PV Wisma | `wisma_pv` | `DLj_COy4rrgcEPfkkLpD` | 100 |
| VC Wisma | `wisma_vc` | `FrBUCM3jr7gcEPfkkLpD` | 200 |
| WA Kontak | `wisma_kontak` | `gH-uCLSVsLgcEPfkkLpD` | 300 |
| ATC Wisma | `wisma_atc` | `45vBCNiPrrgcEPfkkLpD` | 500 |
| Lead Wisma | `wisma_lead` | `bo-PCNi5sLgcEPfkkLpD` | 5000 |

## GA4 Event Mapping

| Funnel | DataLayer event | GA4 event name | GA4 status |
| --- | --- | --- | --- |
| PV Wisma | `wisma_pv` | `wisma_pv` | Event |
| VC Wisma | `wisma_vc` | `wisma_vc` | Event |
| WA Kontak | `wisma_kontak` | `wisma_kontak` | Key event |
| ATC Wisma | `wisma_atc` | `wisma_atc` | Key event |
| Lead Wisma | `wisma_lead` | `wisma_lead` | Key event |

Di GA4, tandai `wisma_kontak`, `wisma_atc`, dan `wisma_lead` sebagai key event. `wisma_pv` dan `wisma_vc` cukup menjadi event biasa.

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
- `dlv_currency`
- `dlv_transaction_id`
- `dlv_page_location`
- `dlv_campaign`
- `dlv_gclid`
- `dlv_wbraid`
- `dlv_gbraid`
- `dlv_room_type`
- `dlv_room_summary`
- `dlv_room_count`
- `dlv_guest_count`
- `dlv_stay_nights`
- `dlv_total_booking_value`
- `User Data EC`

## Catatan Meta

Meta tidak perlu di-import ke GTM. Kode website sudah menangani:

- `fbclid` dari URL.
- `_fbc` dan `_fbp`.
- phone hash.
- browser Pixel event untuk `PageView`, `ViewContent`, `Contact`, `AddToCart`, dan `Lead`.
- server CAPI event untuk `PageView`, `ViewContent`, `Contact`, `AddToCart`, dan `Lead`.
- CAPI `Lead` dikirim lewat endpoint booking lead supaya data sheet dan payload lead memakai event id yang sama.

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
