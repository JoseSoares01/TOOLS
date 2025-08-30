// Sistema de Login SVF com Banco de Dados Integrado
// Carrega o gerenciador de banco de dados
// Nota: O arquivo database-manager.js deve ser carregado antes deste

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
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Previne o comportamento padrão de enviar o formulário

        // Capturando os valores dos campos de login e senha
        const login = document.getElementById('login').value;
        const senha = document.getElementById('password').value;

        // Validação básica
        if (!login || !senha) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }

        // Usa o sistema de banco de dados para validar login
        if (typeof dbManager !== 'undefined') {
            const result = dbManager.validateLogin(login, senha);
            if (result.success) {
                // Login bem-sucedido
                showMessage('Login realizado com sucesso!', 'success');
                
                // Armazena informações do usuário
                localStorage.setItem('usuarioLogado', JSON.stringify(result.user));
                localStorage.setItem('loginTime', new Date().toISOString());
                
                // Redireciona após um breve delay
                setTimeout(() => {
                    window.location.href = '/pages/Tools.html';
                }, 1500);
            } else {
                showMessage(result.message, 'error');
            }
        } else {
            // Fallback para sistema antigo se o banco não estiver disponível
            const usuariosValidos = {
                JanyelSVF: "SVF_010203",
                HenriqueSVF: "SVF_020304",
                TABSVF: "SVF_030405",
                AnisabelN: "SVF_040506",
                SRITA: "SVF_060708",
            };

            if (usuariosValidos[login] && usuariosValidos[login] === senha) {
                showMessage('Login realizado com sucesso!', 'success');
                localStorage.setItem('usuarioLogado', login);
                setTimeout(() => {
                    window.location.href = '/pages/Tools.html';
                }, 1500);
            } else {
                showMessage('Login ou senha incorretos. Tente novamente.', 'error');
            }
        }
    });
}

// Capturando o formulário de registro
const registerForm = document.getElementById('register-form');

// Adicionando um event listener para o envio do formulário de registro
if (registerForm) {
    registerForm.addEventListener('submit', function(event) {
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
            const result = dbManager.registerUser({
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
                    window.location.href = '/pages/Tools.html';
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
    window.location.href = '/index.html';
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
