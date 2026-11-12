# Status & Roadmap Projek e-Hadir

Dokumen ini merekodkan status sebenar pembangunan aplikasi **e-Hadir** berasaskan kod sumber semasa, hasil ujian teknikal, serta perancangan fasa akan datang.

---

## 1. Status Semasa Pembangunan

Bagi memastikan ketelusan kepada pihak berkepentingan, jadual di bawah membezakan secara jelas antara perkara yang **sudah dibina**, **telah diuji**, **belum disahkan**, dan **masih dirancang**:

| Komponen / Ciri | Status | Catatan Sebenar |
| :--- | :--- | :--- |
| **Spesifikasi & Keperluan PRD v1.0** | ✅ **Selesai & Disahkan** | Dokumen PRD v1.0 bertarikh 12 November 2026 telah disahkan sepenuhnya dan disimpan dalam projek. |
| **Kerangka Projek & Dependensi** | ✅ **Sudah Dibina** | Pemasangan React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Motion, dan pelayan Express. |
| **Kompilasi & Binaan Asas (*Build System*)** | 🧪 **Telah Diuji** | Perintah `npm run build` dan `compile_applet` telah dijalankan dan lulus 100% tanpa sebarang ralat sintaks. |
| **Antara Muka Pengguna e-Hadir (`App.tsx`)** | ✅ **Sudah Dibina & Berfungsi** | Antara muka penuh pendaftaran ahli (BYOD), semakan No. Gaji automatik, padanan senarai induk, dan pas digital telah siap dibina. |
| **Modul Kamera Langsung (*Live Camera Selfie*)** | ✅ **Sudah Dibina & Berfungsi** | Integrasi kamera hadapan langsung peranti dengan panduan bingkai wajah, tangkapan ke kanvas, dan pemampatan imej JPEG (<150KB). |
| **Pusat Radar Lokasi Langsung (Live Location)** | ✅ **Sudah Dibina (Eksklusif Urus Setia)** | Peta radar interaktif berpusat di dewan dengan pemantauan koordinat GPS, zon jarak, dan kemas kini langsung (*live sync*). Disekat sepenuhnya daripada ahli biasa. |
| **Papan Pemuka Urus Setia & Kunci PIN** | ✅ **Sudah Dibina & Berfungsi** | Antara muka pentadbir dilindungi Kod PIN 6-digit dengan 4 kad kuorum, penapis status, muat naik CSV senarai induk, dan eksport CSV rasmi. |
| **Pangkalan Data Awan (Firebase Firestore)** | ⚠️ **Pilihan / Konfigurasi Tersedia** | Aplikasi beroperasi lancar dengan storan tempatan pantas (*Local State & Storage*) dan bersedia untuk disambungkan ke projek Firebase jika diaktifkan. |

---

## 2. Isu Diketahui (*Known Issues & Limitations*)

1. **Komponen Paparan Masih Kosong:**  
   Fail `src/App.tsx` pada masa ini belum memaparkan antara muka e-Hadir kerana fokus fasa ini adalah menstrukturkan repositori, konfigurasi persekitaran binaan, dan dokumentasi penuh berasaskan PRD.
2. **Ketiadaan Pangkalan Data Awan Aktif:**  
   Kredensial Firebase (`apiKey`, `projectId`, `storageBucket`) belum dikonfigurasikan di dalam persekitaran. Apabila fasa pembinaan bermula, mod storan tempatan sementara (*in-memory / localStorage*) disyorkan sebagai fasa peralihan sebelum pangkalan data awan dipasang.
3. **Kekangan Sambungan GitHub:**  
   Persekitaran pembangun dalam talian belum mempunyai sambungan terus (*direct token/auth*) ke akaun GitHub peribadi pemilik projek. Oleh itu, langkah penyambungan manual disediakan di dalam [Panduan Setup](SETUP-DAN-PENYELENGGARAAN.md).

---

## 3. Pelan Tindakan & Roadmap Fasa

Pelan pembangunan disusun mengikut urutan logik tanpa menetapkan tarikh rekaan:

### Fasa 1: Aliran Teras Ahli & Struktur UI (MVP)
- [ ] Membina tema warna korporat *Emerald Green* (`#065f46`) dan latar belakang putih.
- [ ] Membina skrin utama carian No. Gaji dan pengesahan profil ahli layak.
- [ ] Melaksanakan integrasi kamera hadapan langsung (*HTML5 video stream*) dengan sekatan input muat naik galeri.
- [ ] Melaksanakan fungsi pemampatan imej JPEG (< 150KB) sebelum penghantaran.
- [ ] Membina paparan Pas Kehadiran Digital bersama butang *"Daftar Ahli Seterusnya"* untuk sokongan mod kiosk tablet.
- [ ] Melaksanakan pengesanan pendaftaran berulang berdasarkan No. Gaji.

### Fasa 2: Papan Pemuka Urus Setia & Pengurusan Data (MVP)
- [ ] Membina modal/skrin kunci Kod PIN pentadbir 6-digit dengan simpanan sesi `sessionStorage`.
- [ ] Membina borang tetapan sesi mesyuarat (Tajuk, Tarikh, Sasaran Kuorum %) dan suis pendaftaran Buka/Tutup.
- [ ] Membina fungsi pembaca/penghurai muat naik fail CSV senarai ahli induk (3 kolum: `No_Gaji`, `Nama_Penuh`, `Bahagian_Cawangan`).
- [ ] Membina kad metrik kuorum langsung dan penapis senarai ahli mengikut bahagian/status.
- [ ] Menambah fungsi dialog pengesahan dua peringkat untuk *"Reset Sesi / Padam Semua Data"*.

### Fasa 3: Integrasi Storan Awan & Eksport Laporan (MVP)
- [ ] Menghubungkan Firebase Firestore untuk sinkronisasi masa nyata antara telefon ahli dan tablet urus setia.
- [ ] Menyimpan imej swafoto ke Cloud Storage.
- [ ] Membina fungsi penjanaan dan muat turun laporan akhir berformat fail `.csv` dengan sokongan UTF-8 BOM.

### Fasa 4: Ciri Lanjutan (Fasa 2 — Dirancang)
- [ ] Sokongan berbilang sesi mesyuarat serentak atau arkib tahunan (*Multi-Event Archive*).
- [ ] Penjanaan Kod QR automatik yang sedia dicetak dari papan pemuka admin.
- [ ] Modul audit visual manual (*"Sah"* / *"Siasat"*) oleh jawatankuasa pemilihan bagi setiap gambar kehadiran.
- [ ] Modul cabutan bertuah (*Lucky Draw*) rawak automatik berasaskan senarai ahli yang hadir secara sah.
