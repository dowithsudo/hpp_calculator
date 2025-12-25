// src/auth/auth.service.js

import { supabase } from '../supabase'

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function logout() {
  await supabase.auth.signOut()
  window.location.reload()
}
