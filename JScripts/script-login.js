// Sistema de Login SVF com Banco de Dados Integrado
// Carrega o gerenciador de banco de dados
// Nota: O arquivo database-manager.js deve ser carregado antes deste
// Requer JScripts/core/app-config.js antes deste script para caminhos em subpastas.

function appUrl(p) {
    return window.APP && typeof window.APP.url === "function" ? window.APP.url(p) : p;
}
function dashboardUrl() {
    return window.APP && typeof window.APP.dashboardUrl === "function"
        ? window.APP.dashboardUrl()
        : "/pages/Tools.html";
}
function loginPageUrl() {
    return window.APP && typeof window.APP.loginUrl === "function" ? window.APP.loginUrl() : "/index.html";
}

// Elementos do DOM para alternância entre formulários
const container = document.querySelector('.container');
const LoginLink = document.querySelector('.SignInLink');
const RegisterLink = document.querySelector('.SignUpLink');

// Event listeners para alternância entre formulários
if (RegisterLink) {
    RegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        container.classList.add('active');
    });
}

if (LoginLink) {
    LoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        container.classList.remove('active');
    });
}

// Capturando o formulário de login
const loginForm = document.getElementById('login-form');

// Adicionando um event listener para o envio do formulário de login
if (loginForm) {
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Previne o comportamento padrão de enviar o formulário

        // Capturando os valores dos campos de login e senha
        const login = document.getElementById('login').value.trim();
        const senha = document.getElementById('password').value;

        // Validação básica
        if (!login || !senha) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }

        if (isLoginLocked(login)) {
            showMessage('Muitas tentativas. Aguarde alguns minutos e tente novamente.', 'error');
            return;
        }

        // Usa o sistema de banco de dados para validar login
        if (typeof dbManager !== 'undefined') {
            const result = await dbManager.validateLogin(login, senha);
            if (result.success) {
                clearLoginAttempts(login);
                // Login bem-sucedido
                showMessage('Login realizado com sucesso!', 'success');
                
                // Armazena informações do usuário
                localStorage.setItem('usuarioLogado', JSON.stringify(result.user));
                localStorage.setItem('loginTime', new Date().toISOString());
                
                // Redireciona após um breve delay
                setTimeout(() => {
                    window.location.href = dashboardUrl();
                }, 1500);
            } else {
                registerFailedAttempt(login);
                showMessage(result.message, 'error');
            }
        } else {
            showMessage('Sistema de autenticação indisponível no momento.', 'error');
        }
    });
}

// Capturando o formulário de registro
const registerForm = document.getElementById('register-form');

// Adicionando um event listener para o envio do formulário de registro
if (registerForm) {
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Previne o comportamento padrão de enviar o formulário

        // Capturando os valores dos campos de registro
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        // Validação básica
        if (!username || !email || !password) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }

        // Usa o sistema de banco de dados para registro
        if (typeof dbManager !== 'undefined') {
            const result = await dbManager.registerUser({
                usuario: username,
                email: email,
                senha: password
            });

            if (result.success) {
                showMessage(result.message, 'success');
                
                // Limpa os campos do formulário
                registerForm.reset();
                
                // Volta para o formulário de login após delay
                setTimeout(() => {
                    container.classList.remove('active');
                }, 2000);
            } else {
                showMessage(result.message, 'error');
            }
        } else {
            // Fallback se o banco não estiver disponível
            showMessage('Sistema de registro temporariamente indisponível.', 'warning');
        }
    });
}

function getAttemptKey(username) {
    return `loginAttempts:${username.toLowerCase()}`;
}

function isLoginLocked(username) {
    const key = getAttemptKey(username);
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    try {
        const data = JSON.parse(raw);
        const now = Date.now();
        if (data.lockUntil && now < data.lockUntil) {
            return true;
        }
        if (data.lastAttempt && (now - data.lastAttempt > 15 * 60 * 1000)) {
            localStorage.removeItem(key);
        }
    } catch (e) {
        localStorage.removeItem(key);
    }
    return false;
}

function registerFailedAttempt(username) {
    const key = getAttemptKey(username);
    const now = Date.now();
    let count = 0;
    let lockUntil = null;
    try {
        const current = JSON.parse(localStorage.getItem(key) || '{}');
        if (current.lastAttempt && (now - current.lastAttempt) < 15 * 60 * 1000) {
            count = (current.count || 0) + 1;
        } else {
            count = 1;
        }
    } catch (e) {
        count = 1;
    }

    if (count >= 5) {
        lockUntil = now + (5 * 60 * 1000);
    }

    localStorage.setItem(key, JSON.stringify({
        count,
        lastAttempt: now,
        lockUntil
    }));
}

function clearLoginAttempts(username) {
    localStorage.removeItem(getAttemptKey(username));
}

// Função para exibir mensagens
function showMessage(message, type = 'info') {
    // Remove mensagens anteriores
    const existingMessage = document.querySelector('.message-popup');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Cria nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-popup message-${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <span class="message-text">${message}</span>
            <button class="message-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Adiciona ao body
    document.body.appendChild(messageDiv);

    // Remove automaticamente após 5 segundos
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

// Função para verificar se o usuário já está logado
function verificarLogin() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
        try {
            const user = JSON.parse(usuarioLogado);
            // Verifica se o login ainda é válido (24 horas)
            const loginTime = localStorage.getItem('loginTime');
            if (loginTime) {
                const loginDate = new Date(loginTime);
                const now = new Date();
                const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    // Login ainda válido, redireciona
                    window.location.href = dashboardUrl();
                    return;
                }
            }
        } catch (e) {
            // Formato antigo, limpa e continua
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('loginTime');
        }
    }
}

// Executa a verificação quando a página carrega
document.addEventListener('DOMContentLoaded', verificarLogin);

// Função para fazer logout
function logout() {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('loginTime');
    window.location.href = loginPageUrl();
}

// Adiciona funcionalidade de "Lembrar-me"
const lembrarCheckbox = document.getElementById('lembrar');
if (lembrarCheckbox) {
    lembrarCheckbox.addEventListener('change', function() {
        if (this.checked) {
            localStorage.setItem('lembrarUsuario', 'true');
            console.log('Usuário optou por ser lembrado');
        } else {
            localStorage.removeItem('lembrarUsuario');
        }
    });
}

// Função para exportar dados do banco (para administradores)
function exportarUsuarios() {
    if (typeof dbManager !== 'undefined') {
        dbManager.exportToCSV();
        showMessage('Lista de usuários exportada com sucesso!', 'success');
    } else {
        showMessage('Sistema de banco de dados não disponível.', 'error');
    }
}

// Função para ver estatísticas do banco (para administradores)
function verEstatisticas() {
    if (typeof dbManager !== 'undefined') {
        const stats = dbManager.getStats();
        const message = `
            Estatísticas do Sistema:
            - Total de usuários: ${stats.total}
            - Usuários ativos: ${stats.ativos}
            - Administradores: ${stats.admins}
            - Última atualização: ${stats.ultimaAtualizacao}
        `;
        showMessage(message, 'info');
    } else {
        showMessage('Sistema de banco de dados não disponível.', 'error');
    }
}

// Adiciona funções ao escopo global para uso em botões HTML
window.exportarUsuarios = exportarUsuarios;
window.verEstatisticas = verEstatisticas;
window.logout = logout;
