/**
 * ============================================================================
 * GOOGLE APPS SCRIPT (GAS) - WISMA APOLLO KUALA KURUN (FINAL PRODUCTION)
 * ============================================================================
 * 
 * Script ini 100% DISINKRONKAN DENGAN STRUKTUR SHEET ANDA:
 * 1. "booking raw"  (30 Kolom: Log Mentah Semua Parameter Teknis & Tracking)
 * 2. "Booking data" (26 Kolom: Rekap Operasional Hotel & Status CRM)
 * 3. "Google ads"   (26 Kolom: Khusus Lead Google Ads GCLID, WBRAID, GBRAID)
 * 4. "Meta ads"     (28 Kolom: Khusus Lead Meta Ads FBCLID, FBP, FBC, Hashes)
 * 5. "Organic"      (22 Kolom: Khusus Lead Organik / Direct)
 * 
 * FITUR OTOMATIS:
 * - Nomor urut (No) otomatis bertambah 1, 2, 3, dst
 * - Status awal CRM otomatis diisi: Pending / Belum Bayar
 * - Deteksi sumber iklan cerdas (Google Ads / Meta Ads / Organic)
 * - Nomor WA otomatis diawali kutip (') agar angka 0 tidak terpotong
 * - Email notifikasi otomatis ke Admin dengan tombol WhatsApp sekali klik
 * 
 * PETUNJUK PEMASANGAN:
 * 1. Buka Google Sheet -> menu Ekstensi -> Apps Script
 * 2. Hapus seluruh isi kode lama, paste SEMUA kode ini dari awal sampai akhir
 * 3. Ubah NOTIFICATION_EMAIL di bawah ini (jika perlu)
 * 4. Klik "Terapkan" (Deploy) -> "Kelola Deployment" -> Edit (ikon pensil) -> Pilih "Versi Baru" -> Klik "Terapkan"
 * ============================================================================
 */

var CONFIG = {
  // Email Admin/CS penerima notifikasi lead masuk (pisahkan koma jika lebih dari satu)
  NOTIFICATION_EMAIL: "admin@wisma-apollo.my.id, reservasi.apollo@gmail.com",
  
  // Nama sheet persis sesuai sheet Anda
  TAB_RAW: "booking raw",
  TAB_DATA: "Booking data",
  TAB_GADS: "Google ads",
  TAB_META: "Meta ads",
  TAB_ORGANIC: "Organic"
};

