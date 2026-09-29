function validateNumeric(input) {
    return /^[0-9]*$/.test(input);
}

function validateAlphanumeric(input) {
    return /^[a-zA-Z0-9]*$/.test(input);
}

function validateAlphabetic(input) {
    return /^[a-zA-Z]*$/.test(input);
}

function limitCharacters(input, maxLength) {
    return input.slice(0, maxLength);
}

/** Limpa valor colado/digitado (aceita vírgula, espaços, €) e devolve float. */
function parseDecimalInput(rawValue) {
    if (typeof rawValue !== "string") rawValue = String(rawValue || "");
    const cleaned = rawValue
        .replace(/€/g, "")
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}(\D|$))/g, "")
        .replace(",", ".");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
}

function setIvaRateBadge(badgeId, percentLabel) {
    const badge = document.getElementById(badgeId);
    if (badge) badge.textContent = percentLabel;
}

function updateIVARates() {
    const espacoFiscal = document.getElementById("espaco_fiscal").value;
    let baseIsenta = document.getElementById("base_isenta");
    let baseReduzida = document.getElementById("base_reduzida");
    let baseIntermedia = document.getElementById("base_intermedia");
    let baseNormal = document.getElementById("base_normal");

    let rates = { isenta: "0%", reduzida: "—", intermedia: "—", normal: "—" };

    switch (espacoFiscal) {
        case "PT":
            rates = { isenta: "0%", reduzida: "6%", intermedia: "13%", normal: "23%" };
            baseIsenta.placeholder = "Base isenta (0%)";
            baseReduzida.placeholder = "Base reduzida (6%)";
            baseIntermedia.placeholder = "Base intermédia (13%)";
            baseNormal.placeholder = "Base normal (23%)";
            break;
        case "PT-AC":
            rates = { isenta: "0%", reduzida: "4%", intermedia: "9%", normal: "16%" };
            baseIsenta.placeholder = "Base isenta (0%)";
            baseReduzida.placeholder = "Base reduzida (4%)";
            baseIntermedia.placeholder = "Base intermédia (9%)";
            baseNormal.placeholder = "Base normal (16%)";
            break;
        case "PT-MA":
            rates = { isenta: "0%", reduzida: "4%", intermedia: "12%", normal: "22%" };
            baseIsenta.placeholder = "Base isenta (0%)";
            baseReduzida.placeholder = "Base reduzida (4%)";
            baseIntermedia.placeholder = "Base intermédia (12%)";
            baseNormal.placeholder = "Base normal (22%)";
            break;
        case "INT":
        case "EU":
            rates = { isenta: "0%", reduzida: "—", intermedia: "—", normal: "—" };
            baseIsenta.placeholder = "Base isenta (0%)";
            baseReduzida.placeholder = "Base reduzida";
            baseIntermedia.placeholder = "Base intermédia";
            baseNormal.placeholder = "Base normal";
            break;
        default:
            rates = { isenta: "0%", reduzida: "—", intermedia: "—", normal: "—" };
            baseIsenta.placeholder = "Base isenta (0%)";
            baseReduzida.placeholder = "Base reduzida";
            baseIntermedia.placeholder = "Base intermédia";
            baseNormal.placeholder = "Base normal";
            break;
    }

    setIvaRateBadge("badge_isenta", rates.isenta);
    setIvaRateBadge("badge_reduzida", rates.reduzida);
    setIvaRateBadge("badge_intermedia", rates.intermedia);
    setIvaRateBadge("badge_normal", rates.normal);
}

function updateTaxBaseFieldsVisibility() {
    const paisEl = document.getElementById("pais");
    const espacoFiscalEl = document.getElementById("espaco_fiscal");

    const pais = (paisEl?.value || "").toUpperCase();
    const espacoFiscal = (espacoFiscalEl?.value || "").toUpperCase();

    /* EU+EU e INT+INT: só base isenta (compras intracomunitárias / internacional sem IVA nacional). */
    const showOnlyIsenta =
        (pais === "EU" && espacoFiscal === "EU") ||
        (pais === "INT" && espacoFiscal === "INT");

    const baseIsenta = document.getElementById("base_isenta");
    const baseReduzida = document.getElementById("base_reduzida");
    const baseIntermedia = document.getElementById("base_intermedia");
    const baseNormal = document.getElementById("base_normal");
    const impostoSelo = document.getElementById("imposto_selo");

    const fieldsToHide = [baseReduzida, baseIntermedia, baseNormal, impostoSelo].filter(Boolean);

    if (showOnlyIsenta) {
        if (baseIsenta) baseIsenta.style.display = "";
        fieldsToHide.forEach((el) => {
            el.style.display = "none";
            el.value = "";
        });
        return;
    }

    // Default: show all fields
    [baseIsenta, ...fieldsToHide].filter(Boolean).forEach((el) => {
        el.style.display = "";
    });
}

/**
 * Mantém País/Regime e Espaço fiscal coerentes:
 * — EU / INT: mesmo valor nos dois campos;
 * — PT (Continental e ilhas): se o espaço ainda for EU ou INT, assume Continental (PT).
 */
function syncEspacoFromPais() {
    const paisEl = document.getElementById("pais");
    const espacoEl = document.getElementById("espaco_fiscal");
    if (!paisEl || !espacoEl) return;
    const p = (paisEl.value || "").toUpperCase();
    const ex = (espacoEl.value || "").toUpperCase();
    if (p === "EU" || p === "INT") {
        espacoEl.value = p;
    } else if (p === "PT" && (ex === "EU" || ex === "INT")) {
        espacoEl.value = "PT";
    }
    syncFiscalSelectDisplays();
}

/** Continental / Açores / Madeira → País/Regime em Continental e ilhas (PT); EU/INT espelham o espaço. */
function syncPaisFromEspaco() {
    const paisEl = document.getElementById("pais");
    const espacoEl = document.getElementById("espaco_fiscal");
    if (!paisEl || !espacoEl) return;
    const e = (espacoEl.value || "").toUpperCase();
    if (e === "EU" || e === "INT") {
        paisEl.value = e;
    } else if (e === "PT" || e === "PT-AC" || e === "PT-MA") {
        paisEl.value = "PT";
    }
    syncFiscalSelectDisplays();
}

