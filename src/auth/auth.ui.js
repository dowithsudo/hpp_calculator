// src/auth/auth.ui.js

import { login } from './login.js'
import { register } from './register.js'

export function renderAuth() {
  document.querySelector('#app').innerHTML = `
    <div class="container mt-5" style="max-width:400px">
      <h3 class="text-center mb-3">HPP Calculator</h3>

      <input id="email" class="form-control mb-2" placeholder="Email">
      <input id="password" type="password" class="form-control mb-3" placeholder="Password">

      <button id="loginBtn" class="btn btn-primary w-100 mb-2">Login</button>
      <button id="registerBtn" class="btn btn-outline-secondary w-100">Register</button>
    </div>
  `

  document.getElementById('loginBtn').onclick = () =>
    login(email.value, password.value)

  document.getElementById('registerBtn').onclick = () =>
    register(email.value, password.value)
}
