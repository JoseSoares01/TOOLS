// Função para calcular todos os valores
function calcular() {
    const linhas = document.querySelectorAll('.data-row');
    let totalComIva = 0;
    let totalSemIva = 0;
    let totalIva = 0;

    linhas.forEach((linha, index) => {
        const input = linha.querySelector('.valor-com-iva');
        const select = linha.querySelector('.taxa-select');
        const valorSemIvaCell = linha.querySelector('.valor-sem-iva');
        const valorIvaCell = linha.querySelector('.valor-iva');

        const valorComIva = parseFloat(input.value) || 0;
        const taxa = parseFloat(select.value) || 0;

        if (valorComIva > 0 && taxa > 0) {
            const taxaDecimal = taxa / 100;
            const valorSemIva = valorComIva / (1 + taxaDecimal);
            const valorIva = valorComIva - valorSemIva;

            valorSemIvaCell.textContent = valorSemIva.toFixed(2) + ' €';
            valorIvaCell.textContent = valorIva.toFixed(2) + ' €';

            totalComIva += valorComIva;
            totalSemIva += valorSemIva;
            totalIva += valorIva;
        } else {
            valorSemIvaCell.textContent = '0,00 €';
            valorIvaCell.textContent = '0,00 €';
        }
    });

    // Atualizar totais
    document.getElementById('totalComIva').textContent = totalComIva.toFixed(2) + ' €';
    document.getElementById('totalSemIva').textContent = totalSemIva.toFixed(2) + ' €';
    document.getElementById('totalIva').textContent = totalIva.toFixed(2) + ' €';
}

// Função para adicionar nova linha
function adicionarLinha() {
    const tbody = document.getElementById('tableBody');
    const novaLinha = document.createElement('tr');
    novaLinha.className = 'data-row';
    
    novaLinha.innerHTML = `
        <td>
            <select class="taxa-select" onchange="calcular()">
                <option value="6">6%</option>
                <option value="13" selected>13%</option>
                <option value="23">23%</option>
            </select>
        </td>
        <td><input type="number" class="valor-com-iva" step="0.01" oninput="calcular()" placeholder="0.00"></td>
        <td class="valor-sem-iva">0,00 €</td>
        <td class="valor-iva">0,00 €</td>
        <td>
            <button class="remove-btn" onclick="removerLinha(this)" title="Remover linha">🗑️</button>
        </td>
    `;
    
    tbody.appendChild(novaLinha);
    calcular();
}

// Função para remover linha
function removerLinha(button) {
    const linha = button.closest('.data-row');
    const tbody = document.getElementById('tableBody');
    
    // Verificar se há pelo menos uma linha antes de remover
    if (tbody.children.length > 1) {
        linha.remove();
        calcular();
    } else {
        alert('Deve haver pelo menos uma linha na tabela.');
    }
}

// Função para limpar toda a tabela
function limparTabela() {
    const tbody = document.getElementById('tableBody');
    const linhas = tbody.querySelectorAll('.data-row');
    
    linhas.forEach(linha => {
        const input = linha.querySelector('.valor-com-iva');
        const valorSemIvaCell = linha.querySelector('.valor-sem-iva');
        const valorIvaCell = linha.querySelector('.valor-iva');
        
        input.value = '';
        valorSemIvaCell.textContent = '0,00 €';
        valorIvaCell.textContent = '0,00 €';
    });
    
    calcular();
}

// Função para inicializar a calculadora
function inicializarCalculadora() {
    // Adicionar event listeners para inputs existentes
    document.addEventListener('DOMContentLoaded', function() {
        calcular();
        
        // Adicionar event listeners para inputs dinâmicos
        document.addEventListener('input', function(e) {
            if (e.target.classList.contains('valor-com-iva')) {
                calcular();
            }
        });
        
        document.addEventListener('change', function(e) {
            if (e.target.classList.contains('taxa-select')) {
                calcular();
            }
        });
    });
}

// Inicializar quando a página carregar
inicializarCalculadora();
