import { supabase } from '../supabase'

export async function register(email, password) {
  const { error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    alert(error.message)
  } else {
    alert('Registrasi berhasil, silakan login')
  }
}