const FISCAL_FLAG_PT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" aria-hidden="true"><rect width="600" height="400" fill="#FF0000"/><rect width="240" height="400" fill="#006600"/><circle cx="240" cy="200" r="86" fill="#FFCC00"/><circle cx="240" cy="200" r="70" fill="none" stroke="#CC0000" stroke-width="8"/><path d="M214 162h52v46c0 24-26 40-26 40s-26-16-26-40z" fill="#fff" stroke="#003399" stroke-width="3"/><rect x="214" y="162" width="52" height="16" fill="#006600"/><rect x="214" y="194" width="26" height="20" fill="#FF0000"/><circle cx="240" cy="214" r="6" fill="#003399"/></svg>';
const FISCAL_FLAG_EU = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" aria-hidden="true"><rect width="300" height="200" fill="#003399"/><polygon points="150.00,30.00 151.88,35.41 157.61,35.53 153.04,38.99 154.70,44.47 150.00,41.20 145.30,44.47 146.96,38.99 142.39,35.53 148.12,35.41" fill="#FC0"/><polygon points="181.00,38.31 182.88,43.72 188.61,43.83 184.04,47.30 185.70,52.78 181.00,49.51 176.30,52.78 177.96,47.30 173.39,43.83 179.12,43.72" fill="#FC0"/><polygon points="203.69,61.00 205.57,66.41 211.30,66.53 206.74,69.99 208.40,75.47 203.69,72.20 198.99,75.47 200.65,69.99 196.09,66.53 201.81,66.41" fill="#FC0"/><polygon points="212.00,92.00 213.88,97.41 219.61,97.53 215.04,100.99 216.70,106.47 212.00,103.20 207.30,106.47 208.96,100.99 204.39,97.53 210.12,97.41" fill="#FC0"/><polygon points="203.69,123.00 205.57,128.41 211.30,128.53 206.74,131.99 208.40,137.47 203.69,134.20 198.99,137.47 200.65,131.99 196.09,128.53 201.81,128.41" fill="#FC0"/><polygon points="181.00,145.69 182.88,151.10 188.61,151.22 184.04,154.68 185.70,160.17 181.00,156.89 176.30,160.17 177.96,154.68 173.39,151.22 179.12,151.10" fill="#FC0"/><polygon points="150.00,154.00 151.88,159.41 157.61,159.53 153.04,162.99 154.70,168.47 150.00,165.20 145.30,168.47 146.96,162.99 142.39,159.53 148.12,159.41" fill="#FC0"/><polygon points="119.00,145.69 120.88,151.10 126.61,151.22 122.04,154.68 123.70,160.17 119.00,156.89 114.30,160.17 115.96,154.68 111.39,151.22 117.12,151.10" fill="#FC0"/><polygon points="96.31,123.00 98.19,128.41 103.91,128.53 99.35,131.99 101.01,137.47 96.31,134.20 91.60,137.47 93.26,131.99 88.70,128.53 94.43,128.41" fill="#FC0"/><polygon points="88.00,92.00 89.88,97.41 95.61,97.53 91.04,100.99 92.70,106.47 88.00,103.20 83.30,106.47 84.96,100.99 80.39,97.53 86.12,97.41" fill="#FC0"/><polygon points="96.31,61.00 98.19,66.41 103.91,66.53 99.35,69.99 101.01,75.47 96.31,72.20 91.60,75.47 93.26,69.99 88.70,66.53 94.43,66.41" fill="#FC0"/><polygon points="119.00,38.31 120.88,43.72 126.61,43.83 122.04,47.30 123.70,52.78 119.00,49.51 114.30,52.78 115.96,47.30 111.39,43.83 117.12,43.72" fill="#FC0"/></svg>';
const FISCAL_FLAG_INT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" aria-hidden="true"><rect width="60" height="40" fill="#F8FAFC"/><path d="M8 10h44v20H8z" fill="none" stroke="#94A3B8" stroke-width="2"/></svg>';

function fiscalFlagMarkup(value) {
    const v = (value || "").toUpperCase();
    if (v === "PT" || v === "PT-AC" || v === "PT-MA") return FISCAL_FLAG_PT;
    if (v === "EU") return FISCAL_FLAG_EU;
    if (v === "INT") return FISCAL_FLAG_INT;
    return "";
}

function syncSelectPillDisplay(selectId, displayMainId, emptyLabel) {
    const el = document.getElementById(selectId);
    const mainEl = document.getElementById(displayMainId);
    if (!el || !mainEl) return;

    const v = el.value || "";
    const flagEl = document.getElementById(selectId + "_flag");
    const markup = fiscalFlagMarkup(v);
    if (flagEl) {
        flagEl.innerHTML = markup;
        flagEl.hidden = !markup;
    }

    const menu = document.getElementById(selectId + "_menu");
    if (menu) {
        menu.querySelectorAll("[data-value]").forEach((btn) => {
            const on = btn.getAttribute("data-value") === v;
            btn.classList.toggle("is-selected", on);
            btn.setAttribute("aria-selected", on ? "true" : "false");
        });
    }

    if (!v) {
        mainEl.textContent = emptyLabel || "Selecione";
        return;
    }

    const opt = el.selectedOptions[0];
    const raw = (opt && opt.textContent) ? opt.textContent.trim() : "";
    mainEl.textContent = raw || v;
}

function closeFiscalFlagMenus() {
    document.querySelectorAll(".fiscal-flag-menu").forEach((menu) => {
        menu.hidden = true;
    });
    document.querySelectorAll(".panel-card.is-flag-open").forEach((card) => {
        card.classList.remove("is-flag-open");
    });
    document.querySelectorAll(".fiscal-flag-select select").forEach((sel) => {
        sel.setAttribute("aria-expanded", "false");
    });
}

