// Import Supabase and initialize the client
const supabaseUrl = 'https://cmxvccqnkipadmiqalyd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNteHZjY3Fua2lwYWRtaXFhbHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MDA2MDksImV4cCI6MjA0NTE3NjYwOX0.2dz9xleUx2vv8NKvUE6UNFRgu-3b9iMhOedNE3Ls6OE'; // Replace with your actual Supabase anon/public key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Função para abrir o modal
function openModal() {
    const modal = document.getElementById("ModalVendor");
    modal.style.display = "block";
    populateVendorList(); // Corrigido nome da função
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById("ModalVendor");
    modal.style.display = "none";
}

// Função para preencher o select com os vendors do banco de dados Supabase
async function populateVendorList() {
    const vendorSelect = document.getElementById("vendor_select");

    // Limpa o select antes de adicionar os novos vendors
    vendorSelect.innerHTML = "";

    // Fetch vendors from Supabase
    try {
        const { data, error } = await supabase
            .from('VendorsBCP') // Assuming your table is named VENDORS
            .select('NIF, VENDOR'); // Replace 'id' and 'name' with your actual column names

        if (error) throw error;

        // Add default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.text = "Selecione um vendor";
        vendorSelect.appendChild(defaultOption);

        // Populate the select with vendors from the database
        data.forEach(function (vendor) {
            const option = document.createElement("option");
            option.value = vendor.NIF; // Assuming 'id' is the column for vendor value
            option.text = vendor.VENDOR; // Assuming 'name' is the column for vendor label
            vendorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching vendors:", error.message);
        alert("Não foi possível carregar os vendors.");
    }
}

// Função para preencher o campo de NIF com base na seleção do vendor
function fillVendorData() {
    const selectedValue = document.getElementById('vendor_select').value;

    if (selectedValue) {
        document.getElementById('nif_vendedor').value = selectedValue;
    } else {
        // Limpa o campo se nenhum vendor for selecionado
        document.getElementById('nif_vendedor').value = '';
    }
}

// Event listeners para o modal
window.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById("ModalVendor");
    const btn = document.getElementById("openModalBtn");
    const span = document.getElementsByClassName("close")[0];

    // Abrir modal ao clicar no botão
    btn.onclick = openModal;

    // Fechar modal ao clicar no "X"
    span.onclick = closeModal;

    // Fechar modal ao clicar fora dele
    window.onclick = function (event) {
        if (event.target == modal) {
            closeModal();
        }
    };
});
