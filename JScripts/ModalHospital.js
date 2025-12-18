// Script para lidar com os NIFs da Avigilon e preencher os campos automaticamente.

// Lista de NIFs da Avigilon / empresas relacionadas
const avigilonNifs = [
    { value: "", label: "Selecione uma opção" },
    { value: "", label: "=== AVIGILON ===", isGroup: true },
    { value: "CA501011001_503257567", country: "INT", label: "CANADA - CA501011001" },
    { value: "NL823582851_503257567", country: "INT", label: "HOLANDA - NL823582851" },
    { value: "DE453247169_503257567", country: "EU", label: "ALEMANHA - DE453247169" },
    { value: "", label: "=== VISIOTECH ===", isGroup: true },
    { value: "ESB80645518_503257567", country: "EU", label: "VISIOTECH - ESB80645518" },
];

function openModal() {
    const modal = document.getElementById("hospitalModal");
    modal.style.display = "block";
    populateAvigilonList();
}

function closeModal() {
    const modal = document.getElementById("hospitalModal");
    modal.style.display = "none";
}

function populateAvigilonList() {
    const avigilonSelect = document.getElementById("hospital_select");
    avigilonSelect.innerHTML = "";

    avigilonNifs.forEach(function(item) {
        const option = document.createElement("option");
        option.value = item.value;
        option.text = item.label;
        // Cabeçalhos de grupo ficam desativados e com estilo diferente
        if (item.isGroup) {
            option.disabled = true;
            option.style.fontWeight = "bold";
            option.style.backgroundColor = "#f0f0f0";
            option.style.color = "#333";
        }
        avigilonSelect.appendChild(option);
    });
}

function fillAvigilonData() {
    const selectedValue = document.getElementById('hospital_select').value;
    const nifVendedorInput = document.getElementById('nif_vendedor');
    const nifEmpresaInput = document.getElementById('nif_empresa');
    const paisSelect = document.getElementById('pais');
    const espacoFiscalSelect = document.getElementById('espaco_fiscal');

    // Limpa os campos primeiro
    nifVendedorInput.value = '';
    nifEmpresaInput.value = '';
    paisSelect.value = '';
    espacoFiscalSelect.value = '';

    if (selectedValue) {
        const [nifVendedor, nifEmpresa] = selectedValue.split('_');
        const foundAvigilon = avigilonNifs.find(h => h.value === selectedValue);
        
        if (foundAvigilon) {
            nifVendedorInput.value = nifVendedor;
            nifEmpresaInput.value = nifEmpresa;
            paisSelect.value = foundAvigilon.country;
            espacoFiscalSelect.value = foundAvigilon.country;
        }
    }
}

// Event listeners para o modal
window.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("hospitalModal");
    const btn = document.getElementById("openModalBtn");
    const span = document.getElementsByClassName("close")[0];
    const select = document.getElementById("hospital_select");

    // Abrir modal ao clicar no botão
    btn.onclick = openModal;

    // Fechar modal ao clicar no "X"
    span.onclick = closeModal;

    // Chamar a função de preenchimento ao mudar a seleção
    select.onchange = fillAvigilonData;

    // Fechar modal ao clicar fora dele
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    };
});