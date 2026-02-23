function navigate(page) {
    // Verifica se ainda está logado antes de navegar
    if (!localStorage.getItem('usuarioLogado')) {
        alert('Sua sessão expirou. Por favor, faça login novamente.');
        window.location.href = '/index.html';
        return;
    }
    window.location.href = `/pages/${page}.html`;
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
        window.location.href = '/index.html';
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
            window.location.href = `/pages/${url}.html`;
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


// 1. Configuração do Canvas
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// 2. Lógica da Partícula
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Rebate nas bordas
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.4)'; // Verde Excel
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 3. Criação e Animação
function createParticles() {
    for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((p, index) => {
        p.update();
        p.draw();
        
        // Desenha as linhas de conexão entre partículas próximas
        for (let j = index; j < particles.length; j++) {
            const dist = Math.hypot(p.x - particles[j].x, p.y - particles[j].y);
            
            if (dist < 120) {
                ctx.strokeStyle = `rgba(34, 197, 94, ${1 - dist/120})`;
                ctx.lineWidth = 0.3;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animate);
}

// Inicialização
initCanvas();
createParticles();
animate();

// Responsividade
window.addEventListener('resize', initCanvas);

    