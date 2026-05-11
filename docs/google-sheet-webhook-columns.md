# Google Sheet Webhook Columns

Endpoint booking lead mengirim field berikut ke Google Apps Script sebagai `FormData`.

## Kolom Utama

Urutan kolom yang disarankan di sheet:

```text
submittedAt
transactionId
eventId
name
phone
checkIn
checkOut
stayNights
roomType
roomSummary
roomCount
singleRoomCount
doubleRoomCount
guestCount
breakfast
breakfastValue
totalValue
notes
source
clickId
pageLocation
gclid
wbraid
gbraid
fbclid
fbp
fbc
campaign
hashedPhone
metaHashedPhone
```

## Catatan Field

- `transactionId` adalah `TRX-*` yang dibuat sejak user masuk website dan dipakai berurutan dari `PageView` sampai `Lead`.
- `eventId` untuk Lead memakai format `${transactionId}-wisma_lead`, sama dengan event browser dan CAPI agar Meta bisa deduplikasi.
- `hashedPhone` dipakai untuk Google Enhanced Conversion.
- `metaHashedPhone` dipakai untuk Meta CAPI.
- `fbclid`, `fbp`, dan `fbc` dipakai untuk atribusi Meta.
- `gclid`, `wbraid`, dan `gbraid` dipakai untuk atribusi Google Ads.
- `totalValue` adalah estimasi total booking termasuk sarapan jika dipilih.
