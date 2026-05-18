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

function updateIVARates() {
    const espacoFiscal = document.getElementById("espaco_fiscal").value;
    let baseIsenta = document.getElementById("base_isenta");
    let baseReduzida = document.getElementById("base_reduzida");
    let baseIntermedia = document.getElementById("base_intermedia");
    let baseNormal = document.getElementById("base_normal");

    switch (espacoFiscal) {
        case "PT":
            baseIsenta.placeholder = "Base isenta (0%)";
            baseReduzida.placeholder = "Base reduzida (6%)";
            baseIntermedia.placeholder = "Base intermédia (13%)";
            baseNormal.placeholder = "Base normal (23%)";
            break;
        case "PT-AC":
            baseIsenta.placeholder = "Base isenta (0%)";
            baseReduzida.placeholder = "Base reduzida (4%)";
            baseIntermedia.placeholder = "Base intermédia (9%)";
            baseNormal.placeholder = "Base normal (16%)";
            break;
        case "PT-MA":
            baseIsenta.placeholder = "Base isenta (0%)";
            baseReduzida.placeholder = "Base reduzida (4%)";
            baseIntermedia.placeholder = "Base intermédia (12%)";
            baseNormal.placeholder = "Base normal (22%)";
            break;
        case "INT":
            baseIsenta.placeholder = "Base isenta (0%)";
            baseReduzida.placeholder = "Base reduzida";
            baseIntermedia.placeholder = "Base intermédia";
            baseNormal.placeholder = "Base normal";
            break;
        default:
            baseIsenta.placeholder = "Base isenta (0%)";
            baseReduzida.placeholder = "Base reduzida";
            baseIntermedia.placeholder = "Base intermédia";
            baseNormal.placeholder = "Base normal";
            break;
    }
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
        return;
    }
    if (p === "PT" && (ex === "EU" || ex === "INT")) {
        espacoEl.value = "PT";
    }
}