function openFiscalFlagMenu(wrap, menu, select) {
    closeFiscalFlagMenus();
    menu.hidden = false;
    menu.classList.remove("is-up");
    const card = wrap.closest(".panel-card");
    if (card) card.classList.add("is-flag-open");
    if (select) select.setAttribute("aria-expanded", "true");

    const spaceBelow = window.innerHeight - wrap.getBoundingClientRect().bottom;
    if (spaceBelow < menu.offsetHeight + 16) menu.classList.add("is-up");

    const current = menu.querySelector(".is-selected") || menu.querySelector(".fiscal-flag-option");
    menu.querySelectorAll(".is-active").forEach((el) => el.classList.remove("is-active"));
    if (current) {
        current.classList.add("is-active");
        current.focus();
    }
}

function moveFiscalFlagHighlight(menu, direction) {
    const items = Array.from(menu.querySelectorAll(".fiscal-flag-option"));
    if (!items.length) return;
    const active = menu.querySelector(".is-active");
    let index = items.indexOf(active);
    if (index < 0) index = direction > 0 ? -1 : 0;
    index = (index + direction + items.length) % items.length;
    items.forEach((el) => el.classList.remove("is-active"));
    items[index].classList.add("is-active");
    items[index].focus();
}

function initFiscalFlagMenus() {
    ["espaco_fiscal", "pais"].forEach((id) => {
        const select = document.getElementById(id);
        if (!select) return;
        const wrap = select.closest(".fiscal-flag-select");
        if (!wrap || wrap.dataset.flagReady === "1") return;
        wrap.dataset.flagReady = "1";

        const menu = document.createElement("div");
        menu.id = id + "_menu";
        menu.className = "fiscal-flag-menu";
        menu.hidden = true;
        menu.setAttribute("role", "listbox");
        menu.setAttribute("aria-label", select.getAttribute("aria-label") || "Opções");

        Array.from(select.options).forEach((opt) => {
            if (!opt.value) return;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "fiscal-flag-option";
            btn.setAttribute("role", "option");
            btn.dataset.value = opt.value;

            const flag = document.createElement("span");
            flag.className = "fiscal-flag";
            flag.innerHTML = fiscalFlagMarkup(opt.value);
            flag.setAttribute("aria-hidden", "true");

            const label = document.createElement("span");
            label.textContent = (opt.textContent || "").trim();

            btn.appendChild(flag);
            btn.appendChild(label);
            btn.addEventListener("click", (event) => {
                event.preventDefault();
                select.value = opt.value;
                select.dispatchEvent(new Event("change", { bubbles: true }));
                closeFiscalFlagMenus();
                select.focus();
            });
            menu.appendChild(btn);
        });

        wrap.appendChild(menu);

        select.addEventListener("mousedown", (event) => {
            event.preventDefault();
            if (menu.hidden) openFiscalFlagMenu(wrap, menu, select);
            else {
                closeFiscalFlagMenus();
                select.focus();
            }
        });

        select.addEventListener("keydown", (event) => {
            const openKeys = ["ArrowDown", "ArrowUp", "Enter", " "];
            if (menu.hidden && (openKeys.includes(event.key) || (event.altKey && event.key === "ArrowDown"))) {
                event.preventDefault();
                openFiscalFlagMenu(wrap, menu, select);
            }
        });

        menu.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                closeFiscalFlagMenus();
                select.focus();
                return;
            }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                moveFiscalFlagHighlight(menu, event.key === "ArrowDown" ? 1 : -1);
                return;
            }
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                const current = menu.querySelector(".is-active") || menu.querySelector(".is-selected");
                if (current) current.click();
            }
        });
    });

    if (!document.documentElement.dataset.fiscalFlagDismiss) {
        document.documentElement.dataset.fiscalFlagDismiss = "1";
        document.addEventListener("mousedown", (event) => {
            if (event.target.closest(".fiscal-flag-select")) return;
            closeFiscalFlagMenus();
        });
    }
}

function syncFiscalSelectDisplays() {
    syncSelectPillDisplay("espaco_fiscal", "espaco_fiscal_display_main");
    syncSelectPillDisplay("pais", "pais_display_main");
}

function syncTipologiaSelectAppearance() {
    const el = document.getElementById("tipologia");
    const mainEl = document.getElementById("tipologia_display_main");
    const pillEl = document.getElementById("tipologia_sigla_pill");
    if (!el) return;

    const v = el.value || "";
    if (!v) {
        if (mainEl) mainEl.textContent = "Selecione";
        if (pillEl) {
            pillEl.hidden = true;
            pillEl.textContent = "";
            pillEl.removeAttribute("data-tipologia");
        }
        return;
    }

    const opt = el.selectedOptions[0];
    const raw = (opt && opt.textContent) ? opt.textContent.trim() : "";
    const parsed = raw.match(/^\s*([A-Z0-9-]+)\s*\(([^)]+)\)\s*$/i);
    const desc = parsed ? parsed[2].trim() : raw;

    if (mainEl) mainEl.textContent = desc || raw || v;
    if (pillEl) {
        pillEl.hidden = false;
        pillEl.textContent = v;
        pillEl.setAttribute("data-tipologia", v);
    }
}

/* ── Retenção na fonte (RV) ────────────────────────────────── */
let rvRetencaoAtiva = false;

function toggleRvRetencaoBlock() {
    const tipologiaEl = document.getElementById("tipologia");
    const block = document.getElementById("rvRetencaoBlock");
    if (!block) return;
    const isRV = tipologiaEl && tipologiaEl.value === "RV";
    block.hidden = !isRV;
    if (!isRV) {
        rvRetencaoAtiva = false;
        const fields = document.getElementById("rvRetencaoFields");
        if (fields) fields.hidden = true;
        document.querySelectorAll(".rv-toggle-btn").forEach(b => b.classList.remove("rv-toggle-active"));
    }
}

