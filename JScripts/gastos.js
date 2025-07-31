// Função para atualizar o total de linhas
function atualizarTotalLinhas() {
    let total = 0;
    
    if (document.getElementById('iva0').checked) {
        total += parseInt(document.getElementById('linhas0').value) || 0;
    }
    
    if (document.getElementById('iva6').checked) {
        total += parseInt(document.getElementById('linhas6').value) || 0;
    }
    
    if (document.getElementById('iva13').checked) {
        total += parseInt(document.getElementById('linhas13').value) || 0;
    }
    
    if (document.getElementById('iva23').checked) {
        total += parseInt(document.getElementById('linhas23').value) || 0;
    }
    
    document.getElementById('totalLinhas').textContent = total;
}

// Função para atualizar o total dos valores
function atualizarTotalValores() {
    let total = 0;
    
    if (document.getElementById('iva0').checked) {
        total += parseFloat(document.getElementById('valor0').value) || 0;
    }
    
    if (document.getElementById('iva6').checked) {
        total += parseFloat(document.getElementById('valor6').value) || 0;
    }
    
    if (document.getElementById('iva13').checked) {
        total += parseFloat(document.getElementById('valor13').value) || 0;
    }
    
    if (document.getElementById('iva23').checked) {
        total += parseFloat(document.getElementById('valor23').value) || 0;
    }
    
    document.getElementById('totalValores').textContent = `€${total.toFixed(2)}`;
}

// Adicionar event listeners para atualizar os totais
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para checkboxes
    document.getElementById('iva0').addEventListener('change', function() {
        atualizarTotalLinhas();
        atualizarTotalValores();
    });
    document.getElementById('iva6').addEventListener('change', function() {
        atualizarTotalLinhas();
        atualizarTotalValores();
    });
    document.getElementById('iva13').addEventListener('change', function() {
        atualizarTotalLinhas();
        atualizarTotalValores();
    });
    document.getElementById('iva23').addEventListener('change', function() {
        atualizarTotalLinhas();
        atualizarTotalValores();
    });
    
    // Event listeners para campos de número de linhas
    document.getElementById('linhas0').addEventListener('input', atualizarTotalLinhas);
    document.getElementById('linhas6').addEventListener('input', atualizarTotalLinhas);
    document.getElementById('linhas13').addEventListener('input', atualizarTotalLinhas);
    document.getElementById('linhas23').addEventListener('input', atualizarTotalLinhas);
    
    // Event listeners para campos de valor
    document.getElementById('valor0').addEventListener('input', atualizarTotalValores);
    document.getElementById('valor6').addEventListener('input', atualizarTotalValores);
    document.getElementById('valor13').addEventListener('input', atualizarTotalValores);
    document.getElementById('valor23').addEventListener('input', atualizarTotalValores);
    
    // Inicializar totais
    atualizarTotalLinhas();
    atualizarTotalValores();
});

function distribuirValor() {
    const totalComIVA = parseFloat(document.getElementById("valorComIva").value);
    
    // Coletar configurações de IVA
    const configuracoesIVA = [];
    
    if (document.getElementById('iva0').checked) {
        const linhas0 = parseInt(document.getElementById('linhas0').value) || 0;
        const valor0 = parseFloat(document.getElementById('valor0').value) || 0;
        if (linhas0 > 0) {
            configuracoesIVA.push({ taxa: 0, linhas: linhas0, valor: valor0 });
        }
    }
    
    if (document.getElementById('iva6').checked) {
        const linhas6 = parseInt(document.getElementById('linhas6').value) || 0;
        const valor6 = parseFloat(document.getElementById('valor6').value) || 0;
        if (linhas6 > 0) {
            configuracoesIVA.push({ taxa: 6, linhas: linhas6, valor: valor6 });
        }
    }
    
    if (document.getElementById('iva13').checked) {
        const linhas13 = parseInt(document.getElementById('linhas13').value) || 0;
        const valor13 = parseFloat(document.getElementById('valor13').value) || 0;
        if (linhas13 > 0) {
            configuracoesIVA.push({ taxa: 13, linhas: linhas13, valor: valor13 });
        }
    }
    
    if (document.getElementById('iva23').checked) {
        const linhas23 = parseInt(document.getElementById('linhas23').value) || 0;
        const valor23 = parseFloat(document.getElementById('valor23').value) || 0;
        if (linhas23 > 0) {
            configuracoesIVA.push({ taxa: 23, linhas: linhas23, valor: valor23 });
        }
    }
    
    // Validações
    if (isNaN(totalComIVA) || totalComIVA <= 0) {
        document.getElementById("resultado").innerText = "Por favor, insira um valor total válido.";
        return;
    }
    
    if (configuracoesIVA.length === 0) {
        document.getElementById("resultado").innerText = "Selecione pelo menos uma taxa de IVA e especifique o número de linhas.";
        return;
    }
    
    const totalLinhas = configuracoesIVA.reduce((sum, config) => sum + config.linhas, 0);
    if (totalLinhas === 0) {
        document.getElementById("resultado").innerText = "Especifique pelo menos uma linha para distribuir o valor.";
        return;
    }
    
    // Verificar se há valores especificados
    const temValoresEspecificados = configuracoesIVA.some(config => config.valor > 0);
    
    if (temValoresEspecificados) {
        // Calcular distribuição baseada nos valores especificados
        const resultado = calcularDistribuicaoComValoresEspecificados(totalComIVA, configuracoesIVA);
        exibirResultado(resultado, totalComIVA);
    } else {
        // Calcular distribuição proporcional
        const resultado = calcularDistribuicaoMultiplaIVA(totalComIVA, configuracoesIVA);
        exibirResultado(resultado, totalComIVA);
    }
}

