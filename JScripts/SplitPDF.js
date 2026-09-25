/* =========================================================
   PDF Tools - Mesclar e Separar PDFs
   ---------------------------------------------------------
   Funcionalidades:
   - Upload por clique
   - Drag and drop
   - Pré-visualização da primeira página
   - Seleção de ficheiros
   - Reordenação por drag
   - Mesclagem de PDFs
   - Separação de um PDF em páginas individuais
   - Toasts de feedback
========================================================= */

/* =========================
   CONFIGURAÇÃO PDF.JS
========================= */
pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";

/* =========================
   ESTADO DA APLICAÇÃO
========================= */

/**
 * Array principal com os ficheiros PDF carregados.
 * Cada item terá:
 * - id: identificador único
 * - file: ficheiro original
 * - name: nome do ficheiro
 * - pages: nº de páginas (preenchido após leitura)
 */
let pdfFiles = [];

/* =========================
   ELEMENTOS DO DOM
========================= */
const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const selectFilesBtn = document.getElementById("selectFilesBtn");
const filesList = document.getElementById("filesList");
const emptyState = document.getElementById("emptyState");

const mergeBtn = document.getElementById("mergeBtn");
const splitBtn = document.getElementById("splitBtn");
const clearBtn = document.getElementById("clearBtn");
const selectionInfo = document.getElementById("selectionInfo");

const toastContainer = document.getElementById("toastContainer");

/* =========================
   UTILITÁRIOS
========================= */

/**
 * Gera um ID simples e único para cada ficheiro.
 */
