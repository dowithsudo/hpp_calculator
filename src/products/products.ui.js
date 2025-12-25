// src/products/products.ui.js

import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct
} from './products.service.js'

import { navigate } from '../main.js'
import { formatRupiah } from '../shared/format.js'

export async function renderProducts(session, container) {
  let products = await getProducts()
  let keyword = ''

  /* ======================
     FILTER
  ====================== */
  function getFiltered() {
    if (!keyword) return products
    const kw = keyword.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(kw)
    )
  }

  /* ======================
     RENDER TABLE
  ====================== */
  function renderTable(data) {
    const tbody = container.querySelector('#productsTable')
    if (!tbody) return

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-muted">
            Belum ada produk
          </td>
        </tr>
      `
      return
    }

    tbody.innerHTML = data.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>
          ${p.hpp_total
            ? formatRupiah(p.hpp_total)
            : '<span class="text-muted">-</span>'}
        </td>
        <td>${p.notes || '-'}</td>
        <td>
          <div class="d-grid gap-1">
            <button
              class="btn btn-sm btn-primary"
              data-detail="${p.id}">
              Detail HPP
            </button>
            <button
              class="btn btn-sm btn-warning"
              data-edit="${p.id}">
              Edit
            </button>
            <button
              class="btn btn-sm btn-danger"
              data-del="${p.id}">
              Hapus
            </button>
          </div>
        </td>
      </tr>
    `).join('')

    bindActions(data)
  }

  /* ======================
     ACTION BINDING
  ====================== */
  function bindActions(data) {
    // DETAIL / RESEP
    container.querySelectorAll('[data-detail]').forEach(btn => {
      btn.onclick = () => {
        navigate('product-detail', btn.dataset.detail)
      }
    })

    // EDIT
    container.querySelectorAll('[data-edit]').forEach(btn => {
      btn.onclick = async () => {
        const p = data.find(x => x.id === btn.dataset.edit)
        if (!p) return

        const name = prompt('Nama produk', p.name)
        if (!name) return

        const notes = prompt('Catatan', p.notes || '')

        await updateProduct(p.id, { name, notes })
        renderProducts(session, container)
      }
    })

    // DELETE
    container.querySelectorAll('[data-del]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Hapus produk ini?')) return
        await deleteProduct(btn.dataset.del)
        renderProducts(session, container)
      }
    })
  }

  /* ======================
     RENDER PAGE
  ====================== */
  container.innerHTML = `
    <div>
      <h4 class="mb-3">Daftar Produk</h4>

      <input
        id="searchInput"
        class="form-control mb-3"
        placeholder="Cari produk..."
      >

      <form id="productForm" class="card card-body mb-4">
        <label class="form-label">Nama Produk</label>
        <input
          id="productName"
          class="form-control mb-2"
          required
        >

        <label class="form-label">Catatan</label>
        <textarea
          id="productNotes"
          class="form-control mb-3"
          rows="2"
        ></textarea>

        <button class="btn btn-primary">
          Tambah Produk
        </button>
      </form>

      <table class="table table-bordered table-striped">
        <thead class="table-light">
          <tr>
            <th>Nama Produk</th>
            <th width="160">HPP / Unit</th>
            <th>Catatan</th>
            <th width="160">Aksi</th>
          </tr>
        </thead>
        <tbody id="productsTable"></tbody>
      </table>
    </div>
  `

  /* ======================
     EVENTS
  ====================== */
  container.querySelector('#searchInput').oninput = e => {
    keyword = e.target.value.trim()
    renderTable(getFiltered())
  }

  container.querySelector('#productForm').onsubmit = async e => {
    e.preventDefault()

    const name = productName.value.trim()
    const notes = productNotes.value.trim()

    if (!name) {
      alert('Nama produk wajib diisi')
      return
    }

    await addProduct({
      user_id: session.user.id,
      name,
      notes,
      hpp_total: null
    })

    renderProducts(session, container)
  }

  /* ======================
     INIT
  ====================== */
  renderTable(products)
}
