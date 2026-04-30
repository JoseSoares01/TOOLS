const DESIGN_SYSTEM_KEY = 'svfDesignSystemSettings';

const DEFAULT_DESIGN_SETTINGS = {
    colors: {
        pageBackground: '#06101d',
        cardBorder: '#ffffff22',
        cardTagBg: '#eef7ff',
        cardTagText: '#2563eb',
        titleColor: '#edf5ff'
    },
    typography: {
        h1Font: 'Inter, sans-serif',
        h2Font: 'Inter, sans-serif',
        h3Font: 'Inter, sans-serif'
    },
    cardStyle: {
        radius: 32
    },
    cardNames: {
        Trivalor: { title: 'Gerador QR Trivalor', description: 'Gere códigos QR para o sistema Trivalor de forma rápida, padronizada e segura.' },
        BCP: { title: 'Gerador QR Despesas', description: 'Crie códigos QR para apoio ao controlo de despesas, faturação e fluxos internos.' },
        SplitPDF: { title: "Editar PDFs", description: 'Mescle, separe e organize documentos PDF com uma interface mais eficiente.' },
        Convert: { title: 'Conversor de Imagens', description: 'Converta imagens em PDF com organização visual, pré-visualização e ordem personalizada.' },
        ServinformSite: { title: 'Calculadora IVA', description: 'Calcule IVA de forma precisa para faturação, despesas e conferência de valores.' },
        winzinkemails: { title: 'Distribuição de Custos', description: 'Edite e gere ficheiros de distribuição de custos com fluxo claro.' },
        buscarcidades: { title: 'Encontrar Cidades', description: 'Localize cidades e regiões em Portugal com uma experiência rápida.' }
    }
};

function deepMerge(base, patch) {
    const output = Array.isArray(base) ? [...base] : { ...base };
    Object.keys(patch || {}).forEach((key) => {
        const baseValue = output[key];
        const patchValue = patch[key];
        if (
            baseValue &&
            patchValue &&
            typeof baseValue === 'object' &&
            typeof patchValue === 'object' &&
            !Array.isArray(baseValue) &&
            !Array.isArray(patchValue)
        ) {
            output[key] = deepMerge(baseValue, patchValue);
        } else {
            output[key] = patchValue;
        }
    });
    return output;
}

function getDesignSettings() {
    try {
        const raw = localStorage.getItem(DESIGN_SYSTEM_KEY);
        const stored = raw ? JSON.parse(raw) : {};
        return deepMerge(DEFAULT_DESIGN_SETTINGS, stored);
    } catch (e) {
        return { ...DEFAULT_DESIGN_SETTINGS };
    }
}

function saveDesignSettings(settings) {
    localStorage.setItem(DESIGN_SYSTEM_KEY, JSON.stringify(settings));
}

function resetDesignSettings() {
    localStorage.removeItem(DESIGN_SYSTEM_KEY);
}

function applyCardNames(cardNames) {
    const cards = document.querySelectorAll('.modern-card[data-url]');
    cards.forEach((card) => {
        const key = card.getAttribute('data-url');
        const data = cardNames[key];
        if (!data) return;
        const titleNode = card.querySelector('.card-title');
        const descriptionNode = card.querySelector('.card-desc');
        if (titleNode && data.title) titleNode.textContent = data.title;
        if (descriptionNode && data.description) descriptionNode.textContent = data.description;
    });
}

function applyDesignSystemToToolsPage(settings) {
    if (!settings) return;
    const root = document.documentElement;
    root.style.setProperty('--bg-1', settings.colors.pageBackground);
    root.style.setProperty('--text', settings.colors.titleColor);
    root.style.setProperty('--line', settings.colors.cardBorder);
    root.style.setProperty('--tag-bg', settings.colors.cardTagBg);
    root.style.setProperty('--tag-text', settings.colors.cardTagText);
    root.style.setProperty('--radius-xl', `${settings.cardStyle.radius}px`);
    root.style.setProperty('--radius-lg', `${Math.max(12, settings.cardStyle.radius - 8)}px`);

    const pageTitle = document.querySelector('.hero-copy h1');
    if (pageTitle) {
        pageTitle.style.color = settings.colors.titleColor;
        pageTitle.style.fontFamily = settings.typography.h1Font;
    }

    const h2List = document.querySelectorAll('h2');
    h2List.forEach((node) => {
        node.style.fontFamily = settings.typography.h2Font;
    });

    const h3List = document.querySelectorAll('h3');
    h3List.forEach((node) => {
        node.style.fontFamily = settings.typography.h3Font;
    });

    const cards = document.querySelectorAll('.modern-card');
    cards.forEach((card) => {
        card.style.borderRadius = `${settings.cardStyle.radius}px`;
    });

    applyCardNames(settings.cardNames);
}

window.DesignSystem = {
    key: DESIGN_SYSTEM_KEY,
    defaults: DEFAULT_DESIGN_SETTINGS,
    getSettings: getDesignSettings,
    saveSettings: saveDesignSettings,
    resetSettings: resetDesignSettings,
    applyToToolsPage: applyDesignSystemToToolsPage
};
