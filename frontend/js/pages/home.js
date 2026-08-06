document.addEventListener('DOMContentLoaded', () => {

    if (!Api.session.isLoggedIn()) {
        window.location.href = 'login';
        return;
    }

    const currentUser = Api.session.getUser();
    let countdownTimer = null;

    loadRaceBanner();
    loadTeams();

    // ---------------------------------------------------------
    // Banner de la próxima carrera
    // ---------------------------------------------------------
    async function loadRaceBanner() {
        try {
            const race = await Api.f2.getNextRace();
            if (!race) return; // no hay carreras cargadas, el banner queda oculto

            document.getElementById('nextRaceBanner').style.display = '';
            document.getElementById('raceRound').textContent = `ROUND ${race.round_number}`;
            document.getElementById('raceName').textContent = race.name;
            document.getElementById('raceFullName').textContent = race.full_name || `Formula 2 - ${race.name} ${race.season}`;
            document.getElementById('raceDate').textContent = formatDateLabel(race.date);
            if (race.circuit_img) {
                document.getElementById('raceCircuitImg').src = race.circuit_img;
            }

            startCountdown(race.date);
        } catch (error) {
            console.error('No se pudo cargar la próxima carrera:', error.message);
        }
    }

    function formatDateLabel(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }).replace('.', '');
    }

    function startCountdown(dateStr) {
        function tick() {
            const diffMs = new Date(dateStr) - new Date();
            if (diffMs <= 0) {
                clearInterval(countdownTimer);
                document.getElementById('countdownDays').textContent = '0';
                document.getElementById('countdownHours').textContent = '0';
                document.getElementById('countdownMinutes').textContent = '0';
                return;
            }
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diffMs / 1000 / 60) % 60);
            document.getElementById('countdownDays').textContent = days;
            document.getElementById('countdownHours').textContent = hours;
            document.getElementById('countdownMinutes').textContent = minutes;
        }
        tick();
        countdownTimer = setInterval(tick, 60 * 1000); // se refresca cada minuto
    }

    // ---------------------------------------------------------
    // Equipos del usuario
    // ---------------------------------------------------------
    async function loadTeams() {
        try {
            const teams = await Api.users.getTeams(currentUser.id);
            
            if (teams.length === 0) {
                document.getElementById('noTeamsMessage').style.display = '';
                return;
            }

            document.getElementById('lastRaceHeading').style.display = '';
            document.getElementById('seasonStatsHeading').style.display = '';

            // Traer el historial de puntos de cada equipo
            const histories = await Promise.all(teams.map(t => Api.teams.getRaceHistory(t.id)));

            const lastRaceContainer = document.getElementById('lastRaceTeams');
            const seasonStatsContainer = document.getElementById('seasonStatsTeams');
            
            // Determinamos la última carrera global basándonos en el historial del primer equipo
            const globalLastRace = histories[0]?.lastRace;
            const lastRaceTag = document.getElementById('lastRaceTag');

            // Lógica de negocio: ¿La temporada ya empezó?
            if (globalLastRace) {
                lastRaceTag.textContent = globalLastRace.raceName;
            } else {
                lastRaceTag.textContent = "Pretemporada";
                lastRaceContainer.innerHTML = `
                    <div style="grid-column: 1 / -1; padding: 2rem; background-color: #1e1e1e; border: 1px dashed #333; border-radius: 12px; text-align: center; color: #aaa;">
                        <p>La temporada aún no ha comenzado. ¡Prepárate para la primera carrera!</p>
                    </div>`;
            }

            teams.forEach((team, index) => {
                const history = histories[index];
                const badge = `T${index + 1}`;

                // Solo inyectamos las tarjetas de última carrera si hay datos
                if (globalLastRace) {
                    lastRaceContainer.appendChild(renderLastRaceCard(team, badge, history.lastRace));
                }
                
                seasonStatsContainer.appendChild(renderSeasonStatsCard(team, badge, history.bestWeek));
            });
        } catch (error) {
            console.error('No se pudieron cargar tus equipos:', error.message);
        }
    }

    function renderLastRaceCard(team, badge, lastRace) {
        const article = document.createElement('article');
        article.className = 'team-card';
        article.innerHTML = `
            <div class="team-header">
                <span class="team-t-badge">${badge}</span>
                <h3 class="team-name">${escapeHtml(team.name)}</h3>
            </div>
            <div class="team-stats-box">
                <span class="stat-label">Puntos de carrera</span>
                <strong class="stat-value">${lastRace ? lastRace.points : 0} PTS</strong>
            </div>
            <div class="team-footer">
                <a href="#" class="link-action">Ver resultado &rsaquo;</a>
            </div>
        `;
        return article;
    }

    function renderSeasonStatsCard(team, badge, bestWeek) {
        const article = document.createElement('article');
        article.className = 'team-card';
        article.innerHTML = `
            <div class="team-header">
                <span class="team-t-badge">${badge}</span>
                <h3 class="team-name">${escapeHtml(team.name)}</h3>
            </div>
            <div class="total-pts-box">
                ${team.total_points} PTS
            </div>
            <div class="season-best-box">
                <span class="stat-label">Semana con mejores resultados</span>
                ${bestWeek ? `
                <div class="best-race-info">
                    <div>
                        <strong>${escapeHtml(bestWeek.raceName)}</strong>
                        <br><span class="date-micro">${escapeHtml(bestWeek.dateLabel)}</span>
                    </div>
                    <strong class="best-pts">${bestWeek.points} PTS</strong>
                </div>` : '<p class="date-micro">Todavía sin datos</p>'}
            </div>
            <div class="transfer-info">
                <span>Transferencias gratuitas</span>
                <strong>${team.free_transfers_remaining}</strong>
            </div>
        `;
        return article;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }
});