# 🎬 Anime Downloader Web

Aplikasi web modern untuk download anime dengan mudah dan cepat. Mendukung berbagai resolusi dan format, dengan UI yang indah dan mobile-friendly.

## ✨ Fitur

- 🔍 **Pencarian Anime** - Cari anime favorit dari otakudesu.best
- 📺 **Pilih Episode** - Pilih episode spesifik atau download semua sekaligus
- 🎯 **Pilihan Resolusi** - MP4 (360p, 480p, 720p) dan MKV (480p, 720p, 1080p)
- 📱 **Mobile-Friendly** - Bekerja sempurna di HP dan tablet
- ⚡ **Download Berurutan** - Download satu per satu untuk stabilitas
- 🎨 **UI Modern** - Dark mode dengan gradient purple-blue yang indah
- 🔄 **Multi-Provider** - Pixeldrain dengan fallback ke provider lain

## 🏗️ Arsitektur

Aplikasi ini terdiri dari dua bagian:

### Frontend (GitHub Pages)
- HTML, CSS, JavaScript murni
- Tidak perlu build process
- Deploy ke GitHub Pages gratis

### Backend (Railway)
- Node.js + Express
- Web scraping dengan Cheerio
- API endpoints untuk search, episodes, dan download links

## 🚀 Quick Start

### 1. Setup Backend (Railway)

```bash
cd backend
npm install
```

Buat file `.env`:
```env
PORT=3000
CORS_ORIGIN=https://yourusername.github.io
```

Jalankan lokal:
```bash
npm start
```

### 2. Setup Frontend

Edit `frontend/config.js` dan update API URL:
```javascript
const CONFIG = {
    API_URL: 'http://localhost:3000'  // Untuk testing lokal
    // Atau gunakan Railway URL setelah deploy
};
```

Buka `frontend/index.html` di browser.

## 📦 Deployment

### Deploy Backend ke Railway

1. Push code ke GitHub
2. Buka [Railway.app](https://railway.app)
3. Klik "New Project" → "Deploy from GitHub"
4. Pilih repository ini
5. Pilih folder `backend`
6. Tambahkan environment variable:
   - `CORS_ORIGIN`: URL GitHub Pages kamu (contoh: `https://username.github.io`)
7. Deploy! Railway akan memberikan URL seperti `https://your-app.up.railway.app`

### Deploy Frontend ke GitHub Pages

1. Push folder `frontend` ke repository GitHub
2. Buka Settings → Pages
3. Pilih branch dan folder `frontend`
4. Save
5. Update `frontend/config.js` dengan Railway URL:
   ```javascript
   const CONFIG = {
       API_URL: 'https://your-app.up.railway.app'
   };
   ```
6. Commit dan push perubahan

## 📖 Cara Penggunaan

1. **Cari Anime**
   - Ketik judul anime di search bar
   - Klik "Cari" atau tekan Enter

2. **Pilih Anime**
   - Klik pada hasil pencarian
   - Episode akan dimuat otomatis

3. **Pilih Kualitas**
   - Pilih resolusi yang diinginkan (default: Highest MP4)
   - Pilihan akan disimpan untuk sesi berikutnya

4. **Download Episode**
   - **Unduh Semua**: Download semua episode yang tersedia
   - **Unduh yang Dipilih**: Masukkan nomor episode (contoh: `1-5,7,10`)

5. **Download File**
   - Aplikasi akan membuka halaman Pixeldrain di tab baru
   - Klik tombol **"Download"** di halaman Pixeldrain
   - File akan tersimpan di folder Download HP/PC kamu

> **💡 Catatan Penting**: Untuk menghindari error hotlink, aplikasi membuka halaman Pixeldrain di tab baru. Kamu perlu klik tombol Download di halaman tersebut. Lihat [CARA_DOWNLOAD.md](CARA_DOWNLOAD.md) untuk panduan lengkap.

## 🎯 Format Input Episode

- Range: `1-5` (episode 1 sampai 5)
- Spesifik: `1,3,5` (episode 1, 3, dan 5)
- Kombinasi: `1-3,5,7-10` (episode 1,2,3,5,7,8,9,10)

## 🛠️ Teknologi

**Frontend:**
- HTML5
- CSS3 (Custom Properties, Flexbox, Grid)
- Vanilla JavaScript (ES6+)

**Backend:**
- Node.js
- Express.js
- Axios (HTTP client)
- Cheerio (Web scraping)
- CORS

## 📱 Kompatibilitas Mobile

Aplikasi ini **100% kompatibel dengan HP**:
- ✅ Download langsung ke folder Download
- ✅ UI responsif untuk layar kecil
- ✅ Touch-friendly buttons
- ✅ Bekerja di semua browser mobile (Chrome, Safari, Firefox)

## ⚠️ Catatan Penting

- Download anime hanya untuk penggunaan pribadi
- Dukung industri anime dengan menonton secara legal
- Aplikasi ini hanya untuk tujuan edukasi

## 🤝 Kontribusi

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - bebas digunakan dan dimodifikasi

## 💡 Tips

- Gunakan "Highest MP4" untuk kualitas terbaik dengan ukuran file lebih kecil
- Gunakan "Highest MKV" untuk kualitas maksimal
- Download di WiFi untuk menghemat kuota
- Pastikan ada cukup ruang penyimpanan sebelum download

---

Made with ❤️ for anime lovers
"# Anime" 
