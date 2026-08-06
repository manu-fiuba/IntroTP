document.addEventListener('DOMContentLoaded', async () => {

    if (!Api.session.isLoggedIn()) {
        window.location.href = 'login';
        return;
    }

    const currentUser = Api.session.getUser();
    const listEl = document.getElementById('leaguesList');
    const emptyEl = document.getElementById('noLeaguesMessage');
    const errorEl = document.getElementById('leaguesError');

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    try {
        const [leagues, myTeams] = await Promise.all([
            Api.users.getLeagues(currentUser.id),
            Api.users.getTeams(currentUser.id)
        ]);

        if (leagues.length === 0) {
            emptyEl.style.display = '';
            return;
        }

        const myTeamIds = myTeams.map(t => t.id);

        // Api.users.getLeagues no trae posición ni el nombre de tu equipo en
        // cada liga (el backend real tampoco lo hace hoy) — para eso hay que
        // pedir el detalle completo de cada liga y buscarte en la tabla de
        // posiciones.
        const details = await Promise.all(leagues.map(l => Api.leagues.getById(l.id)));

        leagues.forEach((league, index) => {
            const detail = details[index];
            const myEntryIndex = detail.leaderboard.findIndex(entry => myTeamIds.includes(entry.team_id));
            const myEntry = myEntryIndex >= 0 ? detail.leaderboard[myEntryIndex] : null;
            const position = myEntryIndex >= 0 ? myEntryIndex + 1 : null;

            listEl.appendChild(renderLeagueCard(league, position, myEntry));
        });
    } catch (error) {
        showError('No se pudieron cargar tus ligas: ' + error.message);
    }

    function renderLeagueCard(league, position, myEntry) {
        const a = document.createElement('a');
        a.href = `league-detail.html?leagueId=${league.id}`;
        a.className = 'league-card';
        a.innerHTML = `
            <div class="league-card-header">
                <div class="league-info">
                    <h3 class="league-title">${escapeHtml(league.name)}</h3>
                    <p class="league-desc">${escapeHtml(league.description)}</p>
                </div>
                <div class="league-position">
                    <span class="pos-number">${position ?? '-'}</span>
                    <span class="pos-total">/ ${league.max_participants.toLocaleString('es-AR')}</span>
                </div>
            </div>
            <div class="league-card-footer">
                <span class="team-label">Equipo:</span>
                <span class="team-name">${escapeHtml(myEntry ? myEntry.team_name : 'Sin equipo en esta liga')}</span>
            </div>
        `;
        return a;
    }
});