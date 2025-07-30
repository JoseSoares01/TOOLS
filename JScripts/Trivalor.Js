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
            baseNormal.placeholder = "Base normal (18%)";
            break;
        case "PT-MA":
            baseIsenta.placeholder = "Base isenta (0%)";
            baseReduzida.placeholder = "Base reduzida (5%)";
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

//event listener
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("espaco_fiscal").addEventListener("change", updateIVARates);
    updateIVARates(); // Chame isto caso seja necessario= para definir os placeholders corretos inicialmente
});

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
        taxa_iva_reduzida = 0.05;
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
        
        setTimeout(clearInputs, 1000);
    });
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
// TEXTO do botão de copiar
document.querySelectorAll(".copy").forEach(copyButton => {
    copyButton.addEventListener("click", () => {
        const targetElement = document.querySelector(copyButton.dataset.copy);
        const textToCopy = targetElement.value.trim(); // Usa .value para textarea

        navigator.clipboard.writeText(textToCopy).then(() => {
            const label = copyButton.querySelector(".copy-label");
            const originalText = label.textContent;

            copyButton.disabled = true;
            label.textContent = "Copied!";
            setTimeout(() => {
                copyButton.disabled = false;
                label.textContent = originalText;
            }, 1000);
        });
    });
});

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
