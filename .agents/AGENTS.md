# Project Deployment SOP & Rules

Setiap kali melakukan pemeliharaan kode (maintenance), pembersihan file (cleanup), atau penambahan fitur (feature), Antigravity wajib mengikuti alur kerja (workflow) berikut sebelum melakukan deploy ke VPS:

1. **Review & Observasi**: Lakukan analisis menyeluruh terhadap file, git status, data untracked, dan script yang terdampak.
2. **Lapor (Report)**: Laporkan hasil temuan dan rencana aksi (apa yang akan dihapus, diubah, atau ditambahkan) secara jelas kepada User.
3. **Persetujuan User (Yes or No Deploy)**: Tunggu instruksi atau persetujuan tertulis dari User sebelum mengeksekusi perintah deploy (`.\deploy.ps1`). Jangan melakukan deploy secara sepihak/otomatis.

# Combat Rules & Vocabulary
- **Aggressive (Musuh/Boss Aggressive)**: Menandakan musuh memiliki peluang serangan ganda (**Double Hit Chance**). Peluang ini didefinisikan dalam JSON data musuh (`doubleHitChance` dalam persentase) dan diproses dalam perhitungan pertempuran di `gameStore.js`.

# Communication Rules
- **Plan Presentation**: Jangan pernah menyuruh User untuk membaca file `.md` (seperti `implementation_plan.md`). Selalu rangkum dan tampilkan isi rencana (plan) atau pertanyaan secara langsung di dalam pesan chat/balasan.
