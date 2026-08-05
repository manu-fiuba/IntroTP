document.addEventListener('DOMContentLoaded', () => {

    if (!Api.session.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('createLeagueForm');
    const errorEl = document.getElementById('createLeagueError');
    const submitBtn = document.getElementById('createLeagueSubmit');

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
    function hideError() {
        errorEl.classList.remove('visible');
        errorEl.textContent = '';
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
                password: document.getElementById('league-password').value
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