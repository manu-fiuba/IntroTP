document.addEventListener('DOMContentLoaded', async () => {

    if (!Api.session.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const currentUser = Api.session.getUser();
    const leagueId = new URLSearchParams(window.location.search).get('leagueId');
    const errorEl = document.getElementById('leagueDetailError');

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    if (!leagueId) {
        showError('No se especificó qué liga mostrar.');
        return;
    }

    let league;
    let myTeams;
    let myEntry = null;

    try {
        [league, myTeams] = await Promise.all([
            Api.leagues.getById(leagueId),
            Api.users.getTeams(currentUser.id)
        ]);
    } catch (error) {
        showError('No se pudo cargar la liga: ' + error.message);
        return;
    }

    const myTeamIds = myTeams.map(t => t.id);
    const myEntryIndex = league.leaderboard.findIndex(entry => myTeamIds.includes(entry.team_id));
    if (myEntryIndex >= 0) myEntry = league.leaderboard[myEntryIndex];

    // --- Tarjeta de información ---
    document.getElementById('leagueInfoCard').style.display = '';
    document.title = `F2 Fantasy | ${league.name}`;
    document.getElementById('leagueTitle').textContent = league.name;
    document.getElementById('leagueDesc').textContent = league.description;
    document.getElementById('leagueOwner').textContent = league.owner_username || 'Desconocido';

    if (myEntryIndex >= 0) {
        document.getElementById('leaguePositionBadge').style.display = '';
        document.getElementById('leaguePosition').textContent = `${myEntryIndex + 1}°`;
        document.getElementById('myTeamMeta').style.display = '';
        document.getElementById('leagueMyTeam').textContent = myEntry.team_name;
    }

    if (league.join_code) {
        document.getElementById('joinCodeMeta').style.display = '';
        document.getElementById('leagueJoinCode').textContent = league.join_code;
    }

    // --- Tabla de posiciones ---
    if (league.leaderboard.length > 0) {
        document.getElementById('leaderboardSection').style.display = '';
        const tbody = document.getElementById('leaderboardBody');
        league.leaderboard.forEach((entry, index) => {
            const rank = index + 1;
            const tr = document.createElement('tr');
            let rowClasses = [];
            if (rank === 1) rowClasses.push('rank-1');
            if (rank === 2) rowClasses.push('rank-2');
            if (rank === 3) rowClasses.push('rank-3');
            if (entry.team_id === myEntry?.team_id) rowClasses.push('current-user-row');
            tr.className = rowClasses.join(' ');

            tr.innerHTML = `
                <td class="col-pos">${rank}</td>
                <td class="col-team">
                    <div class="participant-info">
                        <img src="./img/circle-user.svg" alt="Perfil" class="participant-avatar">
                        <div class="participant-text">
                            <span class="user-name">${escapeHtml(entry.manager_name)}</span>
                            <span class="team-name">${escapeHtml(entry.team_name)}</span>
                        </div>
                    </div>
                </td>
                <td class="col-pts">${entry.total_points}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- Abandonar liga ---
    if (myEntry) {
        const dangerZone = document.getElementById('dangerZone');
        dangerZone.style.display = '';
        const leaveBtn = document.getElementById('leaveLeagueBtn');
        leaveBtn.addEventListener('click', async () => {
            if (!confirm(`¿Seguro que querés abandonar "${league.name}" con ${myEntry.team_name}?`)) return;
            leaveBtn.disabled = true;
            leaveBtn.textContent = 'Abandonando...';
            try {
                await Api.leagues.leave(league.id, myEntry.team_id);
                window.location.href = 'leagues.html';
            } catch (error) {
                showError(error.message);
                leaveBtn.disabled = false;
                leaveBtn.textContent = 'Abandonar Liga';
            }
        });
    }
});