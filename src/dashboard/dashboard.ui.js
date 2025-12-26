// src/dashboard/dashboard.ui.js

import { navigate } from '../main.js'

export function renderDashboard(session, container) {
  container.innerHTML = `
    <div>
      <h4 class="mb-4">Dashboard</h4>

      <div class="row g-3">

        <!-- PRODUK -->
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Produk & HPP</h5>
              <p class="card-text text-muted">
                Kelola produk, resep, dan hitung HPP.
              </p>
              <button
                class="btn btn-outline-primary btn-sm"
                id="goProducts">
                Kelola Produk
              </button>
            </div>
          </div>
        </div>

        <!-- BAHAN -->
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Bahan Baku</h5>
              <p class="card-text text-muted">
                Master bahan dan harga satuan.
              </p>
              <button
                class="btn btn-outline-primary btn-sm"
                id="goMaterials">
                Kelola Bahan
              </button>
            </div>
          </div>
        </div>

        <!-- MARKETPLACE -->
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Marketplace Simulator</h5>
              <p class="card-text text-muted">
                Hitung biaya marketplace dan margin produk.
              </p>
              <button
                class="btn btn-outline-primary btn-sm"
                id="goMarketplace">
                Buka Marketplace
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `

  // ===== EVENTS =====
  document.getElementById('goProducts').onclick = () => {
    navigate('products')
  }

  document.getElementById('goMaterials').onclick = () => {
    navigate('materials')
  }

  document.getElementById('goMarketplace').onclick = () => {
    navigate('marketplace')
  }
}
