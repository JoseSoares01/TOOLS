document.addEventListener('DOMContentLoaded', function() {
    // Função renomeada para Script_Js
    Script_Js();
});

function Script_Js() {
    // Dropdown menu functionality
    const dropdowns = document.querySelectorAll('nav ul li');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseover', function() {
            const submenu = this.querySelector('ul');
            if (submenu) {
                submenu.style.display = 'block'; // Mostra o submenu quando o item é "mouseover"
            }
        });
        dropdown.addEventListener('mouseout', function() {
            const submenu = this.querySelector('ul');
            if (submenu) {
                submenu.style.display = 'none'; // Esconde o submenu quando o item é "mouseout"
            }
        });
    });
}
