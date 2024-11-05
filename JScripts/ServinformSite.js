// Seleciona o formulário
const form = document.getElementById('my-form');

// Adiciona um event listener ao envio do formulário
form.addEventListener('submit', (event) => {
  event.preventDefault(); // Previne o envio padrão do formulário

  // Coleta os dados do formulário
  const formData = new FormData(form);

  // Envia os dados do formulário para o servidor
  fetch('/submit-form', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    // Trata a resposta do servidor
    console.log('Formulário enviado com sucesso!');
  })
  .catch(error => {
    // Trata erros no envio do formulário
    console.error('Erro ao enviar o formulário:', error);
  });
});