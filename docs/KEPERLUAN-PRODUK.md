# Keperluan Produk & Spesifikasi Sistem (PRD)

Dokumen ini merumuskan spesifikasi keperluan produk rasmi berasaskan **e-Hadir Product Requirements Document (PRD) Versi 1.0 (MVP)** bertarikh 12 November 2026.

Fail dokumen asal disimpan di dalam repositori:  
`public/assets/aistudio/e-Hadir_Product_Requirements_Document__PRD__v1.0_e9a0eda7.pdf`

---

## 1. Ringkasan & Objektif Produk

- **Nama Produk:** e-Hadir — Sistem Kehadiran
- **Versi:** 1.0 (MVP — *Minimum Viable Product*)
- **Status PRD:** Disahkan (*Keperluan MVP telah dipersetujui sepenuhnya*)
- **Format Sistem:** Aplikasi Web Responsif (*Single Page Application* / SPA) berasaskan web mudah alih (*BYOD*) dan tablet kiosk.

### Matlamat Utama & Metrik Kejayaan
1. **Kesahihan Kehadiran 100%:** Setiap rekod kehadiran wajib mempunyai padanan No. Gaji sah dalam pangkalan data induk, cap masa tepat, dan foto swafoto langsung (*live camera selfie*).
2. **Kelancaran Aliran Pendaftaran:** Masa pendaftaran dari imbasan Kod QR sehingga kemunculan Pas Kehadiran Digital disasarkan di bawah **30 saat** bagi setiap ahli.
3. **Pemantauan Kuorum Masa Nyata:** Pihak urus setia menerima kemas kini peratusan kuorum dalam masa kurang **3 saat** selepas butang pengesahan ditekan oleh mana-mana peranti.
4. **Pelaporan Serta-Merta:** Laporan rasmi kehadiran berformat CSV/Excel boleh dijana dan dimuat turun serta-merta sebaik sahaja pendaftaran ditutup.

---

## 2. Peranan Pengguna & Matriks Hak Akses

| Peranan (*Role*) | Akses & Peranti | Hak & Tanggungjawab |
| :--- | :--- | :--- |
| **Ahli / Peserta Mesyuarat** | Telefon pintar sendiri (*BYOD*), pautan Kod QR awam | Carian No. Gaji sendiri, melihat profil sendiri, mengambil swafoto langsung, dan memaparkan Pas Kehadiran Digital. *Tiada akses kepada data ahli lain.* |
| **Petugas Kaunter (Kiosk)** | Tablet di kaunter urus setia | Membantu ahli mendaftar menggunakan antara muka yang sama dengan sokongan butang reset pantas (*"Daftar Ahli Seterusnya"*). |
| **Pentadbir Urus Setia (Admin)** | Komputer riba / tablet, dilindungi Kod PIN 6-digit | Menetapkan butiran mesyuarat, memuat naik senarai induk CSV, menukar status pendaftaran (Buka/Tutup), melihat statistik kuorum, dan memuat turun laporan akhir. |

---

## 3. Skop MVP vs Fasa Masa Depan vs Luar Skop

### Dalam Skop MVP (Fasa 1)
- [x] Paparan maklumat sesi mesyuarat, ruang logo rasmi sebelum tajuk, dan kawalan suis buka/tutup pendaftaran.
- [x] Carian No. Gaji dan pengesahan kelayakan terhadap pangkalan data induk.
- [x] Sekatan pendaftaran berulang (*Duplicate Prevention*).
- [x] Tangkapan gambar swafoto langsung secara mandatori (*Live Camera Only*).
- [x] Paparan Pas Kehadiran Digital dengan logo rasmi dan butang mod kiosk (*"Daftar Ahli Seterusnya"*).
- [x] Pengesahan akses pentadbir melalui Kod PIN 6-digit.
- [x] Muat naik fail senarai induk ahli (CSV) dan pengurusan logo organisasi (muat naik fail imej/URL).
- [x] Papan pemuka pemantauan kuorum masa nyata dan penapisan senarai ahli.
- [x] Pusat Radar Lokasi Langsung (Eksklusif Urus Setia & Kemas Kini Live).
- [x] Eksport laporan akhir kehadiran ke format fail CSV dengan sokongan UTF-8 BOM.

