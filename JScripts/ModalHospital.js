const avigilonNifs = [
    { value: "", label: "Selecione uma opção" },
    { value: "", label: "=== AVIGILON ===", isGroup: true },
    { value: "CA501011001_503257567", country: "INT", label: "CANADA - CA501011001" },
    { value: "NL823582851_503257567", country: "INT", label: "HOLANDA - NL823582851" },
    { value: "DE453247169_503257567", country: "EU", label: "ALEMANHA - DE453247169" },
    { value: "", label: "=== VISIOTECH ===", isGroup: true },
    { value: "ESB80645518_503257567", country: "EU", label: "VISIOTECH - ESB80645518" },
    { value: "", label: "=== ADEMCO ADI ===", isGroup: true },
    { value: "ESB28668358_503257567", country: "EU", label: "ADEMCO ADI - ESB28668358" },
];

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

    avigilonNifs.forEach((item) => {
        if (item.isGroup) {
            const label = document.createElement('div');
            label.className = 'dropdown-group';

            const groupName = item.label.replace(/^===\s*|\s*===$/g, '').trim();
            label.textContent = groupName;

            if (/visiotech/i.test(groupName)) {
                label.classList.add('visiotech');
            } else if (/avigilon/i.test(groupName)) {
                label.classList.add('avigilon');
            } else if (/ademco/i.test(groupName) || /adi/i.test(groupName)) {
                label.classList.add('ademco');
            }

            dropdown.appendChild(label);
            return;
        }

        if (!item.value) return;

        const opt = document.createElement('div');
        opt.className = 'dropdown-option';
        opt.tabIndex = 0;
        opt.dataset.value = item.value;
        opt.textContent = item.label;

        opt.addEventListener('click', () => {
            applySelection(item.value);
        });

        opt.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                applySelection(item.value);
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
    const foundAvigilon = avigilonNifs.find(item => item.value === selectedValue);

    if (!foundAvigilon) return;

    if (nifVendedorInput) nifVendedorInput.value = nifVendedor || '';
    if (nifEmpresaInput) nifEmpresaInput.value = nifEmpresa || '';
    if (paisSelect) paisSelect.value = foundAvigilon.country || '';
    if (espacoFiscalSelect) espacoFiscalSelect.value = foundAvigilon.country || '';

    closeDropdown();
}

let dropdownOutsideHandler = null;

function openModal() {
    const btn = document.getElementById('openModalBtn');
    const dropdown = createDropdownIfNeeded();

    if (!btn) {
        console.error('Botão openModalBtn não encontrado.');
        return;
    }

    populateDropdownList();

    const rect = btn.getBoundingClientRect();

    dropdown.style.minWidth = rect.width + 'px';
    dropdown.style.left = `${rect.left + window.scrollX}px`;
    dropdown.style.top = `${rect.bottom + window.scrollY + 8}px`;
    dropdown.style.display = 'block';
    dropdown.style.zIndex = '9999';

    if (dropdownOutsideHandler) {
        document.removeEventListener('click', dropdownOutsideHandler);
    }

    dropdownOutsideHandler = function (e) {
        if (!dropdown.contains(e.target) && e.target !== btn) {
            closeDropdown();
        }
    };

    setTimeout(() => {
        document.addEventListener('click', dropdownOutsideHandler);
    }, 0);
}

function closeDropdown() {
    const dropdown = document.getElementById('hospitalDropdown');

    if (dropdown) {
        dropdown.style.display = 'none';
    }

    if (dropdownOutsideHandler) {
        document.removeEventListener('click', dropdownOutsideHandler);
        dropdownOutsideHandler = null;
    }
}

function initModalHospital() {
    const btn = document.getElementById('openModalBtn');

    if (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const dropdown = document.getElementById('hospitalDropdown');

            if (dropdown && dropdown.style.display === 'block') {
                closeDropdown();
            } else {
                openModal();
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalHospital);
} else {
    initModalHospital();
}