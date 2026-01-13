// Sidebar Menu Management
class SidebarMenu {
    constructor() {
        this.sidebar = null;
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        this.createSidebar();
        this.bindEvents();
        this.setActivePage();
    }

    createSidebar() {
        const sidebar = document.createElement('div');
        sidebar.className = 'sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <img src="/images/Logo-Lateral.png" alt="Logo Servinform">
                <h3>Ferramentas</h3>
            </div>
            <nav class="sidebar-nav">
                <ul>
                    <li><a href="/pages/Tools.html" data-title="Dashboard Principal">
                        <img src="/images/colunas.png" alt="Dashboard Icone"> Dashboard
                    </a></li>
                    <li><a href="/pages/Trivalor.html" data-title="Gerador QR Trivalor">
                        <img src="/images/smartphone.png" alt="Trivalor Icone"> Trivalor
                    </a></li>
                    <li><a href="/pages/BCP.html" data-title="Gerador QR Despesas">
                        <img src="/images/despesas.png" alt="Despesas Icone"> Despesas
                    </a></li>
                    <li><a href="/pages/SplitPDF.html" data-title="Editor de PDFs">
                        <img src="/images/pdf02.png" alt="Editor de PDFs Icone"> Editor de PDFs
                    </a></li>
                    <li><a href="/pages/Convert.html" data-title="Conversor de Imagens">
                        <img src="/images/intercambio.png" alt="Conversor de Imagens Icone"> Conversor de Imagens
                    </a></li>
                    <li><a href="/pages/ServinformSite.html" data-title="Calculadora IVA">
                        <img src="/images/calculadora.png" alt="Calculadora IVA Icone"> Calculadora IVA
                    </a></li>
                    <li><a href="/pages/Calculadora_gastos.html" data-title="Calculadora de Gastos">
                        <img src="/images/orcamentacao.png" alt="Calculadora de Gastos Icone"> Winzink Emails
                    </a></li>
                </ul>
            </nav>
        `;

        document.body.appendChild(sidebar);
        this.sidebar = sidebar;
    }



    bindEvents() {
        // Handle navigation clicks
        this.sidebar.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                this.handleNavigation(e.target);
            }
        });
    }



    setActivePage() {
        const links = this.sidebar.querySelectorAll('a');
        links.forEach(link => {
            if (link.href.includes(this.currentPage)) {
                link.classList.add('current-page');
            }
        });
    }

    handleNavigation(link) {
        // Add loading state
        link.style.pointerEvents = 'none';
        link.style.opacity = '0.7';
        
        // Navigate after a short delay for better UX
        setTimeout(() => {
            window.location.href = link.href;
        }, 150);
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '');
        return page || 'Tools';
    }


}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SidebarMenu();
});

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarMenu;
}
