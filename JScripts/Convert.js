/* =========================================================
   Conversor de Imagens para PDF
   ---------------------------------------------------------
   Funcionalidades:
   - Upload por clique
   - Drag and drop
   - Pré-visualização das imagens
   - Reordenação por drag
   - Reordenação manual (cima / baixo)
   - Remoção de imagens
   - Inverter ordem
   - Exportação para um único PDF
   - Toasts de feedback
========================================================= */

/* =========================
   ESTADO DA APLICAÇÃO
========================= */

/**
 * Array principal das imagens carregadas.
 * Cada item:
 * - id: id único
 * - file: ficheiro original
 * - name: nome do ficheiro
 * - type: tipo MIME
 * - previewUrl: URL temporária para preview
 */
let arquivosImagens = [];

/* =========================
   ELEMENTOS DO DOM
========================= */
const entradaImagens = document.getElementById("entrada-imagens");
const listaImagens = document.getElementById("lista-imagens");
const botaoExportar = document.getElementById("exportar-imagens-pdf");
const reverseOrderBtn = document.getElementById("reverseOrderBtn");
const clearBtn = document.getElementById("clearBtn");
const dropArea = document.getElementById("dropArea");
const selectFilesBtn = document.getElementById("selectFilesBtn");
const emptyState = document.getElementById("emptyState");
const selectionInfo = document.getElementById("selectionInfo");
const toastContainer = document.getElementById("toastContainer");

/* =========================
   UTILITÁRIOS
========================= */

/**
 * Gera um id simples e único.
 */
