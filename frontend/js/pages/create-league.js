// js/pages/create-league.js

document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos el formulario usando la clase que tiene en tu HTML
    const formCrearLiga = document.querySelector('form.auth-card');

    if (formCrearLiga) {
        formCrearLiga.addEventListener('submit', async (e) => {
            // Evitamos que el navegador cambie de página automáticamente
            e.preventDefault(); 

            // Recopilamos los valores de los inputs usando sus IDs
            const payloadLiga = {
                name: document.getElementById('league-name').value,
                description: document.getElementById('league-desc').value,
                password: document.getElementById('league-password').value,
                max_participants: parseInt(document.getElementById('league-max').value, 10)
            };

            // Seleccionamos el botón para deshabilitarlo mientras carga
            const submitBtn = formCrearLiga.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creando...';

            try {
                // Llamamos a la API (que ahora vive globalmente gracias a api.js)
                const respuesta = await api.createLeague(payloadLiga);

                if (respuesta.status === 'success') {
                    console.log('¡Liga creada con éxito!', respuesta.data);
                    
                    // Redirigimos a la página de ligas
                    window.location.href = 'leagues.html'; 
                } else {
                    alert('Error al crear la liga: ' + respuesta.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Crear Liga';
                }
            } catch (error) {
                console.error('Error al intentar crear la liga:', error);
                alert('Ocurrió un error inesperado.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Crear Liga';
            }
        });
    }
});