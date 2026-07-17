# Kitab Sakti Kalibrasi Mecha Arctron Warrior (LV1 Set Master)

Kitab sakti ini menyimpan koordinat kalibrasi presisi master untuk mecha **Arctron Warrior** sebagai basis/cetak biru fitting bagi varian level lain (LV32, LV42, LV55) serta sebagai referensi awal bagi job Arctron lain seperti **Ranger** dan **Technician**.

---

## 1. Master Coordinate Presets (GEAR_POINTS)

Gunakan preset master di bawah ini untuk dimasukkan langsung ke `GearOverlay.jsx` atau di-import ke Dressing Room Sandbox:

```javascript
// GEAR_POINTS presets for GearOverlay.jsx:
const GEAR_POINTS = {
  armor:  [{ x: 0.002, y: 0.050, ax: 0.5, ay: 0.15, size: 0.457, rot: 0, z: 1 }],
  pants:  [{ x: 0.003, y: 0.341, ax: 0.5, ay: 0.22, size: 0.414, rot: 0, z: 2 }],
  boots: [
    { x: 0.128, y: 0.649, ax: 0.5, ay: 0.15, size: 0.394, rot: 0, z: 3, scaleX: 1.070, scaleY: 1.105, label: 'boot_l', splitSuffix: '_l' },
    { x: -0.132, y: 0.648, ax: 0.5, ay: 0.15, size: 0.424, rot: 0, z: 3, scaleX: 0.940, scaleY: 1.020, label: 'boot_r', splitSuffix: '_r' }
  ],
  gloves: [
    { x: 0.209, y: 0.354, ax: 0.52, ay: 0.22, size: 0.248, rot: 0, z: 6, scaleY: 1.065, label: 'glove_l', splitSuffix: '_l' },
    { x: -0.181, y: 0.329, ax: 0.5, ay: 0.23, size: 0.258, rot: -1, z: 5, scaleX: 1.035, scaleY: 1.200, label: 'glove_r', splitSuffix: '_r' }
  ],
  shield: [{ x: 0.100, y: 0.728, ax: 0.5, ay: 0.5, size: 0.450, rot: 0, z: 7 }],
  weapon: [{ x: -0.174, y: 0.506, ax: 0.5, ay: 0.75, size: 0.401, rot: -1, z: 4 }],
  helmet: [{ x: 0.001, y: 0.066, ax: 0.5, ay: 0.5, size: 0.123, rot: 0, z: 5, scaleX: 0.970, scaleY: 1.045 }]
};
```

---

## 2. SOP Pemotongan Asset (Asset Cropping Rules)

Agar koordinat di atas tetap pas ("was wus") saat berganti level variant (LV32, LV42, LV55), pemotongan asset gambar (PNG) harus mematuhi aturan berikut:

1. **Tight Crop (Tanpa Spasi Transparan Sisa)**:
   - Setiap gambar gear harus dipotong mepet pada batas terluar piksel gambarnya. Mboten pareng enten sisa ruang transparan kosong ing ndhuwur, ngisor, kiwa, utawa tengen gambar.

2. **Konsistensi Skala Bawaan**:
   - Proporsi visual gear antar level kudu konsisten.

3. **Konvensi Split Boots/Gloves (Front-View)**:
   - Separuh KIWA gambar gabungan = sisih TENGEN mecha → simpan sebagai `_r.png`
   - Separuh TENGEN gambar gabungan = sisih KIWA mecha → simpan sebagai `_l.png`

---

## 3. Aturan Sendi Senjata Dinamis (Weapon Grip Standards)

- **Sword / Axe**: Cekelan ing gagang ngisor: `ay: 0.75`, sudut miring: `rot: -1` s/d `rot: 10`
- **Gun / Bow**: Cekelan ing tengah: `ax: 0.5, ay: 0.5`, sudut lurus: `rot: 0`

---

## 4. Cara Adaptasi Ranger & Technician

1. Copy preset Warrior ing ndhuwur dadi basis awal.
2. Import preset menyang Dressing Room (klik Import → pilih preset → Apply).
3. Ganti tab menyang Ranger/Technician.
4. Fine-tune bagean sing miring/asimetris.
5. Klik **💾 Save to Kitab** kanggo nyimpen dadi file kalibrasi anyar.
