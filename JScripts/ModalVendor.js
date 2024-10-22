import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabaseUrl = 'https://cmxvccqnkipadmiqalyd.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchVendors() {
    const { data, error } = await supabase
        .from('vendors')
        .select('*');
    if (error) {
        console.error('Error fetching vendors:', error);
        return [];
    }
    return data;
}

async function populateVendorList() {
    const vendorSelect = document.getElementById("vendor_select");
    vendorSelect.innerHTML = "";  // Clear the existing vendor options

    // Default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "Selecione um vendor";
    vendorSelect.appendChild(defaultOption);

    const vendors = await fetchVendors();

    vendors.forEach(function(vendor) {
        const option = document.createElement("option");
        option.value = vendor.nif;  // Assuming NIF is the value field
        option.text = vendor.name;  // Assuming name is the label field
        vendorSelect.appendChild(option);
    });
}

async function addVendor(name, nif) {
    const { data, error } = await supabase
        .from('vendors')
        .insert([{ name: name, nif: nif }]);

    if (error) {
        console.error('Error adding vendor:', error);
    } else {
        console.log('Vendor added:', data);
    }
}

// Modal control functions
function openModal() {
    const modal = document.getElementById("ModalVendor");
    if (modal) {
        modal.style.display = "block";  // Show the modal
        populateVendorList();           // Populate vendor dropdown
    } else {
        console.error('Modal element not found!');
    }
}

function closeModal() {
    const modal = document.getElementById("ModalVendor");
    if (modal) {
        modal.style.display = "none";  // Hide the modal
    } else {
        console.error('Modal element not found!');
    }
}

// Populate NIF field when a vendor is selected
function fillVendorData() {
    const selectedValue = document.getElementById('vendor_select').value;
    document.getElementById('nif_vendedor').value = selectedValue || '';
}

// Event listeners for modal and form submission
window.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById("openModalBtn");

    // Check if button exists and attach event listener to open modal
    if (btn) {
        btn.onclick = openModal;
    } else {
        console.error('Button with id "openModalBtn" not found!');
    }

    const span = document.getElementsByClassName("close")[0];

    // Close modal when the "X" button is clicked
    if (span) {
        span.onclick = closeModal;
    } else {
        console.error('Close button not found!');
    }

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        const modal = document.getElementById("ModalVendor");
        if (event.target == modal) {
            closeModal();
        }
    };

    // Handle form submission for adding new vendors
    document.getElementById('vendorForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const vendorName = document.getElementById('vendor_name').value;
        const vendorNif = document.getElementById('nif_vendedor').value;

        // Add the new vendor to Supabase
        await addVendor(vendorName, vendorNif);

        // Refresh vendor list after adding
        populateVendorList();

        // Clear form inputs
        document.getElementById('vendor_name').value = '';
        document.getElementById('nif_vendedor').value = '';
    });
});
