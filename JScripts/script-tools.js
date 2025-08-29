function navigate(page) {
    // Verifica se ainda está logado antes de navegar
    if (!localStorage.getItem('usuarioLogado')) {
        alert('Sua sessão expirou. Por favor, faça login novamente.');
        window.location.href = 'https://ferramentasservinform.pt/login.html';
        return;
    }
    window.location.href = `https://ferramentasservinform.pt/pages/${page}.html`;
}

function logout() {
    // Se existir botão com classe, aplica efeito e usa fluxo animado
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        if (!logoutBtn.classList.contains('logging-out')) {
            logoutBtn.classList.add('logging-out');
        }
    }

    // Remove credencial de sessão
    try {
        localStorage.removeItem('usuarioLogado');
    } catch (e) {
        // ignora
    }

    // Efeito de fade-out na página
    document.body.classList.add('fade-out');

    // Redireciona para login após a animação
    setTimeout(() => {
        window.location.href = 'https://ferramentasservinform.pt/login.html';
    }, 400);
}

// Novo sistema de expansão e redirecionamento dos cards
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function(e) {
        e.preventDefault();
        const url = this.dataset.url;
        const overlay = document.querySelector('.overlay');

        // Ativa o overlay com fade
        overlay.style.display = 'block';
        setTimeout(() => overlay.classList.add('active'), 10);

        // Adiciona classe de expansão ao card
        this.classList.add('expanding');

        // Após a animação, redireciona
        setTimeout(() => {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
            this.classList.remove('expanding');
            // Redirecionamento real
            window.location.href = `https://ferramentasservinform.pt/pages/${url}.html`;
        }, 500);
    });
});

// Função para animação
function handleLogout() {
    // Adiciona efeito visual ao botão
    const logoutBtn = document.querySelector('.logout-btn');
    logoutBtn.classList.add('logging-out');

    // Adiciona efeito de fade out na página
    document.body.classList.add('fade-out');

    // Aguarda a animação terminar
    setTimeout(() => {
        // Remove o token de login
        localStorage.removeItem('usuarioLogado');

        // Redireciona para a página de login
        window.location.href = 'https://ferramentasservinform.pt/login.html';
    }, 500); // Ajuste o tempo conforme necessário
}

function expandAndRedirect(url, cardElement) {
    expandCard(cardElement); // Chama a função de expansão
    setTimeout(() => {
        window.location.href = url; // Redireciona após o efeito de expansão
    }, 500); // Ajuste o tempo conforme necessário
}

function expandCard(cardElement) {
    // Sua lógica de expansão aqui
    cardElement.classList.toggle('expanded'); // Exemplo: adiciona ou remove uma classe para expansão
}
