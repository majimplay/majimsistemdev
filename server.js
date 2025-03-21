const express = require('express');
const app = express();
const stripe = require('stripe')('sk_test_51R4tD8L1dPSHoy7pZax1VdgcycbYojxOkhWHISM2CdVo6hNfjFuAT62yfF1JOxj1eDMnw9cGPbT0tCWpilIaeDbw00jFMYZUnr'); // Chave secreta de teste

app.use(express.json());

// Rota para processar o pagamento
app.post('/processar-pagamento', async (req, res) => {
  const { paymentMethodId } = req.body;
  
  try {
    // Cria uma intenção de pagamento com valor de 10,00 reais (1000 centavos)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: 'brl',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
    });

    // Verifica se é necessária autenticação adicional (ex: 3D Secure)
    if (paymentIntent.status === 'requires_action') {
      res.send({
        requiresAction: true,
        paymentIntentClientSecret: paymentIntent.client_secret,
      });
    } else if (paymentIntent.status === 'succeeded') {
      // Pagamento concluído com sucesso
      res.send({ success: true });
    } else {
      res.send({ error: 'Status de pagamento inesperado.' });
    }
  } catch (error) {
    res.send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
