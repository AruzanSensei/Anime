# 🚀 Deployment Guide

Panduan lengkap untuk deploy Anime Downloader Web ke Railway (backend) dan GitHub Pages (frontend).

## 📋 Prerequisites

- Akun GitHub
- Akun Railway (gratis, sign up dengan GitHub)
- Git terinstall di komputer

## 🔧 Part 1: Deploy Backend ke Railway

### Step 1: Persiapan Repository

1. Buat repository baru di GitHub atau gunakan yang sudah ada
2. Push code ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/anime-downloader-web.git
   git push -u origin main
   ```

### Step 2: Deploy ke Railway

1. Buka [Railway.app](https://railway.app)
2. Klik **"Login"** dan login dengan GitHub
3. Klik **"New Project"**
4. Pilih **"Deploy from GitHub repo"**
5. Pilih repository `anime-downloader-web`
6. Railway akan otomatis detect Node.js project

### Step 3: Konfigurasi Backend

1. Setelah deploy, klik project yang baru dibuat
2. Klik tab **"Variables"**
3. Tambahkan environment variables:
   - Key: `PORT`, Value: `3000`
   - Key: `CORS_ORIGIN`, Value: `*` (sementara, akan diupdate nanti)
4. Klik **"Settings"** → **"Generate Domain"**
5. Copy URL yang diberikan (contoh: `https://anime-downloader-production.up.railway.app`)

### Step 4: Test Backend

Buka di browser:
```
https://your-railway-url.up.railway.app/health
```

Seharusnya muncul response:
```json
{"status":"ok","timestamp":"2026-01-02T..."}
```

## 🌐 Part 2: Deploy Frontend ke GitHub Pages

### Step 1: Update Config

1. Edit file `frontend/config.js`
2. Update API URL dengan Railway URL:
   ```javascript
   const CONFIG = {
       API_URL: 'https://your-railway-url.up.railway.app'
   };
   ```
3. Commit perubahan:
   ```bash
   git add frontend/config.js
   git commit -m "Update API URL for production"
   git push
   ```

### Step 2: Enable GitHub Pages

1. Buka repository di GitHub
2. Klik **Settings** → **Pages**
3. Di **Source**, pilih:
   - Branch: `main`
   - Folder: `/frontend` (atau `/ (root)` jika frontend di root)
4. Klik **Save**
5. Tunggu beberapa menit, GitHub akan memberikan URL seperti:
   ```
   https://username.github.io/anime-downloader-web
   ```

### Step 3: Update CORS di Railway

1. Kembali ke Railway dashboard
2. Klik project backend
3. Klik tab **"Variables"**
4. Edit `CORS_ORIGIN`:
   - Value: `https://username.github.io`
5. Backend akan otomatis restart

## ✅ Verifikasi Deployment

### Test 1: Buka Frontend
Buka URL GitHub Pages di browser (desktop atau mobile)

### Test 2: Test Search
1. Ketik nama anime (contoh: "Naruto")
2. Klik "Cari"
3. Hasil pencarian harus muncul

### Test 3: Test Download
1. Klik salah satu anime dari hasil
2. Pilih resolusi
3. Klik "Unduh Semua" atau masukkan episode spesifik
4. Link download harus muncul

## 🔍 Troubleshooting

### Error: CORS Policy

**Problem:** Browser menampilkan error CORS

**Solution:**
1. Pastikan `CORS_ORIGIN` di Railway sudah benar
2. Harus sama persis dengan URL GitHub Pages (tanpa trailing slash)
3. Restart backend di Railway

### Error: Failed to Fetch

**Problem:** Frontend tidak bisa connect ke backend

**Solution:**
1. Cek `config.js` - pastikan API_URL benar
2. Cek Railway backend masih running (buka `/health` endpoint)
3. Cek browser console untuk error detail

### Error: 404 Not Found di GitHub Pages

**Problem:** GitHub Pages menampilkan 404

**Solution:**
1. Pastikan folder yang dipilih di Settings → Pages sudah benar
2. Tunggu 5-10 menit setelah enable GitHub Pages
3. Cek file `index.html` ada di folder yang benar

### Download Tidak Jalan di Mobile

**Problem:** Tombol download tidak berfungsi di HP

**Solution:**
1. Pastikan browser mengizinkan pop-up dan download
2. Coba browser lain (Chrome, Firefox)
3. Cek koneksi internet stabil

## 🔄 Update Aplikasi

### Update Backend

1. Edit code di folder `backend`
2. Commit dan push ke GitHub:
   ```bash
   git add .
   git commit -m "Update backend"
   git push
   ```
3. Railway akan otomatis deploy ulang

### Update Frontend

1. Edit code di folder `frontend`
2. Commit dan push ke GitHub:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push
   ```
3. GitHub Pages akan otomatis update (tunggu 1-2 menit)

## 💰 Biaya

- **Railway**: Free tier (500 jam/bulan, cukup untuk personal use)
- **GitHub Pages**: Gratis selamanya
- **Total**: Rp 0 / bulan! 🎉

## 📊 Monitoring

### Railway Dashboard
- Lihat logs: Railway → Project → Deployments → View Logs
- Monitor usage: Railway → Project → Metrics

### GitHub Pages
- Status: Repository → Settings → Pages
- Traffic: Repository → Insights → Traffic

## 🎯 Next Steps

Setelah deployment berhasil:

1. ✅ Bookmark URL GitHub Pages
2. ✅ Test di berbagai device (HP, tablet, PC)
3. ✅ Share dengan teman (opsional)
4. ✅ Monitor Railway usage agar tidak over limit

## 🆘 Butuh Bantuan?

Jika ada masalah:
1. Cek logs di Railway
2. Cek browser console (F12)
3. Baca error message dengan teliti
4. Google error message jika perlu

---

Selamat! Aplikasi kamu sudah live dan bisa diakses dari mana saja! 🚀