/**
 * Endpoint utama penerima HTTP POST dari Website
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Mencegah race condition saat ada beberapa order masuk bersamaan

  try {
    var params = {};

    // 1. Parsing payload (Mendukung x-www-form-urlencoded, multipart, maupun JSON)
    if (e && e.postData && e.postData.contents) {
      try {
        if (e.postData.type && e.postData.type.indexOf("application/json") !== -1) {
          params = JSON.parse(e.postData.contents);
        }
      } catch (err) {}
    }
    if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      params = Object.assign({}, params, e.parameter);
    }

    // 2. Normalisasi Data
    var now = new Date();
    var submittedAt = params.submittedAt || Utilities.formatDate(now, "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    var trxId = params.transactionId || params.trx_id || ("TRX-" + now.getTime());
    var eventId = params.eventId || (trxId + "-wisma_lead");
    var name = params.name || "-";
    var rawPhone = String(params.phone || "").trim();
    var phone = "'" + rawPhone.replace(/^'+/, ""); // Aman dari pemotongan angka 0 oleh format angka Google Sheet
    var checkIn = params.checkIn || "-";
    var checkOut = params.checkOut || "-";
    var stayNights = params.stayNights || "1";
    var roomType = params.roomType || "-";
    var roomSummary = params.roomSummary || (params.roomType ? params.roomType : "Kamar Wisma Apollo");
    var roomCount = params.roomCount || "1";
    var singleRoomCount = params.singleRoomCount || "0";
    var doubleRoomCount = params.doubleRoomCount || "0";
    var guestCount = params.guestCount || "1";
    var breakfast = params.breakfast || "Tidak";
    var breakfastValue = Number(params.breakfastValue || 0);
    var totalValue = Number(params.totalValue || params.total_booking_value || 0);
    var notes = params.notes || "-";
    var source = params.source || "Organic";
    var clickId = params.clickId || "";
    var pageLocation = params.pageLocation || "";
    var gclid = params.gclid || "";
    var wbraid = params.wbraid || "";
    var gbraid = params.gbraid || "";
    var fbclid = params.fbclid || "";
    var fbp = params.fbp || "";
    var fbc = params.fbc || "";
    var campaign = params.campaign || "";
    var hashedPhone = params.hashedPhone || params.sha256_phone_number || "";
    var metaHashedPhone = params.metaHashedPhone || "";

    // Deteksi Sumber Trafik secara Akurat
    var isGoogle = Boolean(gclid || wbraid || gbraid || source.toLowerCase() === "google");
    var isMeta = Boolean(fbclid || fbc || ["meta", "facebook", "fb", "instagram", "ig"].indexOf(source.toLowerCase()) !== -1);
    var isOrganic = !isGoogle && !isMeta;

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // =========================================================================
    // 1. TAB: "booking raw" (30 Kolom Sesuai Milik Anda)
    // =========================================================================
    var rawHeaders = [
      "Timestamp", "TRX ID", "Event ID", "Nama Tamu", "No WhatsApp",
      "Check-In", "Check-Out", "Malam", "Tipe Kamar", "Rincian Kamar",
      "Total Kamar", "Single Bed", "Double Bed", "Jumlah Tamu", "Sarapan",
      "Biaya Sarapan", "Total Biaya", "Catatan", "Source", "Click ID",
      "GCLID", "WBRAID", "GBRAID", "FBCLID", "FBP", "FBC",
      "Campaign", "Hashed Phone (GAds)", "Hashed Phone (Meta)", "pageLocation"
    ];
    var sheetRaw = getOrCreateSheet(ss, CONFIG.TAB_RAW, rawHeaders, "#1B4332");
    sheetRaw.appendRow([
      submittedAt, trxId, eventId, name, phone,
      checkIn, checkOut, stayNights, roomType, roomSummary,
      roomCount, singleRoomCount, doubleRoomCount, guestCount, breakfast,
      breakfastValue, totalValue, notes, source, clickId,
      gclid, wbraid, gbraid, fbclid, fbp, fbc,
      campaign, hashedPhone, metaHashedPhone, pageLocation
    ]);

    // =========================================================================
    // 2. TAB: "Booking data" (26 Kolom Sesuai Milik Anda)
    // =========================================================================
    var dataHeaders = [
      "No", "Tanggal Masuk", "Nama", "No WhatsApp", "Check In", "Check Out",
      "Malam", "Tipe Kamar", "Ringkasan Kamar", "Jumlah Kamar", "Single Bed",
      "Double Bed", "Jumlah Tamu", "Sarapan", "Nilai Sarapan", "Total Booking",
      "Catatan Tamu", "Source", "Status Follow Up", "Status Booking",
      "Status Pembayaran", "Nominal Dibayar", "Admin Note", "Follow Up Terakhir",
      "Confirmed At", "Transaction ID"
    ];
    var sheetData = getOrCreateSheet(ss, CONFIG.TAB_DATA, dataHeaders, "#2D6A4F");
    var noData = Math.max(1, sheetData.getLastRow()); // Auto increment nomor urut
    sheetData.appendRow([
      noData, submittedAt, name, phone, checkIn, checkOut,
      stayNights, roomType, roomSummary, roomCount, singleRoomCount,
      doubleRoomCount, guestCount, breakfast, breakfastValue, totalValue,
      notes, source, "Pending", "Pending",
      "Belum Bayar", 0, "", "",
      "", trxId
    ]);

    // =========================================================================
    // 3. TAB: "Google ads" (26 Kolom Sesuai Milik Anda)
    // =========================================================================
    if (isGoogle) {
      var gadsHeaders = [
        "No", "Tanggal Masuk", "Nama", "No WhatsApp", "Check In", "Check Out",
        "Malam", "Tipe Kamar", "Ringkasan Kamar", "Jumlah Kamar", "Single Bed",
        "Double Bed", "Jumlah Tamu", "Sarapan", "Nilai Sarapan", "Total Booking",
        "Campaign", "GCLID", "WBRAID", "GBRAID", "Click ID", "Page Location",
        "Status Follow Up", "Status Booking", "Status Pembayaran", "Transaction ID"
      ];
      var sheetGads = getOrCreateSheet(ss, CONFIG.TAB_GADS, gadsHeaders, "#1A73E8");
      var noGads = Math.max(1, sheetGads.getLastRow());
      sheetGads.appendRow([
        noGads, submittedAt, name, phone, checkIn, checkOut,
        stayNights, roomType, roomSummary, roomCount, singleRoomCount,
        doubleRoomCount, guestCount, breakfast, breakfastValue, totalValue,
        campaign, gclid, wbraid, gbraid, clickId, pageLocation,
        "Pending", "Pending", "Belum Bayar", trxId
      ]);
    }

    // =========================================================================
    // 4. TAB: "Meta ads" (28 Kolom Sesuai Milik Anda)
    // =========================================================================
    if (isMeta) {
      var metaHeaders = [
        "No", "Tanggal Masuk", "Nama", "No WhatsApp", "Check In", "Check Out",
        "Malam", "Tipe Kamar", "Ringkasan Kamar", "Jumlah Kamar", "Single Bed",
        "Double Bed", "Jumlah Tamu", "Sarapan", "Nilai Sarapan", "Total Booking",
        "Campaign", "FBCLID", "FBP", "FBC", "Click ID", "Hashed Phone",
        "Meta Hashed Phone", "Page Location", "Status Follow Up", "Status Booking",
        "Status Pembayaran", "Transaction ID"
      ];
      var sheetMeta = getOrCreateSheet(ss, CONFIG.TAB_META, metaHeaders, "#1877F2");
      var noMeta = Math.max(1, sheetMeta.getLastRow());
      sheetMeta.appendRow([
        noMeta, submittedAt, name, phone, checkIn, checkOut,
        stayNights, roomType, roomSummary, roomCount, singleRoomCount,
        doubleRoomCount, guestCount, breakfast, breakfastValue, totalValue,
        campaign, fbclid, fbp, fbc, clickId, hashedPhone,
        metaHashedPhone, pageLocation, "Pending", "Pending",
        "Belum Bayar", trxId
      ]);
    }

    // =========================================================================
    // 5. TAB: "Organic" (22 Kolom Sesuai Milik Anda)
    // =========================================================================
    if (isOrganic) {
      var organicHeaders = [
        "No", "Tanggal Masuk", "Nama", "No WhatsApp", "Check In", "Check Out",
        "Malam", "Tipe Kamar", "Ringkasan Kamar", "Jumlah Kamar", "Single Bed",
        "Double Bed", "Jumlah Tamu", "Sarapan", "Nilai Sarapan", "Total Booking",
        "Catatan Tamu", "Page Location", "Status Follow Up", "Status Booking",
        "Status Pembayaran", "Transaction ID"
      ];
      var sheetOrganic = getOrCreateSheet(ss, CONFIG.TAB_ORGANIC, organicHeaders, "#52796F");
      var noOrganic = Math.max(1, sheetOrganic.getLastRow());
      sheetOrganic.appendRow([
        noOrganic, submittedAt, name, phone, checkIn, checkOut,
        stayNights, roomType, roomSummary, roomCount, singleRoomCount,
        doubleRoomCount, guestCount, breakfast, breakfastValue, totalValue,
        notes, pageLocation, "Pending", "Pending",
        "Belum Bayar", trxId
      ]);
    }

    // =========================================================================
    // 6. KIRIM NOTIFIKASI EMAIL KE ADMIN
    // =========================================================================
    try {
      sendEmailNotification({
        name: name,
        phone: rawPhone,
        checkIn: checkIn,
        checkOut: checkOut,
        stayNights: stayNights,
        roomSummary: roomSummary,
        roomCount: roomCount,
        guestCount: guestCount,
        breakfast: breakfast,
        totalValue: totalValue,
        notes: notes,
        source: source,
        trxId: trxId,
        gclid: gclid,
        wbraid: wbraid,
        gbraid: gbraid,
        fbclid: fbclid
      });
    } catch (emailErr) {
      // Email gagal tidak boleh menggagalkan simpan data ke sheet
    }

    // Response Sukses
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      result: "success",
      message: "Lead recorded to all matching sheets successfully",
      trxId: trxId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      result: "error",
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Mendukung uji coba via Browser (GET) untuk cek apakah Web App aktif
 */
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "Wisma Apollo Google Apps Script Webhook (Production)",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Fungsi Pembantu: Mencari sheet berdasarkan nama (fleksibel huruf besar/kecil),
 * atau otomatis membuatnya jika belum ada.
 */
