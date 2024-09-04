const entradaPdf = document.getElementById('entrada-pdf');
const listaPdfs = document.getElementById('lista-pdfs');
const botaoExportar = document.getElementById('exportar-pdf');
const botaoSeparar = document.getElementById('separar-pdf');
let arquivosPdf = [];

// Desativa o botão de exportação por padrão
botaoExportar.disabled = true;

entradaPdf.addEventListener('change', (evento) => {
    const arquivos = Array.from(evento.target.files);
    arquivos.forEach(arquivo => {
        arquivosPdf.push(arquivo);
        renderizarListaPdfs();
    });
    verificarBotaoExportar(); // Verifica se o botão deve ser ativado
});

function moverParaCima(arquivo) {
    const indice = arquivosPdf.indexOf(arquivo);
    if (indice > 0) {
        [arquivosPdf[indice], arquivosPdf[indice - 1]] = [arquivosPdf[indice - 1], arquivosPdf[indice]];
        renderizarListaPdfs();
    }
}

function moverParaBaixo(arquivo) {
    const indice = arquivosPdf.indexOf(arquivo);
    if (indice < arquivosPdf.length - 1) {
        [arquivosPdf[indice], arquivosPdf[indice + 1]] = [arquivosPdf[indice + 1], arquivosPdf[indice]];
        renderizarListaPdfs();
    }
}

function removerArquivo(arquivo) {
    arquivosPdf = arquivosPdf.filter(f => f !== arquivo);
    renderizarListaPdfs();
    verificarBotaoExportar(); // Verifica se o botão deve ser desativado
}

function renderizarListaPdfs() {
    listaPdfs.innerHTML = '';
    arquivosPdf.forEach(arquivo => {
        const div = document.createElement('div');
        div.classList.add('pdf-item');
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
        listaPdfs.appendChild(div);
    });
}

function verificarBotaoExportar() {
    // Ativa ou desativa o botão de exportar com base na quantidade de PDFs selecionados
    if (arquivosPdf.length === 0) {
        botaoExportar.disabled = true;
    } else {
        botaoExportar.disabled = false;
    }
}

async function mesclarPDFs() {
    if (arquivosPdf.length === 0) {
        alert('Nenhum PDF selecionado para mesclar!');
        return;
    }

    const pdfMesclado = await PDFLib.PDFDocument.create();
    for (const arquivo of arquivosPdf) {
        const arrayBuffer = await arquivo.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const paginasCopiadas = await pdfMesclado.copyPages(pdf, pdf.getPageIndices());
        paginasCopiadas.forEach(pagina => pdfMesclado.addPage(pagina));
    }
    const arquivoPdfMesclado = await pdfMesclado.save();
    baixar(arquivoPdfMesclado, 'mesclado.pdf', 'application/pdf');
}

async function separarPDFs() {
    if (arquivosPdf.length === 0) {
        alert('Nenhum PDF selecionado para separar!');
        return;
    }

    for (const arquivo of arquivosPdf) {
        const arrayBuffer = await arquivo.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        for (const [index, pagina] of pdf.getPages().entries()) {
            const novoPdf = await PDFLib.PDFDocument.create();
            const [paginaCopiada] = await novoPdf.copyPages(pdf, [index]);
            novoPdf.addPage(paginaCopiada);
            const pdfSeparado = await novoPdf.save();
            baixar(pdfSeparado, `${arquivo.name.replace('.pdf', '')}_pagina_${index + 1}.pdf`, 'application/pdf');
        }
    }
}

botaoExportar.addEventListener('click', mesclarPDFs);
botaoSeparar.addEventListener('click', separarPDFs);

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
