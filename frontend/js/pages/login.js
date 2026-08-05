document.addEventListener('DOMContentLoaded', () => {

    // Si ya hay una sesión activa, no tiene sentido ver el login de nuevo.
    if (Api.session.isLoggedIn()) {
        window.location.href = 'home.html';
        return;
    }

    const form = document.getElementById('loginForm');
    const errorEl = document.getElementById('loginError');
    const submitBtn = document.getElementById('loginSubmit');

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

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Ingresando...';

        try {
            await Api.users.login({ username, password });
            window.location.href = 'home.html';
        } catch (error) {
            showError(error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Entrar';
        }
    });
});