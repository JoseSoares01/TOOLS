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
                        <i>🏠</i>Dashboard
                    </a></li>
                    <li><a href="/pages/Trivalor.html" data-title="Gerador QR Trivalor">
                        <i>📱</i>Trivalor
                    </a></li>
                    <li><a href="/pages/BCP.html" data-title="Gerador QR Despesas">
                        <i>💳</i>BCP Despesas
                    </a></li>
                    <li><a href="/pages/SplitPDF.html" data-title="Editor de PDFs">
                        <i>📄</i>Split PDF
                    </a></li>
                    <li><a href="/pages/Convert.html" data-title="Conversor de Imagens">
                        <i>🖼️</i>Conversor
                    </a></li>
                    <li><a href="/pages/ServinformSite.html" data-title="Calculadora IVA">
                        <i>🧮</i>Calculadora IVA
                    </a></li>
                    <li><a href="/pages/Calculadora_gastos.html" data-title="Calculadora de Gastos">
                        <i>💰</i>Calculadora Gastos
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
