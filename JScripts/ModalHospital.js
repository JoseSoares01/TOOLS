// Função para preencher os campos de NIF com base na seleção do hospital
function fillHospitalData() {
    const selectedValue = document.getElementById('hospital_select').value;
    const [nifVendedor, nifEmpresa] = selectedValue.split('_');
    document.getElementById('nif_vendedor').value = nifVendedor || '';
    document.getElementById('nif_empresa').value = nifEmpresa || '';
}

// Função para abrir o modal
var modal = document.getElementById("hospitalModal");
var btn = document.getElementById("openModalBtn");
var span = document.getElementsByClassName("close")[0];

// Abrir modal ao clicar no botão
btn.onclick = function() {
    modal.style.display = "block";
}

// Fechar modal ao clicar no "X"
span.onclick = function() {
    modal.style.display = "none";
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}