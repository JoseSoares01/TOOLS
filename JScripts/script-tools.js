/**
 * SISTEMA DE FERRAMENTAS SERVINFORM
 * Versão: 2.0 (Modern Layout)
 */

// --- 1. CONFIGURAÇÃO DO CANVAS (PARTÍCULAS) ---
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createParticles() {
    particles = [];
    for (let i = 0; i < 70; i++) particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, index) => {
        p.update();
        p.draw();
        // Linhas de conexão
        for (let j = index + 1; j < particles.length; j++) {
            const dist = Math.hypot(p.x - particles[j].x, p.y - particles[j].y);
            if (dist < 130) {
                ctx.strokeStyle = `rgba(1, 255, 255, ${0.15 - dist/800})`;
                ctx.lineWidth = 0.4;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animateParticles);
}

// --- 2. SISTEMA DE CARREGAMENTO E ENTRADA ---
window.addEventListener('load', () => {
    const loader = document.getElementById('preloader');
    const cards = document.querySelectorAll('.modern-card');

    // Esconde o loader
    loader.classList.add('loader-hidden');

    // Animação em cascata dos cards
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('show');
        }, 300 + (index * 120));
    });
});

// --- 3. NAVEGAÇÃO E SESSÃO ---
function navigate(page) {
    if (!localStorage.getItem('usuarioLogado')) {
        alert('Sessão expirada. Por favor, faça login.');
        window.location.href = '/index.html';
        return;
    }
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = `/pages/${page}.html`;
    }, 500);
}

function logout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) logoutBtn.classList.add('logging-out');
    
    document.body.classList.add('fade-out');
    localStorage.removeItem('usuarioLogado');

    setTimeout(() => {
        window.location.href = 'https://ferramentasservinform.pt/login.html';
    }, 500);
}

// --- 4. CLIQUE E EXPANSÃO DOS CARDS ---
document.querySelectorAll('.modern-card').forEach(card => {
    card.addEventListener('click', function(e) {
        const url = this.dataset.url;
        const overlay = document.querySelector('.overlay');

        // Impede cliques múltiplos
        if (this.classList.contains('expanding')) return;

        // Feedback Visual
        overlay.classList.add('active');
        this.classList.add('expanding');

        // Redireciona após animação
        setTimeout(() => {
            window.location.href = `/pages/${url}.html`;
        }, 600);
    });
});

// --- INICIALIZAÇÃO ---
initCanvas();
createParticles();
animateParticles();
window.addEventListener('resize', () => { initCanvas(); createParticles(); });

window.addEventListener('load', () => {
    // ... seu código de loader e cards ...

    // Animação do footer após os cards aparecerem
    const footer = document.querySelector('.main-footer');
    setTimeout(() => {
        footer.style.opacity = "1";
        footer.style.transform = "translateY(0)";
    }, 1000);
});