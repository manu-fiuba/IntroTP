// js/pages/league-detail.js

document.addEventListener('DOMContentLoaded', async () => {
    
    // Obtenemos el ID de la liga de la URL (Ej: league-detail.html?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const leagueId = urlParams.get('id') || '1'; // '1' por defecto para el mock
    
    // Referencias al DOM
    const ui = {
        name: document.getElementById('league-name'),
        position: document.getElementById('league-position'),
        description: document.getElementById('league-description'),
        admin: document.getElementById('league-admin'),
        userTeam: document.getElementById('league-user-team'),
        code: document.getElementById('league-code'),
        leaderboard: document.getElementById('leaderboard-body'),
        leaveBtn: document.getElementById('leave-league-btn')
    };

    // ==========================================
    // 1. OBTENER Y MOSTRAR DATOS
    // ==========================================
    const loadLeagueData = async () => {
        try {
            const response = await api.getLeagueDetails(leagueId);
            
            if (response.status === 'success') {
                const data = response.data;
                renderLeagueInfo(data);
                renderLeaderboard(data.leaderboard);
            }
        } catch (error) {
            console.error("Error al cargar la liga:", error);
            ui.name.textContent = 'Error al cargar los datos';
        }
    };

    const renderLeagueInfo = (data) => {
        ui.name.textContent = data.name;
        ui.position.textContent = data.userPosition;
        ui.description.textContent = data.description;
        ui.admin.textContent = data.adminName;
        ui.userTeam.textContent = data.userTeamName;
        ui.code.textContent = data.inviteCode;
    };

    const renderLeaderboard = (leaderboard) => {
        ui.leaderboard.innerHTML = ''; // Limpiar tabla

        leaderboard.forEach(participant => {
            // Clases especiales para el top 3 y para el usuario actual
            let rowClass = participant.position <= 3 ? `rank-${participant.position}` : '';
            if (participant.isCurrentUser) {
                rowClass += ' current-user-row';
            }

            const row = `
                <tr class="${rowClass.trim()}">
                    <td class="col-pos">${participant.position}</td>
                    <td class="col-team">
                        <div class="participant-info">
                            <img src="./img/circle-user.svg" alt="Perfil" class="participant-avatar">
                            <div class="participant-text">
                                <span class="user-name">${participant.userName}</span>
                                <span class="team-name">${participant.teamName}</span>
                            </div>
                        </div>
                    </td>
                    <td class="col-pts">${participant.points}</td>
                </tr>
            `;
            ui.leaderboard.innerHTML += row;
        });
    };

    // ==========================================
    // 2. ACCIONES (ABANDONAR LIGA)
    // ==========================================
    ui.leaveBtn.addEventListener('click', async () => {
        const confirmLeave = confirm("¿Estás seguro de que querés abandonar esta liga? Perderás todo tu progreso en ella.");
        
        if (confirmLeave) {
            const originalText = ui.leaveBtn.textContent;
            ui.leaveBtn.textContent = 'Saliendo...';
            ui.leaveBtn.disabled = true;

            try {
                const response = await api.leaveLeague(leagueId);
                if (response.status === 'success') {
                    alert(response.message);
                    window.location.href = 'leagues.html'; // Redirigir al listado general
                }
            } catch (error) {
                alert("Ocurrió un error al intentar salir de la liga.");
                ui.leaveBtn.textContent = originalText;
                ui.leaveBtn.disabled = false;
            }
        }
    });

    // Iniciar carga al abrir la página
    loadLeagueData();
});