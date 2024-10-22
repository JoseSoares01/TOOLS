// Import Supabase
import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabaseUrl = 'https://cmxvccqnkipadmiqalyd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNteHZjY3Fua2lwYWRtaXFhbHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MDA2MDksImV4cCI6MjA0NTE3NjYwOX0.2dz9xleUx2vv8NKvUE6UNFRgu-3b9iMhOedNE3Ls6OE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para abrir o modal
async function openModal() {
    try {
        const modal = document.getElementById("ModalVendor");
        if (!modal) throw new Error("Modal element not found");

        modal.style.display = "block";
        await populateVendorList();
    } catch (error) {
        console.error("Error opening modal:", error);
        alert("Erro ao abrir o modal");
    }
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById("ModalVendor");
    if (modal) {
        modal.style.display = "none";
    }
}

// Função para preencher o select com os vendors do banco de dados Supabase
async function populateVendorList() {
    const vendorSelect = document.getElementById("vendor_select");
    if (!vendorSelect) {
        console.error("Vendor select element not found");
        return;
    }

    // Limpa o select antes de adicionar os novos vendors
    vendorSelect.innerHTML = "";

    try {
        const { data, error } = await supabase
            .from('VENDORSBCP')
            .select('NIF, VENDOR')
            .order('VENDOR'); // Ordena os vendors por nome

        if (error) throw error;

        // Add default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.text = "Selecione um vendor";
        vendorSelect.appendChild(defaultOption);

        // Populate the select with vendors from the database
        data.forEach(vendor => {
            const option = document.createElement("option");
            option.value = vendor.NIF;
            option.text = vendor.VENDOR;
            vendorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching vendors:", error);
        alert("Não foi possível carregar os vendors. Erro: " + error.message);
    }
}

// Função para preencher o campo de NIF com base na seleção do vendor
function fillVendorData() {
    try {
        const vendorSelect = document.getElementById('vendor_select');
        const nifInput = document.getElementById('nif_vendedor');

        if (!vendorSelect || !nifInput) {
            throw new Error("Required elements not found");
        }

        nifInput.value = vendorSelect.value || '';
    } catch (error) {
        console.error("Error filling vendor data:", error);
        alert("Erro ao preencher dados do vendor");
    }
}

// Event listeners para o modal
document.addEventListener('DOMContentLoaded', function() {
    try {
        const modal = document.getElementById("ModalVendor");
        const btn = document.getElementById("openModalBtn");
        const span = document.getElementsByClassName("close")[0];

        if (!modal || !btn || !span) {
            throw new Error("Required modal elements not found");
        }

        // Abrir modal ao clicar no botão
        btn.addEventListener('click', openModal);

        // Fechar modal ao clicar no "X"
        span.addEventListener('click', closeModal);

        // Fechar modal ao clicar fora dele
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    } catch (error) {
        console.error("Error setting up modal event listeners:", error);
    }
});

// Exporta as funções necessárias
export { openModal, closeModal, fillVendorData };