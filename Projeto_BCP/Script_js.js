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
            baseReduzida.placeholder = "Base reduzida (6%)";
            baseIntermedia.placeholder = "Base intermédia (13%)";
            baseNormal.placeholder = "Base normal (23%)";
            baseIsenta.value = baseIsenta.value || "";
            break;
        case "PT-AC":
            baseReduzida.placeholder = "Base reduzida (4%)";
            baseIntermedia.placeholder = "Base intermédia (9%)";
            baseNormal.placeholder = "Base normal (18%)";
            baseIsenta.value = baseIsenta.value || "";
            break;
        case "PT-MA":
            baseReduzida.placeholder = "Base reduzida (5%)";
            baseIntermedia.placeholder = "Base intermédia (12%)";
            baseNormal.placeholder = "Base normal (22%)";
            baseIsenta.value = baseIsenta.value || "";
            break;
        default:
            baseReduzida.placeholder = "Base reduzida";
            baseIntermedia.placeholder = "Base intermédia";
            baseNormal.placeholder = "Base normal";
            baseIsenta.value = baseIsenta.value || "";
            break;
    }
}

document.getElementById("espaco_fiscal").addEventListener("change", updateIVARates);

function generateQRCode() {
    const nif_vendedor = limitCharacters(document.getElementById("nif_vendedor").value || '0', 9);
    const nif_empresa = limitCharacters(document.getElementById("nif_empresa").value || '0', 9);
    const pais = document.getElementById("pais").value.toUpperCase() || '0';
    const tipologia = document.getElementById("tipologia").value || '0';
    const data = limitCharacters(document.getElementById("data").value || '0', 8);
    const numero_fatura = document.getElementById("numero_fatura").value || '0';
    const espaco_fiscal = document.getElementById("espaco_fiscal").value.toUpperCase() || '0';
    const base_isenta = document.getElementById("base_isenta").value === '' ? '*' : parseFloat(document.getElementById("base_isenta").value).toFixed(2);
    const base_reduzida = parseFloat(document.getElementById("base_reduzida").value) || 0;
    const base_intermedia = parseFloat(document.getElementById("base_intermedia").value) || 0;
    const base_normal = parseFloat(document.getElementById("base_normal").value) || 0;
    const irs = parseFloat(document.getElementById("irs").value) || 0;

    if (!validateNumeric(nif_vendedor) || !validateNumeric(nif_empresa) || !validateNumeric(data)) {
        alert("NIF do fornecedor, NIF da empresa e data devem conter apenas números.");
        return;
    }

    if (!validateAlphabetic(pais) || !validateAlphabetic(espaco_fiscal.replace("-", ""))) {
        alert("Os campos devem ser preenchidos corretamente.");
        return;
    }

    let taxa_iva_reduzida, taxa_iva_intermedia, taxa_iva_normal;
    switch (espaco_fiscal) {
        case "PT":
            taxa_iva_reduzida = 0.06;
            taxa_iva_intermedia = 0.13;
            taxa_iva_normal = 0.23;
            break;
        case "PT-MA":
            taxa_iva_reduzida = 0.05;
            taxa_iva_intermedia = 0.12;
            taxa_iva_normal = 0.22;
            break;
        case "PT-AC":
            taxa_iva_reduzida = 0.04;
            taxa_iva_intermedia = 0.09;
            taxa_iva_normal = 0.18;
            break;
        default:
            alert("Espaço fiscal desconhecido. Por favor, insira um espaço fiscal válido (PT, PT-MA, PT-AC).");
            return;
    }

    const iva_reduzida = base_reduzida * taxa_iva_reduzida;
    const iva_intermedia = base_intermedia * taxa_iva_intermedia;
    const iva_normal = base_normal * taxa_iva_normal;
    const total_impostos = iva_reduzida + iva_intermedia + iva_normal;
    const total_fatura = parseFloat(base_isenta === '*' ? 0 : base_isenta) + base_reduzida + base_intermedia + base_normal + total_impostos - irs;

    const dados_qr_code = `A:${nif_vendedor}*B:${nif_empresa}*C:${pais}*D:${tipologia}*E:N*F:${data}*G:${numero_fatura}*H:*I1:${espaco_fiscal}*I2:${base_isenta}*I3:${base_reduzida.toFixed(2)}*I4:${iva_reduzida.toFixed(4)}*I5:${base_intermedia.toFixed(2)}*I6:${iva_intermedia.toFixed(4)}*I7:${base_normal.toFixed(2)}*I8:${iva_normal.toFixed(4)}*N:${total_impostos.toFixed(4)}*O:${total_fatura.toFixed(4)}*P:${irs.toFixed(2)}*Q:*R:*`
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
