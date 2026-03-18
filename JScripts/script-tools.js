/**
 * SISTEMA DE FERRAMENTAS SERVINFORM
 * Versão: 2.1 (Auth & Navigation Fixed)
 */

// --- 1. SISTEMA DE SEGURANÇA ---
(function checkAuth() {
    const session = localStorage.getItem('usuarioLogado');
    const path = window.location.pathname;
    const isLoginPage = path.includes('login.html') || path === '/' || path.includes('index.html');

    if (!session && !isLoginPage) {
        window.location.href = '/login.html';
    } else if (session && isLoginPage) {
        window.location.href = '/pages/dashboard.html';
    }
})();

// --- 2. CONFIGURAÇÃO DO CANVAS ---
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function initCanvas() {
    if(!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 1;
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
        ctx.fillStyle = 'rgba(16, 69, 97, 0.98)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createParticles() {
    particles = [];
    for (let i = 0; i < 150; i++) particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, index) => {
        p.update();
        p.draw();
        for (let j = index + 1; j < particles.length; j++) {
            const dist = Math.hypot(p.x - particles[j].x, p.y - particles[j].y);
            if (dist < 150) {
                ctx.strokeStyle = `rgba(16, 69, 97, ${Math.max(0, 0.15 - dist / 800)})`;
                ctx.lineWidth = 0.4;
                ctx.beginPath(); ctx.moveTo(p.x, p.y);
                ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animateParticles);
}

// --- 3. CARREGAMENTO E INTERAÇÃO ---
window.addEventListener('load', () => {
    const loader = document.getElementById('preloader');
    const cards = document.querySelectorAll('.modern-card');
    const footer = document.querySelector('.main-footer');

    // Esconder Loader
    if(loader) loader.classList.add('loader-hidden');

    // Entrada dos Cards
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('show');
        }, 300 + (index * 120));
    });

    // Entrada do Footer
    if(footer) {
        setTimeout(() => {
            footer.style.opacity = "1";
            footer.style.transform = "translateY(0)";
        }, 1000);
    }
});

// --- 4. FUNÇÕES DE NAVEGAÇÃO ---

// Função de Login
function realizarLogin(usuario, senha) {
    if (usuario === "admin" && senha === "123") {
        const userData = { token: "auth_" + Date.now() };
        localStorage.setItem('usuarioLogado', JSON.stringify(userData));
        document.body.classList.add('fade-out');
        setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 500);
    } else {
        alert("Credenciais inválidas");
    }
}

// Função de Navegação Geral (Support, etc)
function navigate(page) {
    document.body.classList.add('fade-out');
    setTimeout(() => { window.location.href = `/pages/${page}.html`; }, 500);
}

// Função de Logout
function logout() {
    const btn = document.querySelector('.logout-btn');
    if (btn) btn.classList.add('logging-out');
    localStorage.removeItem('usuarioLogado');
    document.body.classList.add('fade-out');
    setTimeout(() => { window.location.replace('/login.html'); }, 600);
}

// --- 5. LOGICA DOS CARDS (O QUE ESTAVA FALTANDO) ---
document.querySelectorAll('.modern-card').forEach(card => {
    card.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        const overlay = document.querySelector('.overlay');

        if (!url || this.classList.contains('expanding')) return;

        // Ativa animações
        if(overlay) {
            overlay.style.display = 'block';
            setTimeout(() => overlay.classList.add('active'), 10);
        }
        this.classList.add('expanding');

        // Redireciona
        setTimeout(() => {
            window.location.href = `/pages/${url}.html`;
        }, 600);
    });
});

// Inicialização
initCanvas();
createParticles();
animateParticles();
window.addEventListener('resize', () => { initCanvas(); createParticles(); });

// --- 6. RELÓGIO ANALÓGICO E DIGITAL ---
(function () {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const days = [
    "Domingo", "Segunda", "Terça", "Quarta",
    "Quinta", "Sexta", "Sábado"
  ];

  const secondEl = document.querySelector('.second');
  const minuteEl = document.querySelector('.minute');
  const hourEl = document.querySelector('.hour');
  const timeEl = document.querySelector('.time');
  const dayEl = document.querySelector('.day');
  const dateEl = document.querySelector('.date');
  const dailEl = document.querySelector('.dail');

  function getTime() {
    const now = new Date();

    const second = now.getSeconds();
    const minute = now.getMinutes();
    const hour = now.getHours();
    const time = now.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    const day = now.getDay();
    const month = now.getMonth();
    const dayOfMonth = now.getDate() + ' . ' + months[month];

    const ds = second * -6;
    const dm = minute * -6;
    const dh = hour * -30;

    secondEl.style.transform = `rotate(${ds}deg)`;
    minuteEl.style.transform = `rotate(${dm}deg)`;
    hourEl.style.transform = `rotate(${dh}deg)`;

    timeEl.textContent = time;
    dayEl.textContent = days[day];
    dateEl.textContent = dayOfMonth;
  }

  function dailer(selector, size) {
    const element = document.querySelector(selector);
    for (let s = 0; s < 60; s++) {
      const span = document.createElement('span');
      span.style.transform = `rotate(${6 * s}deg) translateX(${size}px)`;
      span.textContent = s;
      element.appendChild(span);
    }
  }

  dailer('.second', 195);
  dailer('.minute', 145);
  dailer('.dail', 230);

  for (let s = 1; s < 13; s++) {
    const span = document.createElement('span');
    span.style.transform = `rotate(${30 * s}deg) translateX(100px)`;
    span.textContent = s;
    hourEl.appendChild(span);
  }

  setInterval(getTime, 1000);
  getTime();
})();