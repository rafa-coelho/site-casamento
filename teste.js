const valor = 1000.01;
const maximoParcelas = 12;

const fator = [
    { parcelas: 1, fator: 1 },
    { parcelas: 2, fator: 0.51495 },
    { parcelas: 3, fator: 0.34670 },
    { parcelas: 4, fator: 0.26255 },
    { parcelas: 5, fator: 0.21210 },
    { parcelas: 6, fator: 0.17847 },
    { parcelas: 7, fator: 0.15446 },
    { parcelas: 8, fator: 0.13645 },
    { parcelas: 9, fator: 0.12246 },
    { parcelas: 10, fator: 0.11127 },
    { parcelas: 11, fator: 0.10212 },
    { parcelas: 12, fator: 0.09450 }
];

const parcelas = [];

for (let i = 1; i <= maximoParcelas; i++) {
    const valor_parcela = valor * fator.find(x => x.parcelas === i).fator;
    const valor_total = valor_parcela * i;
    const juros = ((valor_total - valor) / valor) * 100;
    //${juros > 0 ? ` (${juros.toFixed(2)}%)` : '' }

    parcelas.push({
        parcelas: i,
        valor_parcela,
        valor_total,
        juros,
        label: `${i}x de R$ ${parseFloat(valor_parcela).toFixed(2)}`
    });

    html += `<option value="${i}" valor_parcela='${valor_parcela}'>${i}x de R$ ${parseFloat(valor_parcela).toFixed(2)}</option>`;
}

console.log(parcelas)