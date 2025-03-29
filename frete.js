// cloud/main.js
const fetch = require('node-fetch');

Parse.Cloud.define('calcularFrete', async (request) => {
    try {
        // Validação do CEP
        const cepDestino = request.params.cepDestino?.replace(/\D/g, '');
        if (!cepDestino || cepDestino.length !== 8) {
            throw new Parse.Error(101, 'CEP inválido');
        }

        // Configuração do payload
        const payload = {
            from: { postal_code: '01001000' },
            to: { postal_code: cepDestino },
            package: {
                height: 20,
                width: 30,
                length: 40,
                weight: 2
            },
            options: {
                insurance_value: 0,
                receipt: false,
                own_hand: false
            }
        };

        // Chamada à API Melhor Envio
        const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
                'User-Agent': 'FreteCalculator/1.0'
            },
            body: JSON.stringify(payload)
        });

        // Tratamento de erros da API
        if (!response.ok) {
            const errorData = await response.json();
            throw new Parse.Error(500, errorData.message || 'Erro na API');
        }

        const data = await response.json();

        // Processamento dos resultados
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
        console.error('Erro detalhado:', {
            code: error.code,
            message: error.message,
            params: request.params
        });
        throw new Parse.Error(error.code || 500, error.message);
    }
});
