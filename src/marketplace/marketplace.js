// src/marketplace/marketplace.js

import { renderMarketplace } from './marketplace.ui.js'

/**
 * Entry point Marketplace Module
 * Dipanggil dari router / main.js
 */
export async function marketplacePage(session, container) {
  if (!session || !session.user) {
    container.innerHTML = `
      <div class="alert alert-warning">
        Silakan login terlebih dahulu
      </div>
    `
    return
  }

  await renderMarketplace(session, container)
}