function setupRvRetencaoListeners() {
    const btnSim = document.getElementById("rvRetSim");
    const btnNao = document.getElementById("rvRetNao");
    const fields = document.getElementById("rvRetencaoFields");

    function setActive(sim) {
        rvRetencaoAtiva = sim;
        if (btnSim) btnSim.classList.toggle("rv-toggle-active", sim);
        if (btnNao) btnNao.classList.toggle("rv-toggle-active", !sim);
        if (fields) fields.hidden = !sim;
        if (!sim) {
            const valEl = document.getElementById("retencao_valor");
            const tipoEl = document.getElementById("retencao_tipo");
            if (valEl) valEl.value = "";
            if (tipoEl) tipoEl.value = "";
        }
    }

    if (btnSim) btnSim.addEventListener("click", () => setActive(true));
    if (btnNao) btnNao.addEventListener("click", () => setActive(false));
}

// event listeners
document.addEventListener("DOMContentLoaded", function () {
    const espacoFiscalEl = document.getElementById("espaco_fiscal");
    const paisEl = document.getElementById("pais");
    const tipologiaEl = document.getElementById("tipologia");

    if (tipologiaEl) {
        tipologiaEl.addEventListener("change", function () {
            syncTipologiaSelectAppearance();
            toggleRvRetencaoBlock();
        });
        syncTipologiaSelectAppearance();
        toggleRvRetencaoBlock();
    }

    if (espacoFiscalEl) {
        espacoFiscalEl.addEventListener("change", function () {
            syncPaisFromEspaco();
            syncFiscalSelectDisplays();
            updateIVARates();
            updateTaxBaseFieldsVisibility();
        });
    }

    if (paisEl) {
        paisEl.addEventListener("change", function () {
            syncEspacoFromPais();
            syncFiscalSelectDisplays();
            updateIVARates();
            updateTaxBaseFieldsVisibility();
        });
    }

    setupRvRetencaoListeners();
    initFiscalFlagMenus();

    // Inicializa placeholders e visibilidade
    syncEspacoFromPais();
    syncPaisFromEspaco();
    syncFiscalSelectDisplays();
    updateIVARates();
    updateTaxBaseFieldsVisibility();
});

let qrPopupTimeout;
/** Timeout da limpeza do formulário após gerar QR — cancelável ao reutilizar */
let clearFormTimeout = null;
/** Backup da última string fiscal gerada */
let lastGeneratedQrString = "";
const LAST_QR_STORAGE_KEY = "trivalor_last_qr_string";

function loadLastQrFromStorage() {
    try {
        const stored = sessionStorage.getItem(LAST_QR_STORAGE_KEY);
        if (stored && stored.trim()) {
            lastGeneratedQrString = stored.trim();
            return lastGeneratedQrString;
        }
    } catch (e) {
        /* sessionStorage pode falhar em modo privado restrito */
    }
    return lastGeneratedQrString || "";
}

function saveLastQrToStorage(qrString) {
    const value = String(qrString || "").trim();
    if (!value) return;
    lastGeneratedQrString = value;
    try {
        sessionStorage.setItem(LAST_QR_STORAGE_KEY, value);
    } catch (e) {
        /* ignore */
    }
}

function getQrStringForReuse() {
    const qrDataEl = document.getElementById("qr_data");
    const fromBox = qrDataEl ? String(qrDataEl.value || "").trim() : "";
    if (fromBox) return fromBox;
    if (lastGeneratedQrString && String(lastGeneratedQrString).trim()) {
        return String(lastGeneratedQrString).trim();
    }
    return loadLastQrFromStorage();
}

/**
 * Parte a string fiscal do QR (segmentos KEY:VAL separados por * ou ;).
 * @param {string} str
 * @returns {Record<string, string>}
 */
function parsePortugueseATQRString(str) {
    const map = {};
    if (!str || typeof str !== "string") return map;
    const trimmed = str.trim();
    const delim = trimmed.includes("*") ? "*" : trimmed.includes(";") ? ";" : null;
    if (!delim) return map;
    const parts = trimmed.split(delim);
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;
        const colon = part.indexOf(":");
        if (colon <= 0) continue;
        const key = part.slice(0, colon).trim();
        const value = part.slice(colon + 1);
        if (key) map[key] = value;
    }
    return map;
}

/** Campo F (AAAAMMDD) válido: 8 dígitos após limpar não-dígitos. */
function isQrDateFieldPresentAndValid(fValue) {
    if (fValue == null || String(fValue).trim() === "") return false;
    const digits = String(fValue).replace(/\D/g, "");
    return digits.length === 8;
}

/** Campo F (AAAAMMDD) → DD/MM/AAAA, ou «—» se inválido/em falta. */
function formatQrDateToDisplay(fValue) {
    if (!isQrDateFieldPresentAndValid(fValue)) return "—";
    const digits = String(fValue).replace(/\D/g, "");
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);
    return `${d}/${m}/${y}`;
}

function isQrNifSummaryMissing(val) {
    if (val == null) return true;
    const s = String(val).trim();
    return s === "" || s === "0";
}

function isQrTotalSummaryMissing(oValue) {
    if (oValue == null || String(oValue).trim() === "") return true;
    const n = parseFloat(String(oValue).replace(",", "."));
    return !Number.isFinite(n);
}

/** Exibe o total (campo O) com separadores pt-PT quando for número. */
function formatQrTotalDisplay(oValue) {
    if (isQrTotalSummaryMissing(oValue)) return "—";
    const n = parseFloat(String(oValue).replace(",", "."));
    return `${n.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} €`;
}

function setQrSummaryPanelHighlight(panel, state) {
    if (!panel) return;
    panel.classList.remove("qr-summary-card--incomplete", "qr-summary-card--complete");
    if (state === "incomplete") panel.classList.add("qr-summary-card--incomplete");
    else if (state === "complete") panel.classList.add("qr-summary-card--complete");
}

