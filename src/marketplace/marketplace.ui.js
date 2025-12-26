// src/marketplace/marketplace.ui.js

import {
  getMarketplaces,
  getProductsWithHpp,
  getMarketplaceByCode,
  getFeePresetsByMarketplaceCode,
  calculateMarketplace,
  saveMarketplaceSimulation,
} from "./marketplace.service.js";

import { supabase } from "../supabase.js";
import { formatRupiah } from "../shared/format.js";
import { navigate } from "../main.js";

export async function renderMarketplace(session, container) {
  const marketplaces = await getMarketplaces();
  const products = await getProductsWithHpp(session.user.id);

  let selectedMarketplaceCode = "shopee";
  let selectedMarketplace = await getMarketplaceByCode(selectedMarketplaceCode);

  let selectedProduct = null;
  let sellingPrice = 0;
  let fees = [];
  let editingSimulationId = null;

  /* =========================
     LOAD FEES
  ========================= */
  async function loadFees() {
    const presets = await getFeePresetsByMarketplaceCode(
      selectedMarketplaceCode,
      session.user.id
    );

    // 🔴 PENTING: reset TOTAL & tandai BUKAN custom
    fees = presets.map((p) => ({
      ...p,
      isActive: p.isRequired ? true : false,
      isCustom: false,
    }));
  }

  /* =========================
     RENDER FEES
  ========================= */
  function renderFees() {
    const el = document.getElementById("fees");
    if (!el) return;

    el.innerHTML = fees
      .map(
        (f) => `
    <div class="d-flex align-items-center mb-2">

      <input type="checkbox"
        class="form-check-input me-2"
        ${f.isActive ? "checked" : ""}
        ${f.isRequired ? "disabled" : ""}
        data-id="${f.id}">

      ${
        f.isCustom
          ? `<input type="text"
              class="form-control form-control-sm me-2"
              style="width:160px"
              value="${f.name}"
              data-name="${f.id}">`
          : `<span class="me-2" style="min-width:180px">
              ${f.name}
              ${f.isRequired ? '<small class="text-muted">(wajib)</small>' : ""}
            </span>`
      }

      ${
        f.isCustom
          ? `<select
        class="form-select form-select-sm me-2"
        style="width:80px"
        data-type="${f.id}">
        <option value="percent" ${
          f.type === "percent" ? "selected" : ""
        }>%</option>
        <option value="fixed" ${
          f.type === "fixed" ? "selected" : ""
        }>Rp</option>
      </select>`
          : `<span class="me-2" style="width:80px"></span>`
      }

<input type="number"
  class="form-control form-control-sm me-2"
  style="width:110px"
  value="${f.value}"
  data-value="${f.id}">


      <span class="me-2">${f.type === "percent" ? "%" : "Rp"}</span>

      ${
        f.isCustom
          ? `<button
              class="btn btn-sm btn-outline-danger"
              data-remove="${f.id}">
              ✕
            </button>`
          : ""
      }

    </div>
  `
      )
      .join("");

    // toggle aktif
    el.querySelectorAll("[data-id]").forEach((cb) => {
      cb.onchange = () => {
        const fee = fees.find((f) => f.id === cb.dataset.id);
        if (!fee || fee.isRequired) return;
        fee.isActive = cb.checked;
        renderSummary();
      };
    });

    // ubah nilai
    el.querySelectorAll("[data-value]").forEach((input) => {
      input.oninput = () => {
        const fee = fees.find((f) => f.id === input.dataset.value);
        fee.value = Number(input.value) || 0;
        renderSummary();
      };
    });

    // ubah nama custom
    el.querySelectorAll("[data-name]").forEach((input) => {
      input.oninput = () => {
        const fee = fees.find((f) => f.id === input.dataset.name);
        if (fee) fee.name = input.value;
      };
    });

    // hapus custom fee
    el.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.onclick = () => {
        fees = fees.filter((f) => f.id !== btn.dataset.remove);
        renderFees();
        renderSummary();
      };
    });

    // ubah tipe custom fee (% / Rp)
