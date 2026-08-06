document.addEventListener('DOMContentLoaded', async () => {

    if (!Api.session.isLoggedIn()) {
        window.location.href = 'login';
        return;
    }

    const currentUser = Api.session.getUser();
    const form = document.getElementById('joinLeagueForm');
    const errorEl = document.getElementById('joinLeagueError');
    const submitBtn = document.getElementById('joinLeagueSubmit');
    const teamSelect = document.getElementById('join-team');

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
    function hideError() {
        errorEl.classList.remove('visible');
        errorEl.textContent = '';
    }

    // Poblar el <select> con los equipos reales del usuario
    try {
        const myTeams = await Api.users.getTeams(currentUser.id);
        if (myTeams.length === 0) {
            showError('Todavía no tenés ningún equipo — creá uno antes de unirte a una liga.');
            submitBtn.disabled = true;
        } else {
            myTeams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = team.name;
                teamSelect.appendChild(option);
            });
        }
    } catch (error) {
        showError('No se pudieron cargar tus equipos: ' + error.message);
        submitBtn.disabled = true;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideError();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Uniéndote...';

        try {
            await Api.leagues.join({
                join_code: document.getElementById('join-code').value.trim(),
                password: document.getElementById('join-password').value,
                fantasy_team_id: Number(teamSelect.value)
            });
            window.location.href = 'leagues.html';
        } catch (error) {
            showError(error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Unirse';
        }
    });
});