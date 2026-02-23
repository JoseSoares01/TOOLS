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
    // Mostrar a lista como dropdown anexada ao botão
    populateDropdownList();
    openDropdown();
}

function closeModal() {
    // fecha tanto modal antigo quanto dropdown (fallback)
    const modal = document.getElementById("hospitalModal");
    if (modal) modal.style.display = "none";
    closeDropdown();
}

function populateAvigilonList() {
    const avigilonSelect = document.getElementById("hospital_select");
    if (!avigilonSelect) return;
    avigilonSelect.innerHTML = "";

    avigilonNifs.forEach(function(item) {
        const option = document.createElement("option");
        option.value = item.value;
        option.text = item.label;
        if (item.isGroup) {
            option.disabled = true;
            option.style.fontWeight = "bold";
            option.style.backgroundColor = "#f0f0f0";
            option.style.color = "#333";
        }
        avigilonSelect.appendChild(option);
    });
}

// --- Dropdown implementation (posicionado junto ao botão) ---
function createDropdownIfNeeded() {
    let dropdown = document.getElementById('hospitalDropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'hospitalDropdown';
        dropdown.className = 'dropdown-hospital';
        dropdown.style.display = 'none';
        document.body.appendChild(dropdown);
    }
    return dropdown;
}

function populateDropdownList() {
    const dropdown = createDropdownIfNeeded();
    dropdown.innerHTML = '';

    avigilonNifs.forEach(function(item) {
        if (item.isGroup) {
            const label = document.createElement('div');
            label.className = 'dropdown-group';
            const groupName = item.label.replace(/^===\s*|\s*===$/g, '').trim();
            label.textContent = groupName;
            if (/visiotech/i.test(groupName)) {
                label.classList.add('visiotech');
            }
            dropdown.appendChild(label);
            return;
        }

        const opt = document.createElement('div');
        opt.className = 'dropdown-option';
        opt.tabIndex = 0;
        opt.dataset.value = item.value || '';
        opt.dataset.country = item.country || '';
        opt.textContent = item.label;
        opt.addEventListener('click', function(e) {
            applySelection(opt.dataset.value);
        });
        opt.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                applySelection(opt.dataset.value);
            }
        });
        dropdown.appendChild(opt);
    });
}

function applySelection(selectedValue) {
    const nifVendedorInput = document.getElementById('nif_vendedor');
    const nifEmpresaInput = document.getElementById('nif_empresa');
    const paisSelect = document.getElementById('pais');
    const espacoFiscalSelect = document.getElementById('espaco_fiscal');

    if (!selectedValue) return;

    const [nifVendedor, nifEmpresa] = selectedValue.split('_');
    const foundAvigilon = avigilonNifs.find(h => h.value === selectedValue);

    if (foundAvigilon) {
        if (nifVendedorInput) nifVendedorInput.value = nifVendedor || '';
        if (nifEmpresaInput) nifEmpresaInput.value = nifEmpresa || '';
        if (paisSelect) paisSelect.value = foundAvigilon.country || '';
        if (espacoFiscalSelect) espacoFiscalSelect.value = foundAvigilon.country || '';
    }

    closeDropdown();
}

let _dropdownOutsideClickHandler = null;

function openDropdown() {
    const dropdown = createDropdownIfNeeded();
    const btn = document.getElementById('openModalBtn');
    if (!btn) {
        // fallback: show modal
        const modal = document.getElementById('hospitalModal');
        if (modal) modal.style.display = 'flex';
        return;
    }

    // populate and position
    populateDropdownList();
    const rect = btn.getBoundingClientRect();
    dropdown.style.minWidth = rect.width + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.display = 'block';

    // handler to close when clicking outside
    _dropdownOutsideClickHandler = function(e) {
        if (!dropdown.contains(e.target) && e.target !== btn) {
            closeDropdown();
        }
    };
    setTimeout(() => { // attach after tick to avoid immediate close
        document.addEventListener('click', _dropdownOutsideClickHandler);
    }, 0);
}

function closeDropdown() {
    const dropdown = document.getElementById('hospitalDropdown');
    if (dropdown) dropdown.style.display = 'none';
    if (_dropdownOutsideClickHandler) {
        document.removeEventListener('click', _dropdownOutsideClickHandler);
        _dropdownOutsideClickHandler = null;
    }
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
// Inicializa listeners do modal com checagens de existência
function initModalHospital() {
    const modal = document.getElementById("hospitalModal");
    const btn = document.getElementById("openModalBtn");
    const span = document.getElementsByClassName("close")[0];
    const select = document.getElementById("hospital_select");

    if (btn) {
        btn.addEventListener('click', openModal);
    }

    if (span) {
        span.addEventListener('click', closeModal);
    }

    if (select) {
        select.addEventListener('change', fillAvigilonData);
        // pre-popula a lista para garantir que opções existam independentemente do momento
        populateAvigilonList();
    }

    // Fechar modal ao clicar fora dele
    window.addEventListener('click', function(event) {
        if (modal && event.target === modal) {
            closeModal();
        }
    });
}

// Executa init imediatamente se o DOM já estiver pronto, ou no DOMContentLoaded caso contrário
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalHospital);
} else {
    initModalHospital();
}