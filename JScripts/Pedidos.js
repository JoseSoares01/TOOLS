(function () {
    "use strict";

    const GLOBAL_CC = [
        { email: "servicopapelzero@servinformgroup.com", label: "Serviço papel zero" },
        { email: "Rui.henriques@trivalor.pt", label: "TRIVALOR — Rui Henriques" },
    ];

    const GERAL_CONTACTS = {
        title: "Geral Norte / Sul",
        people: "Armanda Gonçalves",
        emails: [{ address: "armanda.goncalves@b2b.com.pt", label: "Armanda Gonçalves" }],
    };

    const REQUEST_TYPES = [
        "Conta Razão",
        "Erros Contábeis",
        "Esclarecimentos de Fatura",
    ];

    const COMPANIES = [
        {
            id: "temporaria",
            sap: "4700",
            name: "A TEMPORARIA",
            razao: "A TEMPORARIA",
            nif: "502530537",
            groups: [],
        },
        {
            id: "b2b",
            sap: "2000",
            name: "B2B",
            razao: "B2B - SERVIÇOS",
            nif: "502734914",
            groups: [
                {
                    title: "B2B",
                    people: "Faturas Fornecedores",
                    emails: [{ address: "faturas.fornecedores@b2b.com.pt", label: "Faturas Fornecedores" }],
                },
            ],
        },
        {
            id: "gertal",
            sap: "1100",
            name: "GERTAL",
            razao: "GERTAL - COMP",
            nif: "500126623",
            groups: [],
        },
        {
            id: "iberlim",
            sap: "4600",
            name: "IBERLIM",
            razao: "Sociedade Técnica de Limpeza, S.A.",
            nif: "502117281",
            groups: [
                {
                    title: "IBERLIM",
                    people: "Ana Baião + Elsa Portinha",
                    emails: [
                        { address: "ana.baiao@b2b.com.pt", label: "Ana Baião" },
                        { address: "elsa.portinha@iberlim.pt", label: "Elsa Portinha" },
                    ],
                },
            ],
        },
        {
            id: "itau",
            sap: "1600",
            name: "ITAU",
            razao: "ITAU",
            nif: "500142858",
            groups: [
                {
                    title: "Itau — Sul",
                    people: "Henriqueta Pacheco + Teresa Rodrigues + Contabilidade",
                    emails: [
                        { address: "contabilidade.itau@b2b.com.pt", label: "Contabilidade Itau" },
                        { address: "henriqueta.pacheco@b2b.com.pt", label: "Henriqueta Pacheco" },
                        { address: "teresa.rodrigues@b2b.com.pt", label: "Teresa Rodrigues" },
                    ],
                },
                {
                    title: "Itau — Norte",
                    people: "Helena Soares + Edite Leite + Fátima Ferraria",
                    emails: [
                        { address: "edite.leite@b2b.com.pt", label: "Edite Leite" },
                        { address: "helena.soares@b2b.com.pt", label: "Helena Soares" },
                    ],
                },
            ],
        },
        {
            id: "serdial",
            sap: "9999",
            name: "SERDIAL",
            razao: "SERDIAL",
            nif: "503537314",
            groups: [],
        },
        {
            id: "sinalmais",
            sap: "6900",
            name: "SINAL MAIS",
            razao: "SINAL MAIS",
            nif: "507166620",
            groups: [
                {
                    title: "S. Mais — Sul",
                    people: "Henriqueta Pacheco + Teresa Rodrigues (com Itau Sul + Contabilidade)",
                    emails: [
                        { address: "contabilidade.itau@b2b.com.pt", label: "Contabilidade Itau" },
                        { address: "henriqueta.pacheco@b2b.com.pt", label: "Henriqueta Pacheco" },
                        { address: "teresa.rodrigues@b2b.com.pt", label: "Teresa Rodrigues" },
                    ],
                },
                {
                    title: "S. Mais — Norte",
                    people: "Fátima Ferraria + Amanda",
                    emails: [
                        { address: "fatima.ferraria@b2b.com.pt", label: "Fátima Ferraria" },
                    ],
                },
            ],
        },
        {
            id: "sogenave",
            sap: "1300",
            name: "SOGENAVE",
            razao: "SOGENAVE S.A.",
            nif: "500271518",
            groups: [
                {
                    title: "SOGENAVE",
                    people: "Ana Bela Roberto + Vera Nunes",
                    emails: [
                        { address: "anabela.roberto@sogenave.pt", label: "Ana Bela Roberto" },
                        { address: "vera.nunes@b2b.com.pt", label: "Vera Nunes" },
                    ],
                },
            ],
        },
        {
            id: "strong",
            sap: "5400",
            name: "STRONG CHARON",
            razao: "STRONG CHARON",
            nif: "503257567",
            groups: [
                {
                    title: "STRONG CHARON",
                    people: "Elisabete Pereira",
                    emails: [
                        { address: "elisabete.pereira@b2b.com.pt", label: "Elisabete Pereira" },
                    ],
                },
            ],
        },
        {
            id: "ticket",
            sap: "1200",
            name: "TICKET RESTAURANTE",
            razao: "TICKET RESTAURANTE",
            nif: "500423849",
            groups: [
                {
                    title: "TICKET",
                    people: "Tomás Lopes + Emília Ping",
                    emails: [
                        { address: "tomaslopes@trivalor.pt", label: "Tomás Lopes" },
                    ],
                },
            ],
        },
        {
            id: "trivalor",
            sap: "2000",
            name: "TRIVALOR",
            razao: "TRIVALOR S.A.",
            nif: "502145820",
            groups: [
                {
                    title: "TRIVALOR",
                    people: "Paulo Costa",
                    emails: [
                        { address: "paulo.costa@b2b.com.pt", label: "Paulo Costa" },
                    ],
                },
            ],
        },
    ];

    const companyListEl = document.getElementById("companyList");
    const detailPanel = document.getElementById("detailPanel");
    const emptyState = document.getElementById("emptyState");
    const copyToast = document.getElementById("copyToast");

    let selectedId = null;
    let toastTimer = null;

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function formatTitleWithRegions(title) {
        return escapeHtml(title)
            .replace(/\bNorte\b/g, '<span class="region-label region-label--norte">Norte</span>')
            .replace(/\bSul\b/g, '<span class="region-label region-label--sul">Sul</span>');
    }

    function showToast(message) {
        if (!copyToast) return;
        copyToast.textContent = message;
        copyToast.hidden = false;
        copyToast.classList.add("visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            copyToast.classList.remove("visible");
            copyToast.hidden = true;
        }, 2200);
    }

    async function copyText(text, label) {
        const toastOk = label ? "Texto copiado para a área de transferência." : "E-mail copiado para a área de transferência.";
        const toastFail = label ? "Não foi possível copiar. Selecione o texto manualmente." : "Não foi possível copiar. Selecione o e-mail manualmente.";

        try {
            await navigator.clipboard.writeText(text);
            showToast(toastOk);
            return true;
        } catch {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand("copy");
            document.body.removeChild(ta);
            if (ok) showToast(toastOk);
            else showToast(toastFail);
            return ok;
        }
    }

    function renderEmailRow(emailObj) {
        const address = emailObj.address;
        const label = emailObj.label || address;
        return `
            <div class="email-row">
                <div class="email-row__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M4 6h16v12H4z" stroke-linejoin="round"/>
                        <path d="M4 7l8 6l8-6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="email-row__body">
                    <span class="email-row__label">E-mail</span>
                    <a class="email-row__address" href="mailto:${escapeHtml(address)}">${escapeHtml(address)}</a>
                    <span class="email-row__person">${escapeHtml(label)}</span>
                </div>
                <button type="button" class="email-copy-btn" data-copy="${escapeHtml(address)}" aria-label="Copiar ${escapeHtml(address)}" title="Copiar e-mail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="9" y="9" width="11" height="11" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                </button>
            </div>`;
    }

    function renderContactGroup(group) {
        return `
            <section class="contact-group">
                <header class="contact-group__head">
                    <h3 class="contact-group__title">${formatTitleWithRegions(group.title)}</h3>
                    <p class="contact-group__people">${escapeHtml(group.people)}</p>
                </header>
                <div class="email-list">
                    ${group.emails.map(renderEmailRow).join("")}
                </div>
            </section>`;
    }

    function renderCompanyDetail(company) {
        const groupsHtml = company.groups.length
            ? company.groups.map(renderContactGroup).join("")
            : `<p class="no-contacts">Sem contactos específicos registados para esta empresa. Utilize os contactos gerais e CC obrigatório.</p>`;

        const geralHtml = renderContactGroup({
            title: GERAL_CONTACTS.title,
            people: GERAL_CONTACTS.people,
            emails: GERAL_CONTACTS.emails,
        });

        const ccHtml = `
            <section class="cc-block">
                <header class="cc-block__head">
                    <h3 class="cc-block__title">CC obrigatório em todos os pedidos</h3>
                    <p class="cc-block__hint">Inclua sempre estes endereços em cópia, independentemente do destinatário.</p>
                </header>
                <div class="email-list">
                    ${GLOBAL_CC.map((c) => renderEmailRow({ address: c.email, label: c.label })).join("")}
                </div>
            </section>`;

        const requestsHtml = REQUEST_TYPES.map(
            (t) => `<span class="request-chip">${escapeHtml(t)}</span>`
        ).join("");

        detailPanel.innerHTML = `
            <div class="detail-header">
                <div>
                    <span class="detail-kicker">Empresa selecionada</span>
                    <h2 class="detail-title">${escapeHtml(company.name)}</h2>
                    <p class="detail-razao">${escapeHtml(company.razao)}</p>
                </div>
                <div class="detail-sap-badge">SAP ${escapeHtml(company.sap)}</div>
            </div>

            <div class="detail-meta">
                <article class="meta-card">
                    <span class="meta-label">Nº Contribuinte</span>
                    <strong class="meta-value">${escapeHtml(company.nif)}</strong>
                </article>
                <article class="meta-card">
                    <span class="meta-label">Num. Empresa SAP</span>
                    <strong class="meta-value">${escapeHtml(company.sap)}</strong>
                </article>
                <article class="meta-card">
                    <span class="meta-label">Razão social</span>
                    <strong class="meta-value meta-value--sm">${escapeHtml(company.razao)}</strong>
                </article>
            </div>

            <section class="requests-block">
                <h3 class="section-title">Tipos de pedido</h3>
                <p class="section-hint">Indique no assunto do e-mail o tipo de pedido que está a enviar.</p>
                <div class="request-chips">${requestsHtml}</div>
            </section>

            <section class="contacts-block">
                <h3 class="section-title">Destinatários do pedido</h3>
                ${groupsHtml}
                ${geralHtml}
                ${ccHtml}
            </section>`;

        detailPanel.hidden = false;
        if (emptyState) emptyState.hidden = true;
    }

    function selectCompany(id) {
        selectedId = id;
        const company = COMPANIES.find((c) => c.id === id);
        if (!company) return;

        document.querySelectorAll(".company-item").forEach((btn) => {
            const active = btn.dataset.companyId === id;
            btn.classList.toggle("company-item--active", active);
            btn.setAttribute("aria-selected", active ? "true" : "false");
        });

        renderCompanyDetail(company);
    }

    function renderCompanyList() {
        if (!companyListEl) return;
        companyListEl.innerHTML = COMPANIES.map((c) => `
            <button
                type="button"
                class="company-item"
                data-company-id="${escapeHtml(c.id)}"
                role="option"
                aria-selected="false"
            >
                <span class="company-item__sap">${escapeHtml(c.sap)}</span>
                <span class="company-item__name">${escapeHtml(c.name)}</span>
                <span class="company-item__nif">${escapeHtml(c.nif)}</span>
            </button>
        `).join("");

        companyListEl.querySelectorAll(".company-item").forEach((btn) => {
            btn.addEventListener("click", () => selectCompany(btn.dataset.companyId));
        });
    }

    document.addEventListener("click", (e) => {
        const copyBtn = e.target.closest("[data-copy]");
        if (copyBtn && copyBtn.dataset.copy) {
            e.preventDefault();
            copyText(copyBtn.dataset.copy, copyBtn.dataset.copyLabel || "");
        }
    });

    function init() {
        renderCompanyList();
        if (COMPANIES.length) selectCompany(COMPANIES[0].id);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
