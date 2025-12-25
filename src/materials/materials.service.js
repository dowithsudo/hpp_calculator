// src/materials/materials.service.js

import { supabase } from '../supabase.js'

export async function getMaterials() {
  const { data, error } = await supabase
    .from('raw_materials')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return data
}

export async function addMaterial(material) {
  const { error } = await supabase
    .from('raw_materials')
    .insert([material])

  if (error) {
    alert(error.message)
    return false
  }

  return true
}

export async function updateMaterial(id, material) {
  const { error } = await supabase
    .from('raw_materials')
    .update(material)
    .eq('id', id)

  if (error) {
    alert(error.message)
    return false
  }

  return true
}

export async function deleteMaterial(id) {
  const { error } = await supabase
    .from('raw_materials')
    .delete()
    .eq('id', id)

  if (error) {
    alert(error.message)
    return false
  }

  return true
}
