// js/pages/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitamos que el navegador recargue la página

        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        // Cambiamos el estado del botón para que el usuario sepa que está cargando
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Iniciando sesión...';
        submitBtn.disabled = true;

        try {
            // Llamamos a nuestra API simulada
            const response = await api.login({
                username: usernameInput,
                password: passwordInput
            });

            if (response.status === 'success') {
                // FUTURO: Acá guardaríamos el token en localStorage o sessionStorage
                // localStorage.setItem('auth_token', response.data.token);
                
                // Redirigimos al Home
                window.location.href = 'home.html';
            }
        } catch (error) {
            console.error("Error en el login:", error);
            alert('Usuario o contraseña incorrectos. Por favor, intenta de nuevo.');
            
            // Restauramos el botón para que pueda volver a intentar
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});