# Rekod Perubahan (Changelog)

Semua perubahan ketara pada projek **e-Hadir** akan didokumentasikan di dalam fail ini.

Format ini berpandukan prinsip [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.0] - 2026-11-12

### Ditambah & Dilaksanakan
- **Ruang Logo Rasmi Organisasi / Acara Sebelum Tajuk Mesyuarat:**
  - Ditambah ruangan logo berbingkai kemas tepat sebelum tajuk mesyuarat pada kad pendaftaran ahli (BYOD & Kiosk Tablet).
  - Dipaparkan juga pada bar navigasi atas (*Header*), papan pemuka urus setia, dan kad Pas Kehadiran Digital.
  - Urus setia boleh memuat naik fail logo baharu (PNG/JPG/SVG), memasukkan pautan URL logo, atau menggunakan logo lalai Lembaga Getah Malaysia melalui tab *Tetapan Sesi*.
- **Pusat Radar Lokasi Langsung (Eksklusif Urus Setia):**
  - Pemantauan kedudukan GPS ahli yang hadir berbanding titik rujukan dewan mesyuarat.
  - Pengiraan automatik jarak dalam meter (formula Haversine) dan pengelasan zon: *Dalam Dewan* (<150m), *Sekitar Dewan* (150m-500m), dan *Luar Kawasan* (>500m).
  - Peta radar interaktif SVG dengan titik berdenyut (*pulsing pins*) dan sokongan klik untuk melihat profil, gambar, dan koordinat.
  - Mekanisme **Live Sync** yang menyegerakkan data kedudukan dan masa secara langsung tanpa henti.
  - **Kawalan Privasi Ketat:** Lokasi fizikal disekat sepenuhnya daripada dilihat oleh ahli biasa; hanya dipaparkan di dalam Papan Pemuka Urus Setia selepas memasukkan Kod PIN 6-digit yang sah.
- **Komponen Penuh Aplikasi Web `src/App.tsx`:**
  - Aliran pendaftaran kendiri ahli (BYOD) dan petugas kaunter (Mod Kiosk Tablet).
  - Semakan No. Gaji automatik terhadap pangkalan data induk dengan pengesahan profil dan perlindungan rekod berulang.
  - Modul kamera langsung (*Live WebRTC Camera*) dengan garisan panduan wajah dan pemampatan imej JPEG (<150KB).
  - Kad Pas Kehadiran Digital rasmi bertema Emerald Green.
  - Papan pemuka Urus Setia lengkap dengan 4 metrik kuorum, suis buka/tutup pendaftaran, penapis carian, muat naik fail senarai induk (CSV), dan eksport laporan CSV penuh bersama koordinat.

---

## [1.0.0-draft] - 2026-11-12

### Ditambah
- **Dokumen Keperluan Produk Rasmi (PRD v1.0):** Fail PDF spesifikasi sistem e-Hadir bertarikh 12 November 2026 disertakan dalam direktori `public/assets/aistudio/`.
- **Dokumentasi Lengkap Repositori:**
  - `README.md`: Pintu masuk utama dengan penerangan mudah difahami untuk orang awam.
  - `docs/PANDUAN-PENGGUNA.md`: Panduan operasi terperinci bagi ahli (BYOD), petugas kaunter (Mod Kiosk), dan pentadbir urus setia.
  - `docs/KEPERLUAN-PRODUK.md`: Huraian lengkap keperluan fungsian (FR-001 hingga FR-009) dan peraturan bisnes (BR-01 hingga BR-05).
  - `docs/STATUS-DAN-ROADMAP.md`: Status jujur mengenai perkara yang sudah dibina, telah diuji, belum disahkan, dan perancangan masa depan.
  - `docs/DATA-DAN-PRIVASI.md`: Panduan pengendalian data peribadi, keselamatan swafoto, dan tatacara pemadaman data sesi.
  - `docs/SETUP-DAN-PENYELENGGARAAN.md`: Panduan memasang, menguji binaan, dan langkah menyambungkan kod ke GitHub Private repository.
- **Kerangka Asas Aplikasi Web:**
  - Persediaan persekitaran React 19, TypeScript, Tailwind CSS v4, dan Vite 8.
  - Pakej dependensi Express, Lucide React, dan Motion.
- **Konfigurasi Projek:**
  - Kemas kini `.gitignore` untuk melindungi fail persekitaran `.env`, artifak binaan `dist/`, dan modul `node_modules/`.
  - Kemas kini `.env.example` dengan pembolehubah hos dan konfigurasi masa depan Firebase.
  - Penyelarasan tajuk serta penerangan dalam `index.html` dan `metadata.json`.

### Status Semasa Kod Sumber
- Komponen `src/App.tsx` berada dalam status persediaan rangka awal (*boilerplate* komponen) dan bersedia untuk fasa implementasi modul kamera dan pendaftaran.
