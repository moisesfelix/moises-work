import * as express from 'express';
import * as cors from 'cors';
import fetch from 'node-fetch'; // Usando fetch conforme solicitado

const paymentApp = express();
paymentApp.use(cors({ origin: true }));
paymentApp.use(express.json());

// Log middleware para debug
paymentApp.use((req, res, next) => {
  console.log(`[PaymentAPI] ${req.method} ${req.url}`);
  next();
});

// Constantes das APIs externas
const PIX_GENERATE_API = 'https://conecta-se.web.app/gerar-pix';
const PIX_LIST_PAYMENTS_API = 'https://conecta-se.web.app/list-payment-pix';

// Token estático de segurança interna (pode ser movido para .env futuramente)
// const INTERNAL_TOKEN = 'moises-work-payment-proxy-token-2024';

// Middleware simples de autenticação interna (opcional, para evitar abuso direto da URL)
const validateInternalToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Para desenvolvimento/teste rápido, podemos deixar aberto ou verificar um header simples
  // const token = req.headers['x-internal-token'];
  // if (token !== INTERNAL_TOKEN) {
  //   return res.status(403).json({ error: 'Unauthorized internal access' });
  // }
  next();
};

// Criar um Router para as rotas
const router = express.Router();

/**
 * Rota: GET /health
 * Verifica status da API de pagamentos
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'payment-api' });
});

/**
 * Rota: POST /generate
 * Proxy para gerar cobrança PIX
 * Recebe: { planId, valor, userId, txid }
 */
router.post('/generate', validateInternalToken, async (req, res) => {
  try {
    const { valor, txid } = req.body;

    if (!valor || !txid) {
      res.status(400).json({ error: 'Missing required fields: valor, txid' });
      return; 
    }

    // Prepara payload limpo para a API externa
    // Garante que o valor esteja formatado corretamente (ex: "10.00")
    let formattedValor = valor;
    if (typeof valor === 'number') {
        formattedValor = valor.toFixed(2);
    } else if (typeof valor === 'string' && !isNaN(parseFloat(valor))) {
        formattedValor = parseFloat(valor).toFixed(2);
    }

    const externalPayload = {
        valor: formattedValor,
        txid: txid
    };

    // Faz a chamada para a API externa
    console.log(`[PaymentAPI] Calling external API: ${PIX_GENERATE_API} with body:`, externalPayload);
    const response = await fetch(PIX_GENERATE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(externalPayload)
    });

    if (!response.ok) {
        // Tenta ler o corpo do erro se possível
        const errorText = await response.text();
        console.error(`[PaymentAPI] External API Error Status: ${response.status} ${response.statusText}`);
        console.error(`[PaymentAPI] External API Error Body:`, errorText);
        throw new Error(`External API Error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Normaliza resposta da API externa para formato esperado pelo SDK
    const normalizedData = {
        copieecola: data.copieecola || data.qrCodeData?.qrcode || data.charge?.pixCopiaECola,
        qrcodeImage: data.qrcodeImage || data.qrCodeData?.imagemQrcode,
        charge: data.charge,
        txid: data.charge?.txid || txid
    };

    res.json(normalizedData);
  } catch (error: any) {
    console.error('Error generating PIX:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate PIX', 
      details: error.message 
    });
  }
});

/**
 * Rota: GET /list
 * Proxy para listar pagamentos PIX
 * Recebe query params: startDate, endDate
 */
router.get('/list', validateInternalToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Missing required query params: startDate, endDate' });
      return; 
    }

    const params = new URLSearchParams({
        startDate: startDate as string,
        endDate: endDate as string
    });

    const response = await fetch(`${PIX_LIST_PAYMENTS_API}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`External API Error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('Error listing PIX payments:', error.message);
    res.status(500).json({ 
      error: 'Failed to list payments',
      details: error.message 
    });
  }
});

// Monta o router na raiz E no prefixo /payment para garantir que funcione
// independentemente de como o Firebase Hosting reescreve a URL.
paymentApp.use('/', router);
paymentApp.use('/payment', router);

export default paymentApp;
