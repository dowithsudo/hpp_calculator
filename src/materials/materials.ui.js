// src/materials/materials.ui.js

import {
  getMaterials,
  addMaterial,
  updateMaterial,
  deleteMaterial
} from './materials.service.js'

import { formatRupiah } from '../shared/format.js'

const PAGE_SIZE = 100

export async function renderMaterials(session, container) {
  let materials = await getMaterials()
  let keyword = ''
  let currentPage = 1

  /* ========= HELPERS ========= */

  function highlight(text) {
    if (!keyword) return text
    const regex = new RegExp(`(${keyword})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  function getFiltered() {
    if (!keyword) return materials
    const kw = keyword.toLowerCase()
    return materials.filter(m =>
      m.name.toLowerCase().includes(kw) ||
      m.purchase_unit.toLowerCase().includes(kw) ||
      m.usage_unit.toLowerCase().includes(kw)
    )
  }

  function getPaged(data) {
    const start = (currentPage - 1) * PAGE_SIZE
    return data.slice(start, start + PAGE_SIZE)
  }

  /* ========= RENDER PART ========= */

  function renderTable(data) {
    const tbody = container.querySelector('#materialsTable')
    if (!tbody) return

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted">
            Tidak ada data
          </td>
        </tr>
      `
      return
    }

    tbody.innerHTML = data.map(m => `
      <tr>
        <td>${highlight(m.name)}</td>
        <td>${highlight(m.purchase_unit)}</td>
        <td>${m.purchase_qty}</td>
        <td>${formatRupiah(m.purchase_price)}</td>
        <td>${highlight(m.usage_unit)}</td>
        <td>${formatRupiah(m.price_per_usage_unit)} / ${m.usage_unit}</td>
        <td>
          <div class="d-grid gap-1">
            <button class="btn btn-sm btn-warning" data-edit="${m.id}">
              Edit
            </button>
            <button class="btn btn-sm btn-danger" data-del="${m.id}">
              Hapus
            </button>
          </div>
        </td>
      </tr>
    `).join('')

    bindActions()
  }

  function renderPagination(total) {
    const pager = container.querySelector('#pagination')
    if (!pager) return

    const totalPages = Math.ceil(total / PAGE_SIZE)
    if (totalPages <= 1) {
      pager.innerHTML = ''
      return
    }

    pager.innerHTML = `
      <button class="btn btn-sm btn-outline-secondary me-2"
        ${currentPage === 1 ? 'disabled' : ''}
        id="prevPage">
        ← Prev
      </button>

      <span>
        Page ${currentPage} / ${totalPages}
      </span>

      <button class="btn btn-sm btn-outline-secondary ms-2"
        ${currentPage === totalPages ? 'disabled' : ''}
        id="nextPage">
        Next →
      </button>
    `

    pager.querySelector('#prevPage')?.addEventListener('click', () => {
      currentPage--
      updateView()
    })

    pager.querySelector('#nextPage')?.addEventListener('click', () => {
      currentPage++
      updateView()
    })
  }

  function updateView() {
    const filtered = getFiltered()
    renderTable(getPaged(filtered))
    renderPagination(filtered.length)
  }

  function bindActions() {
    container.querySelectorAll('[data-del]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Hapus bahan ini?')) return
        await deleteMaterial(btn.dataset.del)
        renderMaterials(session, container)
      }
    })

    container.querySelectorAll('[data-edit]').forEach(btn => {
      btn.onclick = async () => {
        const m = materials.find(x => x.id === btn.dataset.edit)
        if (!m) return

        const name = prompt('Nama bahan', m.name)
        if (!name) return

        const price = Number(prompt('Harga beli', m.purchase_price))
        if (price <= 0) return

        const qty = Number(prompt('Satuan unit', m.purchase_qty))
        if (qty <= 0) return

        await updateMaterial(m.id, {
          name,
          purchase_price: price,
          purchase_qty: qty,
          price_per_usage_unit: price / qty
        })

        renderMaterials(session, container)
      }
    })
  }

  /* ========= INITIAL RENDER ========= */

  container.innerHTML = `
    <div>
      <h4 class="mb-3">Master Bahan Baku</h4>

      <input
        id="searchInput"
        class="form-control mb-3"
        placeholder="Cari bahan..."
      >

      <form id="materialForm" class="card card-body mb-4">
        <input id="material_name" class="form-control mb-2" placeholder="Nama bahan" required>
        <input id="purchase_unit" class="form-control mb-2" placeholder="Satuan beli" required>
        <input id="content_per_unit" type="number" class="form-control mb-2" placeholder="Satuan unit" required>
        <input id="purchase_price" type="number" class="form-control mb-2" placeholder="Harga beli" required>
        <input id="usage_unit" class="form-control mb-3" placeholder="Satuan pakai" required>
        <button class="btn btn-primary">Tambah Bahan</button>
      </form>

      <table class="table table-bordered table-striped">
        <thead class="table-light">
          <tr>
            <th>Nama</th>
            <th>Satuan Beli</th>
            <th>Satuan Unit</th>
            <th>Harga Beli</th>
            <th>Satuan Pakai</th>
            <th>Harga / Pakai</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody id="materialsTable"></tbody>
      </table>

      <div id="pagination" class="mt-3"></div>
    </div>
  `

  container.querySelector('#searchInput').oninput = (e) => {
    keyword = e.target.value.trim()
    currentPage = 1
    updateView()
  }

  container.querySelector('#materialForm').onsubmit = async (e) => {
    e.preventDefault()

    await addMaterial({
      user_id: session.user.id,
      name: material_name.value.trim(),
      purchase_unit: purchase_unit.value.trim(),
      purchase_qty: Number(content_per_unit.value),
      purchase_price: Number(purchase_price.value),
      usage_unit: usage_unit.value.trim(),
      price_per_usage_unit: purchase_price.value / content_per_unit.value
    })

    renderMaterials(session, container)
  }

  updateView()
}