function updateQrSummaryFromString(qrString) {
    const panel = document.getElementById("qrSummaryPanel");
    const alertsEl = document.getElementById("qr_summary_alerts");
    const elV = document.getElementById("qr_sum_nif_vendedor");
    const elE = document.getElementById("qr_sum_nif_empresa");
    const elD = document.getElementById("qr_sum_data");
    const elT = document.getElementById("qr_sum_total");
    const dash = "—";
    const trimmed = qrString && typeof qrString === "string" ? qrString.trim() : "";

    if (!trimmed) {
        setQrSummaryPanelHighlight(panel, "idle");
        if (alertsEl) {
            alertsEl.hidden = true;
            alertsEl.replaceChildren();
        }
        if (elV) elV.textContent = dash;
        if (elE) elE.textContent = dash;
        if (elD) elD.textContent = dash;
        if (elT) elT.textContent = dash;
        return;
    }

    const map = parsePortugueseATQRString(trimmed);

    if (elV) elV.textContent = isQrNifSummaryMissing(map.A) ? dash : map.A;
    if (elE) elE.textContent = isQrNifSummaryMissing(map.B) ? dash : map.B;
    if (elD) elD.textContent = formatQrDateToDisplay(map.F);
    if (elT) elT.textContent = isQrTotalSummaryMissing(map.O) ? dash : formatQrTotalDisplay(map.O);

    const alerts = [];
    if (isQrNifSummaryMissing(map.A)) {
        alerts.push("NIF DO VENDEDOR NÃO PREENCHIDO. VERIFIQUE O QR CODE…");
    }
    if (isQrNifSummaryMissing(map.B)) {
        alerts.push("NIF DA EMPRESA NÃO PREENCHIDO. VERIFIQUE O QR CODE…");
    }
    if (!isQrDateFieldPresentAndValid(map.F)) {
        alerts.push("DATA NÃO PREENCHIDA. VERIFIQUE O QR CODE…");
    }
    if (isQrTotalSummaryMissing(map.O)) {
        alerts.push("VALOR TOTAL NÃO PREENCHIDO. VERIFIQUE O QR CODE…");
    }

    setQrSummaryPanelHighlight(panel, alerts.length ? "incomplete" : "complete");

    if (alertsEl) {
        alertsEl.replaceChildren();
        if (alerts.length) {
            alerts.forEach((text) => {
                const p = document.createElement("p");
                p.className = "qr-summary-alert";
                p.textContent = text;
                alertsEl.appendChild(p);
            });
            alertsEl.hidden = false;
        } else {
            alertsEl.hidden = true;
        }
    }
}

function clearQrGenerateErrors() {
    const box = document.getElementById("qr_generate_errors");
    if (!box) return;
    box.hidden = true;
    box.replaceChildren();
    document.querySelectorAll(".field-group.is-invalid").forEach((el) => {
        el.classList.remove("is-invalid");
    });
}

function showQrGenerateErrors(messages, fieldIds) {
    const box = document.getElementById("qr_generate_errors");
    if (!box) return;

    box.replaceChildren();

    const title = document.createElement("p");
    title.className = "qr-generate-errors__title";
    title.textContent = "Não foi possível gerar o QR. Preencha:";
    box.appendChild(title);

    messages.forEach((text) => {
        const p = document.createElement("p");
        p.className = "qr-generate-errors__item";
        p.textContent = "• " + text;
        box.appendChild(p);
    });

    box.hidden = false;

    document.querySelectorAll(".field-group.is-invalid").forEach((el) => {
        el.classList.remove("is-invalid");
    });
    (fieldIds || []).forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        const group = input.closest(".field-group");
        if (group) group.classList.add("is-invalid");
    });

    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function isRequiredFieldEmpty(value) {
    return !String(value || "").trim();
}

function validateRequiredFieldsForQr() {
    const nifVendedor = document.getElementById("nif_vendedor").value;
    const nifEmpresa = document.getElementById("nif_empresa").value;
    const data = document.getElementById("data").value;
    const numeroFatura = document.getElementById("numero_fatura").value;

    const missing = [];
    const fieldIds = [];

    if (isRequiredFieldEmpty(nifVendedor) || String(nifVendedor).trim() === "0") {
        missing.push("NIF do vendedor");
        fieldIds.push("nif_vendedor");
    }
    if (isRequiredFieldEmpty(nifEmpresa) || String(nifEmpresa).trim() === "0") {
        missing.push("NIF da empresa");
        fieldIds.push("nif_empresa");
    }
    if (isRequiredFieldEmpty(data) || !isQrDateFieldPresentAndValid(data)) {
        missing.push("Data do documento");
        fieldIds.push("data");
    }
    if (isRequiredFieldEmpty(numeroFatura) || String(numeroFatura).trim() === "0") {
        missing.push("Número da fatura");
        fieldIds.push("numero_fatura");
    }

    return { ok: missing.length === 0, missing, fieldIds };
}

