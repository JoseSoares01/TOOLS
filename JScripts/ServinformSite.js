function calcularIVA() {
  const valorComIVA = parseFloat(document.getElementById('valor').value);
  const taxaIVA = parseFloat(document.getElementById('iva').value);

  if (isNaN(valorComIVA) || isNaN(taxaIVA) || valorComIVA <= 0 || taxaIVA < 0) {
      alert("Por favor, insira valores válidos.");
      return;
  }

  const valorSemIVA = valorComIVA / (1 + taxaIVA / 100);
  const valorIVA = valorComIVA - valorSemIVA;

  document.getElementById('semIVA').textContent = valorSemIVA.toFixed(2);
  document.getElementById('valorIVA').textContent = valorIVA.toFixed(2);
  document.getElementById('comIVA').textContent = valorComIVA.toFixed(2);
  document.getElementById('resultado').style.display = 'block';
}