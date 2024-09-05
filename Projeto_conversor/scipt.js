const entradaImagens = document.getElementById('entrada-imagens');
const listaImagens = document.getElementById('lista-imagens');
const botaoExportar = document.getElementById('exportar-imagens-pdf');
let arquivosImagens = [];

// Desativa o botão de exportar por padrão
botaoExportar.disabled = true;

entradaImagens.addEventListener('change', (evento) => {
    const arquivos = Array.from(evento.target.files);
    arquivos.forEach(arquivo => {
        arquivosImagens.push(arquivo);
        renderizarListaImagens();
    });
    verificarBotaoExportar(); // Verifica se o botão deve ser ativado
});

function moverParaCima(arquivo) {
    const indice = arquivosImagens.indexOf(arquivo)
}