function gerarId() {
    return `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Mostra um toast visual.
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
 * Atualiza o estado da interface:
 * - empty state
 * - resumo
 * - botões ativos/inativos
 */
function updateUIState() {
    const total = arquivosImagens.length;

    emptyState.classList.toggle("hidden", total > 0);

    if (total === 0) {
        selectionInfo.textContent = "Nenhuma imagem adicionada.";
    } else {
        selectionInfo.textContent = `${total} imagem(ns) pronta(s) para conversão. A ordem exibida será usada no PDF.`;
    }

    botaoExportar.disabled = total === 0;
    reverseOrderBtn.disabled = total < 2;
    clearBtn.disabled = total === 0;
}

/**
 * Limpa a lista toda.
 */
function limparLista() {
    arquivosImagens.forEach(item => {
        if (item.previewUrl) {
            URL.revokeObjectURL(item.previewUrl);
        }
    });

    arquivosImagens = [];
    renderizarListaImagens();
    updateUIState();
    showToast("Lista de imagens limpa.", "info");
}

/* =========================
   SIDEBAR
========================= */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

const dropdownSidebar = document.getElementsByClassName("dropdown-navbar");
for (let i = 0; i < dropdownSidebar.length; i++) {
    dropdownSidebar[i].addEventListener("click", function () {
        this.classList.toggle("active");
        const dropdownContent = this.nextElementSibling;

        if (!dropdownContent) return;

        dropdownContent.style.display =
            dropdownContent.style.display === "block" ? "none" : "block";
    });
}

/* =========================
   DRAG AND DROP (UPLOAD)
========================= */
function preventDefaults(event) {
    event.preventDefault();
    event.stopPropagation();
}

function highlightDropArea() {
    dropArea.classList.add("drag-over");
}

function unhighlightDropArea() {
    dropArea.classList.remove("drag-over");
}

function handleDrop(event) {
    const files = event.dataTransfer.files;
    handleFiles(files);
}

["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, highlightDropArea, false);
});

["dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlightDropArea, false);
});

dropArea.addEventListener("drop", handleDrop, false);

/* =========================
   PROCESSAMENTO DE IMAGENS
========================= */

/**
 * Processa um conjunto de ficheiros.
 */
function handleFiles(fileList) {
    const files = Array.from(fileList);

    files.forEach(file => {
        if (!file.type.startsWith("image/")) {
            showToast(`${file.name} não é uma imagem válida.`, "error");
            return;
        }

        const duplicate = arquivosImagens.some(
            item => item.name === file.name && item.file.size === file.size
        );

        if (duplicate) {
            showToast(`${file.name} já foi adicionada.`, "info");
            return;
        }

        arquivosImagens.push({
            id: gerarId(),
            file,
            name: file.name,
            type: file.type,
            previewUrl: URL.createObjectURL(file)
        });
    });

    renderizarListaImagens();
    updateUIState();
}

/**
 * Renderiza toda a galeria de imagens.
 */
function renderizarListaImagens() {
    listaImagens.innerHTML = "";

    arquivosImagens.forEach((arquivo, index) => {
        const card = document.createElement("article");
        card.className = "imagem-item";
        card.dataset.id = arquivo.id;
        card.draggable = true;

        card.innerHTML = `
            <div class="image-preview">
                <img src="${arquivo.previewUrl}" alt="${arquivo.name}">
            </div>

            <div class="image-meta">
                <p class="image-name">${arquivo.name}</p>
                <span class="image-type">${formatImageType(arquivo.type)} • posição ${index + 1}</span>
            </div>

            <div class="image-actions">
                <button class="icon-btn" type="button" data-action="up">↑</button>
                <button class="icon-btn" type="button" data-action="down">↓</button>
                <button class="icon-btn remove" type="button" data-action="remove">✕</button>
            </div>
        `;

        bindImageCardEvents(card);
        listaImagens.appendChild(card);
    });
}

/**
 * Converte MIME type em etiqueta mais amigável.
 */
function formatImageType(type) {
    if (type.includes("jpeg")) return "JPG";
    if (type.includes("png")) return "PNG";
    if (type.includes("webp")) return "WEBP";
    if (type.includes("gif")) return "GIF";
    if (type.includes("svg")) return "SVG";
    return "Imagem";
}

/* =========================
   EVENTOS DOS CARDS
========================= */

/**
 * Liga os eventos de cada card:
 * - mover cima
 * - mover baixo
 * - remover
 * - drag reorder
 */
function bindImageCardEvents(card) {
    const upBtn = card.querySelector('[data-action="up"]');
    const downBtn = card.querySelector('[data-action="down"]');
    const removeBtn = card.querySelector('[data-action="remove"]');

    upBtn.addEventListener("click", () => moverParaCima(card.dataset.id));
    downBtn.addEventListener("click", () => moverParaBaixo(card.dataset.id));
    removeBtn.addEventListener("click", () => removerArquivo(card.dataset.id));

    card.addEventListener("dragstart", dragStartReorder);
    card.addEventListener("dragover", dragOverReorder);
    card.addEventListener("drop", dropReorder);
    card.addEventListener("dragend", dragEndReorder);
}

/**
 * Move item para cima.
 */
function moverParaCima(id) {
    const indice = arquivosImagens.findIndex(item => item.id === id);
    if (indice > 0) {
        [arquivosImagens[indice], arquivosImagens[indice - 1]] =
        [arquivosImagens[indice - 1], arquivosImagens[indice]];
        renderizarListaImagens();
        updateUIState();
    }
}

/**
 * Move item para baixo.
 */
function moverParaBaixo(id) {
    const indice = arquivosImagens.findIndex(item => item.id === id);
    if (indice < arquivosImagens.length - 1) {
        [arquivosImagens[indice], arquivosImagens[indice + 1]] =
        [arquivosImagens[indice + 1], arquivosImagens[indice]];
        renderizarListaImagens();
        updateUIState();
    }
}

/**
 * Remove um item da lista.
 */
function removerArquivo(id) {
    const item = arquivosImagens.find(img => img.id === id);

    if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
    }

    arquivosImagens = arquivosImagens.filter(img => img.id !== id);

    renderizarListaImagens();
    updateUIState();
    showToast("Imagem removida da lista.", "info");
}

/**
 * Inverte a ordem atual.
 */
function inverterOrdem() {
    arquivosImagens.reverse();
    renderizarListaImagens();
    updateUIState();
    showToast("Ordem das imagens invertida.", "info");
}

/* =========================
   REORDENAÇÃO POR DRAG
========================= */
function dragStartReorder(event) {
    event.dataTransfer.setData("text/plain", event.currentTarget.dataset.id);
    event.currentTarget.classList.add("dragging");
}

function dragOverReorder(event) {
    event.preventDefault();

    const draggingElement = document.querySelector(".imagem-item.dragging");
    const currentElement = event.currentTarget;

    if (!draggingElement || draggingElement === currentElement) return;

    const rect = currentElement.getBoundingClientRect();
    const isAfterHalf = (event.clientY - rect.top) / rect.height > 0.5;

    const nextElement = isAfterHalf ? currentElement.nextElementSibling : currentElement;
    listaImagens.insertBefore(draggingElement, nextElement);
}

function dropReorder(event) {
    event.preventDefault();

    const orderedIds = Array.from(listaImagens.children).map(item => item.dataset.id);
    arquivosImagens = orderedIds
        .map(id => arquivosImagens.find(item => item.id === id))
        .filter(Boolean);

    renderizarListaImagens();
    updateUIState();
    showToast("Ordem atualizada.", "info");
}

function dragEndReorder(event) {
    event.currentTarget.classList.remove("dragging");
}

/* =========================
   CONVERSÃO PARA PDF
========================= */

/**
 * Converte a lista atual de imagens num único PDF.
 */
async function converterImagensParaPDF() {
    if (arquivosImagens.length === 0) {
        showToast("Nenhuma imagem selecionada.", "error");
        return;
    }

    try {
        const pdfDoc = await PDFLib.PDFDocument.create();

        for (const item of arquivosImagens) {
            const arrayBuffer = await item.file.arrayBuffer();
            let imagemEmbed;

            if (item.type === "image/jpeg" || item.type === "image/jpg") {
                imagemEmbed = await pdfDoc.embedJpg(arrayBuffer);
            } else if (item.type === "image/png") {
                imagemEmbed = await pdfDoc.embedPng(arrayBuffer);
            } else if (item.type === "image/webp") {
                showToast(`WEBP ainda não é suportado diretamente: ${item.name}`, "error");
                return;
            } else if (item.type === "image/svg+xml") {
                showToast(`SVG não é suportado diretamente: ${item.name}`, "error");
                return;
            } else {
                showToast(`Formato não suportado: ${item.name}`, "error");
                return;
            }

            const pagina = pdfDoc.addPage([imagemEmbed.width, imagemEmbed.height]);
            pagina.drawImage(imagemEmbed, {
                x: 0,
                y: 0,
                width: imagemEmbed.width,
                height: imagemEmbed.height
            });
        }

        const pdfBytes = await pdfDoc.save();
        baixar(pdfBytes, "imagens_convertidas.pdf", "application/pdf");
        showToast("PDF gerado com sucesso.", "success");

    } catch (error) {
        console.error("Erro ao converter imagens para PDF:", error);
        showToast("Erro ao converter imagens para PDF.", "error");
    }
}

/**
 * Faz download do ficheiro gerado.
 */
function baixar(dados, nomeArquivo, tipo) {
    const arquivo = new Blob([dados], { type: tipo });
    const url = URL.createObjectURL(arquivo);

    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

/* =========================
   EVENTOS GERAIS
========================= */
entradaImagens.addEventListener("change", (evento) => {
    handleFiles(evento.target.files);
    evento.target.value = "";
});

selectFilesBtn.addEventListener("click", () => entradaImagens.click());
botaoExportar.addEventListener("click", converterImagensParaPDF);
reverseOrderBtn.addEventListener("click", inverterOrdem);
clearBtn.addEventListener("click", limparLista);

/* Estado inicial */
updateUIState();