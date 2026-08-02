// js/pages/my-teams.js

document.addEventListener('DOMContentLoaded', async () => {
    const teamsGrid = document.getElementById('teams-grid');
    const MAX_TEAMS = 3; // Límite máximo de equipos por usuario

    const loadMyTeams = async () => {
        try {
            const response = await api.getUserTeams();
            
            if (response.status === 'success') {
                renderTeams(response.data);
            }
        } catch (error) {
            console.error("Error al cargar los equipos:", error);
            teamsGrid.innerHTML = '<p>Hubo un error al cargar tus equipos.</p>';
        }
    };

    const renderTeams = (teams) => {
        teamsGrid.innerHTML = ''; // Limpiamos el texto de "Cargando..."

        // Renderizamos las tarjetas de los equipos existentes
        teams.forEach((team, index) => {
            const card = `
                <article class="team-card">
                    <div class="team-header">
                        <span class="team-t-badge">T${index + 1}</span>
                        <h3 class="team-name">${team.name}</h3>
                    </div>
                    <div class="total-pts-box">
                        ${team.totalPoints} PTS
                    </div>
                    <div class="transfer-info">
                        <span>Presupuesto Restante</span>
                        <strong>$${team.remainingBudget.toFixed(1)}M</strong>
                    </div>
                    <div class="transfer-info">
                        <span>Valor del Equipo</span>
                        <strong>$${team.teamValue.toFixed(1)}M</strong>
                    </div>
                    <div class="team-footer mt-1" style="margin-top: 1rem;">
                        <a href="manage-team.html?id=${team.id}" class="btn btn-outline btn-full text-center" style="width: 100%;">Gestionar Equipo</a>
                    </div>
                </article>
            `;
            teamsGrid.innerHTML += card;
        });

        // Verificamos si hay espacio para crear un equipo nuevo
        if (teams.length < MAX_TEAMS) {
            const emptySlotCard = `
                <a href="create-team.html" class="team-card empty-slot">
                    <div class="empty-content">
                        <span class="plus-icon">+</span>
                        <h3>Crear nuevo equipo</h3>
                        <p>Slot disponible (${teams.length}/${MAX_TEAMS})</p>
                    </div>
                </a>
            `;
            teamsGrid.innerHTML += emptySlotCard;
        }
    };

    // Ejecutamos la carga inicial
    loadMyTeams();
});