function generateQRCode() {
    clearQrGenerateErrors();

    const required = validateRequiredFieldsForQr();
    if (!required.ok) {
        showQrGenerateErrors(required.missing, required.fieldIds);
        return;
    }

    const nif_vendedor = limitCharacters(document.getElementById("nif_vendedor").value || '0', 15);
    const nif_empresa = limitCharacters(document.getElementById("nif_empresa").value || '0', 15);
    const pais = document.getElementById("pais").value.toUpperCase() || '0';
    const tipologia = document.getElementById("tipologia").value || '0';
    const data = limitCharacters(document.getElementById("data").value || '0', 8);
    const numero_fatura = document.getElementById("numero_fatura").value || '0';
    const espaco_fiscal = document.getElementById("espaco_fiscal").value.toUpperCase() || '0';
    const base_isenta = parseDecimalInput(document.getElementById("base_isenta").value);
    const base_reduzida = parseDecimalInput(document.getElementById("base_reduzida").value);
    const base_intermedia = parseDecimalInput(document.getElementById("base_intermedia").value);
    const base_normal = parseDecimalInput(document.getElementById("base_normal").value);
    const imposto_selo = parseDecimalInput(document.getElementById("imposto_selo").value);

    if (!validateAlphanumeric(nif_vendedor) || !validateAlphanumeric(nif_empresa)) {
        showQrGenerateErrors(
            ["NIF do vendedor e NIF da empresa devem conter apenas letras e números."],
            ["nif_vendedor", "nif_empresa"]
        );
        return;
    }

    if (!validateNumeric(data)) {
        showQrGenerateErrors(["A data deve conter apenas números."], ["data"]);
        return;
    }

    if (!validateAlphabetic(pais) || !validateAlphabetic(espaco_fiscal.replace("-", ""))) {
        showQrGenerateErrors(
            ["Preencha País / Regime e Espaço fiscal corretamente."],
            ["pais", "espaco_fiscal"]
        );
        return;
    }

    let taxa_iva_reduzida, taxa_iva_intermedia, taxa_iva_normal;
    if (espaco_fiscal === "PT") {
        taxa_iva_reduzida = 0.06;
        taxa_iva_intermedia = 0.13;
        taxa_iva_normal = 0.23;
    } else if (espaco_fiscal === "PT-MA") {
        taxa_iva_reduzida = 0.04;
        taxa_iva_intermedia = 0.12;
        taxa_iva_normal = 0.22;
    } else if (espaco_fiscal === "PT-AC") {
        taxa_iva_reduzida = 0.04;
        taxa_iva_intermedia = 0.09;
        taxa_iva_normal = 0.16;
    } else if (espaco_fiscal === "EU") {
        taxa_iva_reduzida = 0;
        taxa_iva_intermedia = 0;
        taxa_iva_normal = 0;
    } else if (espaco_fiscal === "INT") {
        taxa_iva_reduzida = 0;
        taxa_iva_intermedia = 0;
        taxa_iva_normal = 0;
    } else {
        showQrGenerateErrors(
            ["Espaço fiscal inválido. Escolha PT, PT-MA, PT-AC, EU ou INT."],
            ["espaco_fiscal"]
        );
        return;
    }

    const iva_reduzida = base_reduzida * taxa_iva_reduzida;
    const iva_intermedia = base_intermedia * taxa_iva_intermedia;
    const iva_normal = base_normal * taxa_iva_normal;
    const total_impostos = iva_reduzida + iva_intermedia + iva_normal;
    const total_fatura = base_isenta + base_reduzida + base_intermedia + base_normal + total_impostos + imposto_selo;

    // Retenção na fonte (RV)
    let retencao_valor = 0;
    let retencao_tipo = "";
    if (tipologia === "RV" && rvRetencaoAtiva) {
        retencao_valor = parseDecimalInput(document.getElementById("retencao_valor").value);
        retencao_tipo = (document.getElementById("retencao_tipo").value || "").toUpperCase();
        if (retencao_valor > 0 && !retencao_tipo) {
            showQrGenerateErrors(
                ["Selecione o tipo de retenção (IRS, IRC ou Rendas)."],
                ["retencao_tipo"]
            );
            return;
        }
    }

    let dados_qr_code;
    if (retencao_valor > 0 && retencao_tipo) {
        dados_qr_code = `A:${nif_vendedor}*B:${nif_empresa}*C:${pais}*D:${tipologia}*E:N*F:${data}*G:${numero_fatura}*H:*I1:${espaco_fiscal}*I2:${base_isenta.toFixed(2)}*I3:${base_reduzida.toFixed(2)}*I4:${iva_reduzida.toFixed(4)}*I5:${base_intermedia.toFixed(2)}*I6:${iva_intermedia.toFixed(4)}*I7:${base_normal.toFixed(2)}*I8:${iva_normal.toFixed(4)}*M:${imposto_selo.toFixed(2)}*N:${total_impostos.toFixed(4)}*O:${total_fatura.toFixed(4)}*P:${retencao_valor.toFixed(2)}*Q:0*R:0000*T:${retencao_tipo}*`.replace(/\s+/g, ' ').trim();
    } else {
        dados_qr_code = `A:${nif_vendedor}*B:${nif_empresa}*C:${pais}*D:${tipologia}*E:N*F:${data}*G:${numero_fatura}*H:*I1:${espaco_fiscal}*I2:${base_isenta.toFixed(2)}*I3:${base_reduzida.toFixed(2)}*I4:${iva_reduzida.toFixed(4)}*I5:${base_intermedia.toFixed(2)}*I6:${iva_intermedia.toFixed(4)}*I7:${base_normal.toFixed(2)}*I8:${iva_normal.toFixed(4)}*M:${imposto_selo.toFixed(2)}*N:${total_impostos.toFixed(4)}*O:${total_fatura.toFixed(4)}*P:0*Q:*R:*S:SEM_QR_CODE*`.replace(/\s+/g, ' ').trim();
    }

    QRCode.toDataURL(dados_qr_code, { errorCorrectionLevel: 'M' }, function(err, url) {
        if (err) {
            console.error(err);
            showQrGenerateErrors(["Erro ao gerar a imagem do QR. Tente novamente."], []);
            return;
        }
        const qrCodeImage = new Image();
        qrCodeImage.src = url;
        document.getElementById('qrcode').innerHTML = '';
        document.getElementById('qrcode').appendChild(qrCodeImage);
        document.getElementById('qr_data').value = dados_qr_code;
        saveLastQrToStorage(dados_qr_code);
        updateQrSummaryFromString(dados_qr_code);
        clearQrGenerateErrors();
        showQrCodePopup();

        // Limpa só o formulário (não a string/imagem do QR). Cancelável se o utilizador reutilizar dados.
        clearTimeout(clearFormTimeout);
        clearFormTimeout = setTimeout(clearInputs, 1000);
    });
}

function showQrCodePopup(message = "QR CODE GERADO!") {
    const popup = document.getElementById("qr-popup");
    if (!popup) {
        return;
    }
    popup.textContent = message;
    popup.setAttribute("aria-hidden", "false");
    popup.classList.add("visible");

    clearTimeout(qrPopupTimeout);
    qrPopupTimeout = setTimeout(() => {
        popup.classList.remove("visible");
        popup.setAttribute("aria-hidden", "true");
    }, 2000);
}

