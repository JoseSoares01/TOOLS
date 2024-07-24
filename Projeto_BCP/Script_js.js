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
        alert("Os campos devem ser
