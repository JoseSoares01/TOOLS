// Array para armazenar os arquivos PDF
let pdfFiles = [];

// Elementos do DOM
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const filesList = document.getElementById('filesList');
const mergeBtn = document.getElementById('mergeBtn');
const splitBtn = document.getElementById('splitBtn');

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
                    <span>${file.name}</span>
                    <button class="remove-btn" onclick="removeFile('${file.name}', this.parentElement)">×</button>
                `;
                filesList.appendChild(fileItem);
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
}

// Mostrar mensagem de erro
function showError(message) {
    alert(message); // You can replace this with a more sophisticated error display
}

// Função para mesclar PDFs
mergeBtn.addEventListener('click', async () => {
    if (pdfFiles.length < 2) {
        showError('Selecione pelo menos 2 arquivos para mesclar');
        return;
    }

    try {
        const merger = new PDFMerger();
        for (const file of pdfFiles) {
            await merger.add(file);
        }
        const mergedPdfFile = await merger.saveAsBlob();
        const url = URL.createObjectURL(mergedPdfFile);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'merged.pdf';
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erro ao mesclar PDFs:', error);
        showError(`Erro ao mesclar PDFs: ${error.message}`);
    }
});

// Função para separar PDF
splitBtn.addEventListener('click', async () => {
    if (pdfFiles.length !== 1) {
        showError('Selecione apenas 1 arquivo para separar');
        return;
    }

    try {
        const pdfDoc = await PDFLib.PDFDocument.load(await pdfFiles[0].arrayBuffer());
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
            link.download = `${pdfFiles[0].name.replace('.pdf', '')}_page${i + 1}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Erro ao separar PDF:', error);
        showError(`Erro ao separar PDF: ${error.message}`);
    }
});

// Inicializar PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';