// src/main.js

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { getSession, logout } from './auth/auth.service.js'
import { renderAuth } from './auth/auth.ui.js'
import { renderDashboard } from './dashboard/dashboard.ui.js'
import { renderProducts } from './products/products.ui.js'
import { renderMaterials } from './materials/materials.ui.js'
import { renderProductDetail } from './products/product-detail.ui.js'

// 👉 TAMBAHAN MARKETPLACE
import { marketplacePage } from './marketplace/marketplace.js'

let sessionCache = null
let currentRoute = { name: 'dashboard', params: null }

export function navigate(name, params = null) {
  currentRoute = { name, params }
  render()
}

async function render() {
  const app = document.querySelector('#app')

  if (!sessionCache) {
    sessionCache = await getSession()
  }

  if (!sessionCache) {
    renderAuth()
    return
  }

  // ===== LAYOUT DENGAN NAV MINIMAL =====
  app.innerHTML = `
    <nav class="navbar navbar-dark bg-dark">
      <div class="container-fluid">
        <div class="d-flex gap-2">
          <button
            id="navDashboard"
            class="btn btn-outline-light btn-sm">
            Dashboard
          </button>

          <button
            id="navProducts"
            class="btn btn-outline-light btn-sm">
            Produk
          </button>

          <button
            id="navMaterials"
            class="btn btn-outline-light btn-sm">
            Bahan
          </button>

          <button
            id="navMarketplace"
            class="btn btn-outline-light btn-sm">
            Marketplace
          </button>
        </div>

        <span class="navbar-text text-white">
          HPP Calculator
        </span>

        <button
          id="navLogout"
          class="btn btn-danger btn-sm">
          Logout
        </button>
      </div>
    </nav>

    <div id="page" class="container mt-4"></div>
  `

  // ===== NAV EVENTS =====
  document.getElementById('navDashboard').onclick = () => {
    navigate('dashboard')
  }

  document.getElementById('navProducts').onclick = () => {
    navigate('products')
  }

  document.getElementById('navMaterials').onclick = () => {
    navigate('materials')
  }

  document.getElementById('navMarketplace').onclick = () => {
    navigate('marketplace')
  }

  document.getElementById('navLogout').onclick = async () => {
    await logout()
    sessionCache = null
    render()
  }

  const page = document.getElementById('page')

  // ===== ROUTING =====
  switch (currentRoute.name) {
    case 'dashboard':
      renderDashboard(sessionCache, page)
      break

    case 'products':
      renderProducts(sessionCache, page)
      break

    case 'product-detail':
      renderProductDetail(sessionCache, currentRoute.params, page)
      break

    case 'materials':
      renderMaterials(sessionCache, page)
      break

    // 👉 ROUTE MARKETPLACE
    case 'marketplace':
      marketplacePage(sessionCache, page)
      break

    default:
      navigate('dashboard')
  }
}

// initial render
render()
