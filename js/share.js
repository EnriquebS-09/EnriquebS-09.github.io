// js/shared.js
function checkAuthState() {
    const isLoggedIn = sessionStorage.getItem('compufix_loggedIn') === 'true';
    const profileNavItem = document.getElementById('profileNavItem');
    const loginNavItem = document.getElementById('loginNavItem');
    const logoutNavItem = document.getElementById('logoutNavItem');
    
    if (isLoggedIn) {
        if (profileNavItem) profileNavItem.style.display = 'block';
        if (loginNavItem) loginNavItem.style.display = 'none';
        if (logoutNavItem) logoutNavItem.style.display = 'block';
    }
    
    // Configurar el botón de logout si existe
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('compufix_loggedIn');
            sessionStorage.removeItem('compufix_userEmail');
            sessionStorage.removeItem('compufix_userName');
            sessionStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', checkAuthState);