# Project Deployment SOP & Rules

Setiap kali melakukan pemeliharaan kode (maintenance), pembersihan file (cleanup), atau penambahan fitur (feature), Antigravity wajib mengikuti alur kerja (workflow) berikut sebelum melakukan deploy ke VPS:

1. **Review & Observasi**: Lakukan analisis menyeluruh terhadap file, git status, data untracked, dan script yang terdampak.
2. **Lapor (Report)**: Laporkan hasil temuan dan rencana aksi (apa yang akan dihapus, diubah, atau ditambahkan) secara jelas kepada User.
3. **Persetujuan User (Yes or No Deploy)**: Tunggu instruksi atau persetujuan tertulis dari User sebelum mengeksekusi perintah deploy (`.\deploy.ps1`). Jangan melakukan deploy secara sepihak/otomatis.

# Combat Rules & Vocabulary
- **Aggressive (Musuh/Boss Aggressive)**: Menandakan musuh memiliki peluang serangan ganda (**Double Hit Chance**). Peluang ini didefinisikan dalam JSON data musuh (`doubleHitChance` dalam persentase) dan diproses dalam perhitungan pertempuran di `gameStore.js`.

# Communication Rules
- **Plan Presentation**: Jangan pernah menyuruh User untuk membaca file `.md` (seperti `implementation_plan.md`). Selalu rangkum dan tampilkan isi rencana (plan) atau pertanyaan secara langsung di dalam pesan chat/balasan.

# AI Modification & Anti-Refresh Rules
- **LOCK-GEARS-CALIBRATION (Anti-Refresh)**: File `src/data/LOCK-GEARS-CALIBRATION.json` dan semua file HTML Dressing Room (`arctron-warrior.html`, `arctron-ranger.html`, dll) **DILARANG KERAS** diedit atau dimodifikasi oleh AI tanpa izin eksplisit dari User.
- **HAK AKSES**: Semua AI/IDE HANYA DIIZINKAN untuk READ (membaca) `LOCK-GEARS-CALIBRATION.json`. WRITE (menulis/mengedit) hanya diperbolehkan JIKA diberi izin, dan HANYA untuk mengubah logika script/codingan, BUKAN angka kalibrasi.
- **KEPEMILIKAN KALIBRASI**: Jika ada kesalahan kalibrasi, itu murni kesalahan User. HANYA User yang berhak melakukan UNLOCK dan membenarkan angka kalibrasi tersebut lewat browser.
- **ALASAN**: Memodifikasi file-file tersebut akan memicu Vite Hot-Reload (hard-refresh) yang dapat MENGHAPUS pekerjaan kalibrasi User yang belum di-save (unsaved work) di dalam browser. Jika ada permintaan perubahan pada sistem kalibrasi, pastikan User sudah selesai melakukan kalibrasi sebelum mengeksekusi edit.
- **DRESSING ROOM SYNC SAFETY**: Sebelum deploy yang menyentuh `LOCK-GEARS-CALIBRATION.json`, AI WAJIB mengingatkan User untuk MENUTUP semua tab Dressing Room di localhost. Dressing Room yang terbuka bisa men-trigger auto-save via Vite HMR yang akan MENIMPA data kalibrasi yang benar dengan data browser yang tidak lengkap.
