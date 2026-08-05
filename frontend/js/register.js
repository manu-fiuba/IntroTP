import { register } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('.auth-card');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const usernameInput = document.getElementById('reg-username').value;
            const passwordInput = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;
            const submitBtn = registerForm.querySelector('button[type="submit"]');

            if (passwordInput !== passwordConfirm) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creando cuenta...';

                await register(usernameInput, passwordInput, passwordConfirm);
                
                alert('Cuenta creada con éxito. Ya puedes iniciar sesión.');
                window.location.href = 'login.html';
            } catch (error) {
                alert(`Error: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Registrarse';
            }
        });
    }
});