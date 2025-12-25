// src/shared/format.js

export function formatRupiah(value) {
  return `Rp ${Number(value).toLocaleString('id-ID')}`
}
