// js/pages/join-league.js

document.addEventListener('DOMContentLoaded', async () => {
    const teamSelect = document.getElementById('join-team');
    const joinForm = document.getElementById('join-league-form');

    // ==========================================
    // 1. CARGAR LOS EQUIPOS EN EL SELECT
    // ==========================================
    const loadTeamsForSelect = async () => {
        try {
            const response = await api.getUserTeams();
            
            if (response.status === 'success') {
                const teams = response.data;
                
                // Reiniciamos el select
                teamSelect.innerHTML = '<option value="" selected>Selecciona un equipo</option>';
                
                if (teams.length === 0) {
                    teamSelect.innerHTML = '<option value="" selected>No tienes equipos (Crea uno primero)</option>';
                    return;
                }

                // Insertamos cada equipo del usuario como una opción
                teams.forEach(team => {
                    const option = document.createElement('option');
                    option.value = team.id;
                    option.textContent = team.name;
                    teamSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Error cargando equipos:", error);
            teamSelect.innerHTML = '<option value="">Error al cargar equipos</option>';
        }
    };

    // ==========================================
    // 2. MANEJAR EL ENVÍO DEL FORMULARIO
    // ==========================================
    joinForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        const code = document.getElementById('join-code').value;
        const password = document.getElementById('join-password').value;
        const teamId = teamSelect.value;

        // Cambiamos el texto del botón mientras "carga"
        const submitBtn = joinForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Uniéndose...';
        submitBtn.disabled = true;

        try {
            // Simulamos el envío a nuestro backend mock
            const response = await api.joinLeague({ code, password, teamId });

            if (response.status === 'success') {
                alert(response.message); // En una app real usaríamos un modal o toast
                window.location.href = 'leagues.html'; // Redirigimos a la vista de ligas
            }
        } catch (error) {
            alert('Hubo un error al intentar unirse a la liga.');
        } finally {
            // Restauramos el botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Ejecutamos la carga inicial
    loadTeamsForSelect();
});