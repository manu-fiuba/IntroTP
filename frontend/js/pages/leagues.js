// js/pages/leagues.js

document.addEventListener('DOMContentLoaded', async () => {
    const leaguesContainer = document.getElementById('user-leagues-list');

    const loadLeagues = async () => {
        try {
            // Mantenemos el H2 y mostramos un estado de carga temporal
            leaguesContainer.innerHTML = '<h2>Mis Ligas</h2><p>Cargando ligas...</p>';

            const response = await api.getUserLeagues();

            if (response.status === 'success') {
                renderLeagues(response.data);
            }
        } catch (error) {
            console.error("Error al cargar las ligas:", error);
            leaguesContainer.innerHTML = '<h2>Mis Ligas</h2><p>Hubo un error al cargar tus ligas.</p>';
        }
    };

    const renderLeagues = (leagues) => {
        // Limpiamos el contenedor, pero volvemos a poner el título
        leaguesContainer.innerHTML = '<h2>Mis Ligas</h2>';

        if (leagues.length === 0) {
            leaguesContainer.innerHTML += '<p>Todavía no estás participando en ninguna liga. ¡Creá una o unite a la de tus amigos!</p>';
            return;
        }

        // Generamos el HTML por cada liga
        leagues.forEach(league => {
            // Notá cómo le pasamos el ID en la URL de destino
            const card = `
                <a href="league-detail.html?id=${league.id}" class="league-card">
                    <div class="league-card-header">
                        <div class="league-info">
                            <h3 class="league-title">${league.name}</h3>
                            <p class="league-desc">${league.description}</p>
                        </div>
                        <div class="league-position">
                            <span class="pos-number">${league.position}</span>
                            <span class="pos-total">/ ${league.totalParticipants.toLocaleString('es-AR')}</span>
                        </div>
                    </div>
                    <div class="league-card-footer">
                        <span class="team-label">Equipo actual:</span>
                        <span class="team-name">${league.userTeamName}</span>
                    </div>
                </a>
            `;
            leaguesContainer.innerHTML += card;
        });
    };

    // Ejecutamos la carga inicial
    loadLeagues();
});