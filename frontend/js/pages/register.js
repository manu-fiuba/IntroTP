document.addEventListener('DOMContentLoaded', () => {

    if (Api.session.isLoggedIn()) {
        window.location.href = 'home';
        return;
    }

    const form = document.getElementById('registerForm');
    const errorEl = document.getElementById('registerError');
    const submitBtn = document.getElementById('registerSubmit');

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }

    function hideError() {
        errorEl.classList.remove('visible');
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideError();

        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const repeatPassword = document.getElementById('reg-password-confirm').value;

        // Validación rápida en el cliente antes de llamar a la API
        if (password !== repeatPassword) {
            showError('Las contraseñas no coinciden.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creando cuenta...';

        try {
            await Api.users.register({ username, password, repeatPassword });
            // Lo mandamos a loguearse con la cuenta recién creada
            window.location.href = 'login';
        } catch (error) {
            showError(error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Registrarse';
        }
    });
});