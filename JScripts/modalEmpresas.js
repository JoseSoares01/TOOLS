// Lista de vendors
const empresas = [
    { value: "", label: "Selecione uma empresa" },
    { value: "500734305", label: "ACTIVOBANK, SA" },
    { value: "501525882", label: "BANCO COMERCIAL PORTUGUÊS, SA" },
    { value: "510112234", label: "IMOSERIT S.A." },
    { value: "500116385", label: "FIPARSO-SOC. IMOBILIARIA, LDA" },
    { value: "502081376", label: "BICHORRO-EMPREEND.TUR.IMOB, SA" },
    { value: "500116393", label: "FINALGARVE-SOC.PROM.IMB.TUR, SA" },
    { value: "502689943", label: "FUNDAÇÃO MILLENNIUM BCP" },
    { value: "502478780", label: "MBCP TELESERVIÇOS-S.C.E., SA" },
    { value: "511098812", label: "BCP AFRICA,SGPS, LDA" },
    { value: "511112971", label: "MBCP PARTIÇÕES, SGPS, LDA" },
    { value: "507552881", label: "INTERFUNDOS-GEST.FUND.INV.IMOB, SA" },
    { value: "503705373", label: "MBCP PRESTAÇÃO SERVIÇOS, ACE" },
  
    // Adicione mais vendors aqui conforme necessário
];

// Função para abrir o modal
function openModal() {
    const modal = document.getElementById("ModalEmpresas");
    modal.style.display = "block";
    populateEmpresaList(); // Corrigido nome da função
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById("ModalEmpresa");
    modal.style.display = "none";
}

// Função para preencher o select com os vendors
function populateEmpresaList() { // Corrigido nome da função
    const empresaSelect = document.getElementById("empresa_select");

    // Limpa o select antes de adicionar os novos vendors
    empresaSelect.innerHTML = "";

    // Adiciona todos os vendors da lista
    empresas.forEach(function(empresa) { // Usando a lista correta de vendors
        const option = document.createElement("option");
        option.value = empresa.value;
        option.text = empresa.label;
        empresaSelect.appendChild(option);
    });
}

// Função para preencher o campo de NIF com base na seleção do vendor
function fillEmpresaData() { // Corrigido nome da função para match com o HTML
    const selectedValue = document.getElementById('empresa_select').value;

    if (selectedValue) {
        document.getElementById('nif_empresa').value = selectedValue;
    } else {
        // Limpa o campo se nenhum vendor for selecionado
        document.getElementById('nif_empresa').value = '';
    }
}

// Event listeners para o modal
window.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("ModalEmpresa");
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
