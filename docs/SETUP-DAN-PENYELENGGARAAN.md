# Panduan Setup & Penyelenggaraan Sistem

Dokumen ini menyediakan panduan teknikal untuk memasang, menjalankan, menguji, dan menyambungkan repositori projek **e-Hadir** ke akaun GitHub anda.

---

## 1. Keperluan Sistem Minimum

Sebelum memulakan, pastikan komputer anda telah dipasang dengan:
- **Node.js:** Versi `v20.x` atau lebih terkini (disyorkan LTS).
- **Pengurus Pakej (*Package Manager*):** `npm` (versi 10+) atau `pnpm` / `yarn`.
- **Git:** Versi `2.34` atau ke atas.
- **Pelayar Web Moden:** Google Chrome, Microsoft Edge, atau Apple Safari dengan sokongan protokol selamat HTTPS (kamera web memerlukan sambungan selamat untuk berfungsi).

---

## 2. Arahan Pemasangan & Menjalankan Projek

### Langkah 1: Klon atau Buka Folder Projek
Buka terminal dan masuk ke folder projek:
```bash
cd e-hadir
```

### Langkah 2: Memasang Pakej Dependensi
Jalankan arahan berikut untuk memuat turun semua modul yang diperlukan:
```bash
npm install
```

### Langkah 3: Menjalankan Pelayan Pembangun (*Dev Server*)
Untuk memulakan aplikasi dalam mod pembangun tempatan (*local development*):
```bash
npm run dev
```
Pelayan akan beroperasi pada port lalai:
`http://localhost:3000`

### Langkah 4: Membina Aplikasi untuk Pengeluaran (*Production Build*)
Untuk menguji proses kompilasi dan membina fail pengeluaran yang dioptimumkan:
```bash
npm run build
```
Fail output yang telah dikompilasi akan disimpan di dalam folder `dist/`.

---

## 3. Konfigurasi Pembolehubah Persekitaran (*Environment Variables*)

Fail contoh `.env.example` telah disediakan pada punca direktori projek:

```bash
# GEMINI_API_KEY: Disediakan secara automatik oleh persekitaran AI Studio jika diperlukan
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: URL hos aplikasi untuk rujukan dalaman dan pautan luar
APP_URL="MY_APP_URL"

# Konfigurasi Pilihan untuk Integrasi Firebase (Fasa 3 MVP e-Hadir)
# VITE_FIREBASE_API_KEY="AIzaSy..."
# VITE_FIREBASE_AUTH_DOMAIN="projek-anda.firebaseapp.com"
# VITE_FIREBASE_PROJECT_ID="projek-anda"
# VITE_FIREBASE_STORAGE_BUCKET="projek-anda.appspot.com"
# VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
# VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"

# Kod PIN Pentadbir Urus Setia (Lalai: 123456)
# VITE_ADMIN_PIN="123456"
```

Untuk kegunaan tempatan, salin fail ini kepada fail `.env`:
```bash
cp .env.example .env
```

---

## 4. Langkah Menyambungkan Projek ke GitHub

Persekitaran pembangun ini tidak menyimpan akses token peribadi GitHub anda. Untuk menyimpan projek ini ke dalam akaun GitHub anda secara selamat, ikuti langkah berikut:

### Cadangan Maklumat Repositori
- **Nama Repositori (Repository Name):** `e-hadir`
- **Penerangan (Description):** `Sistem Pengesahan Kehadiran Mesyuarat dan Aktiviti berasaskan Kod QR, No. Gaji dan Swafoto Langsung`
- **Tahap Keterlihatan (Visibility):** **Private** *(Disyorkan sebagai default untuk melindungi rekod senarai ahli dan dokumen dalaman organisasi)*

### Langkah-langkah di GitHub:
1. Log masuk ke akaun [GitHub](https://github.com).
2. Tekan ikon **"+"** di sudut kanan atas dan pilih **New repository**.
3. Masukkan nama `e-hadir`.
4. Pilih pilihan **Private**.
5. **JANGAN** tanda pilihan *Add a README file*, *.gitignore*, atau *license* (kerana semua fail ini telah siap disediakan di dalam projek ini).
6. Tekan butang hijau **Create repository**.

### Langkah Menolak Kod (*Push*) dari Komputer Anda:
Buka terminal pada direktori projek ini dan jalankan arahan berikut:

```bash
# 1. Mulakan git tempatan sekiranya belum ada
git init

# 2. Tambah semua fail projek
git add .

# 3. Lakukan commit pertama
git commit -m "feat: inisialisasi repositori projek e-Hadir beserta dokumentasi lengkap"

# 4. Namakan cawangan utama sebagai main
git branch -M main

# 5. Hubungkan ke repositori GitHub anda (gantikan USERNAME dengan nama akaun GitHub anda)
git remote add origin https://github.com/USERNAME/e-hadir.git

# 6. Tolak kod dan dokumentasi ke GitHub
git push -u origin main
```

---

## 5. Struktur Fail Projek

```text
/
├── .env.example                # Templat pembolehubah persekitaran selamat
├── .gitignore                  # Senarai fail dikecualikan daripada Git
├── index.html                  # Fail templat HTML utama aplikasi
├── metadata.json               # Konfigurasi nama dan kebenaran pelantar AI Studio
├── package.json                # Senarai pakej dan skrip pengaturcaraan
├── tsconfig.json               # Konfigurasi pengkompil TypeScript
├── vite.config.ts              # Konfigurasi pelayan dan pembina Vite
├── README.md                   # Pintu masuk utama repositori untuk orang awam
├── CHANGELOG.md                # Rekod sejarah perubahan projek
├── docs/                       # Folder dokumentasi terperinci
│   ├── PANDUAN-PENGGUNA.md     # Panduan langkah demi langkah pengguna & urus setia
│   ├── KEPERLUAN-PRODUK.md     # Spesifikasi keperluan produk (PRD v1.0)
│   ├── STATUS-DAN-ROADMAP.md   # Status sebenar semasa dan fasa masa depan
│   ├── DATA-DAN-PRIVASI.md     # Dasar privasi data ahli dan kawalan akses
│   └── SETUP-DAN-PENYELENGGARAAN.md # Dokumen panduan ini
├── public/                     # Aset statik awam
│   └── assets/aistudio/        # Salinan fail rasmi PDF PRD v1.0
└── src/                        # Kod sumber aplikasi
    ├── App.tsx                 # Komponen utama aplikasi
    ├── index.css               # Gaya reka bentuk global Tailwind CSS v4
    └── main.tsx                # Titik mula pendaftaran aplikasi React
```

---

## 6. Penyelesaian Masalah Teknikal Lazim

- **Ralat Kamera tidak aktif di pelayar web:**  
  Kebenaran `getUserMedia` disekat secara lalai oleh pelayar moden jika dijalankan tanpa protokol HTTPS (kecuali pada alamat `http://localhost`). Pastikan pelayan produksi dipasang sijil SSL/TLS (HTTPS).
- **Ralat Kompilasi TypeScript:**  
  Jalankan `npm run lint` untuk mengesahkan tiada percanggahan jenis data sebelum melakukan *commit* ke Git.
