# Panduan Pengguna e-Hadir

Dokumen ini menerangkan cara menggunakan sistem **e-Hadir** untuk tiga peranan pengguna utama:
1. **Ahli / Peserta Mesyuarat** (menggunakan telefon pintar peribadi)
2. **Petugas Kaunter Pendaftaran** (menggunakan tablet kiosk)
3. **Pentadbir Urus Setia** (menggunakan komputer riba atau tablet)

---

## 1. Panduan untuk Ahli (Telefon Pintar / BYOD)

Aliran ini digunakan oleh ahli yang hadir secara fizikal ke dewan mesyuarat dan mempunyai telefon pintar sendiri dengan kamera yang berfungsi.

### Langkah 1: Imbas Kod QR
- Buka aplikasi kamera pada telefon pintar anda.
- Arahkan kamera ke Kod QR fizikal yang dipaparkan pada skrin layar dewan atau papan tanda pintu masuk.
- Tekan pautan yang muncul untuk membuka laman web **e-Hadir**.

### Langkah 2: Semak Maklumat Sesi & Masukkan No. Gaji
- Pastikan Tajuk Mesyuarat dan Tarikh yang dipaparkan adalah betul.
- Pastikan lencana status menunjukkan **"Pendaftaran Dibuka"**.
- Masukkan No. Gaji anda (contoh: `LGM1024` atau `1024`). Sistem tidak membezakan huruf besar atau huruf kecil.
- Tekan butang **"Semak No. Gaji"**.

### Langkah 3: Pengesahan Identiti
- Sistem akan memaparkan Nama Penuh dan Bahagian/Cawangan anda.
- Semak butiran tersebut:
  - Jika betul, tekan butang **"Teruskan ke Kamera"**.
  - Jika bukan nama anda, semak semula No. Gaji yang dimasukkan.

### Langkah 4: Tangkapan Swafoto Langsung (*Live Selfie*)
- Pelayar web telefon akan meminta kebenaran mengakses kamera (*Allow Camera Access*). Tekan **Benarkan / Allow**.
- Pandang ke kamera hadapan telefon. Pastikan wajah anda berada di dalam bingkai pratonton dengan pencahayaan yang mencukupi.
- Tekan butang bulat **"Tangkap Gambar"**.
- Periksa gambar yang diambil:
  - Jika gambar kabur, tekan **"Ambil Semula"**.
  - Jika gambar jelas, tekan **"Sahkan & Hantar Kehadiran"**.

### Langkah 5: Pas Kehadiran Digital
- Selepas dihantar, skrin akan memaparkan **Pas Kehadiran Digital** bertema hijau dengan lencana **"KEHADIRAN DISAHKAN"**.
- Pas ini memaparkan:
  - Nama Penuh & No. Gaji
  - Bahagian / Cawangan
  - Tarikh & Masa Pendaftaran berketepatan saat
  - Foto swafoto anda
- Tunjukkan pas ini kepada petugas pintu masuk dewan jika diminta.

---

## 2. Panduan untuk Petugas Kaunter (Mod Kiosk Tablet)

Mod ini digunakan oleh ahli jawatankuasa di meja pendaftaran untuk membantu ahli yang tidak membawa telefon pintar, kehabisan bateri, atau menghadapi masalah capaian internet.

### Langkah Pendaftaran Pantas Ahli:
1. Buka URL aplikasi e-Hadir pada pelayar tablet urus setia.
2. Minta No. Gaji daripada ahli dan taipkan ke dalam ruangan input.
3. Sahkan nama yang terpapar bersama ahli berkenaan.
4. Hadapkan kamera tablet ke arah ahli dan tekan **"Tangkap Gambar"**.
5. Tekan **"Sahkan & Hantar Kehadiran"**.
6. Tunjukkan Pas Kehadiran Digital kepada ahli sebagai bukti pendaftaran berjaya.
7. Tekan butang **"Daftar Ahli Seterusnya"** di bahagian bawah pas. Skrin akan terus dikosongkan dan bersedia untuk ahli berikutnya dalam masa kurang 2 saat tanpa perlu memuat semula halaman web.

---

## 3. Panduan untuk Pentadbir Urus Setia (Admin)

Papan pemuka Urus Setia membolehkan penyelarasan penuh mesyuarat dijalankan dengan teratur.

### Langkah 1: Log Masuk Pentadbir
1. Pada bahagian bawah (*footer*) halaman utama aplikasi, tekan pautan kecil **"Akses Urus Setia"**.
2. Masukkan **Kod PIN 6-digit** Pentadbir (lalai: `123456`).
3. Tekan butang **"Masuk Dashboard"**.

### Langkah 2: Persediaan Sesi & Muat Naik Senarai Induk Ahli
Sebelum pendaftaran dibuka kepada umum:
1. Masukkan **Tajuk Mesyuarat** (contoh: *Mesyuarat Agung Tahunan Ke-35*).
2. Masukkan **Tarikh Mesyuarat**.
3. Tetapkan **Sasaran Kuorum (%)** (contoh: `50` untuk 50% kehadiran ahli layak).
4. Muat naik fail senarai ahli layak berformat `.csv` yang mengandungi 3 kolum wajib:
   - `No_Gaji`
   - `Nama_Penuh`
   - `Bahagian_Cawangan`
5. Sistem akan membaca fail dan mengemas kini jumlah keseluruhan ahli layak.

