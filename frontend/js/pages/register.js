// js/pages/register.js

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitamos que la página se recargue

        const usernameInput = document.getElementById('reg-username').value.trim();
        const passwordInput = document.getElementById('reg-password').value;
        const confirmPasswordInput = document.getElementById('reg-password-confirm').value;
        const submitBtn = registerForm.querySelector('button[type="submit"]');

        // 1. Validación en el frontend: Chequeamos que las contraseñas sean iguales
        if (passwordInput !== confirmPasswordInput) {
            alert('Las contraseñas no coinciden. Por favor, verificalas.');
            return; // Cortamos la ejecución acá
        }

        // Cambiamos el texto del botón mientras carga
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creando cuenta...';
        submitBtn.disabled = true;

        try {
            // 2. Llamamos a nuestra API simulada
            const response = await api.register({
                username: usernameInput,
                password: passwordInput
            });

            if (response.status === 'success') {
                alert(response.message);
                // Redirigimos al login para que inicie sesión con su nueva cuenta
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error("Error en el registro:", error);
            // Mostramos el mensaje de error que nos devuelve la API (Ej: "Usuario ya en uso")
            alert(error.message || 'Hubo un error al intentar crear la cuenta.');
        } finally {
            // Restauramos el botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});