function distribuirValor() {
    const totalComIVA = parseFloat(document.getElementById("valorComIva").value);
    const taxaIVA = parseFloat(document.getElementById("taxaIva").value);
    const numLinhas = parseInt(document.getElementById("linhas").value);

    if (isNaN(totalComIVA) || isNaN(taxaIVA) || isNaN(numLinhas) || numLinhas <= 0) {
      document.getElementById("resultado").innerText = "Preenche todos os campos corretamente.";
      return;
    }

    const taxa = 1 + (taxaIVA / 100);
    const totalSemIVA = +(totalComIVA / taxa).toFixed(6);
    const baseSemIVA = +(totalSemIVA / numLinhas).toFixed(6);

    let valores = [];
    let acumuladoComIVA = 0;

    for (let i = 0; i < numLinhas; i++) {
      let valor = baseSemIVA;
      valor = +(Math.round(valor * 100) / 100);
      valores.push(valor);
      acumuladoComIVA += +(valor * taxa).toFixed(2);
    }

    let diferenca = +(totalComIVA - acumuladoComIVA).toFixed(2);
    if (diferenca !== 0) {
      for (let i = 0; i < numLinhas; i++) {
        let ajuste = +(diferenca / taxa).toFixed(2);
        valores[i] += ajuste;
        acumuladoComIVA = valores.reduce((soma, v) => soma + +(v * taxa).toFixed(2), 0);
        if (+(acumuladoComIVA.toFixed(2)) === totalComIVA) break;
      }
    }

    let texto = `Distribuição para ${numLinhas} linhas:\n\n`;
    let somaFinal = 0;
    valores.forEach((v, i) => {
      const valorIVA = +(v * (taxaIVA / 100)).toFixed(2);
      const comIVA = +(v + valorIVA).toFixed(2);
      somaFinal += comIVA;
      texto += `Linha ${i + 1}: Sem IVA = €${v.toFixed(2)}, IVA = €${valorIVA}, Com IVA = €${comIVA}\n`;
    });

    texto += `\nTotal com IVA calculado: €${somaFinal.toFixed(2)} (esperado: €${totalComIVA})`;
    document.getElementById("resultado").innerText = texto;
  }