# e-Hadir — Sistem Pengurusan Kehadiran Mesyuarat & Aktiviti

> **Aplikasi web responsif untuk merekod kehadiran ahli secara pantas dan telus melalui imbasan Kod QR fizikal, semakan No. Gaji automatik, serta pengesahan swafoto langsung (*live camera selfie*).**

---

## 1. Masalah yang Diselesaikan

Dalam penganjuran Mesyuarat Agung Tahunan (AGM) atau perhimpunan rasmi organisasi berstruktur:
- **Kehadiran Palsu (Proxy):** Ahli boleh mengisi pautan borang Google Form biasa dari luar dewan untuk rakan yang tidak hadir secara fizikal.
- **Kesesakan di Kaunter:** Pendaftaran manual menggunakan buku atau kertas menyebabkan barisan panjang dan melengahkan permulaan mesyuarat.
- **Kesilapan Data:** Ejaan nama atau No. Gaji yang silap ditaip manual menyukarkan padanan dengan rekod keahlian rasmi.
- **Kelewatan Pengiraan Kuorum:** Pihak urus setia terpaksa mengira borang secara manual dan lambat mengetahui sama ada syarat korum mesyuarat telah dicapai.

**e-Hadir** menyelesaikan masalah ini dengan membenarkan ahli mendaftar sendiri menggunakan telefon pintar (*Bring Your Own Device* / BYOD) atau melalui tablet kaunter pendaftaran. Sistem menyemak No. Gaji terhadap senarai induk ahli, mewajibkan swafoto langsung di dewan, dan mengemas kini peratusan kuorum serta-merta (*real-time*).

---

## 2. Untuk Siapa Aplikasi Ini?

| Kumpulan Pengguna | Peranti Digunakan | Peranan Utama |
| :--- | :--- | :--- |
| **Ahli / Peserta Mesyuarat** | Telefon pintar peribadi (*BYOD*) | Imbas Kod QR di dewan, semak No. Gaji, tangkap swafoto langsung, dan simpan Pas Kehadiran Digital. |
| **Petugas Kaunter (Mod Kiosk)** | Tablet kaunter urus setia | Membantu ahli yang tiada telefon pintar atau menghadapi masalah capaian internet/bateri untuk mendaftar pantas. |
| **Pentadbir Urus Setia (Admin)** | Komputer riba / Tablet | Memuat naik senarai induk ahli (CSV), membuka/menutup sesi pendaftaran, memantau kuorum secara langsung, dan mengeksport laporan rasmi. |

---

## 3. Apa yang Boleh Dibuat? (Ciri Utama Berdasarkan PRD)

Berdasarkan dokumen spesifikasi rasmi (*Product Requirements Document* / PRD v1.0), sistem ini direka dengan keupayaan berikut:

1. **Semakan No. Gaji & Pencegahan Rekod Berulang:**
   Sistem mencari padanan No. Gaji secara tepat dalam senarai induk. Jika ahli telah berdaftar, sistem menyekat pendaftaran kali kedua dan memaparkan pas kehadiran asal beserta bukti cap masa.
2. **Kamera Langsung Sahaja (*Live Selfie Only*):**
   Tangkapan gambar hanya dibenarkan melalui kamera langsung peranti (*HTML5 MediaDevices API*). Muat naik gambar fail dari galeri telefon disekat sepenuhnya bagi mengelakkan penipuan gambar lama.
3. **Pas Kehadiran Digital:**
   Kad pengesahan rasmi bertema *Emerald Green* yang memaparkan nama penuh, No. Gaji, bahagian/cawangan, waktu pendaftaran berketepatan saat, dan gambar bukti kehadiran.
4. **Mod Kiosk Tablet untuk Kaunter:**
   Butang *"Daftar Ahli Seterusnya"* memudahkan petugas kaunter mendaftarkan ramai ahli berturut-turut tanpa perlu memuat semula halaman web.
