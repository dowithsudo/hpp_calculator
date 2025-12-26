// src/marketplace/marketplace.service.js

import { supabase } from '../supabase.js'

/* =====================================================
   MARKETPLACE
===================================================== */
export async function getMarketplaces() {
  const { data, error } = await supabase
    .from('marketplaces')
    .select('id, code, name')
    .order('name')

  if (error) throw error
  return data
}

/* =====================================================
   PRODUCTS + HPP
===================================================== */
export async function getProductsWithHpp(userId) {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, hpp_total')
    .eq('user_id', userId)
    .order('name')

  if (error) throw error
  return data
}

/* =====================================================
   GET MARKETPLACE ID BY CODE
===================================================== */
export async function getMarketplaceByCode(code) {
  const { data, error } = await supabase
    .from('marketplaces')
    .select('id, name, code')
    .eq('code', code)
    .single()

  if (error) throw error
  return data
}

/* =====================================================
   FEE PRESETS (GLOBAL + CUSTOM USER)
===================================================== */
export async function getFeePresetsByMarketplaceCode(
  marketplaceCode,
  userId = null
) {
  const marketplace = await getMarketplaceByCode(marketplaceCode)

  let query = supabase
    .from('marketplace_fee_presets')
.select('*')
.eq('marketplace_id', marketplace.id)
.eq('is_visible', true)
.order('sort_order', { ascending: true })


  // ambil preset global + preset custom user
  if (userId) {
    query = query.or(`user_id.is.null,user_id.eq.${userId}`)
  }

  const { data, error } = await query.order('is_required', {
    ascending: false
  })

  if (error) throw error

  return data.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type, // percent | fixed
    value: p.default_value,
    isRequired: p.is_required,
    isActive: p.is_required ? true : p.is_active_by_default,
    infoUrl: p.info_url,
    isCustom: !!p.user_id
  }))
}

/* =====================================================
   CREATE CUSTOM FEE (DISKON, VOUCHER, DLL)
===================================================== */
export async function createCustomFee({
  userId,
  marketplaceId,
  name,
  type,
  value
}) {
  const { error } = await supabase
    .from('marketplace_fee_presets')
    .insert({
      marketplace_id: marketplaceId,
      user_id: userId,
      name,
      type, // percent | fixed
      default_value: value,
      is_required: false,
      is_active_by_default: true
    })

  if (error) throw error
}

/* =====================================================
   FEE OVERRIDES (PER USER + PRODUCT)
===================================================== */
export async function getFeeOverrides(userId, productId) {
  const { data, error } = await supabase
    .from('marketplace_fee_overrides')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (error) throw error
  return data
}

/* =====================================================
   SAVE / UPDATE OVERRIDE
===================================================== */
export async function saveFeeOverride({
  userId,
  productId,
  presetId,
  value,
  isActive
}) {
  const { error } = await supabase
    .from('marketplace_fee_overrides')
    .upsert({
      user_id: userId,
      product_id: productId,
      marketplace_fee_preset_id: presetId,
      value,
      is_active: isActive
    })

  if (error) throw error
}

/* =====================================================
   CALCULATE MARKETPLACE RESULT
===================================================== */
export function calculateMarketplace({
  hpp,
  sellingPrice,
  fees
}) {
  let totalMarketplaceFee = 0

  const breakdown = fees
    .filter(f => f.isActive)
    .map(fee => {
      let cost = 0

      if (fee.type === 'percent') {
        cost = sellingPrice * (fee.value / 100)
      } else {
        cost = fee.value
      }

      totalMarketplaceFee += cost

      return {
        name: fee.name,
        cost
      }
    })

  const totalCost = hpp + totalMarketplaceFee
  const margin = sellingPrice - totalCost
  const marginPercent =
    sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0

  return {
    hpp,
    sellingPrice,
    totalMarketplaceFee,
    totalCost,
    margin,
    marginPercent,
    breakdown
  }
}

/* =====================================================
   SAVE MARKETPLACE SIMULATION
===================================================== */
export async function saveMarketplaceSimulation({
  userId,
  marketplaceId,
  productId,
  sellingPrice,
  result
}) {
  const { error } = await supabase
    .from('marketplace_simulations')
    .upsert({
      user_id: userId,
      marketplace_id: marketplaceId,
      product_id: productId,
      selling_price: sellingPrice,
      hpp: result.hpp,
      total_marketplace_fee: result.totalMarketplaceFee,
      total_cost: result.totalCost,
      margin: result.margin,
      margin_percent: result.marginPercent
    }, {
      onConflict: 'user_id,marketplace_id,product_id'
    })

  if (error) throw error
}


/* =====================================================
   LOAD SAVED SIMULATION (OPTIONAL, FOR UI)
===================================================== */
export async function getSavedMarketplaceSimulation({
  userId,
  marketplaceId,
  productId
}) {
  const { data, error } = await supabase
    .from('marketplace_simulations')
    .select('*')
    .eq('user_id', userId)
    .eq('marketplace_id', marketplaceId)
    .eq('product_id', productId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}
