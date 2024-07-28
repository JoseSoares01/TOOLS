document.addEventListener('DOMContentLoaded', function() {
    const colorToggleBtn = document.getElementById('colorToggle');
    colorToggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('blue-bg');
    });
});
