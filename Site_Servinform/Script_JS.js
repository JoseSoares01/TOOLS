document.addEventListener('DOMContentLoaded', function() {
    Script_Js();
});

function Script_Js() {
    // Dropdown menu functionality
    const menuItems = document.querySelectorAll('nav.menu .menu-item');
    menuItems.forEach(menuItem => {
        menuItem.addEventListener('mouseover', function() {
            const submenu = this.querySelector('.sub-menu');
            if (submenu) {
                submenu.style.visibility = 'visible';
                submenu.style.maxHeight = '12rem';
            }
        });
        menuItem.addEventListener('mouseout', function() {
            const submenu = this.querySelector('.sub-menu');
            if (submenu) {
                submenu.style.visibility = 'hidden';
                submenu.style.maxHeight = '0';
            }
        });
    });
}
