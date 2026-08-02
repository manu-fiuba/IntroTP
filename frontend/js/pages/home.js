// js/pages/home.js

document.addEventListener('DOMContentLoaded', async () => {
    
    // ==========================================
    // 1. LÓGICA DE LA CUENTA REGRESIVA
    // ==========================================
    const countdownBoxes = document.querySelectorAll('.countdown-timer strong');
    
    // Simulamos una fecha límite (ej: 5 días a partir de hoy)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5);

    const updateCountdown = () => {
        const now = new Date();
        const diff = deadline - now;

        if (diff <= 0) return; // Si ya pasó, no hace nada

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);

        // Actualizamos el DOM (asumiendo que los strong están en orden: Días, Horas, Minutos)
        if (countdownBoxes.length === 3) {
            countdownBoxes[0].textContent = days.toString().padStart(2, '0');
            countdownBoxes[1].textContent = hours.toString().padStart(2, '0');
            countdownBoxes[2].textContent = minutes.toString().padStart(2, '0');
        }
    };

    setInterval(updateCountdown, 60000); // Actualizar cada minuto
    updateCountdown(); // Llamada inicial


    // ==========================================
    // 2. CARGA DE EQUIPOS DEL USUARIO
    // ==========================================
    const lastRaceGrid = document.getElementById('last-race-grid');
    const seasonStatsGrid = document.getElementById('season-stats-grid');

    const loadTeams = async () => {
        try {
            lastRaceGrid.innerHTML = '<p>Cargando equipos...</p>';
            seasonStatsGrid.innerHTML = '<p>Cargando estadísticas...</p>';

            const response = await api.getUserTeams();

            if (response.status === 'success') {
                const teams = response.data;
                renderLastRaceTeams(teams);
                renderSeasonStatsTeams(teams);
            }
        } catch (error) {
            console.error("Error cargando el dashboard:", error);
        }
    };

    const renderLastRaceTeams = (teams) => {
        lastRaceGrid.innerHTML = ''; // Limpiar
        
        if (teams.length === 0) {
            lastRaceGrid.innerHTML = '<p>No tenés equipos creados. ¡Animate a crear uno!</p>';
            return;
        }

        teams.forEach((team, index) => {
            // Simulamos puntos aleatorios para la última carrera
            const lastRacePoints = Math.floor(Math.random() * 50) + 100; 
            
            const card = `
                <article class="team-card">
                    <div class="team-header">
                        <span class="team-t-badge">T${index + 1}</span>
                        <h3 class="team-name">${team.name}</h3>
                    </div>
                    <div class="team-stats-box">
                        <span class="stat-label">Puntos de carrera</span>
                        <strong class="stat-value">${lastRacePoints} PTS</strong>
                    </div>
                    <div class="team-footer">
                        <a href="my-teams.html" class="link-action">Ver resultado &rsaquo;</a>
                    </div>
                </article>
            `;
            lastRaceGrid.innerHTML += card;
        });
    };

    const renderSeasonStatsTeams = (teams) => {
        seasonStatsGrid.innerHTML = ''; // Limpiar

        if (teams.length === 0) {
            seasonStatsGrid.innerHTML = '<p>No hay estadísticas disponibles.</p>';
            return;
        }

        teams.forEach((team, index) => {
            const card = `
                <article class="team-card">
                    <div class="team-header">
                        <span class="team-t-badge">T${index + 1}</span>
                        <h3 class="team-name">${team.name}</h3>
                    </div>
                    <div class="total-pts-box">
                        ${team.total_points} PTS
                    </div>
                    <div class="season-best-box">
                        <span class="stat-label">Semana con mejores resultados</span>
                        <div class="best-race-info">
                            <div>
                                <span class="round-badge micro">ROUND -</span>
                                <strong>Por definir</strong>
                            </div>
                            <strong class="best-pts">-- PTS</strong>
                        </div>
                    </div>
                    <div class="transfer-info">
                        <span>Transferencias gratuitas</span>
                        <strong>${team.free_transfers_remaining}</strong>
                    </div>
                </article>
            `;
            seasonStatsGrid.innerHTML += card;
        });
    };

    // Ejecutar carga
    loadTeams();
});