el.querySelectorAll('[data-type]').forEach(sel => {
  sel.onchange = () => {
    const fee = fees.find(f => f.id === sel.dataset.type)
    if (fee) {
      fee.type = sel.value
      renderSummary()
    }
  }
})

  }

  function addCustomFee() {
    fees.push({
      id: "custom-" + Date.now(),
      name: "",
      type: "percent", // default %
      value: 0,
      isActive: false,
      isRequired: false,
      isCustom: true,
    });

    renderFees();
    renderSummary();
  }
  


  /* =========================
     SUMMARY
  ========================= */
  function renderSummary() {
    const el = document.getElementById("summary");
    if (!el) return;

    if (!selectedProduct || sellingPrice <= 0) {
      el.innerHTML = `<div class="text-muted">
        Pilih produk dan isi harga jual
      </div>`;
      return;
    }

    const result = calculateMarketplace({
      hpp: selectedProduct.hpp_total || 0,
      sellingPrice,
      fees,
    });

    el.innerHTML = `
      <div>
        <div><strong>HPP:</strong> ${formatRupiah(result.hpp)}</div>

        <div class="mt-2">
          <strong>Biaya Marketplace:</strong>
          <ul class="list-unstyled ms-2 mb-1">
            ${result.breakdown
              .map(
                (b) => `
              <li class="d-flex justify-content-between">
                <span>${b.name}</span>
                <span>${formatRupiah(b.cost)}</span>
              </li>
            `
              )
              .join("")}
          </ul>
          <div class="d-flex justify-content-between border-top pt-1">
            <strong>Total Biaya Marketplace</strong>
            <strong>${formatRupiah(result.totalMarketplaceFee)}</strong>
          </div>
        </div>

        <hr>

        <div class="d-flex justify-content-between">
          <span>Total Cost</span>
          <strong>${formatRupiah(result.totalCost)}</strong>
        </div>

        <div class="d-flex justify-content-between">
          <span>Harga Jual</span>
          <strong>${formatRupiah(result.sellingPrice)}</strong>
        </div>

        <hr>

        <div>
          <strong>Margin:</strong>
          ${formatRupiah(result.margin)}
          (${result.marginPercent.toFixed(2)}%)
        </div>

        <div class="mt-3 text-end">
          <button id="saveSimulation"
            class="btn btn-primary btn-sm">
            💾 ${editingSimulationId ? "Update" : "Simpan"} Simulasi
          </button>
        </div>
      </div>
    `;

    document.getElementById("saveSimulation").onclick = async () => {
      await saveMarketplaceSimulation({
        userId: session.user.id,
        marketplaceId: selectedMarketplace.id,
        productId: selectedProduct.id,
        sellingPrice,
        result,
      });

      // ===== RESET STATE =====
      selectedProduct = null;
      sellingPrice = 0;
      editingSimulationId = null;

      // reset input UI
      document.getElementById("productSelect").value = "";
      document.getElementById("priceInput").value = "";

      // reset biaya ke default (wajib ON, lainnya OFF)
      await loadFees();
      renderFees();

      // ringkasan balik ke kondisi awal
      renderSummary();

      // refresh simulasi tersimpan (data terbaru)
      await loadSaved();

      alert("Simulasi berhasil disimpan / diperbarui");
    };
  }

  /* =========================
     LOAD SAVED SIMULATIONS
  ========================= */
  async function loadSaved() {
    const el = document.getElementById("savedList");
    if (!el) return;

    const { data } = await supabase
      .from("marketplace_simulations")
      .select(
        `
        id,
        selling_price,
        total_cost,
        margin,
        margin_percent,
        products ( id, name )
      `
      )
      .eq("user_id", session.user.id)
      .eq("marketplace_id", selectedMarketplace.id)
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) {
      el.innerHTML = `<div class="text-muted">Belum ada simulasi</div>`;
      return;
    }

    el.innerHTML = data
      .map(
        (d) => `
      <div class="border-bottom py-2 d-flex justify-content-between align-items-center">
        <div>
          <a href="#" class="product-link"
             data-product="${d.products.id}">
            <strong>${d.products.name}</strong>
          </a><br>
          <small class="text-muted">
            Harga ${formatRupiah(d.selling_price)} |
            Cost ${formatRupiah(d.total_cost)} |
            Margin ${formatRupiah(d.margin)} (${d.margin_percent.toFixed(2)}%)
          </small>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-primary me-1"
            data-edit="${d.id}">
            Edit
          </button>
          <button class="btn btn-sm btn-outline-danger"
            data-del="${d.id}">
            Hapus
          </button>
        </div>
      </div>
    `
      )
      .join("");

    // klik nama produk → detail produk
    el.querySelectorAll(".product-link").forEach((a) => {
      a.onclick = (e) => {
        e.preventDefault();
        navigate("product-detail", a.dataset.product);
      };
    });

    // edit simulasi
    el.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.onclick = () => {
        const sim = data.find((x) => x.id === btn.dataset.edit);
        selectedProduct = products.find((p) => p.id === sim.products.id);
        sellingPrice = sim.selling_price;
        editingSimulationId = sim.id;

        document.getElementById("productSelect").value = selectedProduct.id;
        document.getElementById("priceInput").value = sellingPrice;

        loadFees().then(() => {
          renderFees();
          renderSummary();
        });
      };
    });

    // delete simulasi
    el.querySelectorAll("[data-del]").forEach((btn) => {
      btn.onclick = async () => {
        if (!confirm("Hapus simulasi ini?")) return;
        await supabase
          .from("marketplace_simulations")
          .delete()
          .eq("id", btn.dataset.del);
        loadSaved();
      };
    });
  }

  /* =========================
     MAIN RENDER
  ========================= */
  container.innerHTML = `
    <div>
      <h4 class="mb-3">Marketplace Simulator</h4>

      <div class="card card-body mb-3">
        <label>Marketplace</label>
        <select id="marketplaceSelect" class="form-control mb-2">
          ${marketplaces
            .map(
              (m) => `
            <option value="${m.code}">${m.name}</option>
          `
            )
            .join("")}
        </select>

        <label>Produk</label>
        <select id="productSelect" class="form-control mb-2">
          <option value="">-- pilih produk --</option>
          ${products
            .map(
              (p) => `
            <option value="${p.id}">${p.name}</option>
          `
            )
            .join("")}
        </select>

        <label>Harga Jual</label>
        <input id="priceInput"
          type="number"
          class="form-control"
          placeholder="Harga jual">
      </div>

      <div class="card card-body mb-3">
  <div class="d-flex justify-content-between align-items-center mb-2">
    <h6 class="mb-0">Biaya Marketplace</h6>
    <button id="addCustomFee"
      class="btn btn-sm btn-outline-secondary">
      + Tambah Biaya Custom
    </button>
  </div>
  <div id="fees"></div>
</div>


      <div class="card card-body mb-3">
        <h6>Ringkasan</h6>
        <div id="summary"></div>
      </div>

      <div class="card card-body">
        <h6>Simulasi Tersimpan</h6>
        <div id="savedList"></div>
      </div>
    </div>
  `;

  /* =========================
     EVENTS
  ========================= */
  document.getElementById("marketplaceSelect").onchange = async (e) => {
    selectedMarketplaceCode = e.target.value;
    selectedMarketplace = await getMarketplaceByCode(selectedMarketplaceCode);
    await loadFees();
    renderFees();
    renderSummary();
    loadSaved();
  };

  document.getElementById("productSelect").onchange = async (e) => {
    selectedProduct = products.find((p) => p.id === e.target.value);
    sellingPrice = 0;
    editingSimulationId = null;
    document.getElementById("priceInput").value = "";
    await loadFees();
    renderFees();
    renderSummary();
  };

  document.getElementById("priceInput").oninput = (e) => {
    sellingPrice = Number(e.target.value) || 0;
    renderSummary();
  };

  document.getElementById("addCustomFee").onclick = () => {
    addCustomFee();
  };

  /* =========================
     INIT
  ========================= */
  await loadFees();
  renderFees();
  renderSummary();
  loadSaved();
}
