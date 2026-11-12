# Pengendalian Data & Dasar Privasi

Dokumen ini menerangkan jenis data yang dikumpulkan oleh aplikasi **e-Hadir**, lokasi penyimpanan data, kawalan keselamatan, serta had perlindungan privasi.

---

## 1. Data yang Dikumpulkan

Aplikasi e-Hadir hanya mengumpul data yang diperlukan secara minimum bagi mengesahkan kehadiran ahli:

| Jenis Data | Kategori | Tujuan Pengumpulan |
| :--- | :--- | :--- |
| **Nombor Gaji (No. Gaji / Staff ID)** | Data Pengenalan Pekerja | Digunakan sebagai pengecam unik untuk memadankan kelayakan ahli terhadap senarai induk. |
| **Nama Penuh** | Data Profil Ahli | Dipaparkan pada skrin bagi tujuan semakan identiti oleh ahli dan pengesahan pas digital. |
| **Bahagian / Cawangan** | Maklumat Jabatan | Membolehkan analisis taburan kehadiran ahli mengikut unit organisasi atau bahagian. |
| **Swafoto Langsung (*Live Selfie*)** | Bukti Visual Kehadiran | Diambil melalui kamera langsung peranti sebagai bukti fizikal bahawa ahli hadir sendiri di dewan mesyuarat. |
| **Cap Masa Pendaftaran (*Timestamp*)** | Rekod Transaksi | Merekodkan tarikh dan waktu tepat (berketepatan saat) apabila pendaftaran disahkan. |

---

## 2. Di Mana Data Disimpan?

Berdasarkan pelan senibina perisian:
- **Pangkalan Data Utama:** Data teks (maklumat ahli, status kehadiran, cap masa) dirancang disimpan di **Firebase Firestore** berpusat.
- **Fail Gambar Swafoto:** Imej disimpan di dalam storan awan selamat **Firebase Cloud Storage** dengan laluan folder terhad, contohnya: `selfies/{staffId}_{timestamp}.jpg`.
- **Mod Tempatan Sementara:** Sekiranya aplikasi dijalankan tanpa sambungan Firebase aktif, rekod disimpan buat sementara waktu di dalam memori pelayar pengguna (*Local Storage* atau memori sesi).

---

## 3. Adakah Data Dihantar kepada AI atau Perkhidmatan Luar?

- **Tiada Pengecaman Wajah Berasaskan AI:**  
  Sistem **TIDAK** menghantar gambar swafoto kepada mana-mana model AI, pembekal biometrik pihak ketiga, atau alat pengecaman wajah automatik (*facial recognition*). 
- Gambar swafoto berfungsi semata-mata sebagai bukti visual pasif yang disimpan untuk tujuan semakan audit oleh jawatankuasa urus setia.
- **Pengendalian Lokasi GPS (Eksklusif Urus Setia & Kemas Kini Live):**  
  Koordinat geolokasi peranti dirakam secara automatik semasa pengesahan kehadiran semata-mata untuk mengesahkan bahawa ahli berada di dewan mesyuarat fizikal. **Data lokasi dan peta radar adalah SULIT dan HANYA BOLEH DILIHAT OLEH URUS SETIA**. Ahli biasa tidak dibenarkan melihat peta taburan, jarak, atau koordinat mana-mana peserta lain.

---

## 4. Kawalan Hak Akses (Siapa Boleh Melihat Data?)

1. **Ahli / Peserta Awam:**  
   - Hanya boleh mencari rekod sendiri menggunakan padanan No. Gaji tepat.
   - Sistem **TIDAK** membenarkan ahli biasa membaca senarai penuh ahli atau melihat lokasi ahli lain pada sebarang antaramuka awam.
2. **Pentadbir Urus Setia (Akses Eksklusif Peta & Lokasi Live):**  
   - Mempunyai akses penuh kepada senarai kehadiran, statistik kuorum, laporan akhir, serta **Peta Radar Lokasi Langsung (*Live Location Map*)** selepas memasukkan **Kod PIN Pentadbir 6-digit** yang sah.
   - Peta radar Urus Setia dikemas kini secara langsung (*live sync*) setiap beberapa saat untuk pemantauan dewan secara aktif.
3. **Perlindungan Foto Swafoto & Koordinat:**  
   - Foto swafoto dan koordinat geolokasi dilindungi dan hanya boleh diakses melalui sesi pentadbir bagi tujuan audit keabsahan mesyuarat.

---

## 5. Prosedur Pemadaman Data (*Data Retention & Deletion*)

- **Penyimpanan Bermusim:** Data kehadiran sesuatu sesi mesyuarat hanya diperlukan sepanjang tempoh mesyuarat berlangsung dan sehingga laporan rasmi dimuktamadkan.
- **Fungsi Reset Sesi:**  
  Urus setia dibekalkan fungsi *"Reset Sesi / Padam Semua Data"* pada papan pemuka admin. Tindakan ini dilindungi oleh dialog pengesahan dua langkah (*two-step confirmation*) untuk memadam rekod kehadiran dan imej lama sebelum mesyuarat sesi baharu dimulakan.

---

## 6. Kenyataan Batasan & Pematuhan

- Aplikasi ini direka berpandukan prinsip perlindungan data korporat yang berhemat (mengumpul data minima, mengehadkan akses pihak ketiga, dan perlindungan kata kunci PIN).
- **Perhatian:** Sistem ini belum melalui pensijilan rasmi undang-undang atau audit kepatuhan luaran bebas (seperti pensijilan rasmi Akta Perlindungan Data Peribadi / PDPA). Setiap organisasi yang menggunakan perisian ini dinasihatkan untuk menyelaraskan penggunaan foto dan data pekerja mengikut dasar privasi dalaman organisasi masing-masing sebelum memulakan acara berskala besar.
