document.addEventListener('DOMContentLoaded', function() {
    Script_Js(); // Chama a função Script_Js quando o DOM está completamente carregado
});

function Script_Js() {
    // Seleciona todos os itens de menu que possuem submenus
    const dropdowns = document.querySelectorAll('nav.menu .menu-item');

    // Adiciona eventos de mouseover e mouseout para cada item do menu
    dropdowns.forEach(dropdown => {
        // Mostra o submenu ao passar o mouse sobre o item
        dropdown.addEventListener('mouseover', function() {
            this.querySelector('.sub-menu').style.visibility = 'visible';
            this.querySelector('.sub-menu').style.maxHeight = '12rem';
        });

        // Esconde o submenu ao retirar o mouse do item
        dropdown.addEventListener('mouseout', function() {
            this.querySelector('.sub-menu').style.visibility = 'hidden';
            this.querySelector('.sub-menu').style.maxHeight = '0';
        });
    });
}