5. **Papan Pemuka Urus Setia Dilindungi Kod PIN:**
   Halaman pentadbir dilindungi PIN 6-digit untuk kawalan suis buka/tutup pendaftaran, pemantauan kemajuan kuorum mesyuarat, dan muat naik senarai induk (fail CSV).
6. **Pemantauan Lokasi Langsung Ahli (Eksklusif Urus Setia & Kemas Kini Live):**
   Peta radar interaktif berpusat di dewan mesyuarat untuk memantau kehadiran fizikal ahli secara langsung berasaskan koordinat GPS dan jarak ke dewan (<150m, 150m-500m, >500m). **Lokasi ini dirahsiakan sepenuhnya daripada ahli biasa dan hanya boleh diakses oleh urus setia.**
7. **Eksport Laporan Rasmi (CSV):**
   Satu klik untuk memuat turun senarai kehadiran penuh yang mengandungi status hadir/tidak hadir, cap masa detik saat, zon jarak ke dewan, dan koordinat GPS untuk tujuan minit mesyuarat dan audit rasmi.

---

## 4. Contoh Cara Penggunaan

Berikut adalah aliran satu pendaftaran biasa ahli di dewan mesyuarat:

```
[Imbas QR di Dewan] ➔ [Masukkan No. Gaji] ➔ [Sahkan Nama & Bahagian]
         ➔ [Ambil Swafoto Langsung] ➔ [Pas Kehadiran Digital Berjaya Dipaparkan]
```

1. **Langkah 1:** Ahli tiba di pintu dewan dan mengimbas Kod QR fizikal yang dipaparkan di skrin menggunakan telefon pintar.
2. **Langkah 2:** Halaman pendaftaran e-Hadir dibuka. Ahli memasukkan No. Gaji (contoh: `LGM1001`) dan menekan **"Semak No. Gaji"**.
3. **Langkah 3:** Nama dan bahagian ahli dipaparkan untuk pengesahan. Ahli menekan **"Teruskan ke Kamera"**.
4. **Langkah 4:** Kamera hadapan diaktifkan. Ahli mengambil swafoto wajah dan menekan **"Sahkan & Hantar Kehadiran"**. Koordinat lokasi fizikal dirakam secara selamat di latar belakang untuk semakan urus setia.
5. **Langkah 5:** Pas Kehadiran Digital dipaparkan dengan lencana hijau, cap masa tepat, dan foto. Ahli boleh menunjukkan pas ini kepada petugas pintu dewan.

---

## 5. Cara Mencuba

Aplikasi dihoskan pada persekitaran awan berikut:

