// src/dashboard/dashboard.ui.js

import { navigate } from '../main.js'

export function renderDashboard(session, container) {
  container.innerHTML = `
    <div>
      <h3 class="mb-4">Dashboard</h3>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Daftar Produk</h5>
              <p class="card-text">
                Kelola produk, resep, dan HPP.
              </p>
              <button
                id="btnProducts"
                class="btn btn-primary">
                Kelola Produk
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Master Bahan</h5>
              <p class="card-text">
                Kelola bahan baku dan harga.
              </p>
              <button
                id="btnMaterials"
                class="btn btn-secondary">
                Master Bahan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  // ===== ROUTING BUTTONS =====
  container.querySelector('#btnProducts').onclick = () => {
    navigate('products')
  }

  container.querySelector('#btnMaterials').onclick = () => {
    navigate('materials')
  }
}