function getOrCreateSheet(ss, sheetName, headers, headerBgColor) {
  var sheets = ss.getSheets();
  var targetSheet = null;

  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().trim().toLowerCase() === sheetName.trim().toLowerCase()) {
      targetSheet = sheets[i];
      break;
    }
  }

  if (!targetSheet) {
    targetSheet = ss.insertSheet(sheetName);
    targetSheet.appendRow(headers);
    var headerRange = targetSheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold")
               .setBackground(headerBgColor || "#1B4332")
               .setFontColor("#FFFFFF")
               .setHorizontalAlignment("center");
    targetSheet.setFrozenRows(1);
    for (var col = 1; col <= headers.length; col++) {
      targetSheet.autoResizeColumn(col);
    }
  }

  return targetSheet;
}

/**
 * Format dan kirim notifikasi email HTML
 */
function sendEmailNotification(data) {
  if (!CONFIG.NOTIFICATION_EMAIL || CONFIG.NOTIFICATION_EMAIL.indexOf("@") === -1) return;

  var cleanPhone = data.phone.replace(/[^0-9]/g, "");
  var waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.substring(1) : cleanPhone;
  var waLink = "https://wa.me/" + waNumber;
  var formattedTotal = "Rp " + Number(data.totalValue || 0).toLocaleString("id-ID");

  var subject = "🛎️ [LEAD RESERVASI] " + data.name + " (" + data.stayNights + " Malam) - " + formattedTotal;

  var adsInfo = "";
  if (data.wbraid) {
    adsInfo = '<span style="background: #e8f0fe; color: #1a73e8; padding: 2px 8px; border-radius: 4px; font-size: 11px;">iOS WBRAID</span> ';
  } else if (data.gbraid) {
    adsInfo = '<span style="background: #e8f0fe; color: #1a73e8; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Android GBRAID</span> ';
  } else if (data.gclid) {
    adsInfo = '<span style="background: #e8f0fe; color: #1a73e8; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Google Click ID</span> ';
  } else if (data.fbclid) {
    adsInfo = '<span style="background: #e8f0fe; color: #1877f2; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Meta Click ID</span> ';
  }

  var htmlBody = ""
    + '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; color: #333;">'
    + '  <div style="background-color: #1B4332; color: #ffffff; padding: 24px; text-align: center;">'
    + '    <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Wisma Apollo Kuala Kurun</h2>'
    + '    <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Notifikasi Lead Pemesanan Baru dari Website</p>'
    + '  </div>'
    + '  <div style="padding: 24px; line-height: 1.6;">'
    + '    <p style="font-size: 15px; margin-top: 0;">Halo Tim Pengelola & CS Wisma Apollo,</p>'
    + '    <p>Ada calon tamu yang baru saja mengisi data reservasi di website:</p>'
    + '    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">'
    + '      <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; font-weight: bold; width: 38%;">Nama Tamu:</td><td style="padding: 8px 0;">' + data.name + '</td></tr>'
    + '      <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; font-weight: bold;">WhatsApp:</td><td style="padding: 8px 0;"><a href="' + waLink + '" style="color: #25D366; font-weight: bold; text-decoration: none;">' + data.phone + '</a></td></tr>'
    + '      <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; font-weight: bold;">Jadwal:</td><td style="padding: 8px 0;">' + data.checkIn + ' s/d ' + data.checkOut + ' (' + data.stayNights + ' malam)</td></tr>'
    + '      <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; font-weight: bold;">Pilihan Kamar:</td><td style="padding: 8px 0;">' + data.roomSummary + ' (' + data.roomCount + ' kamar)</td></tr>'
    + '      <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; font-weight: bold;">Jumlah Tamu:</td><td style="padding: 8px 0;">' + data.guestCount + ' orang</td></tr>'
    + '      <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; font-weight: bold;">Sarapan:</td><td style="padding: 8px 0;">' + data.breakfast + '</td></tr>'
    + '      <tr style="border-bottom: 1px solid #f0f0f0; background-color: #f9fbf9;"><td style="padding: 10px 0; font-weight: bold; font-size: 15px; color: #1B4332;">Estimasi Biaya:</td><td style="padding: 10px 0; font-weight: bold; font-size: 15px; color: #1B4332;">' + formattedTotal + '</td></tr>'
    + '      <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; font-weight: bold;">Catatan Tamu:</td><td style="padding: 8px 0;">' + data.notes + '</td></tr>'
    + '      <tr><td style="padding: 8px 0; font-weight: bold;">Sumber Trafik:</td><td style="padding: 8px 0;">' + data.source + ' ' + adsInfo + '<br><small style="color: #999;">ID: ' + data.trxId + '</small></td></tr>'
    + '    </table>'
    + '    <div style="text-align: center; margin: 28px 0 10px 0;">'
    + '      <a href="' + waLink + '" style="background-color: #25D366; color: #ffffff; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37,211,102,0.3);">'
    + '        💬 Chat Tamu di WhatsApp'
    + '      </a>'
    + '    </div>'
    + '  </div>'
    + '  <div style="background-color: #f7f9f7; padding: 14px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee;">'
    + '    Sistem Pelacakan Otomatis Wisma Apollo • Data telah otomatis dicatat di Google Sheet'
    + '  </div>'
    + '</div>';

  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}