/** Continental / Açores / Madeira → País/Regime em Continental e ilhas (PT); EU/INT espelham o espaço. */
function syncPaisFromEspaco() {
    const paisEl = document.getElementById("pais");
    const espacoEl = document.getElementById("espaco_fiscal");
    if (!paisEl || !espacoEl) return;
    const e = (espacoEl.value || "").toUpperCase();
    if (e === "EU" || e === "INT") {
        paisEl.value = e;
        return;
    }
    if (e === "PT" || e === "PT-AC" || e === "PT-MA") {
        paisEl.value = "PT";
    }
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

// event listeners
document.addEventListener("DOMContentLoaded", function () {
    const espacoFiscalEl = document.getElementById("espaco_fiscal");
    const paisEl = document.getElementById("pais");
    const tipologiaEl = document.getElementById("tipologia");

    if (tipologiaEl) {
        tipologiaEl.addEventListener("change", syncTipologiaSelectAppearance);
        syncTipologiaSelectAppearance();
    }

    if (espacoFiscalEl) {
        espacoFiscalEl.addEventListener("change", function () {
            syncPaisFromEspaco();
            updateIVARates();
            updateTaxBaseFieldsVisibility();
        });
    }

    if (paisEl) {
        paisEl.addEventListener("change", function () {
            syncEspacoFromPais();
            updateIVARates();
            updateTaxBaseFieldsVisibility();
        });
    }

    // Inicializa placeholders e visibilidade
    syncEspacoFromPais();
    syncPaisFromEspaco();
    updateIVARates();
    updateTaxBaseFieldsVisibility();
});

let qrPopupTimeout;

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

function generateQRCode() {
    const nif_vendedor = limitCharacters(document.getElementById("nif_vendedor").value || '0', 15);
    const nif_empresa = limitCharacters(document.getElementById("nif_empresa").value || '0', 15);
    const pais = document.getElementById("pais").value.toUpperCase() || '0';
    const tipologia = document.getElementById("tipologia").value || '0';
    const data = limitCharacters(document.getElementById("data").value || '0', 8);
    const numero_fatura = document.getElementById("numero_fatura").value || '0';
    const espaco_fiscal = document.getElementById("espaco_fiscal").value.toUpperCase() || '0';
    const base_isenta = parseFloat(document.getElementById("base_isenta").value) || 0;
    const base_reduzida = parseFloat(document.getElementById("base_reduzida").value) || 0;
    const base_intermedia = parseFloat(document.getElementById("base_intermedia").value) || 0;
    const base_normal = parseFloat(document.getElementById("base_normal").value) || 0;
    const imposto_selo = parseFloat(document.getElementById("imposto_selo").value) || 0;

    if (!validateAlphanumeric(nif_vendedor) || !validateAlphanumeric(nif_empresa)) {
        alert("NIF do vendedor e NIF da empresa devem conter apenas letras e números.");
        return;
    }

    if (!validateNumeric(data)) {
        alert("A data deve conter apenas números.");
        return;
    }

    if (!validateAlphabetic(pais) || !validateAlphabetic(espaco_fiscal.replace("-", ""))) {
        alert("Todos campos devem ser preenchidos corretamente.");
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
        alert("Espaço fiscal desconhecido. Por favor, insira um espaço fiscal válido (PT, PT-MA, PT-AC, EU, ou INT).");
        return;
    }

    const iva_reduzida = base_reduzida * taxa_iva_reduzida;
    const iva_intermedia = base_intermedia * taxa_iva_intermedia;
    const iva_normal = base_normal * taxa_iva_normal;
    const total_impostos = iva_reduzida + iva_intermedia + iva_normal;
    const total_fatura = base_isenta + base_reduzida + base_intermedia + base_normal + total_impostos + imposto_selo;

    const dados_qr_code = `A:${nif_vendedor}*B:${nif_empresa}*C:${pais}*D:${tipologia}*E:N*F:${data}*G:${numero_fatura}*H:*I1:${espaco_fiscal}*I2:${base_isenta.toFixed(2)}*I3:${base_reduzida.toFixed(2)}*I4:${iva_reduzida.toFixed(4)}*I5:${base_intermedia.toFixed(2)}*I6:${iva_intermedia.toFixed(4)}*I7:${base_normal.toFixed(2)}*I8:${iva_normal.toFixed(4)}*M:${imposto_selo.toFixed(2)}*N:${total_impostos.toFixed(4)}*O:${total_fatura.toFixed(4)}*P:0*Q:*R:*S:SEM_QR_CODE*`.replace(/\s+/g, ' ').trim();

    QRCode.toDataURL(dados_qr_code, { errorCorrectionLevel: 'M' }, function(err, url) {
        if (err) {
            console.error(err);
            return;
        }
        const qrCodeImage = new Image();
        qrCodeImage.src = url;
        document.getElementById('qrcode').innerHTML = '';
        document.getElementById('qrcode').appendChild(qrCodeImage);
        document.getElementById('qr_data').value = dados_qr_code;
        updateQrSummaryFromString(dados_qr_code);
        showQrCodePopup();
        
        setTimeout(clearInputs, 1000);
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
    syncTipologiaSelectAppearance();
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

        if (!textToCopy) return;

        const textElement = button.querySelector('.copy-text');
        const iconElement = button.querySelector('.copy-icon');

        const originalText = textElement.textContent;
        const originalIcon = iconElement.getAttribute('name');

        try {
            await navigator.clipboard.writeText(textToCopy);

            button.classList.add('copied');
            textElement.textContent = 'Copied';
            iconElement.setAttribute('name', 'checkmark-outline');

            clearTimeout(button._copyTimeout);

            button._copyTimeout = setTimeout(() => {
                button.classList.remove('copied');
                textElement.textContent = originalText;
                iconElement.setAttribute('name', originalIcon);
            }, 1800);

        } catch (error) {
            console.error('Erro ao copiar:', error);
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
    const valorComIVA = parseFloat(document.getElementById('valor').value);
    const taxaIVA = parseFloat(document.getElementById('iva').value);

    if (isNaN(valorComIVA) || isNaN(taxaIVA) || valorComIVA <= 0 || taxaIVA < 0) {
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