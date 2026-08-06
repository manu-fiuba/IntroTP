document.addEventListener('DOMContentLoaded', async () => {

    if (!Api.session.isLoggedIn()) {
        window.location.href = 'login';
        return;
    }

    const MAX_TEAMS = 3;
    const currentUser = Api.session.getUser();
    const gridEl = document.getElementById('myTeamsGrid');
    const errorEl = document.getElementById('myTeamsError');

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
        const teams = await Api.users.getTeams(currentUser.id);

        teams.forEach((team, index) => {
            gridEl.appendChild(renderTeamCard(team, index + 1));
        });

        // Solo se puede seguir creando equipos hasta el límite de 3.
        if (teams.length < MAX_TEAMS) {
            gridEl.appendChild(renderEmptySlot());
        }
    } catch (error) {
        showError('No se pudieron cargar tus equipos: ' + error.message);
    }

    function renderTeamCard(team, badgeNumber) {
        // El "valor del equipo" es lo que gastaste del presupuesto de $100M.
        const teamValue = 100.0 - team.budget_remaining;

        const article = document.createElement('article');
        article.className = 'team-card';
        article.innerHTML = `
            <div class="team-header">
                <span class="team-t-badge">T${badgeNumber}</span>
                <h3 class="team-name">${escapeHtml(team.name)}</h3>
            </div>
            <div class="total-pts-box">
                ${team.total_points} PTS
            </div>
            <div class="transfer-info">
                <span>Presupuesto Restante</span>
                <strong>$${team.budget_remaining.toFixed(1)}M</strong>
            </div>
            <div class="transfer-info">
                <span>Valor del Equipo</span>
                <strong>$${teamValue.toFixed(1)}M</strong>
            </div>
            <div class="team-footer mt-1" style="margin-top: 1rem;">
                <a href="manage-team?teamId=${team.id}" class="btn btn-outline btn-full text-center" style="width: 100%;">Gestionar Equipo</a>
            </div>
        `;
        return article;
    }

    function renderEmptySlot() {
        const a = document.createElement('a');
        a.href = 'create-team';
        a.className = 'team-card empty-slot';
        a.innerHTML = `
            <div class="empty-content">
                <span class="plus-icon">+</span>
                <h3>Crear nuevo equipo</h3>
                <p>Slot disponible</p>
            </div>
        `;
        return a;
    }
});