function clearInputs() {
    clearFormTimeout = null;

    document.getElementById("nif_vendedor").value = "";
    document.getElementById("nif_empresa").value = "";
    document.getElementById("pais").value = "";
    document.getElementById("tipologia").value = "";
    document.getElementById("data").value = "";
    document.getElementById("data_calendario").value = "";
    document.getElementById("numero_fatura").value = "";
    document.getElementById("espaco_fiscal").value = "";
    document.getElementById("base_isenta").value = "";
    document.getElementById("base_reduzida").value = "";
    document.getElementById("base_intermedia").value = "";
    document.getElementById("base_normal").value = "";
    document.getElementById("imposto_selo").value = "";
    const retValEl = document.getElementById("retencao_valor");
    const retTipoEl = document.getElementById("retencao_tipo");
    if (retValEl) retValEl.value = "";
    if (retTipoEl) retTipoEl.value = "";
    rvRetencaoAtiva = false;
    syncTipologiaSelectAppearance();
    syncFiscalSelectDisplays();
    updateIVARates();
    toggleRvRetencaoBlock();

    // Nunca apagar a string / imagem do último QR
    const backup = lastGeneratedQrString || loadLastQrFromStorage();
    if (backup) {
        const qrDataEl = document.getElementById("qr_data");
        if (qrDataEl) {
            qrDataEl.value = backup;
        }
        saveLastQrToStorage(backup);
    }
}

/**
 * Reutiliza do último QR: NIF vendedor, NIF empresa, tipologia, espaço fiscal e país.
 * Mantém livres: número da fatura, data e bases/valores.
 * Não apaga a caixa «Dados do QR» nem a imagem.
 */
function reutilizarDadosQr() {
    try {
        // Impede que a limpeza automática pós-geração apague o que vamos preencher
        if (clearFormTimeout) {
            clearTimeout(clearFormTimeout);
            clearFormTimeout = null;
        }

        const qrDataEl = document.getElementById("qr_data");
        const preservedQr = getQrStringForReuse();

        if (!preservedQr) {
            alert("Gere um QR primeiro para poder reutilizar os dados.");
            return false;
        }

        if (qrDataEl) qrDataEl.value = preservedQr;
        saveLastQrToStorage(preservedQr);

        const map = parsePortugueseATQRString(preservedQr);
        const nifVendedor = (map.A || "").trim();
        const nifEmpresa = (map.B || "").trim();
        const pais = (map.C || "").trim().toUpperCase();
        const tipologia = (map.D || "").trim().toUpperCase();
        // I1 = espaço fiscal; alguns parsers antigos podem expor só "I"
        const espacoFiscal = ((map.I1 || map.I || "").trim()).toUpperCase();

        if (!nifVendedor && !nifEmpresa && !tipologia && !espacoFiscal && !pais) {
            alert("Não foi possível ler os dados deste QR.");
            if (qrDataEl) qrDataEl.value = preservedQr;
            return false;
        }

        const nifVendedorEl = document.getElementById("nif_vendedor");
        const nifEmpresaEl = document.getElementById("nif_empresa");
        const tipologiaEl = document.getElementById("tipologia");
        const espacoEl = document.getElementById("espaco_fiscal");
        const paisEl = document.getElementById("pais");

        if (nifVendedorEl && nifVendedor && nifVendedor !== "0") {
            nifVendedorEl.value = nifVendedor;
        }
        if (nifEmpresaEl && nifEmpresa && nifEmpresa !== "0") {
            nifEmpresaEl.value = nifEmpresa;
        }

        if (tipologiaEl && tipologia && tipologia !== "0") {
            const hasOpt = Array.prototype.some.call(tipologiaEl.options, function (opt) {
                return String(opt.value).toUpperCase() === tipologia;
            });
            if (hasOpt) tipologiaEl.value = tipologia;
        }

        if (espacoEl && espacoFiscal && espacoFiscal !== "0") {
            const hasEspaco = Array.prototype.some.call(espacoEl.options, function (opt) {
                return String(opt.value).toUpperCase() === espacoFiscal;
            });
            if (hasEspaco) espacoEl.value = espacoFiscal;
        }

        if (paisEl) {
            if (pais && pais !== "0") {
                const hasPais = Array.prototype.some.call(paisEl.options, function (opt) {
                    return String(opt.value).toUpperCase() === pais;
                });
                if (hasPais) {
                    paisEl.value = pais;
                } else if (espacoFiscal === "EU" || espacoFiscal === "INT") {
                    paisEl.value = espacoFiscal;
                } else if (espacoFiscal === "PT" || espacoFiscal === "PT-AC" || espacoFiscal === "PT-MA") {
                    paisEl.value = "PT";
                }
            } else {
                syncPaisFromEspaco();
            }
        }

        if (espacoEl && espacoEl.value) {
            syncPaisFromEspaco();
        } else if (paisEl && paisEl.value) {
            syncEspacoFromPais();
        }

        syncTipologiaSelectAppearance();
        toggleRvRetencaoBlock();
        updateIVARates();
        updateTaxBaseFieldsVisibility();
        clearQrGenerateErrors();

        if (paisEl) paisEl.dispatchEvent(new Event("change", { bubbles: true }));
        if (espacoEl) espacoEl.dispatchEvent(new Event("change", { bubbles: true }));
        if (tipologiaEl) tipologiaEl.dispatchEvent(new Event("change", { bubbles: true }));

        // Garantir que a caixa e o backup não foram alterados
        if (qrDataEl) qrDataEl.value = preservedQr;
        saveLastQrToStorage(preservedQr);
        updateQrSummaryFromString(preservedQr);

        const btn = document.getElementById("btnReutilizarQr");
        if (btn) {
            const label = btn.querySelector("strong");
            const original = "Reutilizar dados do QR";
            btn.classList.add("is-applied");
            if (label) label.textContent = "Dados aplicados";
            clearTimeout(btn._reuseTimeout);
            btn._reuseTimeout = setTimeout(function () {
                btn.classList.remove("is-applied");
                if (label) label.textContent = original;
            }, 1800);
        }

        const focusEl = document.getElementById("numero_fatura");
        if (focusEl) {
            focusEl.focus();
            if (typeof focusEl.scrollIntoView === "function") {
                focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }

        return true;
    } catch (err) {
        console.error("reutilizarDadosQr:", err);
        alert("Erro ao reutilizar dados do QR. Recarregue a página (Ctrl+F5) e tente novamente.");
        return false;
    }
}

window.reutilizarDadosQr = reutilizarDadosQr;

function bindReutilizarQrButton() {
    const btn = document.getElementById("btnReutilizarQr");
    if (!btn || btn._reutilizarBound) return;
    btn._reutilizarBound = true;
    btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        reutilizarDadosQr();
    });
}

