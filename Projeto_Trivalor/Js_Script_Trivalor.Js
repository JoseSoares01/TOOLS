function validateNumeric(input) {
    return /^[0-9]*$/.test(input);
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
        default:
            baseIsenta.placeholder = "Base isenta (0%)";
            baseReduzida.placeholder = "Base reduzida";
            baseIntermedia.placeholder = "Base intermédia";
            baseNormal.placeholder = "Base normal";
            break;
    }
}

// Certifique-se de adicionar o event listener após o DOM estar completamente carregado
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("espaco_fiscal").addEventListener("change", updateIVARates);
    updateIVARates(); // Chame para definir os placeholders corretos inicialmente
});

function generateQRCode() {
    const nif_vendedor = limitCharacters(document.getElementById("nif_vendedor").value || '0', 9);
    const nif_empresa = limitCharacters(document.getElementById("nif_empresa").value || '0', 9);
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

    if (!validateNumeric(nif_vendedor) || !validateNumeric(nif_empresa) || !validateNumeric(data)) {
        alert("NIF do vendedor, NIF da empresa e data devem conter apenas números.");
        return;
    }

    if (!validateAlphabetic(pais) || !validateAlphabetic(espaco_fiscal.replace("-", ""))) {
        alert("Os campos devem ser preenchidos corretamente.");
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
    } else {
        alert("Espaço fiscal desconhecido. Por favor, insira um espaço fiscal válido (PT, PT-MA, PT-AC, ou EU).");
        return;
    }

    const iva_reduzida = base_reduzida * taxa_iva_reduzida;
    const iva_intermedia = base_intermedia * taxa_iva_intermedia;
    const iva_normal = base_normal * taxa_iva_normal;
    const total_impostos = iva_reduzida + iva_intermedia + iva_normal;
    const total_fatura = base_isenta + base_reduzida + base_intermedia + base_normal + total_impostos + imposto_selo;

    const dados_qr_code = `A:${nif_vendedor}*B:${nif_empresa}*C:${pais}*D:${tipologia}*E:N*F:${data}*G:${numero_fatura}*H:*I1:${espaco_fiscal}*I2:${base_isenta.toFixed(2)}*I3:${base_reduzida.toFixed(2)}*I4:${iva_reduzida.toFixed(4)}*I5:${base_intermedia.toFixed(2)}*I6:${iva_intermedia.toFixed(4)}*I7:${base_normal.toFixed(2)}*I8:${iva_normal.toFixed(4)}*M:${imposto_selo.toFixed(2)}*N:${total_impostos.toFixed(4)}*O:${total_fatura.toFixed(4)}*P:0*Q:*R:*`
        .replace(/\s+/g, ' ').trim();

    QRCode.toDataURL(dados_qr_code, { errorCorrectionLevel: 'M' }, function (err, url) {
        if (err) {
            console.error(err);
            return;
        }
        const qrCodeImage = new Image();
        qrCodeImage.src = url;
        document.getElementById('qrcode').innerHTML = '';
        document.getElementById('qrcode').appendChild(qrCodeImage);
        document.getElementById('qr_data').value = dados_qr_code;
    });
}
// Código do botão de copiar
document.getElementById("copyButton").addEventListener("click", function() {
    const qrText = document.getElementById("qr_data").value;
    navigator.clipboard.writeText(qrText).then(() => {
        alert("Texto copiado com sucesso!");
        
        // Adiciona a classe .active para mostrar o feedback visual
        const copyButton = document.querySelector(".copy-text");
        copyButton.classList.add("active");

        // Remove a classe .active após um tempo para ocultar o feedback
        setTimeout(() => {
            copyButton.classList.remove("active");
        }, 2000);
    }).catch(err => {
        console.error("Erro ao copiar o texto: ", err);
    });
});
