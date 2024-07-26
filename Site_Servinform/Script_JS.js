document.addEventListener('DOMContentLoaded', function() {
    // Dropdown menu functionality
    const dropdowns = document.querySelectorAll('nav ul li');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseover', function() {
            this.querySelector('ul').style.display = 'block';
        });
        dropdown.addEventListener('mouseout', function() {
            this.querySelector('ul').style.display = 'none';
        });
    })