# Quick Start Guide

Panduan cepat untuk menjalankan aplikasi secara lokal.

## Prerequisites

- Node.js 18+ installed
- Git installed

## Local Development

### 1. Clone/Navigate to Project

```bash
cd c:\Users\zanxa\Coding\anime-downloader-web
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=3000
CORS_ORIGIN=*
```

Start backend:
```bash
npm start
```

Backend akan running di `http://localhost:3000`

### 3. Setup Frontend

Buka file `frontend/config.js` dan pastikan:
```javascript
const CONFIG = {
    API_URL: 'http://localhost:3000'
};
```

Buka `frontend/index.html` di browser (double-click atau via Live Server).

## Testing

1. **Test Backend Health**
   ```
   http://localhost:3000/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test Search**
   - Buka frontend di browser
   - Ketik "naruto" di search box
   - Klik "Cari"
   - Hasil harus muncul

3. **Test Download**
   - Click salah satu anime
   - Pilih resolusi
   - Click "Unduh Semua"
   - Download links harus muncul

## Troubleshooting

### PowerShell Execution Policy Error

Jika `npm install` gagal dengan error execution policy:

**Option 1: Bypass untuk session ini**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
```

**Option 2: Use CMD instead**
```cmd
cd backend
npm install
```

**Option 3: Use Git Bash**
```bash
cd backend
npm install
```

### Port Already in Use

Jika port 3000 sudah digunakan:
1. Edit `.env`: `PORT=3001`
2. Edit `frontend/config.js`: `API_URL: 'http://localhost:3001'`
3. Restart backend

## Next Steps

Setelah testing lokal berhasil:
1. ✅ Push code ke GitHub
2. ✅ Deploy backend ke Railway
3. ✅ Deploy frontend ke GitHub Pages
4. ✅ Update config dengan production URLs

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk panduan lengkap deployment.
