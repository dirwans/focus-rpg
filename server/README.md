# Focus RPG Server

Backend server untuk Focus RPG yang menangani API endpoint, termasuk sistem kalibrasi equipment.

## Fitur Utama

- **API Endpoint untuk Kalibrasi Equipment**: Mengirim kalibrasi dari dressing room ke game server
- **Backup Otomatis**: Membuat backup sebelum menerapkan perubahan
- **Version Control**: Melakukan commit dan push perubahan ke repository game

## Instalasi

1. Install dependencies:
   ```bash
   npm install
   ```

2. Konfigurasi environment variables (buat file `.env` jika diperlukan):
   ```bash
   PORT=3000
   REPO_PATH=/var/www/focus-rpg
   BACKUP_PATH=/var/backups/focus-rpg
   ```

3. Jalankan server:
   ```bash
   npm start
   ```

   Untuk mode development:
   ```bash
   npm run dev
   ```

## API Endpoints

### POST /api/apply-calibration

Mengirim data kalibrasi dari dressing room ke game server.

**Request Body:**
```json
{
  "job": "warrior",
  "tier": 1,
  "timestamp": "2023-07-20T12:34:56.789Z",
  "coordinates": "// GEAR_POINTS presets..."
}
```

**Response:**
```json
{
  "success": true,
  "commitHash": "a1b2c3d",
  "deployStatus": "pending",
  "backupFile": "/var/backups/focus-rpg/calibration-backup-2023-07-20T12-34-56.tar.gz",
  "timestamp": "2023-07-20T12:34:56.789Z",
  "message": "Calibration for warrior tier 1 applied successfully"
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-07-20T12:34:56.789Z"
}
```

## Konfigurasi Server

Pastikan server sudah dikonfigurasi dengan benar:

1. **Repository Path**: Pastikan path ke repository game sudah benar di `REPO_PATH`
2. **Backup Path**: Pastikan direktori backup sudah ada dan memiliki izin write
3. **Git Access**: Pastikan server memiliki akses ke repository game untuk melakukan commit dan push
4. **Dependencies**: Pastikan semua dependencies sudah terinstall

## Cara Kerja Sistem Kalibrasi

1. User melakukan kalibrasi di dressing room lokal
2. User klik tombol "Apply to Game"
3. Data kalibrasi dikirim ke server backend
4. Server membuat backup dari repository game
5. Server menulis data kalibrasi ke file ArctronGearOverlay.jsx
6. Server melakukan commit dan push perubahan ke repository
7. Server mengirim respon ke user dengan informasi commit hash dan status deploy

## Troubleshooting

- Jika gagal membuat backup, periksa izi direktori backup
- Jika gagal commit/push, periksa konfigurasi git dan akses ke repository
- Jika gagal menulis file, periksa izi direktori repository
