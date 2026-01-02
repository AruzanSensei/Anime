# GitHub Pages Deployment Fix

## Masalah
GitHub Pages mencari `index.html` di root folder, tapi file kita ada di `frontend/`.

## Solusi: Pindahkan Frontend ke Root

### Langkah 1: Pindahkan File Frontend

Jalankan command ini di root folder `anime-downloader-web`:

```powershell
# Pindahkan file frontend ke root
Copy-Item -Path "frontend\index.html" -Destination "." -Force
Copy-Item -Path "frontend\styles.css" -Destination "." -Force
Copy-Item -Path "frontend\app.js" -Destination "." -Force
Copy-Item -Path "frontend\config.js" -Destination "." -Force
```

Atau manual:
1. Copy `frontend/index.html` → paste ke root folder
2. Copy `frontend/styles.css` → paste ke root folder
3. Copy `frontend/app.js` → paste ke root folder
4. Copy `frontend/config.js` → paste ke root folder

### Langkah 2: Update .gitignore

Pastikan `.gitignore` di root TIDAK mengabaikan file-file ini:

```
# .gitignore di root
node_modules/
.env
*.log
.DS_Store

# Jangan ignore file frontend di root
# index.html
# styles.css
# app.js
# config.js
```

### Langkah 3: Commit & Push

```bash
git add index.html styles.css app.js config.js
git commit -m "Move frontend files to root for GitHub Pages"
git push origin main
```

### Langkah 4: Configure GitHub Pages

1. Buka repository di GitHub
2. Settings → Pages
3. Source: **Deploy from a branch**
4. Branch: **main** / **(root)**
5. Save

Tunggu 1-2 menit, lalu buka URL GitHub Pages kamu.

---

## Alternatif: Gunakan Folder `docs/`

Jika tidak mau file di root, bisa pakai folder `docs/`:

1. Rename folder `frontend/` menjadi `docs/`
2. Di GitHub Settings → Pages
3. Branch: **main** / **docs**
4. Save

---

## Struktur Akhir (Solusi 1 - Root)

```
anime-downloader-web/
├── index.html          ← Dari frontend/
├── styles.css          ← Dari frontend/
├── app.js              ← Dari frontend/
├── config.js           ← Dari frontend/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── ...
├── frontend/           ← Folder asli (bisa dihapus atau dibiarkan)
│   └── ...
├── README.md
├── DEPLOYMENT.md
└── .gitignore
```

## Struktur Akhir (Alternatif - docs/)

```
anime-downloader-web/
├── docs/               ← Rename dari frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── config.js
├── backend/
│   └── ...
├── README.md
└── .gitignore
```

---

## Verifikasi

Setelah deploy, buka:
```
https://yourusername.github.io/anime-downloader-web/
```

Seharusnya tampil aplikasi frontend, bukan README.
