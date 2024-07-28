// Aguarda até que o DOM esteja totalmente carregado
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona o botão de alternância de cor pelo ID
    const colorToggleBtn = document.getElementById('colorToggle');
    // Adiciona um evento de clique ao botão
    colorToggleBtn.addEventListener('click', function() {
        // Alterna a classe 'blue-bg' no corpo do documento
        document.body.classList.toggle('blue-bg');
    });
});