### Fasa Seterusnya (Fasa 2 — Dirancang)
- Pengurusan berbilang sesi mesyuarat (*Multi-Event Archive & History*).
- Penjanaan Kod QR dinamik terus dari dalam papan pemuka admin untuk dicetak.
- Penandaan pengesahan visual manual (*"Sah"* / *"Siasat"*) oleh juruaudit pada setiap foto selfie.
- Modul cabutan bertuah (*Lucky Draw*) berasaskan senarai ahli yang telah sah hadir.

### Di Luar Skop (*Out of Scope*)
- Semakan lokasi berasaskan GPS atau *Geofencing* (bagi mengelakkan isu ketiadaan isyarat GPS di dalam bangunan tertutup).
- Sistem pengundian elektronik (*e-Voting*) untuk usul mesyuarat.
- Pendaftaran akaun individu ahli menggunakan kata laluan atau OTP melalui SMS/Emel.
- Aplikasi mudah alih natif (*App Store* / *Google Play Store*) — sistem beroperasi sepenuhnya sebagai Web App responsif.

---

## 4. Keperluan Fungsian (*Functional Requirements*)

- **FR-001 (Paparan Maklumat Sesi & Kawalan Status Pendaftaran):**  
  Membaca konfigurasi sesi aktif. Jika status `OPEN`, borang carian dipaparkan. Jika status `CLOSED`, borang disembunyikan dan mesej rasmi penutupan dipaparkan.
- **FR-002 (Carian & Pengesahan Kelayakan No. Gaji):**  
  Mencari padanan tepat No. Gaji (tidak peka huruf besar/kecil). Jika tidak sah, tolak serta-merta dengan mesej jelas. Jika sah, paparkan profil (Nama Penuh & Bahagian).
- **FR-003 (Semakan Rekod Berulang):**  
  Jika No. Gaji telah hadir, sekat akses kamera dan terus paparkan notis bahawa kehadiran telah direkodkan bersama Pas Kehadiran Digital terdahulu.
- **FR-004 (Tangkapan Foto Live Selfie Wajib):**  
  Wajib menggunakan kamera langsung (`facingMode: "user"`). Sebarang input muat naik fail gambar dari galeri (`<input type="file">`) adalah dilarang sama sekali. Imej dimampatkan di sisi klien sebelum dihantar.
- **FR-005 (Pas Kehadiran Digital & Butang Mod Kiosk):**  
  Kad pengesahan rasmi bertema Emerald Green mengandungi status sah, butiran ahli, cap masa detik saat, foto selfie, dan butang reset *"Daftar Ahli Seterusnya"*.
- **FR-006 (Pengesahan Akses Pentadbir — Admin PIN Gate):**  
  Melindungi papan pemuka urus setia menggunakan kod PIN 6-digit. Sesi log masuk pentadbir disimpan dalam `sessionStorage`.
- **FR-007 (Konfigurasi Sesi & Muat Naik Senarai Induk):**  
  Urus setia memasukkan tajuk mesyuarat, tarikh, sasaran kuorum (%), dan memuat naik fail CSV (3 kolum: `No_Gaji`, `Nama_Penuh`, `Bahagian_Cawangan`). Menyediakan fungsi *"Reset Sesi / Padam Semua Data"* dengan dialog pengesahan dua peringkat.
- **FR-008 (Dashboard Pemantauan Kuorum Masa Nyata):**  
  Memaparkan kad metrik: Jumlah Hadir, Jumlah Layak, Peratusan Semasa, Status Kuorum (Tercapai / Belum), suis Buka/Tutup, bar carian pantas, dan jadual status kehadiran.
- **FR-009 (Eksport Laporan Akhir CSV):**  
  Memuat turun fail CSV berstruktur (`Laporan_Kehadiran_e-Hadir_YYYY-MM-DD.csv`) mengandungi kolum: `Bil`, `No_Gaji`, `Nama_Penuh`, `Bahagian_Cawangan`, `Status_Kehadiran`, `Masa_Daftar`, `Status_Lokasi_Dewan`, `Jarak_Dari_Dewan_Meter`, `Koordinat_GPS`, dan `Status_Swafoto`.
