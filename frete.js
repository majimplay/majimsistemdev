 const Parse = require('parse/node');
const fetch = require('node-fetch');

Parse.Cloud.define('calcularFrete', async (request) => {
    try {
        // Validação dos dados
        const { cepOrigem, cepDestino, package } = request.params;
        
        if (!cepOrigem || !cepDestino || cepOrigem.length !== 8 || cepDestino.length !== 8) {
            throw new Parse.Error(101, 'CEPs inválidos');
        }

        // Configurar payload para API Melhor Envio
        const payload = {
            from: { postal_code: cepOrigem },
            to: { postal_code: cepDestino },
            package: {
                height: package.height,
                width: package.width,
                length: package.length,
                weight: package.weight
            },
            options: {
                insurance_value: 0,
                receipt: false,
                own_hand: false
            }
        };

        // Chamar API Melhor Envio
        const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
                'User-Agent': 'FreteCalculator/1.0'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Parse.Error(500, errorData.message || 'Erro na API de fretes');
        }

        const data = await response.json();

        // Processar resultados
        const resultados = data
            .filter(item => item.price && item.delivery_time)
            .map(item => ({
                empresa: item.company.name,
                metodo: item.name,
                prazo: `${item.delivery_time} dias úteis`,
                preco: parseFloat(item.price).toFixed(2)
            }));

        return { success: true, data: resultados };
    } catch (error) {
        console.error('Erro no cálculo de frete:', error);
        throw new Parse.Error(error.code || 500, error.message);
    }
});
