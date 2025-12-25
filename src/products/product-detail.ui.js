// src/products/product-detail.ui.js

import { supabase } from '../supabase.js'
import { formatRupiah } from '../shared/format.js'
import { navigate } from '../main.js'

export async function renderProductDetail(session, productId, container) {
  try {
    /* ======================
       LOAD DATA
    ====================== */
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    const { data: materials } = await supabase
      .from('raw_materials')
      .select('*')
      .order('name')

    const { data: recipeItems } = await supabase
      .from('recipe_items')
      .select('*')
      .eq('product_id', productId)

    const { data: overheads } = await supabase
      .from('overhead_costs')
      .select('*')
      .eq('product_id', productId)

    const items = recipeItems || []
    const overheadList = overheads || []

    const production = items.filter(i => i.category === 'production')
    const packing = items.filter(i => i.category === 'packing')

    const sum = arr =>
      arr.reduce((a, b) => a + (b.qty_used * b.cost), 0)

    const overheadTotal =
      overheadList.reduce((a, b) => a + Number(b.amount), 0)

    const hppTotal =
      sum(production) + sum(packing) + overheadTotal

    /* ======================
       SIMPAN HPP
    ====================== */
    await supabase
      .from('products')
      .update({ hpp_total: hppTotal })
      .eq('id', productId)

    /* ======================
       RENDER UI
    ====================== */
    container.innerHTML = `
      <div>
        <!-- BACK -->
        <button
          id="backToProducts"
          class="btn btn-sm btn-outline-secondary mb-3">
          ← Kembali ke Produk
        </button>

        <h4>${product.name}</h4>
        <p class="text-muted">${product.notes || ''}</p>

        <!-- ADD MATERIAL -->
        <div class="card card-body mb-4">
          <h6>Tambah Bahan ke Resep</h6>

          <input id="materialInput" list="materialsList"
            class="form-control mb-2"
            placeholder="Ketik nama bahan">
          <datalist id="materialsList">
            ${materials.map(m => `<option value="${m.name}">`).join('')}
          </datalist>

          <label>
            Qty pakai <span id="unitLabel" class="text-muted"></span>
          </label>
          <input id="qtyInput" type="number"
            class="form-control mb-2">

          <select id="categorySelect" class="form-control mb-2">
            <option value="production">Produksi</option>
            <option value="packing">Packing</option>
          </select>

          <button id="addMaterialBtn" class="btn btn-primary">
            Tambah Bahan
          </button>
        </div>

        <!-- BAHAN PRODUKSI -->
        <h6>Bahan Produksi</h6>
        <ul class="list-group mb-3">
          ${production.map(i => {
            const m = materials.find(x => x.id === i.raw_material_id)
            return `
              <li class="list-group-item">
                <div class="d-flex justify-content-between">
                  <div>
                    <strong>${m?.name}</strong><br>
                    <small class="text-muted">
                      ${i.qty_used} ${m?.usage_unit}
                      × ${formatRupiah(i.cost)} / ${m?.usage_unit}
                    </small>
                  </div>
                  <div>
                    <strong>${formatRupiah(i.qty_used * i.cost)}</strong>
                    <button class="btn btn-sm btn-danger ms-2"
                      data-del-item="${i.id}">✕</button>
                  </div>
                </div>
              </li>
            `
          }).join('') || '<li class="list-group-item text-muted">Kosong</li>'}
        </ul>

        <!-- BAHAN PACKING -->
        <h6>Bahan Packing</h6>
        <ul class="list-group mb-4">
          ${packing.map(i => {
            const m = materials.find(x => x.id === i.raw_material_id)
            return `
              <li class="list-group-item">
                <div class="d-flex justify-content-between">
                  <div>
                    <strong>${m?.name}</strong><br>
                    <small class="text-muted">
                      ${i.qty_used} ${m?.usage_unit}
                      × ${formatRupiah(i.cost)} / ${m?.usage_unit}
                    </small>
                  </div>
                  <div>
                    <strong>${formatRupiah(i.qty_used * i.cost)}</strong>
                    <button class="btn btn-sm btn-danger ms-2"
                      data-del-item="${i.id}">✕</button>
                  </div>
                </div>
              </li>
            `
          }).join('') || '<li class="list-group-item text-muted">Kosong</li>'}
        </ul>

        <!-- OVERHEAD -->
        <h6>Biaya Overhead</h6>
        <p class="text-muted">
          Biaya di luar bahan baku (tenaga kerja, listrik, dll)
        </p>

        <div class="card card-body mb-3">
          <input id="overheadName"
            class="form-control mb-2"
            placeholder="Nama biaya">
          <input id="overheadAmount"
            type="number"
            class="form-control mb-2"
            placeholder="Nominal">
          <button id="addOverheadBtn" class="btn btn-secondary">
            Tambah Overhead
          </button>
        </div>

        <ul class="list-group mb-3">
          ${overheadList.map(o => `
            <li class="list-group-item d-flex justify-content-between">
              <span>${o.name}</span>
              <span>
                ${formatRupiah(o.amount)}
                <button class="btn btn-sm btn-danger ms-2"
                  data-del-overhead="${o.id}">✕</button>
              </span>
            </li>
          `).join('') || '<li class="list-group-item text-muted">Belum ada overhead</li>'}
        </ul>

        <!-- SUMMARY -->
        <div class="alert alert-success">
          <strong>HPP TOTAL:</strong> ${formatRupiah(hppTotal)}
        </div>
      </div>
    `

    /* ======================
       EVENTS
    ====================== */
    container.querySelector('#backToProducts').onclick = () => {
      navigate('products')
    }

    const materialInput = container.querySelector('#materialInput')
    const qtyInput = container.querySelector('#qtyInput')
    const unitLabel = container.querySelector('#unitLabel')
    const categorySelect = container.querySelector('#categorySelect')

    let selectedMaterial = null

    materialInput.oninput = () => {
      selectedMaterial = materials.find(
        m => m.name.toLowerCase() === materialInput.value.toLowerCase()
      )
      unitLabel.textContent = selectedMaterial
        ? `(${selectedMaterial.usage_unit})`
        : ''
    }

    container.querySelector('#addMaterialBtn').onclick = async () => {
      if (!selectedMaterial) return alert('Pilih bahan')
      if (qtyInput.value <= 0) return alert('Qty tidak valid')

      await supabase.from('recipe_items').insert([{
        user_id: session.user.id,
        product_id: productId,
        raw_material_id: selectedMaterial.id,
        qty_used: Number(qtyInput.value),
        cost: selectedMaterial.price_per_usage_unit,
        category: categorySelect.value
      }])

      renderProductDetail(session, productId, container)
    }

    container.querySelectorAll('[data-del-item]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Hapus bahan ini?')) return
        await supabase.from('recipe_items')
          .delete().eq('id', btn.dataset.delItem)
        renderProductDetail(session, productId, container)
      }
    })

    container.querySelector('#addOverheadBtn').onclick = async () => {
      const name = overheadName.value.trim()
      const amount = Number(overheadAmount.value)
      if (!name || amount <= 0) return alert('Data tidak valid')

      await supabase.from('overhead_costs').insert([{
        user_id: session.user.id,
        product_id: productId,
        name,
        amount
      }])

      renderProductDetail(session, productId, container)
    }

    container.querySelectorAll('[data-del-overhead]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Hapus overhead ini?')) return
        await supabase.from('overhead_costs')
          .delete().eq('id', btn.dataset.delOverhead)
        renderProductDetail(session, productId, container)
      }
    })

  } catch (err) {
    console.error(err)
    container.innerHTML = `<div class="alert alert-danger">Terjadi error</div>`
  }
}
