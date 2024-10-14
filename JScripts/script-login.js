// Add JS here// script.js

// Definindo os usuários e senhas permitidos
const usuariosValidos = {
    JanyelSVF: "SVF_010203",
    HenriqueSVF: "SVF_020304",
    TeresaSVF: "SVF_030405"
  };
  
  // Capturando o formulário de login
  const form = document.getElementById('login-form');
  
  // Adicionando um event listener para o envio do formulário
  form.addEventListener('submit', function (event) {
    event.preventDefault(); // Previne o comportamento padrão de enviar o formulário
  
    // Capturando os valores dos campos de login e senha
    const login = document.getElementById('login').value;
    const senha = document.getElementById('password').value;
  
    // Verificando se o login e a senha são válidos
    if (usuariosValidos[login] && usuariosValidos[login] === senha) {
      // Se válidos, redireciona para a página protegida
      alert('Login bem-sucedido! Redirecionando...');
      window.location.href = 'https://suportesvf.pt/index.html'; // Substitua pela URL da sua página protegida
    } else {
      // Se inválidos, exibe uma mensagem de erro
      alert('Login ou senha incorretos. Tente novamente.');
    }
  });
  
