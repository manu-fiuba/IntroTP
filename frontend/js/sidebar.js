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
});

// LÓGICA DE PANEL ADMIN

const userRole = localStorage.getItem('f2_role');
const sidebarNav = document.querySelector('.sidebar-nav');

// Verificamos si es admin y si NO estamos ya en admin.html
if (userRole === 'admin' && sidebarNav && !document.querySelector('a[href="admin.html"]')) {
    // Creamos el link
    const adminLink = document.createElement('a');
    adminLink.href = 'admin.html';
    adminLink.className = 'nav-link admin-link';
    adminLink.textContent = 'Panel Admin';
    
    // Creamos la línea divisoria
    const divider = document.createElement('div');
    divider.className = 'sidebar-divider';
    
    // Los insertamos al principio de la barra de navegación
    sidebarNav.prepend(divider);
    sidebarNav.prepend(adminLink);
}