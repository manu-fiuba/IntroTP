import { login } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.auth-card');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const usernameInput = document.getElementById('username').value;
            const passwordInput = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            try {
                // Feedback visual de carga
                submitBtn.disabled = true;
                submitBtn.textContent = 'Iniciando sesión...';

                await login(usernameInput, passwordInput);
                
                // Login exitoso, vamos al dashboard
                console.log("login exitoso")
                window.location.href = 'home.html';
            } catch (error) {
                // Por ahora usamos un alert, más adelante podemos inyectar un span rojo en el DOM
                alert(`Error: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Entrar';
            }
        });
    }
});