// Restaura string do QR se a página ainda tiver backup na sessão
document.addEventListener("DOMContentLoaded", function () {
    bindReutilizarQrButton();
    const stored = loadLastQrFromStorage();
    const qrDataEl = document.getElementById("qr_data");
    if (stored && qrDataEl && !String(qrDataEl.value || "").trim()) {
        qrDataEl.value = stored;
        updateQrSummaryFromString(stored);
    }
});

// Fallback se o script carregar depois do DOMContentLoaded
if (document.readyState !== "loading") {
    bindReutilizarQrButton();
}

//SIDEBAR START//
/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
  }
  
  /* Set the width of the side navigation to 0 */
  function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
  }
//SIDEBAR END//
//SIDEBAR DROP DOWN START//
//* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
var dropdown = document.getElementsByClassName("dropdown-navbar");
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  });
}
//SIDEBAR DROP DOWN END//



document.querySelectorAll('.copy').forEach(button => {
    button.addEventListener('click', async () => {
        const targetSelector = button.getAttribute('data-copy');
        const target = document.querySelector(targetSelector);

        if (!target) return;

        let textToCopy = '';

        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            textToCopy = target.value.trim();
        } else {
            textToCopy = target.textContent.trim();
        }

        if (!textToCopy) {
            alert('Gere o QR primeiro para poder copiar.');
            return;
        }

        const textElement = button.querySelector('.copy-text');
        const iconElement = button.querySelector('.copy-icon');

        const originalText = textElement ? textElement.textContent : '';
        const originalIcon = iconElement ? iconElement.getAttribute('name') : 'copy-outline';

        try {
            await navigator.clipboard.writeText(textToCopy);

            button.classList.add('copied');
            if (textElement) textElement.textContent = 'Copiado';
            if (iconElement) iconElement.setAttribute('name', 'checkmark-outline');

            clearTimeout(button._copyTimeout);

            button._copyTimeout = setTimeout(() => {
                button.classList.remove('copied');
                if (textElement) textElement.textContent = originalText;
                if (iconElement) iconElement.setAttribute('name', originalIcon);
            }, 2000);

        } catch (error) {
            console.error('Erro ao copiar:', error);
            alert('Não foi possível copiar. Tente novamente.');
        }
    });
});

// Função para formatar a data do calendário para o formato YYYYMMDD
function formatarData() {
    const dataCalendario = document.getElementById('data_calendario').value;
    if (dataCalendario) {
        const data = new Date(dataCalendario);
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        const dataFormatada = `${ano}${mes}${dia}`;
        document.getElementById('data').value = dataFormatada;
    }
}

/** Abre o calendário nativo em qualquer clique no campo de data */
function abrirCalendarioData(event) {
    const el = document.getElementById('data_calendario');
    if (!el) return;
    if (event && event.target === el) return;
    if (typeof el.showPicker === 'function') {
        try {
            el.showPicker();
            return;
        } catch (err) {
            /* fallback abaixo */
        }
    }
    el.focus();
    el.click();
}

window.abrirCalendarioData = abrirCalendarioData;

// Lista de países da União Europeia
const paisesUE = [
    "Alemanha", "Áustria", "Bélgica", "Bulgária", "Chipre", "Croácia", 
    "Dinamarca", "Eslováquia", "Eslovênia", "Espanha", "Estónia", 
    "Finlândia", "França", "Grécia", "Hungria", "Irlanda", "Itália", 
    "Letônia", "Lituânia", "Luxemburgo", "Malta", "Países Baixos", 
    "Polônia", "Portugal", "República Checa", "Romênia", "Suécia"
];

function verificarPaisUE() {
    const paisInput = document.getElementById('pais_check').value.trim();
    const resultadoDiv = document.getElementById('pais_resultado');
    
    if (!paisInput) {
        alert('Por favor, digite o nome do país.');
        return;
    }

    // Normaliza o nome do país (remove acentos e converte para minúsculas)
    const paisNormalizado = paisInput.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    
    // Verifica se o país está na lista da UE
    const paisEncontrado = paisesUE.find(pais => 
        pais.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === paisNormalizado
    );

    if (paisEncontrado) {
        if (paisNormalizado === "portugal") {
            resultadoDiv.textContent = "O PAIS É PORTUGAL, USA-SE A SIGLA 'PT'";
        } else {
            resultadoDiv.textContent = "FAZ PARTE DA UNIÃO EUROPEIA, USA-SE A SIGLA 'EU'";
        }
        resultadoDiv.className = "pais-resultado ue";
    } else {
        resultadoDiv.textContent = "PAÍS É INTERNACIONAL, DEVE-SE USAR A SIGLA 'INT'";
        resultadoDiv.className = "pais-resultado internacional";
    }
}

function togglePaisCheck() {
    const container = document.querySelector('.pais-check-container');
    container.classList.toggle('minimized');
}

// ===== FUNÇÕES DA CALCULADORA DE IVA =====

function calcularIVA() {
    const valorComIVA = parseDecimalInput(document.getElementById('valor').value);
    const taxaIVA = parseDecimalInput(document.getElementById('iva').value);

    if (!valorComIVA || valorComIVA <= 0 || taxaIVA < 0) {
        alert("Por favor, insira valores válidos.");
        return;
    }

    const valorSemIVA = valorComIVA / (1 + taxaIVA / 100);
    const valorIVA = valorComIVA - valorSemIVA;

    document.getElementById('semIVA').textContent = valorSemIVA.toFixed(2);
    document.getElementById('valorIVA').textContent = valorIVA.toFixed(2);
    document.getElementById('comIVA').textContent = valorComIVA.toFixed(2);
    document.getElementById('resultado').style.display = 'block';
}