### Langkah 3: Membuka & Menutup Pendaftaran
- **Buka Pendaftaran:** Tukar suis pendaftaran ke kedudukan **DIBUKA** apabila pintu dewan mula dibuka.
- **Tutup Pendaftaran:** Apabila mesyuarat bermula atau pendaftaran tamat, tolak suis ke kedudukan **DITUTUP**. Sebaik sahaja ditutup, skrin telefon pintar ahli akan serta-merta menyekat kemasukan No. Gaji baharu dan memaparkan notis rasmi bahawa pendaftaran telah tamat.

### Langkah 4: Pemantauan Kuorum Masa Nyata
Papan pemuka memaparkan 4 metrik langsung:
- **Jumlah Hadir:** Bilangan ahli yang telah sah mendaftar.
- **Jumlah Ahli Layak:** Jumlah ahli dalam senarai induk.
- **Peratusan Kehadiran:** Peratusan semasa ahli yang telah hadir.
- **Status Kuorum:** Paparan status sama ada kuorum **Tercapai** (warna hijau) atau **Belum Tercapai** (warna kuning/oren).

### Langkah 5: Pemantauan Lokasi Langsung Ahli (Eksklusif Urus Setia)
1. Pada bahagian tab navigasi urus setia, tekan tab **"Lokasi Langsung Ahli"** (berlabel hijau *Eksklusif Urus Setia*).
2. Peta radar interaktif berpusat di Dewan Mesyuarat (Dewan Perdana LGM) akan memaparkan titik taburan ahli yang hadir secara fizikal:
   - **Pin Hijau (Dalam Dewan):** Ahli berada kurang daripada 150 meter dari dewan.
   - **Pin Oren (Sekitar Dewan):** Ahli berada dalam lingkungan 150m hingga 500m (contoh: di kawasan parkir atau kafeteria).
   - **Pin Merah (Luar Kawasan):** Ahli berada lebih daripada 500 meter dari dewan mesyuarat.
3. **Kemas Kini Secara Live:** Sistem secara automatik menyegerakkan koordinat dan status jarak setiap beberapa saat (*Live Sync Pulse*).
4. Tekan mana-mana pin nombor atau senarai ahli di sebelah kanan untuk melihat profil, gambar swafoto, koordinat GPS terperinci, dan ketepatan jarak (*accuracy*).

### Langkah 6: Memuat Turun Laporan Kehadiran (CSV)
1. Pada papan pemuka admin, tekan butang **"Eksport CSV"**.
2. Fail `.csv` akan dimuat turun secara automatik ke peranti anda dengan nama fail berstruktur, contohnya: `Laporan_Kehadiran_e-Hadir_2026-11-12.csv`.
3. Fail ini mengandungi maklumat penuh: Nombor Bilangan, No. Gaji, Nama Penuh, Bahagian, Status Kehadiran, Waktu Daftar, Status Zon Lokasi, Jarak ke Dewan (Meter), Koordinat GPS, dan Pengesahan Swafoto.

---

## 4. Maksud Status & Label Penting

| Label / Status | Maksud & Kesan |
| :--- | :--- |
| **DIBUKA (OPEN)** | Pendaftaran sedang berjalan. Ahli boleh memasukkan No. Gaji dan mengambil gambar kehadiran. |
| **DITUTUP (CLOSED)** | Pendaftaran telah dihentikan oleh pentadbir. Borang No. Gaji disembunyikan secara automatik. |
| **Kuorum Tercapai** | Peratusan kehadiran ahli telah melepasi sasaran peratusan yang ditetapkan dalam perlembagaan/tetapan. |
| **Kuorum Belum Tercapai** | Jumlah kehadiran masih di bawah sasaran minimum yang diperlukan untuk memulakan mesyuarat secara sah. |
| **Kehadiran Telah Direkodkan** | No. Gaji yang dimasukkan telah didaftarkan sebelum ini. Sistem menghalang pendaftaran kali kedua bagi mengelakkan pertindihan data. |

---

## 5. Penyelesaian Masalah Lazim (Troubleshooting)

### Isu A: Kamera Telefon Tidak Boleh Dibuka
- **Sebab:** Anda mungkin membuka pautan melalui pelayar dalaman aplikasi (*in-app browser*) seperti WhatsApp atau Telegram yang menyekat kebenaran kamera, atau anda telah menekan "Block" pada kebenaran kamera.
- **Penyelesaian:** Salin (*copy*) pautan web tersebut dan tampal (*paste*) ke dalam pelayar web utama seperti **Google Chrome** (untuk Android) atau **Apple Safari** (untuk iPhone/iPad). Pastikan kebenaran kamera ditetapkan kepada "Allow".

### Isu B: Ralat "No. Gaji tidak ditemui dalam senarai ahli layak"
- **Sebab:** No. Gaji yang dimasukkan tiada dalam senarai induk ahli yang dimuat naik oleh urus setia, atau terdapat kesilapan menaip angka.
- **Penyelesaian:** Semak slip gaji atau kad pekerja anda. Sekiranya nombor adalah betul tetapi masih ditolak, sila berjumpa petugas di meja Urus Setia untuk semakan manual senarai induk.

### Isu C: Butang "Sahkan & Hantar" Menunjukkan Ralat Rangkaian
- **Sebab:** Sambungan internet mudah alih terputus seketika semasa gambar sedang dihantar ke pelayan.
- **Penyelesaian:** Jangan muat semula (*refresh*) halaman kerana gambar yang telah ditangkap masih disimpan dalam memori pelayar. Tekan butang **"Cuba Hantar Semula"** setelah sambungan internet kembali stabil.

### Isu D: Ahli Tidak Membawa Telefon atau Bateri Mati
- **Penyelesaian:** Ahli boleh terus ke kaunter urus setia untuk didaftarkan oleh petugas menggunakan Mod Kiosk Tablet.
