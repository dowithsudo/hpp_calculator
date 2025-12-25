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
- Subtotal Bahan Produksi
- Subtotal Bahan Packing
- Total Overhead- 
- HPP disimpan ke kolom `products.hpp_total`
- Ditampilkan di daftar produk

---

### ✅ Navigasi SPA
- Dashboard
- Produk
- Detail Resep
- Navigasi internal tanpa browser back
- Tombol “← Kembali ke Produk” di detail resep

---

## 🧮 Struktur Database Utama

### `raw_materials`
- id
- user_id
- name
- purchase_unit
- purchase_qty
- purchase_price
- usage_unit
- price_per_usage_unit

### `products`
- id
- user_id
- name
- notes
- hpp_total

### `recipe_items`
- id
- user_id
- product_id
- raw_material_id
- qty_used
- cost
- category

### `overhead_costs`
- id
- user_id
- product_id
- name
- amount

---

## 🚀 Modul Marketplace (NEXT)

Marketplace **bukan modul penjualan**, tapi **simulator biaya & margin**.

### Konsep:
- Ambil produk + HPP
- Input harga jual
- Tambahkan biaya marketplace:
  - admin fee
  - service fee
  - iklan
  - biaya lain-lain
- Biaya bisa:
  - nominal
  - atau persentase

### Output:
- Total cost
- Margin nominal
- Margin %

Marketplace yang didukung:
- Shopee
- Tokopedia
- TikTok
- Lazada

---

## 🛠️ Cara Setup (Local Development)

```bash
# clone repo
git clone <repo-url>
cd hpp-calculator

# install dependency
npm install

# copy env
cp .env.example .env

# isi env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# run dev
npm run dev
