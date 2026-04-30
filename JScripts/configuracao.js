const FONT_OPTIONS = [
    'Inter, sans-serif',
    'Poppins, sans-serif',
    'Arial, sans-serif',
    "'Trebuchet MS', sans-serif",
    "'Times New Roman', serif",
    "'Courier New', monospace"
];

function byId(id) { return document.getElementById(id); }

function fillFontOptions(selectId, selected) {
    const sel = byId(selectId);
    sel.innerHTML = '';
    FONT_OPTIONS.forEach((f) => {
        const op = document.createElement('option');
        op.value = f;
        op.textContent = f.split(',')[0].replace(/'/g, '');
        if (f === selected) op.selected = true;
        sel.appendChild(op);
    });
}

function render(settings) {
    byId('pageBackground').value = settings.colors.pageBackground;
    byId('titleColor').value = settings.colors.titleColor;
    byId('cardBorder').value = settings.colors.cardBorder;
    byId('cardTagBg').value = settings.colors.cardTagBg;
    byId('cardTagText').value = settings.colors.cardTagText;

    fillFontOptions('h1Font', settings.typography.h1Font);
    fillFontOptions('h2Font', settings.typography.h2Font);
    fillFontOptions('h3Font', settings.typography.h3Font);

    byId('cardRadius').value = settings.cardStyle.radius;
    byId('radiusValue').textContent = settings.cardStyle.radius;

    const root = byId('cardsEditor');
    root.innerHTML = '';
    const cards = Array.from(document.querySelectorAll ? [] : []);
    const defaultCards = {
        Trivalor: 'Gerador QR Trivalor',
        BCP: 'Gerador QR Despesas',
        SplitPDF: 'Editar PDFs',
        Convert: 'Conversor de Imagens',
        ServinformSite: 'Calculadora IVA',
        winzinkemails: 'Distribuição de Custos',
        buscarcidades: 'Encontrar Cidades'
    };
    Object.keys(defaultCards).forEach((key) => {
        if (!settings.cardNames[key]) settings.cardNames[key] = { title: defaultCards[key], description: '' };
        const row = document.createElement('div');
        row.className = 'card-row';
        row.innerHTML = `
            <h3>${key}</h3>
            <label>Título<input type="text" data-card="${key}" data-field="title" value="${settings.cardNames[key].title || ''}"></label>
            <label>Descrição<input type="text" data-card="${key}" data-field="description" value="${settings.cardNames[key].description || ''}"></label>
        `;
        root.appendChild(row);
    });
}

function collect() {
    const s = window.DesignSystem.getSettings();
    s.colors.pageBackground = byId('pageBackground').value;
    s.colors.titleColor = byId('titleColor').value;
    s.colors.cardBorder = byId('cardBorder').value;
    s.colors.cardTagBg = byId('cardTagBg').value;
    s.colors.cardTagText = byId('cardTagText').value;
    s.typography.h1Font = byId('h1Font').value;
    s.typography.h2Font = byId('h2Font').value;
    s.typography.h3Font = byId('h3Font').value;
    s.cardStyle.radius = Number(byId('cardRadius').value);
    document.querySelectorAll('[data-card][data-field]').forEach((i) => {
        const c = i.dataset.card; const f = i.dataset.field;
        if (!s.cardNames[c]) s.cardNames[c] = { title: '', description: '' };
        s.cardNames[c][f] = i.value.trim();
    });
    return s;
}

document.addEventListener('DOMContentLoaded', () => {
    const settings = window.DesignSystem.getSettings();
    render(settings);
    byId('cardRadius').addEventListener('input', (e) => { byId('radiusValue').textContent = e.target.value; });
    byId('saveBtn').addEventListener('click', () => {
        window.DesignSystem.saveSettings(collect());
        alert('Configuração salva com sucesso.');
    });
    byId('resetBtn').addEventListener('click', () => {
        window.DesignSystem.resetSettings();
        render(window.DesignSystem.getSettings());
    });
    byId('goToolsBtn').addEventListener('click', () => {
        const path = '/pages/Tools.html';
        window.location.href = window.APP && window.APP.url ? window.APP.url(path) : path;
    });
});
function byId(id) {
    return document.getElementById(id);
}

function fillBaseFields(settings) {
    byId('pageBackground').value = settings.colors.pageBackground;
    byId('navBackground').value = settings.colors.navBackground;
    byId('cardBackground').value = settings.colors.cardBackground;
    byId('cardBorder').value = settings.colors.cardBorder;
    byId('titleColor').value = settings.colors.titleColor;

    byId('h1Font').value = settings.typography.h1Font;
    byId('h2Font').value = settings.typography.h2Font;
    byId('h3Font').value = settings.typography.h3Font;

    byId('cardRadius').value = settings.cardStyle.radius;
    byId('radiusValue').textContent = settings.cardStyle.radius;
}

function renderCardsEditor(settings) {
    const root = byId('cardsEditor');
    root.innerHTML = '';
    const names = settings.cardNames || {};

    Object.keys(names).forEach((key) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'card-edit-item';
        wrapper.innerHTML = `
            <h3>${key}</h3>
            <label>Titulo<input type="text" data-card="${key}" data-field="title" value="${names[key].title || ''}"></label>
            <label>Descricao<input type="text" data-card="${key}" data-field="description" value="${names[key].description || ''}"></label>
        `;
        root.appendChild(wrapper);
    });
}

function collectSettingsFromForm() {
    const settings = window.DesignSystem.getSettings();

    settings.colors.pageBackground = byId('pageBackground').value;
    settings.colors.navBackground = byId('navBackground').value;
    settings.colors.cardBackground = byId('cardBackground').value;
    settings.colors.cardBorder = byId('cardBorder').value;
    settings.colors.titleColor = byId('titleColor').value;

    settings.typography.h1Font = byId('h1Font').value;
    settings.typography.h2Font = byId('h2Font').value;
    settings.typography.h3Font = byId('h3Font').value;

    settings.cardStyle.radius = Number(byId('cardRadius').value);

    const cardInputs = document.querySelectorAll('[data-card][data-field]');
    cardInputs.forEach((input) => {
        const card = input.dataset.card;
        const field = input.dataset.field;
        settings.cardNames[card][field] = input.value.trim();
    });

    return settings;
}

function setupEvents() {
    byId('cardRadius').addEventListener('input', (e) => {
        byId('radiusValue').textContent = e.target.value;
    });

    byId('saveBtn').addEventListener('click', () => {
        const settings = collectSettingsFromForm();
        window.DesignSystem.saveSettings(settings);
        alert('Configuracao salva com sucesso.');
    });

    byId('resetBtn').addEventListener('click', () => {
        if (!confirm('Deseja restaurar o padrao?')) return;
        window.DesignSystem.resetSettings();
        const defaults = window.DesignSystem.getSettings();
        fillBaseFields(defaults);
        renderCardsEditor(defaults);
        alert('Configuracao restaurada.');
    });

    byId('openToolsBtn').addEventListener('click', () => {
        window.location.href = '/pages/Tools.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const settings = window.DesignSystem.getSettings();
    fillBaseFields(settings);
    renderCardsEditor(settings);
    setupEvents();
});
