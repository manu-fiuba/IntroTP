document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');

    const openMenu = () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evita hacer scroll con el menu abierto
    };

    const closeMenu = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restaura el scroll
    };

    if (openBtn && closeBtn && sidebar && overlay) {
        openBtn.addEventListener('click', openMenu);
        closeBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu); // Cierra al tocar el fondo oscuro
    }


    document.addEventListener('click', (event) => {
    // Detecta si el elemento cliqueado (o su padre) tiene la clase .logout-link
    const logoutBtn = event.target.closest('.logout-link');
    
    if (logoutBtn) {
        event.preventDefault(); // Evita la redirección inmediata
        
        if (typeof Api !== 'undefined') {
            Api.users.logout(); // Limpia localStorage (TOKEN_KEY y USER_KEY)
        } else {
            // Respaldo directo en caso de que Api no esté cargado
            localStorage.removeItem('f2fantasy_token');
            localStorage.removeItem('f2fantasy_user');
        }

        window.location.href = 'login.html'; // Redirige con la sesión limpia
    }

    // Se ejecuta siempre que la página se vuelve a mostrar (incluso al ir "Atrás" en el navegador)
window.addEventListener('pageshow', () => {
    // Si la API está cargada y NO hay sesión activa, expulsar al login
    if (typeof Api !== 'undefined' && !Api.session.isLoggedIn()) {
        window.location.href = 'login.html';
    }
});
});



});