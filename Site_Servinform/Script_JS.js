document.addEventListener('DOMContentLoaded', function() {
    // Dropdown menu functionality
    const dropdowns = document.querySelectorAll('nav ul li');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseover', function() {
            const submenu = this.querySelector('ul');
            if (submenu) {
                submenu.style.display = 'block';
            }
        });
        dropdown.addEventListener('mouseout', function() {
            const submenu = this.querySelector('ul');
            if (submenu) {
                submenu.style.display = 'none';
            }
        });
    });
});