function calcularDistribuicaoComValoresEspecificados(totalComIVA, configuracoesIVA) {
    const resultado = {
        distribuicoes: [],
        totais: {
            semIVA: 0,
            comIVA: 0,
            detalhesPorTaxa: {}
        }
    };
    
    // Calcular o valor total dos valores especificados
    const totalValoresEspecificados = configuracoesIVA.reduce((sum, config) => sum + config.valor, 0);
    
    // Calcular o fator de proporção
    const fatorProporcao = totalComIVA / totalValoresEspecificados;
    
    // Distribuir por cada taxa baseado nos valores especificados
    configuracoesIVA.forEach(config => {
        const taxa = 1 + (config.taxa / 100);
        const valorComIVA = config.valor * fatorProporcao;
        const valorSemIVA = valorComIVA / taxa;
        const valorPorLinha = valorSemIVA / config.linhas;
        
        // Criar linhas para esta taxa
        for (let i = 0; i < config.linhas; i++) {
            const linha = {
                numero: resultado.distribuicoes.length + 1,
                taxaIVA: config.taxa,
                valorSemIVA: valorPorLinha,
                valorIVA: valorPorLinha * (config.taxa / 100),
                valorComIVA: valorPorLinha * taxa
            };
            
            resultado.distribuicoes.push(linha);
        }
        
        // Acumular totais
        resultado.totais.semIVA += valorSemIVA;
        resultado.totais.comIVA += valorComIVA;
        
        // Detalhes por taxa
        if (!resultado.totais.detalhesPorTaxa[config.taxa]) {
            resultado.totais.detalhesPorTaxa[config.taxa] = {
                linhas: 0,
                totalSemIVA: 0,
                totalIVA: 0,
                totalComIVA: 0
            };
        }
        
        resultado.totais.detalhesPorTaxa[config.taxa].linhas += config.linhas;
        resultado.totais.detalhesPorTaxa[config.taxa].totalSemIVA += valorSemIVA;
        resultado.totais.detalhesPorTaxa[config.taxa].totalIVA += valorSemIVA * (config.taxa / 100);
        resultado.totais.detalhesPorTaxa[config.taxa].totalComIVA += valorComIVA;
    });
    
    return resultado;
}

