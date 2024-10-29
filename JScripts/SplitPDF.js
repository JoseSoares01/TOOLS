// Array para armazenar os arquivos PDF
let pdfFiles = [];

// Elementos do DOM
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const filesList = document.getElementById('filesList');
const mergeBtn = document.getElementById('mergeBtn');
const splitBtn = document.getElementById('splitBtn');
const reorderBtn = document.getElementById('reorderBtn');

// Prevenir comportamento padrão de drag and drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Adicionar efeitos visuais durante o drag
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.classList.add('drag-over');
}

function unhighlight(e) {
    dropArea.classList.remove('drag-over');
}

// Manipulação do evento de drop
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Manipulação do evento de seleção de arquivo
fileInput.addEventListener('change', function(e) {
    handleFiles(this.files);
});

// Função principal para processar os arquivos
async function handleFiles(files) {
    for (const file of files) {
        if (file.type === 'application/pdf') {
            try {
                pdfFiles.push(file);
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.dataset.fileName = file.name;
                fileItem.innerHTML = `
                    <div class="loading"></div>
                    <div class="page-preview"></div>
                    <p class="file-name">${file.name}</p>
                    <button class="remove-btn" title="Remover arquivo">&times;</button>
                `;
                filesList.appendChild(fileItem);
                await generatePDFPreview(file, fileItem);
                const loading = fileItem.querySelector('.loading');
                if (loading) loading.remove();
                const removeBtn = fileItem.querySelector('.remove-btn');
                removeBtn.addEventListener('click', () => removeFile(file.name, fileItem));
            } catch (error) {
                console.error('Erro ao processar arquivo:', error);
                showError(`Erro ao processar ${file.name}`);
            }
        } else {
            showError(`${file.name} não é um arquivo PDF válido`);
        }
    }
    updateButtonsState();
}

// Gerar preview do PDF com tamanho fixo
async function generatePDFPreview(file, fileItem) {
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const pdfData = new Uint8Array(e.target.result);
            const loadingTask = pdfjsLib.getDocument({data: pdfData});
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            // Defina a largura desejada para a pré-visualização
            const fixedWidth = 200;
            const viewport = page.getViewport({scale: 1});
            const scale = fixedWidth / viewport.width;
            const scaledViewport = page.getViewport({scale});

            // Canvas com tamanho fixo
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;

            await page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise;

            const previewDiv = fileItem.querySelector('.page-preview');
            previewDiv.innerHTML = '';
            previewDiv.appendChild(canvas);
        } catch (error) {
            console.error('Erro ao gerar preview:', error);
            const previewDiv = fileItem.querySelector('.page-preview');
            previewDiv.innerHTML = '<p>Erro ao gerar preview</p>';
        }
    };
    reader.readAsArrayBuffer(file);
}

// Remover arquivo
function removeFile(fileName, fileItem) {
    pdfFiles = pdfFiles.filter(file => file.name !== fileName);
    fileItem.remove();
    updateButtonsState();
}

// Atualizar estado dos botões
function updateButtonsState() {
    const hasFiles = pdfFiles.length > 0;
    mergeBtn.disabled = !hasFiles || pdfFiles.length < 2;
    splitBtn.disabled = !hasFiles;
    reorderBtn.disabled = !hasFiles;
}

// Mostrar mensagem de erro
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Lógica de separação de páginas do PDF
splitBtn.addEventListener('click', async () => {
    if (pdfFiles.length !== 1) {
        showError('Selecione apenas 1 arquivo para separar');
        return;
    }
    const pdfFile = pdfFiles[0];
    try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        for (let i = 0; i < pageCount; i++) {
            const singlePagePdf = await PDFLib.PDFDocument.create();
            const [page] = await singlePagePdf.copyPages(pdfDoc, [i]);
            singlePagePdf.addPage(page);
            const pdfBytes = await singlePagePdf.saveAsBase64({ dataUri: true });
            const downloadLink = document.createElement('a');
            downloadLink.href = pdfBytes;
            downloadLink.download = `page-${i + 1}.pdf`;
            downloadLink.click();
        }
    } catch (error) {
        console.error('Erro ao separar PDF:', error);
        showError('Erro ao separar o arquivo PDF');
    }
});

// Lógica de reordenação de páginas do PDF
reorderBtn.addEventListener('click', async () => {
    if (pdfFiles.length !== 1) {
        showError('Selecione apenas 1 arquivo para reordenar');
        return;
    }
    const pageOrder = [2, 0, 1]; // Defina a ordem das páginas desejada
    const pdfFile = pdfFiles[0];
    try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const reorderedPdf = await PDFLib.PDFDocument.create();
        for (const pageIndex of pageOrder) {
            const [page] = await reorderedPdf.copyPages(pdfDoc, [pageIndex]);
            reorderedPdf.addPage(page);
        }
        const pdfBytes = await reorderedPdf.saveAsBase64({ dataUri: true });
        const downloadLink = document.createElement('a');
        downloadLink.href = pdfBytes;
        downloadLink.download = 'reordered.pdf';
        downloadLink.click();
    } catch (error) {
        console.error('Erro ao reordenar PDF:', error);
        showError('Erro ao reordenar o arquivo PDF');
    }
});

// Inicializar PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
