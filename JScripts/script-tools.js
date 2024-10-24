function navigate(page) {
    alert(`Navigating to ${page} page`);
}

function logout() {
    alert('Logging out...');
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
            // Aqui você pode adicionar o redirecionamento real
            alert(`Redirecionando para: ${url}`);
            // window.location.href = url;
        }, 500);
    });
});

function navigate(page) {
    // Verifica se ainda está logado antes de navegar
    if (!localStorage.getItem('usuarioLogado')) {
        alert('Sua sessão expirou. Por favor, faça login novamente.');
        window.location.href = 'https://suportesvf.pt/login.html';
        return;
    }
    window.location.href = `https://suportesvf.pt/pages/${page}.html`;
}

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
        window.location.href = 'https://suportesvf.pt/login.html';
    }, 500);
}



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
        window.location.href = 'https://suportesvf.pt/login.html';
    }, 500);
}