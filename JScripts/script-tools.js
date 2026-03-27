/**
 * =========================================================
 * PORTAL DE FERRAMENTAS SERVINFORM
 * =========================================================
 */

/* =========================
   1. AUTENTICAÇÃO
========================= */
(function checkAuth() {
    const session = localStorage.getItem("usuarioLogado");
    const path = window.location.pathname;
    const isLoginPage =
        path.includes("login.html") ||
        path === "/" ||
        path.includes("index.html");

    if (!session && !isLoginPage) {
        window.location.href = "/login.html";
    } else if (session && isLoginPage) {
        window.location.href = "/pages/dashboard.html";
    }
})();

/* =========================
   2. ELEMENTOS GERAIS
========================= */
const canvas = document.getElementById("hero-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const overlay = document.querySelector(".overlay");
const preloader = document.getElementById("preloader");
const cards = document.querySelectorAll(".modern-card");
const footer = document.querySelector(".main-footer");

let particles = [];
let currentScene = "night";
let particleColor = "rgba(57, 198, 255, 0.75)";
let connectionColorBase = "57, 198, 255";

/* =========================
   3. HELPERS
========================= */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getRangeProgress(current, start, end) {
    if (current <= start) return 0;
    if (current >= end) return 1;
    return (current - start) / (end - start);
}

function setRootVar(name, value) {
    document.documentElement.style.setProperty(name, value);
}

function getDayProgress(hours, minutes) {
    return hours + minutes / 60;
}

/* =========================
   4. CANVAS ANIMADO
========================= */
function initCanvas() {
    if (!canvas || !ctx) return;
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
        this.size = Math.random() * 2.6 + 0.8;
        this.speedX = Math.random() * 0.35 - 0.175;
        this.speedY = Math.random() * 0.35 - 0.175;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }

    draw() {
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createParticles() {
    if (!canvas) return;

    particles = [];
    const count = window.innerWidth < 768 ? 70 : 120;

    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();

        for (let j = index + 1; j < particles.length; j++) {
            const other = particles[j];
            const distance = Math.hypot(
                particle.x - other.x,
                particle.y - other.y
            );

            if (distance < 120) {
                ctx.strokeStyle = `rgba(${connectionColorBase}, ${Math.max(0, 0.12 - distance / 1000)})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(animateParticles);
}

/* =========================
   5. ENTRADA DA PÁGINA
========================= */
window.addEventListener("load", () => {
    if (preloader) {
        preloader.classList.add("loader-hidden");
    }

    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("show");
        }, 220 + index * 100);
    });

    if (footer) {
        setTimeout(() => {
            footer.style.opacity = "1";
            footer.style.transform = "translateY(0)";
        }, 900);
    }
});

/* =========================
   6. NAVEGAÇÃO
========================= */
function realizarLogin(usuario, senha) {
    if (usuario === "admin" && senha === "123") {
        const userData = { token: "auth_" + Date.now() };
        localStorage.setItem("usuarioLogado", JSON.stringify(userData));
        document.body.classList.add("fade-out");

        setTimeout(() => {
            window.location.href = "/pages/dashboard.html";
        }, 500);
    } else {
        alert("Credenciais inválidas");
    }
}

function navigate(page) {
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `/pages/${page}.html`;
    }, 450);
}

function logout() {
    localStorage.removeItem("usuarioLogado");
    document.body.classList.add("fade-out");

    setTimeout(() => {
        window.location.replace("/login.html");
    }, 500);
}

function initCardsNavigation() {
    cards.forEach((card) => {
        card.addEventListener("click", function () {
            const url = this.getAttribute("data-url");

            if (!url || this.classList.contains("expanding")) return;

            if (overlay) {
                overlay.style.display = "block";
                setTimeout(() => overlay.classList.add("active"), 10);
            }

            this.classList.add("expanding");

            setTimeout(() => {
                window.location.href = `/pages/${url}.html`;
            }, 520);
        });
    });
}

/* =========================
   7. CENÁRIO DINÂMICO
========================= */
function setSceneTheme(now = new Date()) {
    const h = now.getHours();
    const m = now.getMinutes();
    const total = getDayProgress(h, m);

    const body = document.body;
    if (!body) return;

    let theme = "night";

    if (total >= 7 && total < 12) {
        theme = "morning";
    } else if (total >= 12 && total < 13) {
        theme = "midday";
    } else if (total >= 13 && total < 17) {
        theme = "afternoon";
    } else if (total >= 17 && total < 18) {
        theme = "sunset";
    } else {
        theme = "night";
    }

    currentScene = theme;
    body.setAttribute("data-theme", theme);

    const sunriseProgress = getRangeProgress(total, 7, 8);
    const middayProgress = getRangeProgress(total, 12, 13);
    const sunsetProgress = getRangeProgress(total, 16, 17);
    const duskProgress = getRangeProgress(total, 17, 18);

    let nightProgress = 1;

    if (total >= 17 && total <= 18) {
        nightProgress = duskProgress;
    } else if (total > 18 || total < 7) {
        nightProgress = 1;
    } else {
        nightProgress = 0;
    }

    const starsDensity = 0.06 + nightProgress * 0.94;
    const starsOpacity = nightProgress * 0.96;

    setRootVar("--sunrise-progress", sunriseProgress.toFixed(3));
    setRootVar("--midday-progress", middayProgress.toFixed(3));
    setRootVar("--sunset-progress", sunsetProgress.toFixed(3));
    setRootVar("--dusk-progress", duskProgress.toFixed(3));
    setRootVar("--night-progress", nightProgress.toFixed(3));
    setRootVar("--stars-density", starsDensity.toFixed(3));

    if (theme === "night") {
        setRootVar("--stars-opacity", starsOpacity.toFixed(3));
    } else if (theme === "sunset") {
        setRootVar("--stars-opacity", (duskProgress * 0.25).toFixed(3));
    } else if (theme === "afternoon" && total >= 16 && total < 17) {
        setRootVar("--stars-opacity", (sunsetProgress * 0.12).toFixed(3));
    } else {
        setRootVar("--stars-opacity", "0");
    }

    updateSunPosition(
        total,
        sunriseProgress,
        sunsetProgress,
        nightProgress,
        middayProgress,
        duskProgress
    );

    updateSceneParticles(theme, sunriseProgress, sunsetProgress, nightProgress);
    toggleCosmicEffects(theme, nightProgress, duskProgress);
}

function updateSunPosition(
    total,
    sunriseProgress = 0,
    sunsetProgress = 0,
    nightProgress = 1,
    middayProgress = 0,
    duskProgress = 0
) {
    const root = document.documentElement;

    const sunVisible = total >= 7 && total < 18;
    const progress = clamp((total - 7) / 11, 0, 1);

    const x = 8 + progress * 78;
    const y = 23 - Math.sin(progress * Math.PI) * 15;

    root.style.setProperty("--sun-x", `${x}%`);
    root.style.setProperty("--sun-y", `${y}%`);

    if (currentScene === "morning") {
        const dawnWarm = 0.22 + sunriseProgress * 0.32;
        const dawnCool = 0.10 + sunriseProgress * 0.12;

        root.style.setProperty("--glow-left", `rgba(255, 212, 120, ${dawnWarm.toFixed(2)})`);
        root.style.setProperty("--glow-right", `rgba(135, 204, 255, ${dawnCool.toFixed(2)})`);
    }

    if (currentScene === "midday") {
        root.style.setProperty("--glow-left", `rgba(255, 235, 170, ${(0.42 + middayProgress * 0.08).toFixed(2)})`);
        root.style.setProperty("--glow-right", `rgba(125, 205, 255, ${(0.20 + middayProgress * 0.05).toFixed(2)})`);
    }

    if (currentScene === "afternoon") {
        const afternoonWarm = 0.26 + sunsetProgress * 0.14;
        const afternoonCool = 0.15 + sunsetProgress * 0.06;

        root.style.setProperty("--glow-left", `rgba(255, 180, 96, ${afternoonWarm.toFixed(2)})`);
        root.style.setProperty("--glow-right", `rgba(255, 132, 96, ${afternoonCool.toFixed(2)})`);
    }

    if (currentScene === "sunset") {
        root.style.setProperty("--glow-left", `rgba(255, 120, 88, ${(0.34 + duskProgress * 0.18).toFixed(2)})`);
        root.style.setProperty("--glow-right", `rgba(139, 92, 246, ${(0.18 + duskProgress * 0.12).toFixed(2)})`);
    }

    if (currentScene === "night") {
        const moonGlow = 0.08 + nightProgress * 0.10;
        root.style.setProperty("--glow-left", `rgba(90, 140, 220, ${moonGlow.toFixed(2)})`);
        root.style.setProperty("--glow-right", `rgba(79, 140, 255, ${(0.06 + nightProgress * 0.05).toFixed(2)})`);
    }

    if (!sunVisible) {
        root.style.setProperty("--sun-x", `86%`);
        root.style.setProperty("--sun-y", `18%`);
    }
}

function updateSceneParticles(theme, sunriseProgress = 0, sunsetProgress = 0, nightProgress = 1) {
    if (theme === "morning") {
        const alpha = 0.45 + sunriseProgress * 0.18;
        particleColor = `rgba(90, 170, 255, ${alpha.toFixed(2)})`;
        connectionColorBase = "90, 170, 255";
    } else if (theme === "midday") {
        particleColor = "rgba(120, 195, 255, 0.42)";
        connectionColorBase = "120, 195, 255";
    } else if (theme === "afternoon" || theme === "sunset") {
        const mixed = sunsetProgress > 0
            ? `rgba(255, 150, 102, ${(0.42 + sunsetProgress * 0.12).toFixed(2)})`
            : "rgba(255, 164, 88, 0.45)";

        particleColor = mixed;
        connectionColorBase = sunsetProgress > 0 ? "255, 150, 102" : "255, 164, 88";
    } else {
        const alpha = 0.36 + nightProgress * 0.39;
        particleColor = `rgba(57, 198, 255, ${alpha.toFixed(2)})`;
        connectionColorBase = "57, 198, 255";
    }
}

function toggleCosmicEffects(theme, nightProgress = 0, duskProgress = 0) {
    const cosmicLayer = document.querySelector(".cosmic-layer");
    if (!cosmicLayer) return;

    if (theme === "sunset") {
        cosmicLayer.style.opacity = (0.35 + duskProgress * 0.65).toFixed(2);
    } else if (theme === "night") {
        cosmicLayer.style.opacity = (0.75 + nightProgress * 0.25).toFixed(2);
    } else {
        cosmicLayer.style.opacity = "0";
    }
}

/* =========================
   8. RELÓGIO
========================= */
(function initClock() {
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const days = [
        "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
        "Quinta-feira", "Sexta-feira", "Sábado"
    ];

    const secondEl = document.querySelector(".second-hand");
    const minuteEl = document.querySelector(".minute-hand");
    const hourEl = document.querySelector(".hour-hand");

    const timeEl = document.querySelector(".time");
    const dayEl = document.querySelector(".day");
    const dateEl = document.querySelector(".date");

    if (!secondEl || !minuteEl || !hourEl || !timeEl || !dayEl || !dateEl) return;

    function updateClock() {
        const now = new Date();

        const second = now.getSeconds();
        const minute = now.getMinutes();
        const hour = now.getHours();

        const secondDeg = second * 6;
        const minuteDeg = minute * 6 + second * 0.1;
        const hourDeg = (hour % 12) * 30 + minute * 0.5;

        secondEl.style.transform = `rotate(${secondDeg}deg)`;
        minuteEl.style.transform = `rotate(${minuteDeg}deg)`;
        hourEl.style.transform = `rotate(${hourDeg}deg)`;

        timeEl.textContent = now.toLocaleTimeString("pt-PT", {
            hour: "2-digit",
            minute: "2-digit"
        });

        dayEl.textContent = days[now.getDay()];
        dateEl.textContent = `${now.getDate()} de ${months[now.getMonth()]}`;

        setSceneTheme(now);
    }

    updateClock();
    setInterval(updateClock, 1000);
})();

/* =========================
   9. FOGUETE
========================= */
function initRocket() {
    const rocket = document.querySelector(".rocket");
    if (!rocket) return;

    function launchRocket() {
        rocket.style.animation = "none";
        rocket.offsetHeight;
        rocket.style.animation = "rocketFly 8s cubic-bezier(0.2, 0, 0.2, 1) forwards";
    }

    launchRocket();
    setInterval(launchRocket, 9000);
}

/* =========================
   10. INICIALIZAÇÃO
========================= */
setSceneTheme(new Date());
initCanvas();
createParticles();
animateParticles();
initCardsNavigation();
initRocket();

window.addEventListener("resize", () => {
    initCanvas();
    createParticles();
});