// Função para abrir o modal
function openModal() {
    const modal = document.getElementById("ModalVendor");
    modal.style.display = "block";
    populateHospitalList(); // Popula a lista de hospitais
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById("ModalVendor");
    modal.style.display = "none";
}

// Função para preencher o select com os vendor's
function populateHospitalList() {
    const vendorSelect = document.getElementById("vendor_select");

    // Limpa o select antes de adicionar os novos vendor's
    vendorSelect.innerHTML = "";

    // Adiciona todos os hospitais da lista global
    hospitais.forEach(function(hospital) {
        const option = document.createElement("option");
        option.value = vendor.value;
        option.text = vendor.label;
        vendorSelect.appendChild(option);
    });
}

// Função para preencher os campos de NIF com base na seleção do vendor's
function fillHospitalData() {
    const selectedValue = document.getElementById('vendor_select').value;

    if (selectedValue) {
        const [nifVendedor, nifEmpresa] = selectedValue.split('_');
        document.getElementById('nif_vendedor').value = nifVendedor || '';
    } else {
        // Limpa os campos se nenhum vendor for selecionado
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

//List_VendorU-->
const vendor = [
    { value: "", label: "Selecione um vendor" },
    { value: "500135088", label: "AUTORIDADE TRIBUARIA" },
]