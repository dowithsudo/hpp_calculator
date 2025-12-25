import { supabase } from '../supabase'

export async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    alert(error.message)
  } else {
    window.location.reload()
  }
}
