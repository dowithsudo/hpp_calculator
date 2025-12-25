// src/products/products.service.js

import { supabase } from '../supabase.js'

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    alert(error.message)
    return []
  }

  return data
}

export async function addProduct(product) {
  const { error } = await supabase
    .from('products')
    .insert([product])

  if (error) {
    alert(error.message)
    return false
  }

  return true
}

export async function updateProduct(id, product) {
  const { error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)

  if (error) {
    alert(error.message)
    return false
  }

  return true
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    alert(error.message)
    return false
  }

  return true
}