function generateId() {
    return `pdf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Mostra mensagens de feedback ao utilizador.
 * type: success | error | info
 */
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3200);
}

/**
 * Lê o ficheiro original e devolve bytes novos (sempre a fresco).
 */
async function readFileAsUint8Array(file) {
    const buffer = await file.arrayBuffer();
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return copy;
}

/**
 * Bytes a partir do File original.
 */
async function getPdfBytes(pdfRecord) {
    if (!pdfRecord || !pdfRecord.file) {
        throw new Error("Ficheiro PDF em falta.");
    }
    return readFileAsUint8Array(pdfRecord.file);
}

/**
 * Garante que PDFLib está disponível.
 */
function assertPdfLib() {
    if (typeof PDFLib === "undefined" || !PDFLib.PDFDocument) {
        throw new Error("A biblioteca PDF-Lib não carregou. Recarregue a página.");
    }
}

/**
 * Abre um PDF com pdf.js a partir de bytes (cópia exclusiva para o worker).
 */
async function openPdfJsDocument(bytes) {
    if (typeof pdfjsLib === "undefined") {
        throw new Error("A biblioteca PDF.js não carregou. Recarregue a página.");
    }

    const data = new Uint8Array(bytes.byteLength);
    data.set(bytes);

    const loadingTask = pdfjsLib.getDocument({ data });
    return loadingTask.promise;
}

/**
 * Converte um canvas num JPEG Uint8Array.
 */
async function canvasToJpegBytes(canvas, quality = 0.92) {
    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (result) => (result ? resolve(result) : reject(new Error("Falha ao gerar imagem da página."))),
            "image/jpeg",
            quality
        );
    });
    return new Uint8Array(await blob.arrayBuffer());
}

/**
 * Renderiza UMA página (1-based) com pdf.js e devolve JPEG + dimensões em pontos.
 * Este caminho garante conteúdo visível (o mesmo motor do preview).
 */
async function renderPdfPageToJpeg(pdfJsDoc, pageNumber, scale = 2) {
    const page = await pdfJsDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
        canvasContext: context,
        viewport
    }).promise;

    const jpegBytes = await canvasToJpegBytes(canvas);

    /* Tamanho da página em pontos PDF (1/72") */
    const widthPt = viewport.width / scale;
    const heightPt = viewport.height / scale;

    canvas.width = 0;
    canvas.height = 0;

    return { jpegBytes, widthPt, heightPt };
}

/**
 * Cria um PDF de 1 página a partir de um JPEG renderizado.
 */
async function createPdfFromJpegPage(jpegBytes, widthPt, heightPt) {
    assertPdfLib();
    const pdfDoc = await PDFLib.PDFDocument.create();
    const image = await pdfDoc.embedJpg(jpegBytes);
    const page = pdfDoc.addPage([widthPt, heightPt]);
    page.drawImage(image, {
        x: 0,
        y: 0,
        width: widthPt,
        height: heightPt
    });
    return pdfDoc.save({ useObjectStreams: false });
}

/**
 * Adiciona ao PDF destino todas as páginas de um documento pdf.js (renderizadas).
 */
async function appendRenderedPages(targetPdf, pdfJsDoc) {
    const pageCount = pdfJsDoc.numPages;
    for (let n = 1; n <= pageCount; n++) {
        const { jpegBytes, widthPt, heightPt } = await renderPdfPageToJpeg(pdfJsDoc, n);
        const image = await targetPdf.embedJpg(jpegBytes);
        const page = targetPdf.addPage([widthPt, heightPt]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: widthPt,
            height: heightPt
        });
    }
    return pageCount;
}

/**
 * Devolve todos os cards selecionados.
 */
function getSelectedFileItems() {
    return Array.from(document.querySelectorAll(".file-item.selected"));
}

/**
 * Procura um registo do array pelo ID.
 */
function findPdfById(id) {
    return pdfFiles.find(item => item.id === id);
}

/* =========================
   ESTADO VISUAL / BOTÕES
========================= */

/**
 * Atualiza:
 * - estado do empty state
 * - texto informativo
 * - botões disponíveis
 */
function updateUIState() {
    const totalFiles = pdfFiles.length;
    const selectedItems = getSelectedFileItems();
    const selectedCount = selectedItems.length;

    emptyState.classList.toggle("hidden", totalFiles > 0);

    if (totalFiles === 0) {
        selectionInfo.textContent = "Nenhum ficheiro carregado.";
    } else if (selectedCount === 0) {
        selectionInfo.textContent = `${totalFiles} ficheiro(s) carregado(s). Selecione os PDFs que pretende usar.`;
    } else {
        selectionInfo.textContent = `${selectedCount} ficheiro(s) selecionado(s) de ${totalFiles}.`;
    }

    mergeBtn.disabled = selectedCount < 2;
    splitBtn.disabled = selectedCount !== 1;
    clearBtn.disabled = totalFiles === 0;
}

/* =========================
   DRAG AND DROP (UPLOAD)
========================= */

/**
 * Previne o comportamento nativo do browser.
 */
function preventDefaults(event) {
    event.preventDefault();
    event.stopPropagation();
}

/**
 * Aplica destaque visual na área de drop.
 */
function highlightDropArea() {
    dropArea.classList.add("drag-over");
}

/**
 * Remove destaque visual na área de drop.
 */
function unhighlightDropArea() {
    dropArea.classList.remove("drag-over");
}

/**
 * Trata ficheiros largados na área.
 */
function handleDrop(event) {
    const files = event.dataTransfer.files;
    handleFiles(files);
}

/* =========================
   PROCESSAMENTO DE FICHEIROS
========================= */

/**
 * Processa múltiplos ficheiros.
 * Apenas PDFs válidos serão adicionados.
 */
async function handleFiles(files) {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
        const isPdf =
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf");

        if (!isPdf) {
            showToast(`${file.name} não é um PDF válido.`, "error");
            continue;
        }

        /* Evita duplicados pelo nome + tamanho */
        const alreadyExists = pdfFiles.some(
            item => item.name === file.name && item.file.size === file.size
        );

        if (alreadyExists) {
            showToast(`${file.name} já foi adicionado.`, "info");
            continue;
        }

        await addPdfFile(file);
    }

    updateUIState();
}

/**
 * Adiciona um PDF ao estado e cria o respetivo card.
 */
async function addPdfFile(file) {
    const id = generateId();

    const pdfRecord = {
        id,
        file,
        name: file.name,
        pages: null
    };

    pdfFiles.push(pdfRecord);

    const fileItem = document.createElement("article");
    fileItem.className = "file-item";
    fileItem.dataset.id = id;
    fileItem.draggable = true;

    fileItem.innerHTML = `
        <button class="remove-btn" type="button" title="Remover arquivo">&times;</button>
        <div class="page-preview">
            <div class="loading"></div>
        </div>
        <div class="file-meta">
            <p class="file-name">${file.name}</p>
            <span class="file-pages">A processar...</span>
        </div>
    `;

    filesList.appendChild(fileItem);

    /* Eventos do card */
    bindFileItemEvents(fileItem);

    try {
        const pageCount = await generatePDFPreview(file, fileItem);

        pdfRecord.pages = pageCount;

        const pagesLabel = fileItem.querySelector(".file-pages");
        if (pagesLabel) {
            pagesLabel.textContent = `${pageCount} página(s)`;
        }
    } catch (error) {
        console.error("Erro ao gerar preview:", error);

        const preview = fileItem.querySelector(".page-preview");
        const pagesLabel = fileItem.querySelector(".file-pages");

        if (preview) {
            preview.innerHTML = `<div style="padding:20px;color:#9fb3c8;text-align:center;">Erro ao gerar preview</div>`;
        }

        if (pagesLabel) {
            pagesLabel.textContent = "Pré-visualização indisponível";
        }

        showToast(`Erro ao processar ${file.name}.`, "error");
    }

    updateUIState();
}

/**
 * Gera a preview da primeira página do PDF.
 * Retorna o total de páginas do documento.
 */
async function generatePDFPreview(file, fileItem) {
    /* Buffer exclusivo para o preview — mesclar/separar lê o File outra vez */
    const previewBytes = await readFileAsUint8Array(file);
    const loadingTask = pdfjsLib.getDocument({ data: previewBytes });
    const pdf = await loadingTask.promise;

    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });

    const desiredWidth = 220;
    const scale = desiredWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    await page.render({
        canvasContext: context,
        viewport: scaledViewport
    }).promise;

    const previewDiv = fileItem.querySelector(".page-preview");
    previewDiv.innerHTML = "";
    previewDiv.appendChild(canvas);

    return pdf.numPages;
}

/* =========================
   EVENTOS DOS CARDS
========================= */

/**
 * Liga todos os eventos de um card:
 * - selecionar
 * - remover
 * - drag start
 * - drag over
 * - drop
 */
function bindFileItemEvents(fileItem) {
    const removeBtn = fileItem.querySelector(".remove-btn");

    removeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        removeFile(fileItem.dataset.id);
    });

    fileItem.addEventListener("click", () => {
        fileItem.classList.toggle("selected");
        updateUIState();
    });

    fileItem.addEventListener("dragstart", dragStartReorder);
    fileItem.addEventListener("dragover", dragOverReorder);
    fileItem.addEventListener("drop", dropReorder);
    fileItem.addEventListener("dragend", dragEndReorder);
}

/**
 * Remove um ficheiro do estado e do DOM.
 */
function removeFile(id) {
    pdfFiles = pdfFiles.filter(item => item.id !== id);

    const element = document.querySelector(`.file-item[data-id="${id}"]`);
    if (element) {
        element.remove();
    }

    updateUIState();
}

/* =========================
   REORDENAÇÃO POR DRAG
========================= */

/**
 * Início do drag de reordenação.
 */
function dragStartReorder(event) {
    event.dataTransfer.setData("text/plain", event.currentTarget.dataset.id);
    event.currentTarget.classList.add("dragging");
}

/**
 * Mantém a zona válida para soltar.
 */
function dragOverReorder(event) {
    event.preventDefault();

    const draggingElement = document.querySelector(".file-item.dragging");
    const currentElement = event.currentTarget;

    if (!draggingElement || draggingElement === currentElement) return;

    const rect = currentElement.getBoundingClientRect();
    const isAfterHalf = (event.clientY - rect.top) / rect.height > 0.5;

    const nextElement = isAfterHalf ? currentElement.nextElementSibling : currentElement;
    filesList.insertBefore(draggingElement, nextElement);
}

/**
 * Ao largar, sincroniza a nova ordem com o array pdfFiles.
 */
function dropReorder(event) {
    event.preventDefault();

    const orderedIds = Array.from(filesList.children).map(item => item.dataset.id);
    pdfFiles = orderedIds.map(id => findPdfById(id)).filter(Boolean);

    showToast("Ordem dos ficheiros atualizada.", "info");
}

/**
 * Limpa classe visual ao terminar o drag.
 */
function dragEndReorder(event) {
    event.currentTarget.classList.remove("dragging");
}

/* =========================
   MESCLAR PDFs
========================= */

/**
 * Mescla os ficheiros selecionados respeitando a ordem atual na interface.
 */
async function mergeSelectedPDFs() {
    const selectedItems = getSelectedFileItems();

    if (selectedItems.length < 2) {
        showToast("Selecione pelo menos 2 PDFs para mesclar.", "error");
        return;
    }

    const previousLabel = mergeBtn.textContent;
    mergeBtn.disabled = true;
    mergeBtn.textContent = "A mesclar…";

    try {
        assertPdfLib();

        const mergedPdf = await PDFLib.PDFDocument.create();
        let pagesMerged = 0;

        for (const item of selectedItems) {
            const pdfRecord = findPdfById(item.dataset.id);
            if (!pdfRecord) continue;

            const bytes = await getPdfBytes(pdfRecord);
            const pdfJsDoc = await openPdfJsDocument(bytes);
            try {
                pagesMerged += await appendRenderedPages(mergedPdf, pdfJsDoc);
            } finally {
                if (typeof pdfJsDoc.destroy === "function") {
                    pdfJsDoc.destroy();
                }
            }
        }

        if (pagesMerged === 0) {
            throw new Error("Nenhuma página válida para mesclar.");
        }

        const mergedBytes = await mergedPdf.save({ useObjectStreams: false });

        const firstSelectedRecord = findPdfById(selectedItems[0].dataset.id);
        const firstBaseName = firstSelectedRecord
            ? firstSelectedRecord.name.replace(/\.pdf$/i, "").trim()
            : "documento_mesclado";
        const mergedFileName = `${firstBaseName || "documento_mesclado"}.pdf`;

        downloadBlob(mergedBytes, mergedFileName, "application/pdf");

        showToast("PDFs mesclados com sucesso.", "success");
    } catch (error) {
        console.error("Erro ao mesclar PDFs:", error);
        const detail = error && error.message ? ` (${error.message})` : "";
        showToast(`Erro ao mesclar os PDFs.${detail}`, "error");
    } finally {
        mergeBtn.textContent = previousLabel;
        updateUIState();
    }
}

/* =========================
   SEPARAR PDF
========================= */

/**
 * Separa um único PDF selecionado em ficheiros por página.
 */
async function splitSelectedPDF() {
    const selectedItems = getSelectedFileItems();

    if (selectedItems.length !== 1) {
        showToast("Selecione apenas 1 PDF para separar.", "error");
        return;
    }

    const pdfRecord = findPdfById(selectedItems[0].dataset.id);
    if (!pdfRecord) {
        showToast("O PDF selecionado não foi encontrado.", "error");
        return;
    }

    const previousLabel = splitBtn.textContent;
    splitBtn.disabled = true;
    splitBtn.textContent = "A separar…";

    try {
        assertPdfLib();

        const sourceBytes = await getPdfBytes(pdfRecord);
        const pdfJsDoc = await openPdfJsDocument(sourceBytes);
        const pageCount = pdfJsDoc.numPages;
        const baseName = pdfRecord.name.replace(/\.pdf$/i, "");

        try {
            for (let n = 1; n <= pageCount; n++) {
                splitBtn.textContent = `A separar… ${n}/${pageCount}`;

                const { jpegBytes, widthPt, heightPt } = await renderPdfPageToJpeg(pdfJsDoc, n);
                const pdfBytes = await createPdfFromJpegPage(jpegBytes, widthPt, heightPt);
                const fileName = `${baseName}_pagina_${n}.pdf`;

                downloadBlob(pdfBytes, fileName, "application/pdf");

                /* Pequena pausa para o browser não bloquear múltiplos downloads */
                await new Promise((r) => setTimeout(r, 120));
            }
        } finally {
            if (typeof pdfJsDoc.destroy === "function") {
                pdfJsDoc.destroy();
            }
        }

        showToast("PDF separado com sucesso.", "success");
    } catch (error) {
        console.error("Erro ao separar PDF:", error);
        const detail = error && error.message ? ` (${error.message})` : "";
        showToast(`Erro ao separar o PDF.${detail}`, "error");
    } finally {
        splitBtn.textContent = previousLabel;
        updateUIState();
    }
}

/* =========================
   DOWNLOAD
========================= */

/**
 * Faz o download de um blob.
 */
function downloadBlob(data, filename, mimeType) {
    const bytes = data instanceof Uint8Array
        ? data
        : new Uint8Array(data);

    /* Cópia explícita — evita ArrayBuffer partilhado/cortado a mais */
    const safeCopy = new Uint8Array(bytes.byteLength);
    safeCopy.set(bytes);

    const blob = new Blob([safeCopy], { type: mimeType || "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* =========================
   LIMPAR LISTA
========================= */

/**
 * Limpa todo o estado da ferramenta.
 */
function clearAllFiles() {
    pdfFiles = [];
    filesList.innerHTML = "";
    updateUIState();
    showToast("Lista limpa com sucesso.", "info");
}

/* =========================
   EVENTOS GERAIS
========================= */

/* Prevenir comportamento nativo */
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

/* Destaque visual na área de upload */
["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, highlightDropArea, false);
});

["dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlightDropArea, false);
});

/* Drop real */
dropArea.addEventListener("drop", handleDrop, false);

/* Abertura seletor de ficheiros */
selectFilesBtn.addEventListener("click", () => fileInput.click());

/* Upload via input */
fileInput.addEventListener("change", function () {
    handleFiles(this.files);
    this.value = "";
});

/* Botões de ação */
mergeBtn.addEventListener("click", mergeSelectedPDFs);
splitBtn.addEventListener("click", splitSelectedPDF);
clearBtn.addEventListener("click", clearAllFiles);

/* Estado inicial */
updateUIState();