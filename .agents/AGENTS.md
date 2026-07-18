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

# Code Review Standards
AI wajib bertindak sebagai **ruthless code reviewer** yang tidak pernah melewatkan apapun:
1. **Detail Review**: Review setiap baris kode dengan perhatian ekstrem terhadap detail.
2. **Security Audit**: Identifikasi kerentanan keamanan (XSS, SQL injection, CSRF, dsb).
3. **Performance Check**: Tunjukkan bottleneck performa.
4. **Architecture Review**: Sarankan perbaikan arsitektur.
5. **Best Practices**: Tegakkan best practices dan standar coding.
6. **Constructive**: Selalu jelaskan MENGAPA sesuatu salah dan BAGAIMANA memperbaikinya.

# Feature Implementation Workflow
Setiap implementasi fitur lengkap wajib mengikuti alur 4 fase:

### Phase 1: Planning
1. Pahami requirements dan edge cases.
2. Desain database schema (jika perlu).
3. Rencanakan API endpoints.
4. Sketch hierarki komponen.

### Phase 2: Backend
1. Buat database migrations.
2. Bangun API endpoints dengan validasi.
3. Tulis unit test untuk business logic.
4. Tambahkan dokumentasi API.

### Phase 3: Frontend
1. Buat React components.
2. Implementasikan state management.
3. Koneksikan ke API endpoints.
4. Tambahkan loading dan error states.
5. Pastikan mobile responsiveness.

### Phase 4: Polish
1. Tambahkan integration tests.
2. Optimasi performa.
3. Tambahkan fitur aksesibilitas.
4. Update dokumentasi.

Selalu kerjakan secara inkremental dan test setiap fase sebelum lanjut ke fase berikutnya.

# Debugging SOP (Systematic Flow)
Setiap debugging wajib mengikuti alur 6 langkah:

### Step 1: Reproduce
1. Buat kasus reproduksi minimal.
2. Dokumentasikan langkah-langkah persis untuk memicu bug.
3. Catat detail environment (OS, browser, versi).

### Step 2: Isolate
1. Binary search: nonaktifkan separuh kode/fitur.
2. Gunakan `git bisect` untuk menemukan kapan bug diperkenalkan.
3. Hapus dependensi satu per satu.

### Step 3: Inspect
1. Tambahkan `console.log` atau `debugger` secara strategis.
2. Gunakan browser DevTools / debugger.
3. Periksa network requests dan responses.
4. Review perubahan terbaru di git history.

### Step 4: Hypothesize
1. Bentuk teori tentang penyebab bug.
2. Daftar asumsi dan uji masing-masing.
3. Pertimbangkan race conditions dan timing issues.

### Step 5: Verify & Fix
1. Test fix secara menyeluruh.
2. Tambahkan regression tests.
3. Dokumentasikan root cause.

### Step 6: Prevent
1. Tambahkan error handling yang lebih baik.
2. Perbaiki logging.
3. Tambahkan tests untuk edge cases.

# API Documentation Standards
Setiap endpoint API wajib didokumentasikan dengan:
1. **Deskripsi Endpoint**: Tujuan dan use cases yang jelas.
2. **Parameter**: Type, required/optional, validation rules.
3. **Contoh Request & Response**: Termasuk error cases.
4. **Auth & Authorization**: Kebutuhan autentikasi (PIN, token, dsb).
5. **Rate Limiting**: Informasi quota jika ada.
6. **Error Handling Guide**: Daftar error codes dan cara menanganinya.

Dokumentasi yang baik mencegah support tickets. Sertakan:
- Quickstart guide untuk endpoint baru.
- Common use cases.
- Migration guides untuk breaking changes.
