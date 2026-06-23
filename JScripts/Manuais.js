(function () {
    "use strict";

    const FLOW_TREE = {
        id: "root",
        label: "Gestão de Facturas Projecto Trivalor — Equipa Mailroom",
        root: true,
        expanded: true,
        children: [
            {
                id: "fases",
                label: "Fases Operacionais Mailroom",
                expanded: true,
                children: [
                    { id: "f1", label: "Recepção de Facturas" },
                    { id: "f2", label: "Envio de Facturas" },
                    { id: "f3", label: "Codificação de Facturas" },
                    { id: "f4", label: "Monitorização de Estados" },
                ],
            },
            {
                id: "recepcao",
                label: "Processo Recepção de Facturas",
                expanded: true,
                children: [
                    {
                        id: "mailbox",
                        label: "Acesso Mailbox",
                        expanded: true,
                        children: [
                            { id: "mb1", label: "Endereço: https://webmail.trivalor.pt", copy: "https://webmail.trivalor.pt", link: "https://webmail.trivalor.pt" },
                            { id: "mb2", label: "Utilizador: factfornpzero@trivalor.pt", copy: "factfornpzero@trivalor.pt" },
                            { id: "mb3", label: "Palavra-passe: Triv@PapelZer0", copy: "Triv@PapelZer0" },
                        ],
                    },
                    {
                        id: "tratamento",
                        label: "Tratamento E-mails",
                        expanded: true,
                        children: [
                            { id: "tr1", label: "Abrir e-mail" },
                            { id: "tr2", label: "Reencaminhar para robot.pzero@b2b.com.pt", copy: "robot.pzero@b2b.com.pt" },
                        ],
                    },
                    {
                        id: "arquivo",
                        label: "Arquivo E-mails",
                        expanded: true,
                        children: [
                            { id: "ar1", label: "Arquivar na pasta «Arquivar»" },
                        ],
                    },
                ],
            },
            {
                id: "codificacao",
                label: "Processo Codificação de Facturas (Validação)",
                expanded: true,
                children: [
                    {
                        id: "papelzero",
                        label: "Aplicativo PapelZero",
                        expanded: true,
                        children: [
                            { id: "pz1", label: "Endereço: https://papelzero.trivalor.pt/trivalor.php", copy: "https://papelzero.trivalor.pt/trivalor.php", link: "https://papelzero.trivalor.pt/trivalor.php" },
                            { id: "pz2", label: "Utilizador: A atribuir" },
                            { id: "pz3", label: "Password: A atribuir" },
                            { id: "pz4", label: "Pasta: Faturação" },
                            { id: "pz5", label: "Opção: Validar facturas" },
                        ],
                    },
                    {
                        id: "campos",
                        label: "Campos para Validação/Preenchimento",
                        expanded: true,
                        children: [
                            {
                                id: "cabecalho",
                                label: "Cabeçalho (Validação)",
                                expanded: true,
                                children: [
                                    { id: "c1", label: "NIF Fornecedor" },
                                    { id: "c2", label: "Nome Fornecedor" },
                                    { id: "c3", label: "NIF Empresa" },
                                    { id: "c4", label: "Nome Empresa" },
                                    { id: "c5", label: "País" },
                                    { id: "c6", label: "Tipo" },
                                    { id: "c7", label: "Data fatura" },
                                    { id: "c8", label: "Total S/IVA" },
                                ],
                            },
                            {
                                id: "geral",
                                label: "Separador Geral (Validação)",
                                expanded: false,
                                children: [
                                    { id: "g1", label: "Nº Fatura" },
                                    { id: "g2", label: "Quadro IVA" },
                                    { id: "g3", label: "IVA" },
                                    { id: "g4", label: "Total fatura" },
                                    { id: "g5", label: "Portes (colocar valor, se 0 colocar 0)" },
                                    { id: "g6", label: "PO (Começa sempre por 47)" },
                                ],
                            },
                            {
                                id: "outros",
                                label: "Separador Outros (Preenchimento)",
                                expanded: false,
                                children: [
                                    { id: "o1", label: "Categoria (OBS — Outros Bens e Serviços)" },
                                    { id: "o2", label: "Área" },
                                    {
                                        id: "workflow",
                                        label: "Workflow (DISTRIBUIÇÃO DE VALIDADOR)",
                                        expanded: false,
                                        children: [
                                            {
                                                id: "wf-cc",
                                                label: "Com Centro de Custo (CC)",
                                                expanded: false,
                                                children: [
                                                    { id: "wf1", label: "SINAL MAIS (491 — NORTE, 492 — SUL)" },
                                                    { id: "wf2", label: "ITAÚ (141 — SUL, 142/143 — NORTE)" },
                                                ],
                                            },
                                            {
                                                id: "wf-sem",
                                                label: "Sem Centro de Custo",
                                                expanded: false,
                                                children: [
                                                    { id: "wf3", label: "SUL — Coimbra, Castelo Branco, Leiria, Santarém, Lisboa, Portalegre, Setúbal, Évora, Beja, Faro, Ilhas" },
                                                    { id: "wf4", label: "NORTE — Aveiro, Viseu, Guarda, Porto, Braga, Vila Real, Bragança, Viana do Castelo" },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                id: "gastos",
                                label: "Separador Gastos (Preenchimento)",
                                expanded: false,
                                children: [
                                    { id: "ga1", label: "Botão Distribuição de gastos fornecedor" },
                                    {
                                        id: "cr",
                                        label: "Seleccionar Conta Razão (CR)",
                                        expanded: false,
                                        children: [
                                            {
                                                id: "solicitar-cr",
                                                label: "Solicitar CR (se não existir)",
                                                expanded: false,
                                                children: [
                                                    { id: "cr1", label: "Email SUL: henriqueta.pacheco@b2b.com.pt; teresa.rodrigues@b2b.com.pt", copy: "henriqueta.pacheco@b2b.com.pt; teresa.rodrigues@b2b.com.pt" },
                                                    { id: "cr2", label: "CC SUL: rui.henriques@trivalor.pt; rui.pardal@sinalmais.com.pt; pedro.gomes@sinalmais.com.pt", copy: "rui.henriques@trivalor.pt; rui.pardal@sinalmais.com.pt; pedro.gomes@sinalmais.com.pt" },
                                                    { id: "cr3", label: "Email NORTE: helena.soares@b2b.com.pt; teresa.rodrigues@b2b.com.pt", copy: "helena.soares@b2b.com.pt; teresa.rodrigues@b2b.com.pt" },
                                                    { id: "cr4", label: "CC NORTE: rui.henriques@trivalor.pt; rui.pardal@sinalmais.com.pt; pedro.gomes@sinalmais.com.pt", copy: "rui.henriques@trivalor.pt; rui.pardal@sinalmais.com.pt; pedro.gomes@sinalmais.com.pt" },
                                                ],
                                            },
                                        ],
                                    },
                                    { id: "ga2", label: "Botão Distribuição de transferência" },
                                    { id: "ga3", label: "Preencher Campo «C. custo» (se indicado na factura)" },
                                    { id: "ga4", label: "Campo «Texto SAP» (O que foi feito — Onde foi feito — Quando foi feito MM/AAAA)" },
                                    { id: "ga5", label: "Portes em linha separada (Conta Razão 62681000, Descritivo «Portes»)" },
                                ],
                            },
                        ],
                    },
                    { id: "finalizar", label: "Finalizar Factura (Clicar botão)" },
                ],
            },
        ],
    };

    const board = document.getElementById("manuaisBoard");
    const viewport = document.getElementById("manuaisViewport");
    const linesSvg = document.getElementById("manuaisLines");
    const copyToast = document.getElementById("copyToast");

    let scale = 0.82;
    let panX = 0;
    let panY = 0;
    let toastTimer = null;
    let expandedState = {};

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function showToast(message) {
        if (!copyToast) return;
        copyToast.textContent = message;
        copyToast.hidden = false;
        copyToast.classList.add("visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            copyToast.classList.remove("visible");
            copyToast.hidden = true;
        }, 2200);
    }

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            showToast("Copiado para a área de transferência.");
            return true;
        } catch {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand("copy");
            document.body.removeChild(ta);
            if (ok) showToast("Copiado para a área de transferência.");
            return ok;
        }
    }

    function initExpandedState(node) {
        expandedState[node.id] = node.expanded !== false;
        (node.children || []).forEach(initExpandedState);
    }

    function isExpanded(id) {
        return expandedState[id] !== false;
    }

    const ANIM_MS = 520;
    let linesRaf = null;

    function copyIconSvg() {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    }

    function linkIconSvg() {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 00-7.07-7.07L10 5"/><path d="M14 11a5 5 0 00-7.07 0L5.52 12.41a5 5 0 007.07 7.07L14 19"/></svg>`;
    }

    function renderNode(node) {
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        const expanded = hasChildren && isExpanded(node.id);
        const chevron = hasChildren
            ? `<span class="mm-node__chevron" aria-hidden="true">›</span>`
            : "";

        const actions = [];
        if (node.copy) {
            actions.push(`<button type="button" class="mm-copy-btn" data-copy="${escapeHtml(node.copy)}" title="Copiar" aria-label="Copiar">${copyIconSvg()}</button>`);
        }
        if (node.link) {
            actions.push(`<a class="mm-link-btn" href="${escapeHtml(node.link)}" target="_blank" rel="noopener noreferrer" title="Abrir link" aria-label="Abrir link">${linkIconSvg()}</a>`);
        }

        const nodeClasses = [
            "mm-node",
            node.root ? "mm-node--root" : "",
            hasChildren ? "mm-node--toggle" : "",
            hasChildren && expanded ? "mm-node--expanded" : "",
        ].filter(Boolean).join(" ");

        const nodeHtml = `
            <div class="mm-node-wrap" data-node-id="${escapeHtml(node.id)}">
                <div class="${nodeClasses}" ${hasChildren ? `data-toggle="${escapeHtml(node.id)}" role="button" tabindex="0" aria-expanded="${expanded ? "true" : "false"}"` : ""}>
                    ${chevron}
                    <span class="mm-node__label">${escapeHtml(node.label)}</span>
                    ${actions.length ? `<span class="mm-node__actions">${actions.join("")}</span>` : ""}
                </div>
            </div>`;

        if (!hasChildren) {
            return `<div class="mm-branch">${nodeHtml}</div>`;
        }

        const childrenHtml = `<div class="mm-children-outer${expanded ? " is-expanded" : ""}" data-parent="${escapeHtml(node.id)}">
                <div class="mm-children-inner">
                    <div class="mm-children">${node.children.map(renderNode).join("")}</div>
                </div>
            </div>`;

        return `<div class="mm-branch">${nodeHtml}${childrenHtml}</div>`;
    }

    function renderTree() {
        return `<div class="mm-tree">${renderNode(FLOW_TREE)}</div>`;
    }

    function animateLines(durationMs = ANIM_MS) {
        const start = performance.now();

        if (linesRaf) cancelAnimationFrame(linesRaf);

        function frame(now) {
            drawLines();
            if (now - start < durationMs) {
                linesRaf = requestAnimationFrame(frame);
            } else {
                linesRaf = null;
                drawLines();
            }
        }

        linesRaf = requestAnimationFrame(frame);
    }

    function isOuterChainVisible(outer) {
        let el = outer;
        while (el && el !== board) {
            if (el.classList.contains("mm-children-outer")) {
                if (!el.classList.contains("is-expanded") || el.classList.contains("is-suppressed")) {
                    return false;
                }
            }
            el = el.parentElement;
        }
        return true;
    }

    function setDescendantSuppression(outer, suppressed) {
        if (!outer) return;
        outer.querySelectorAll(".mm-children-outer").forEach((el) => {
            el.classList.toggle("is-suppressed", suppressed);
        });
    }

    function updateToggleUi(id, expanded) {
        const wrap = board.querySelector(`.mm-children-outer[data-parent="${CSS.escape(id)}"]`);
        const toggleBtn = board.querySelector(`[data-toggle="${CSS.escape(id)}"]`);

        if (wrap) {
            wrap.classList.toggle("is-expanded", expanded);
            setDescendantSuppression(wrap, !expanded);
        }
        if (toggleBtn) {
            toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
            toggleBtn.classList.toggle("mm-node--expanded", expanded);
        }
    }

    function toggleNode(id) {
        const next = !isExpanded(id);
        expandedState[id] = next;
        updateToggleUi(id, next);
        animateLines(ANIM_MS);
    }

    function applyTransform() {
        board.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    }

    function centerBoard() {
        if (!viewport || !board) return;
        const vw = viewport.clientWidth;
        const vh = viewport.clientHeight;
        const bw = board.offsetWidth * scale;
        const bh = board.offsetHeight * scale;
        panX = Math.max(24, (vw - bw) / 2);
        panY = Math.max(24, (vh - bh) / 2);
        applyTransform();
    }

    function drawLines() {
        if (!linesSvg || !board || !viewport) return;

        const vr = viewport.getBoundingClientRect();
        linesSvg.setAttribute("width", String(vr.width));
        linesSvg.setAttribute("height", String(vr.height));
        linesSvg.innerHTML = "";

        board.querySelectorAll(".mm-children-outer.is-expanded").forEach((outer) => {
            if (!isOuterChainVisible(outer)) return;
            const parentId = outer.dataset.parent;
            const childCol = outer.querySelector(".mm-children");
            const parentWrap = board.querySelector(`[data-node-id="${parentId}"]`);
            if (!parentWrap || !childCol) return;

            const parentNode = parentWrap.querySelector(".mm-node");
            const branches = childCol.querySelectorAll(":scope > .mm-branch > .mm-node-wrap");

            branches.forEach((childWrap) => {
                const childNode = childWrap.querySelector(".mm-node");
                if (!parentNode || !childNode) return;

                const pr = parentNode.getBoundingClientRect();
                const cr = childNode.getBoundingClientRect();

                const x1 = pr.right - vr.left;
                const y1 = pr.top + pr.height / 2 - vr.top;
                const x2 = cr.left - vr.left;
                const y2 = cr.top + cr.height / 2 - vr.top;
                const cx = x1 + (x2 - x1) * 0.45;

                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`);
                path.setAttribute("fill", "none");
                path.setAttribute("stroke", "#6eb8a0");
                path.setAttribute("stroke-width", "2");
                path.setAttribute("opacity", "0.85");
                linesSvg.appendChild(path);
            });
        });
    }

    function render() {
        if (!board) return;
        board.innerHTML = renderTree();
        applyTransform();
        requestAnimationFrame(drawLines);
    }

    function setupPan() {
        if (!viewport) return;

        let dragging = false;
        let startX = 0;
        let startY = 0;
        let originX = 0;
        let originY = 0;

        viewport.addEventListener("mousedown", (e) => {
            if (e.target.closest("[data-toggle], .mm-copy-btn, .mm-link-btn")) return;
            dragging = true;
            viewport.classList.add("is-dragging");
            startX = e.clientX;
            startY = e.clientY;
            originX = panX;
            originY = panY;
        });

        window.addEventListener("mousemove", (e) => {
            if (!dragging) return;
            panX = originX + (e.clientX - startX);
            panY = originY + (e.clientY - startY);
            applyTransform();
            drawLines();
        });

        window.addEventListener("mouseup", () => {
            dragging = false;
            viewport.classList.remove("is-dragging");
        });

        viewport.addEventListener("wheel", (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.06 : 0.06;
            scale = Math.min(1.4, Math.max(0.35, scale + delta));
            applyTransform();
            drawLines();
        }, { passive: false });
    }

    function setupZoom() {
        const zoomIn = document.getElementById("zoomIn");
        const zoomOut = document.getElementById("zoomOut");
        const zoomReset = document.getElementById("zoomReset");

        zoomIn?.addEventListener("click", () => {
            scale = Math.min(1.4, scale + 0.1);
            applyTransform();
            drawLines();
        });

        zoomOut?.addEventListener("click", () => {
            scale = Math.max(0.35, scale - 0.1);
            applyTransform();
            drawLines();
        });

        zoomReset?.addEventListener("click", () => {
            scale = 0.82;
            centerBoard();
            drawLines();
        });
    }

    function setupInteractions() {
        board?.addEventListener("click", (e) => {
            const toggle = e.target.closest("[data-toggle]");
            if (toggle) {
                e.preventDefault();
                toggleNode(toggle.dataset.toggle);
                return;
            }

            const copyBtn = e.target.closest("[data-copy]");
            if (copyBtn?.dataset.copy) {
                e.preventDefault();
                copyText(copyBtn.dataset.copy);
            }
        });

        board?.addEventListener("keydown", (e) => {
            const toggle = e.target.closest("[data-toggle]");
            if (!toggle) return;
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleNode(toggle.dataset.toggle);
            }
        });

        window.addEventListener("resize", () => {
            drawLines();
        });
    }

    function init() {
        initExpandedState(FLOW_TREE);
        render();
        centerBoard();
        setupPan();
        setupZoom();
        setupInteractions();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