function calcularDistribuicaoMultiplaIVA(totalComIVA, configuracoesIVA) {
    const resultado = {
        distribuicoes: [],
        totais: {
            semIVA: 0,
            comIVA: 0,
            detalhesPorTaxa: {}
        }
    };
    
    // Calcular o valor médio por linha considerando todas as taxas
    let valorTotalSemIVA = 0;
    let pesoTotal = 0;
    
    // Primeiro, calcular o valor sem IVA para cada taxa
    configuracoesIVA.forEach(config => {
        const taxa = 1 + (config.taxa / 100);
        const valorSemIVA = totalComIVA / taxa;
        const peso = config.linhas;
        
        valorTotalSemIVA += valorSemIVA * peso;
        pesoTotal += peso;
    });
    
    // Valor médio sem IVA por linha
    const valorMedioSemIVA = valorTotalSemIVA / pesoTotal;
    
    // Distribuir por cada taxa
    configuracoesIVA.forEach(config => {
        const taxa = 1 + (config.taxa / 100);
        const valorSemIVA = valorMedioSemIVA;
        const valorComIVA = valorSemIVA * taxa;
        
        // Criar linhas para esta taxa
        for (let i = 0; i < config.linhas; i++) {
            const linha = {
                numero: resultado.distribuicoes.length + 1,
                taxaIVA: config.taxa,
                valorSemIVA: valorSemIVA,
                valorIVA: valorSemIVA * (config.taxa / 100),
                valorComIVA: valorComIVA
            };
            
            resultado.distribuicoes.push(linha);
        }
        
        // Acumular totais
        resultado.totais.semIVA += valorSemIVA * config.linhas;
        resultado.totais.comIVA += valorComIVA * config.linhas;
        
        // Detalhes por taxa
        if (!resultado.totais.detalhesPorTaxa[config.taxa]) {
            resultado.totais.detalhesPorTaxa[config.taxa] = {
                linhas: 0,
                totalSemIVA: 0,
                totalIVA: 0,
                totalComIVA: 0
            };
        }
        
        resultado.totais.detalhesPorTaxa[config.taxa].linhas += config.linhas;
        resultado.totais.detalhesPorTaxa[config.taxa].totalSemIVA += valorSemIVA * config.linhas;
        resultado.totais.detalhesPorTaxa[config.taxa].totalIVA += valorSemIVA * (config.taxa / 100) * config.linhas;
        resultado.totais.detalhesPorTaxa[config.taxa].totalComIVA += valorComIVA * config.linhas;
    });
    
    // Ajustar diferenças de arredondamento
    const diferenca = totalComIVA - resultado.totais.comIVA;
    if (Math.abs(diferenca) > 0.01) {
        // Distribuir a diferença pela primeira linha
        if (resultado.distribuicoes.length > 0) {
            const primeiraLinha = resultado.distribuicoes[0];
            const ajusteSemIVA = diferenca / (1 + (primeiraLinha.taxaIVA / 100));
            
            primeiraLinha.valorSemIVA += ajusteSemIVA;
            primeiraLinha.valorIVA = primeiraLinha.valorSemIVA * (primeiraLinha.taxaIVA / 100);
            primeiraLinha.valorComIVA = primeiraLinha.valorSemIVA + primeiraLinha.valorIVA;
            
            // Atualizar totais
            resultado.totais.semIVA += ajusteSemIVA;
            resultado.totais.comIVA = totalComIVA;
            resultado.totais.detalhesPorTaxa[primeiraLinha.taxaIVA].totalSemIVA += ajusteSemIVA;
            resultado.totais.detalhesPorTaxa[primeiraLinha.taxaIVA].totalIVA = resultado.totais.detalhesPorTaxa[primeiraLinha.taxaIVA].totalSemIVA * (primeiraLinha.taxaIVA / 100);
            resultado.totais.detalhesPorTaxa[primeiraLinha.taxaIVA].totalComIVA = resultado.totais.detalhesPorTaxa[primeiraLinha.taxaIVA].totalSemIVA + resultado.totais.detalhesPorTaxa[primeiraLinha.taxaIVA].totalIVA;
        }
    }
    
    return resultado;
}

function exibirResultado(resultado, valorEsperado) {
    let texto = `DISTRIBUIÇÃO COM MÚLTIPLAS TAXAS DE IVA\n`;
    texto += `==========================================\n\n`;
    
    // Agrupar linhas por taxa de IVA
    const linhasPorTaxa = {};
    resultado.distribuicoes.forEach(linha => {
        if (!linhasPorTaxa[linha.taxaIVA]) {
            linhasPorTaxa[linha.taxaIVA] = [];
        }
        linhasPorTaxa[linha.taxaIVA].push(linha);
    });
    
    // Exibir por taxa
    Object.keys(linhasPorTaxa).sort((a, b) => parseInt(a) - parseInt(b)).forEach(taxa => {
        const linhas = linhasPorTaxa[taxa];
        const detalhes = resultado.totais.detalhesPorTaxa[taxa];
        
        texto += `IVA ${taxa}% (${linhas.length} linha${linhas.length > 1 ? 's' : ''}):\n`;
        texto += `----------------------------------------\n`;
        
        linhas.forEach(linha => {
            texto += `Linha ${linha.numero}: Sem IVA = €${linha.valorSemIVA.toFixed(2)}, IVA = €${linha.valorIVA.toFixed(2)}, Com IVA = €${linha.valorComIVA.toFixed(2)}\n`;
        });
        
        texto += `Subtotal ${taxa}%: Sem IVA = €${detalhes.totalSemIVA.toFixed(2)}, IVA = €${detalhes.totalIVA.toFixed(2)}, Com IVA = €${detalhes.totalComIVA.toFixed(2)}\n\n`;
    });
    
    // Totais gerais
    texto += `TOTAIS GERAIS:\n`;
    texto += `==============\n`;
    texto += `Total sem IVA: €${resultado.totais.semIVA.toFixed(2)}\n`;
    texto += `Total com IVA calculado: €${resultado.totais.comIVA.toFixed(2)}\n`;
    texto += `Valor esperado: €${valorEsperado.toFixed(2)}\n`;
    texto += `Diferença: €${(resultado.totais.comIVA - valorEsperado).toFixed(2)}\n`;
    
    document.getElementById("resultado").innerText = texto;
}