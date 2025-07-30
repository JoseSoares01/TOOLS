function calcular() {
  const valor6 = parseFloat(document.getElementById('valorComIva6').value) || 0;
  const valor23 = parseFloat(document.getElementById('valorComIva23').value) || 0;

  const semIva6 = valor6 / 1.06;
  const iva6 = valor6 - semIva6;

  const semIva23 = valor23 / 1.23;
  const iva23 = valor23 - semIva23;

  const totalComIva = valor6 + valor23;
  const totalSemIva = semIva6 + semIva23;
  const totalIva = iva6 + iva23;

  document.getElementById('semIva6').textContent = semIva6.toFixed(2) + ' €';
  document.getElementById('iva6').textContent = iva6.toFixed(2) + ' €';

  document.getElementById('semIva23').textContent = semIva23.toFixed(2) + ' €';
  document.getElementById('iva23').textContent = iva23.toFixed(2) + ' €';

  document.getElementById('totalComIva').textContent = totalComIva.toFixed(2) + ' €';
  document.getElementById('totalSemIva').textContent = totalSemIva.toFixed(2) + ' €';
  document.getElementById('totalIva').textContent = totalIva.toFixed(2) + ' €';
}
