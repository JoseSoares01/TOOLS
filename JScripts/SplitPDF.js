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

                // Adicionar visual de seleção
                fileItem.addEventListener('click', () => toggleFileSelection(fileItem));
                
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
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Função para mesclar PDFs
mergeBtn.addEventListener('click', async () => {
    if (pdfFiles.length < 2) {
        showError('Selecione pelo menos 2 arquivos para mesclar');
        return;
    }
    // Implementar lógica de mesclagem
});

// Função para separar PDF
splitBtn.addEventListener('click', async () => {
    const selectedFiles = document.querySelectorAll('.file-item.selected');
    if (selectedFiles.length !== 1) {
        showError('Selecione apenas 1 arquivo para separar');
        return;
    }
    // Implementar lógica de separação
});

// Função para reordenar PDFs
reorderBtn.addEventListener('click', () => {
    const selectedFiles = document.querySelectorAll('.file-item.selected');
    if (selectedFiles.length === 0) {
        showError('Nenhum arquivo selecionado para reordenar');
        return;
    }
    // Implementar lógica de reordenação
});

// Inicializar PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
