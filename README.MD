# HPP Calculator & Marketplace Cost Simulator

Aplikasi web untuk menghitung **HPP (Harga Pokok Produksi)** secara detail
dan mensimulasikan **biaya marketplace & margin** per produk.

Project ini ditujukan untuk UMKM / workshop / produsen kecil
yang ingin menentukan harga jual secara **rasional, transparan, dan mudah dipahami**.

---

## 🎯 Tujuan Project

1. Menghitung HPP produk secara akurat:
   - bahan produksi
   - bahan packing
   - overhead (biaya lain-lain)

2. Menyediakan simulasi marketplace:
   - Shopee
   - Tokopedia
   - TikTok
   - Lazada

3. Membantu user menjawab pertanyaan:
   > “Kalau produk ini dijual di marketplace A,
   > dengan biaya-biaya marketplace,
   > margin-nya masih masuk akal atau tidak?”

---

## 🧱 Tech Stack

- **Frontend**
  - Vite
  - Vanilla JavaScript (SPA)
  - Bootstrap 5

- **Backend / Database**
  - Supabase (PostgreSQL + Auth + RLS)

---

## 📦 Fitur yang Sudah Selesai

### ✅ Auth
- Register
- Login
- Session-based access (Supabase Auth)

---

### ✅ Master Bahan Baku
- CRUD bahan baku
- Definisi:
  - satuan beli
  - qty per satuan
  - harga beli
  - satuan pakai
- Harga otomatis dihitung per **1 satuan pakai**
- Search + pagination

---

### ✅ Produk / Resep
- CRUD produk
- Detail produk / resep
- Tambah bahan ke resep:
  - kategori **Produksi** atau **Packing**
  - qty pakai dengan satuan yang jelas
- Tampilkan:
  - harga per satuan pakai
  - total biaya per bahan
- Delete bahan dari resep

---

### ✅ Overhead Cost
- Overhead = biaya di luar bahan baku
- Contoh:
  - tenaga kerja
  - listrik
  - gas
- Overhead memiliki:
  - **nama**
  - **nominal**
- CRUD overhead (tambah & hapus)

---

### ✅ Perhitungan HPP
HPP dihitung otomatis dari:

