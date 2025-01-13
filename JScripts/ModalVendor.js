// Lista de vendors
const vendors = [
    { value: "", label: "Selecione um vendor" },
    { value: "600086178", label: "AUTORIDADE TRIBUTARIA" },
    { value: "508184258", label: "INST REG NOTARIADO" },
    { value: "600086593", label: "SINTRA LISBOA OESTE" },
    // Adicione mais vendors aqui conforme necessário
];

// Função para abrir o modal Vendor
function openModalVendor() {
    const modal = document.getElementById("ModalVendor");
    modal.style.display = "block";
    populateVendorList();
    }

// Função para fechar o modal Vendor
function closeModalVendor() {
    const modal = document.getElementById("ModalVendor");
    if (modal) {
        modal.style.display = "none";
    }
}

// Função para preencher o select com os vendors
function populateVendorList() { // Corrigido nome da função
    const vendorSelect = document.getElementById("vendor_select");

    // Limpa o select antes de adicionar os novos vendors
    vendorSelect.innerHTML = "";

    // Adiciona todos os vendors da lista
    vendors.forEach(function(vendor) { // Usando a lista correta de vendors
        const option = document.createElement("option");
        option.value = vendor.value;
        option.text = vendor.label;
        vendorSelect.appendChild(option);
    });
}

// Função para preencher o campo de NIF com base na seleção do vendor
function fillVendorData() { // Corrigido nome da função para match com o HTML
    const selectedValue = document.getElementById('vendor_select').value;

    if (selectedValue) {
        document.getElementById('nif_vendedor').value = selectedValue;
    } else {
        // Limpa o campo se nenhum vendor for selecionado
        document.getElementById('nif_vendedor').value = '';
    }
}

// Event listeners para o modal
window.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("ModalVendor");
    const btn = document.getElementById("openModalBtn");
    const span = document.getElementsByClassName("close")[0];

    // Abrir modal ao clicar no botão
    btn.onclick = openModal;

    // Fechar modal ao clicar no "X"
    span.onclick = closeModal;

    // Fechar modal ao clicar fora dele
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    };
});