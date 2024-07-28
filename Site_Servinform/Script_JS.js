// Aguarda até que o DOM esteja totalmente carregado
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona o botão de alternância de cor pelo ID
    const colorToggleBtn = document.getElementById('colorToggle');
    // Adiciona um evento de clique ao botão
    colorToggleBtn.addEventListener('click', function() {
        // Alterna a classe 'blue-bg' no corpo do documento
        document.body.classList.toggle('blue-bg');
    });
});

// Traduções para inglês e português
const translations = {
    en: {
        HOME: "HOME",
        ABOUT_US: "ABOUT US",
        PORTFOLIO: "PORTFOLIO",
        SERVICES: "SERVICES",
        BLOG: "BLOG",
        CONTACT: "CONTACT",
        APPOINTMENT: "APPOINTMENT",
        WE_LOVE_TO: "WE LOVE TO",
        CREATIVE_UNIQUE: "Creative & UNIQUE",
        DESCRIPTION: "We are a Gridgum web design & digital marketing agency based in United State"
    },
    pt: {
        HOME: "INÍCIO",
        ABOUT_US: "SOBRE NÓS",
        PORTFOLIO: "PORTFÓLIO",
        SERVICES: "SERVIÇOS",
        BLOG: "BLOG",
        CONTACT: "CONTATO",
        APPOINTMENT: "AGENDAMENTO",
        WE_LOVE_TO: "NÓS ADORAMOS",
        CREATIVE_UNIQUE: "Criativo & ÚNICO",
        DESCRIPTION: "Somos uma agência de design web e marketing digital baseada nos Estados Unidos"
    }
};

let currentLanguage = 'en'; // Idioma inicial

// Seleciona o botão de alternância de idioma pelo ID
const languageToggleBtn = document.getElementById('languageToggle');
languageToggleBtn.addEventListener('click', function() {
    // Alterna o idioma atual
    currentLanguage = currentLanguage === 'en' ? 'pt' : 'en';
    // Atualiza o texto da página com base no idioma selecionado
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = translations[currentLanguage][key];
    });
});