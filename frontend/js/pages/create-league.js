document.addEventListener('DOMContentLoaded', async () => {

    if (!Api.session.isLoggedIn()) {
        window.location.href = 'login';
        return;
    }

    const currentUser = Api.session.getUser();
    const form = document.getElementById('createLeagueForm');
    const errorEl = document.getElementById('createLeagueError');
    const submitBtn = document.getElementById('createLeagueSubmit');
    const teamSelect = document.getElementById('league-team');

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
    function hideError() {
        errorEl.classList.remove('visible');
        errorEl.textContent = '';
    }

    // Poblar el <select> con los equipos reales del usuario — igual que
    // join-league.js. Hace falta para saber con qué equipo entrás a la
    // liga que estás creando (el backend te agrega como miembro con este).
    try {
        const myTeams = await Api.users.getTeams(currentUser.id);
        if (myTeams.length === 0) {
            showError('Todavía no tenés ningún equipo — creá uno antes de armar una liga.');
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
        submitBtn.textContent = 'Creando...';

        try {
            const result = await Api.leagues.create({
                name: document.getElementById('league-name').value.trim(),
                description: document.getElementById('league-desc').value.trim(),
                max_participants: Number(document.getElementById('league-max').value),
                password: document.getElementById('league-password').value,
                fantasy_team_id: Number(teamSelect.value)
            });

            // Mostrar el código de invitación antes de irnos — es la única
            // vez que se puede ver completo apenas se crea.
            form.style.display = 'none';
            document.getElementById('createdJoinCode').textContent = result.league.join_code;
            document.getElementById('createLeagueSuccess').style.display = '';
        } catch (error) {
            showError(error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Liga';
        }
    });
});