- **Pautan Aplikasi (Development URL):** [https://ais-dev-uj7k2plaodesqdveigwlt4-995955667013.asia-southeast1.run.app](https://ais-dev-uj7k2plaodesqdveigwlt4-995955667013.asia-southeast1.run.app)
- **Pautan Paparan Bersama (Shared Preview):** [https://ais-pre-uj7k2plaodesqdveigwlt4-995955667013.asia-southeast1.run.app](https://ais-pre-uj7k2plaodesqdveigwlt4-995955667013.asia-southeast1.run.app)

*Kod PIN Urus Setia Lalai:* `123456`

---

## 6. Status Projek

| Status Komponen | Tahap Semasa | Catatan Jujur |
| :--- | :--- | :--- |
| **Dokumentasi & Spesifikasi (PRD v1.0)** | **Selesai & Disahkan** | Berdasarkan dokumen PRD rasmi 12 November 2026 (`public/assets/aistudio/...`). |
| **Rangka Projek & Senibina Asas** | **Selesai Dibina** | Kerangka React 19, TypeScript, Tailwind CSS v4, dan Vite 8 telah dipasang dan dikonfigurasikan. |
| **Ujian Binaan (*Build & Lint*)** | **Lulus 100%** | Persekitaran kompilasi kod asas disahkan bebas daripada sebarang ralat sintaks. |
| **Komponen UI & Logik Aplikasi (`App.tsx`)** | **Selesai Dibina & Aktif** | Aliran pendaftaran ahli (BYOD/Kiosk), kamera hadapan langsung, pas kehadiran digital, dan dashboard urus setia telah berfungsi sepenuhnya. |
| **Radar Lokasi Langsung (Live Location)** | **Selesai Dibina** | Pemantauan radar GPS masa nyata berpusat di dewan; akses terhad secara eksklusif kepada Urus Setia ber-PIN. |
| **Pangkalan Data Awan (Firebase)** | **Pilihan / Sedia Dihubungkan** | Sistem berfungsi secara optimum dengan storan tempatan pantas (*Local State & Storage*) dan sedia dihubungkan ke Firebase Firestore. |

*Perincian penuh status dan fasa pembangunan didokumentasikan di dalam [`docs/STATUS-DAN-ROADMAP.md`](docs/STATUS-DAN-ROADMAP.md).*

---

## 7. Ringkasan Teknologi

Aplikasi ini menggunakan teknologi web moden yang ringan dan pantas:

- **React 19:** Pustaka (*library*) utama untuk membina antara muka pengguna yang interaktif dan pantas.
- **TypeScript:** Bahasa pengaturcaraan berasaskan JavaScript dengan kawalan jenis data (*type safety*) untuk mengurangkan ralat sistem.
- **Tailwind CSS v4:** Kerangka reka bentuk untuk memastikan antara muka kemas, bertema korporat *Emerald Green*, dan mesra telefon pintar.
- **Vite 8:** Alat kompilasi dan pembangun yang sangat pantas untuk aplikasi web.
- **Lucide React:** Set ikon moden untuk visual yang bersih dan intuitif.
- **Motion:** Pustaka animasi bagi peralihan skrin yang lancar.
- **Express / Node.js:** Pelayan sokongan bagi mengendalikan laluan API dan persekitaran pelayan.

---

## 8. Panduan Lanjut

Untuk maklumat terperinci, sila rujuk dokumentasi mengikut keperluan anda:

- 📖 **[Panduan Pengguna (docs/PANDUAN-PENGGUNA.md)](docs/PANDUAN-PENGGUNA.md)** — Panduan langkah demi langkah untuk ahli, petugas kaunter, dan pentadbir.
- 📋 **[Keperluan Produk & PRD (docs/KEPERLUAN-PRODUK.md)](docs/KEPERLUAN-PRODUK.md)** — Spesifikasi penuh, keperluan fungsian (FR-001 hingga FR-009), dan peraturan bisnes.
- 🗺️ **[Status & Roadmap Projek (docs/STATUS-DAN-ROADMAP.md)](docs/STATUS-DAN-ROADMAP.md)** — Senarai apa yang telah siap, belum diuji, dan perancangan fasa masa depan.
- 🔒 **[Data & Privasi (docs/DATA-DAN-PRIVASI.md)](docs/DATA-DAN-PRIVASI.md)** — Maklumat pengendalian data peribadi, simpanan swafoto, dan keselamatan akses PIN.
- 🛠️ **[Panduan Setup & Penyelenggaraan (docs/SETUP-DAN-PENYELENGGARAAN.md)](docs/SETUP-DAN-PENYELENGGARAAN.md)** — Arahan menjalankan projek di komputer sendiri (*local development*) dan langkah integrasi GitHub.
- 📜 **[Rekod Perubahan (CHANGELOG.md)](CHANGELOG.md)** — Sejarah versi dan kemas kini projek.

---

## 9. Maklum Balas & Bantuan

Sekiranya anda menemui sebarang isu atau ingin mencadangkan penambahbaikan selepas repositori ini disambungkan ke GitHub:
1. Buka tab **Issues** di bahagian atas repositori GitHub anda.
2. Tekan **New Issue**.
3. Terangkan masalah yang dihadapi beserta langkah untuk menghasilkan semula ralat tersebut.

---

## 10. Lesen

Lesen perisian projek ini **belum ditetapkan** oleh pemilik projek. Hak cipta terpelihara kepada pemilik organisasi yang berkenaan.
