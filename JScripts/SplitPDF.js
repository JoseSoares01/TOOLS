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
                fileItem.draggable = true;
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
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeFile(file.name, fileItem);
                });
                // Adicionar eventos de drag and drop para reordenação
                fileItem.addEventListener('dragstart', dragStart);
                fileItem.addEventListener('dragover', dragOver);
                fileItem.addEventListener('drop', drop);
                // Adicionar evento de clique para seleção
                fileItem.addEventListener('click', () => toggleFileSelection(fileItem));
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

// Função para gerar preview do PDF com largura fixa e altura proporcional
async function generatePDFPreview(file, fileItem) {
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const pdfData = new Uint8Array(e.target.result);
            const loadingTask = pdfjsLib.getDocument({data: pdfData});
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            const scale = 0.5;
            const viewport = page.getViewport({scale});
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 200; // Largura fixa
            canvas.height = viewport.height * (200 / viewport.width); // Proporcional
            await page.render({
                canvasContext: context,
                viewport: page.getViewport({scale: canvas.width / viewport.width})
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

// Toggle para selecionar/desselecionar arquivos
function toggleFileSelection(fileItem) {
    fileItem.classList.toggle('selected');
    updateButtonsState();
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
    const selectedFiles = document.querySelectorAll('.file-item.selected');
    mergeBtn.disabled = !hasFiles || selectedFiles.length < 2;
    splitBtn.disabled = !hasFiles || selectedFiles.length !== 1;
    reorderBtn.disabled = !hasFiles;
}

// Mostrar mensagem de erro
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Função para mesclar PDFs
mergeBtn.addEventListener('click', async () => {
    const selectedFiles = document.querySelectorAll('.file-item.selected');
    if (selectedFiles.length < 2) {
        showError('Selecione pelo menos 2 arquivos para mesclar');
        return;
    }

    try {
        // Criar uma nova instância do PDFDocument
        const mergedPdf = await PDFLib.PDFDocument.create();
        
        // Processar cada arquivo selecionado
        for (const fileItem of selectedFiles) {
            const pdfFile = pdfFiles.find(file => file.name === fileItem.dataset.fileName);
            if (!pdfFile) {
                throw new Error(`Arquivo não encontrado: ${fileItem.dataset.fileName}`);
            }

            // Converter o arquivo para ArrayBuffer
            const arrayBuffer = await pdfFile.arrayBuffer();
            
            // Carregar o PDF
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            
            // Copiar todas as páginas do PDF atual
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            
            // Adicionar todas as páginas ao PDF mesclado
            pages.forEach(page => {
                mergedPdf.addPage(page);
            });
        }

        // Salvar o PDF mesclado
        const mergedPdfBytes = await mergedPdf.save();
        
        // Criar um Blob com os bytes do PDF
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        
        // Criar URL do blob e fazer download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'documento_mesclado.pdf';
        
        // Trigger do download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpar a URL do blob
        URL.revokeObjectURL(url);
        
        showError('PDFs mesclados com sucesso!');
        
    } catch (error) {
        console.error('Erro ao mesclar PDFs:', error);
        showError(`Erro ao mesclar PDFs: ${error.message}`);
    }
});
// Função para separar PDF
splitBtn.addEventListener('click', async () => {
    const selectedFiles = document.querySelectorAll('.file-item.selected');
    if (selectedFiles.length !== 1) {
        showError('Selecione apenas 1 arquivo para separar');
        return;
    }
    const selectedFile = pdfFiles.find(file => file.name === selectedFiles[0].dataset.fileName);
    try {
        const pdfDoc = await PDFLib.PDFDocument.load(await selectedFile.arrayBuffer());
        const pageCount = pdfDoc.getPageCount();
        for (let i = 0; i < pageCount; i++) {
            const newPdf = await PDFLib.PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
            newPdf.addPage(copiedPage);
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedFile.name.replace('.pdf', '')}_page${i + 1}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Erro ao separar PDF:', error);
        showError('Erro ao separar PDF');
    }
});

// Função para reordenar PDFs
reorderBtn.addEventListener('click', () => {
    const selectedFiles = document.querySelectorAll('.file-item.selected');
    if (selectedFiles.length === 0) {
        showError('Nenhum arquivo selecionado para reordenar');
        return;
    }
    showError('Arraste e solte os arquivos para reordená-los');
});

// Funções para drag and drop de reordenação
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.fileName);
    e.target.classList.add('dragging');
}

function dragOver(e) {
    e.preventDefault();
    const draggingElement = document.querySelector('.dragging');
    const currentElement = e.target.closest('.file-item');
    if (draggingElement !== currentElement) {
        const rect = currentElement.getBoundingClientRect();
        const nextElement = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5 ? currentElement.nextElementSibling : currentElement;
        filesList.insertBefore(draggingElement, nextElement);
    }
}

function drop(e) {
    e.preventDefault();
    const draggedFileName = e.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`[data-file-name="${draggedFileName}"]`);
    draggedElement.classList.remove('dragging');
    // Atualizar a ordem dos arquivos no array pdfFiles
    const newOrder = Array.from(filesList.children).map(item => item.dataset.fileName);
    pdfFiles = newOrder.map(fileName => pdfFiles.find(file => file.name === fileName));
}

// Inicializar PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