- **FR-010 (Penjejakan & Pemantauan Lokasi Langsung — Eksklusif Urus Setia):**  
  Menyediakan tab radar/peta interaktif masa nyata di dalam Papan Pemuka Urus Setia untuk memantau taburan kedudukan fizikal ahli yang hadir berbanding titik rujukan dewan mesyuarat (jarak dalam meter, status zon: *Dalam Dewan*, *Sekitar Dewan*, atau *Luar Kawasan*). **Hanya Urus Setia ber-PIN sahaja dibenarkan melihat paparan lokasi ini; ahli biasa disekat sepenuhnya daripada melihat lokasi orang lain.** Peta dikemas kini secara langsung (*live sync*) secara berkala.

---

## 5. Peraturan Bisnes (*Business Rules & Edge Cases*)

- **BR-01 (Normalisasi No. Gaji):** Semua input No. Gaji dipangkas ruang kosong di hadapan/belakang (`trim()`) dan ditukar kepada huruf besar (`toUpperCase()`). Contoh: `lgm1024` dan `LGM1024` dianggap sama.
- **BR-02 (Sekatan Pendaftaran Berulang Serentak):** Transaksi pangkalan data menyemak `hasAttended == false` sebelum membenarkan pendaftaran direkodkan bagi mengelakkan perlumbaan data (*race condition*).
- **BR-03 (Kegagalan Akses Kamera):** Jika pelayar menyekat kamera (seperti pelayar dalam aplikasi WhatsApp), paparkan mesej nasihat untuk membuka pautan dalam Google Chrome atau Apple Safari.
- **BR-04 (Gangguan Rangkaian Semasa Hantar Selfie):** Jika sambungan internet terputus semasa penghantaran imej, paparkan butang *"Cuba Hantar Semula"* tanpa memaksa pengguna mengambil semula foto dari awal.
- **BR-05 (Muat Naik Senarai Induk Berulang):** Sekiranya fail CSV baharu dimuat naik ketika pendaftaran sedang aktif, sistem menyediakan pilihan sama ada menambah ahli baharu (*Merge*) atau menggantikan keseluruhan senarai (*Replace*).
- **BR-06 (Privasi Mutlak Lokasi Ahli):** Paparan koordinat GPS dan peta radar ahli adalah **eksklusif kepada Urus Setia**. Antaramuka awam ahli tidak memaparkan sebarang maklumat geolokasi ahli lain bagi melindungi privasi individu.
- **BR-07 (Kemas Kini Lokasi Secara Langsung / Live Sync):** Papan pemuka urus setia mengemas kini kedudukan dan jarak ahli secara *live* menggunakan denyutan sinkronisasi masa nyata (*live sync pulse*) tanpa memerlukan muat semula halaman pelayar.

---

## 6. Kriteria Penerimaan (*Acceptance Criteria*)

| ID Ujian | Rujukan FR | Kriteria Penerimaan |
| :--- | :--- | :--- |
| **AC-01** | FR-001 | Menutup suis pendaftaran menyembunyikan input No. Gaji dan memaparkan notis rasmi penutupan dalam tempoh ≤ 3 saat. |
| **AC-02** | FR-002 | No. Gaji yang sah memaparkan profil tepat; No. Gaji tidak sah ditolak dengan amaran ralat. |
| **AC-03** | FR-003 | Percubaan mendaftar kali kedua menyekat kamera dan memaparkan pas kehadiran asal beserta cap masa awal. |
| **AC-04** | FR-004 | Kamera hadapan dibuka secara langsung; tiada butang muat naik album galeri tersedia. |
| **AC-05** | FR-005 | Pas digital memaparkan data lengkap dan butang reset mengembalikan skrin carian tanpa memuat semula pelayar. |
| **AC-06** | FR-006, FR-007 | Akses admin disekat tanpa PIN sah; fail CSV 3 kolum berjaya dibaca dan mengemas kini jumlah ahli layak. |
| **AC-07** | FR-008, FR-009 | Statistik kuorum dikemas kini serta-merta apabila ahli hadir; eksport CSV menghasilkan fail lengkap sokongan UTF-8 BOM. |
