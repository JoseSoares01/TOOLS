// ModalVendor.js
import { createClient } from '@supabase/supabase-js'; // Import Supabase

const supabaseUrl = 'https://cmxvccqnkipadmiqalyd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNteHZjY3Fua2lwYWRtaXFhbHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MDA2MDksImV4cCI6MjA0NTE3NjYwOX0.2dz9xleUx2vv8NKvUE6UNFRgu-3b9iMhOedNE3Ls6OE'; // Use the actual key
const supabase = createClient(supabaseUrl, supabaseKey); // Initialize Supabase client

// Function to open the modal and fetch the vendors
document.getElementById('openModalBtn').addEventListener('click', openModal);

function openModal() {
    const modal = document.getElementById("ModalVendor");
    modal.style.display = "block";
    populateVendorList(); // Call the function to populate the vendor list
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById("ModalVendor");
    modal.style.display = "none";
}

// Function to fetch vendors from Supabase and populate the dropdown
async function populateVendorList() {
    const vendorSelect = document.getElementById("vendor_select");

    // Show a loading message before fetching
    vendorSelect.innerHTML = "<option>Loading...</option>";

    try {
        const { data, error } = await supabase
            .from('VENDORSBCP') // Ensure this table name matches exactly in Supabase
            .select('NIF, VENDOR'); // Ensure these are the correct column names
        console.log(data)
        if (error) {
            throw error;
        }

        // Clear previous options
        vendorSelect.innerHTML = "";

        // Add default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.text = "Selecione um vendor";
        vendorSelect.appendChild(defaultOption);

        // Populate with the fetched vendors
        data.forEach(function(vendor) {
            const option = document.createElement("option");
            option.value = vendor.NIF; // Assuming 'NIF' is the vendor ID
            option.text = vendor.VENDOR; // Assuming 'VENDOR' is the name of the vendor
            vendorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching vendors:", error.message);
        alert("Não foi possível carregar os vendors.");
    }
}

// Event listeners for modal open/close behavior
window.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("ModalVendor");
    const btn = document.getElementById("openModalBtn");
    const span = document.getElementsByClassName("close")[0];

    // Open modal when button is clicked
    btn.addEventListener('click', openModal); // Changed to use addEventListener

    // Close modal when "X" is clicked
    span.addEventListener('click', closeModal); // Changed to use addEventListener

    // Close modal if clicked outside of it
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });
});