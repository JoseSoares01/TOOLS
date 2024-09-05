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
    const indice = arquivosImagens.indexOf(arquivo);
    if (indice > 0) {
        [arquivosImagens[indice], arquivosImagens[indice - 1]] = [arquivosImagens[indice - 1], arquivosImagens[indice]];
        renderizarListaImagens();
    }
}

function moverParaBaixo(arquivo) {
    const indice = arquivosImagens.indexOf(arquivo);
    if (indice < arquivosImagens.length - 1) {
        [arquivosImagens[indice], arquivosImagens[indice + 1]] = [arquivosImagens[indice + 1], arquivosImagens[indice]];
        renderizarListaImagens();
    }
}

function removerArquivo(arquivo) {
    arquivosImagens = arquivosImagens.filter(f => f !== arquivo);
    renderizarListaImagens();
    verificarBotaoExportar(); // Verifica se o botão deve ser desativado
}

function renderizarListaImagens() {
    listaImagens.innerHTML = '';
    arquivosImagens.forEach(arquivo => {
        const div = document.createElement('div');
        div.classList.add('imagem-item');
        div.textContent = arquivo.name;

        const botaoCima = document.createElement('button');
        botaoCima.textContent = '↑';
        botaoCima.onclick = () => moverParaCima(arquivo);

        const botaoBaixo = document.createElement('button');
        botaoBaixo.textContent = '↓';
        botaoBaixo.onclick = () => moverParaBaixo(arquivo);

        const botaoRemover = document.createElement('button');
        botaoRemover.textContent = 'Remover';
        botaoRemover.onclick = () => removerArquivo(arquivo);

        div.appendChild(botaoCima);
        div.appendChild(botaoBaixo);
        div.appendChild(botaoRemover);
        listaImagens.appendChild(div);
    });
}

function verificarBotaoExportar() {
    // Ativa ou desativa o botão de exportar com base na quantidade de imagens selecionadas
    if (arquivosImagens.length === 0) {
        botaoExportar.disabled = true;
    } else {
        botaoExportar.disabled = false;
    }
}

async function converterImagensParaPDF() {
    if (arquivosImagens.length === 0) {
        alert('Nenhuma imagem selecionada para converter!');
        return;
    }

    const pdfDoc = await PDFLib.PDFDocument.create();

    for (const arquivo of arquivosImagens) {
        const arrayBuffer = await arquivo.arrayBuffer();
        const imageType = arquivo.type;

        let imagemEmbed;

        if (imageType === 'image/jpeg' || imageType === 'image/jpg') {
            imagemEmbed = await pdfDoc.embedJpg(arrayBuffer);
        } else if (imageType === 'image/png') {
            imagemEmbed = await pdfDoc.embedPng(arrayBuffer);
        } else if (imageType === 'image/svg+xml') {
            // Para imagens SVG, você pode converter SVG para PNG usando alguma biblioteca externa antes de incorporar
            alert('Imagens SVG não são diretamente suportadas. Converta-as para PNG antes de usar.');
            return;
        }

        const pagina = pdfDoc.addPage([imagemEmbed.width, imagemEmbed.height]);
        pagina.drawImage(imagemEmbed, {
            x: 0,
            y: 0,
            width: imagemEmbed.width,
            height: imagemEmbed.height,
        });
    }

    const pdfBytes = await pdfDoc.save();
    baixar(pdfBytes, 'imagens_convertidas.pdf', 'application/pdf');
}

botaoExportar.addEventListener('click', converterImagensParaPDF);

function baixar(dados, nomeArquivo, tipo) {
    const arquivo = new Blob([dados], { type: tipo });
    const a = document.createElement('a');
    const url = URL.createObjectURL(arquivo);
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}