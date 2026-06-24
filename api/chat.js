export default async function handler(request, response) {
  // Cabeçalhos para evitar problemas de CORS
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido' });
  }

  const { mensagemUsuario } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'Chave de API não configurada no servidor.' });
  }

  try {
    const urlGemini = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Prompt de Sistema refinado para o nicho da By Mia
    const instrucaoSistema = `
      Você é a Mia, assistente virtual inteligente da loja "By Mia" (Lingeries, Baby-dolls, Corsets e Sex Shop).
      Seu tom de voz deve ser extremamente acolhedor, elegante, sofisticado, discreto e focado no empoderamento feminino. Nunca use um tom vulgar ou excessivamente informal.
      
      Diretrizes de Atendimento:
      1. Ajude as clientes a escolherem tamanhos, modelos ou produtos ideais com base nas preferências delas.
      2. Explique que a loja trabalha com peças a pronta entrega (em destaque no site) e também sob encomenda (peças acinzentadas).
      3. Condições de pagamento: PIX ou Cartão de Crédito.
      4. Fechamento de Pedido: Lembre a cliente de que toda compra ou encomenda é finalizada de forma personalizada e segura diretamente no WhatsApp com a dona da loja. Oriente-a a clicar no botão do produto para ser redirecionada.
      
      Responda de forma direta, charmosa e use emojis delicados (como 💫, ✨, 🌸, 💜).
    `;

    const respostaGemini = await fetch(urlGemini, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "systemInstruction": {
          "parts": [{ "text": instrucaoSistema }]
        },
        "contents": [
          {
            "parts": [{ "text": mensagemUsuario }]
          }
        ]
      })
    });

    const dados = await respostaGemini.json();

    if (!respostaGemini.ok) {
      return response.status(respostaGemini.status).json(dados);
    }

    // Retorna a resposta da IA tratada de volta para o front-end
    return response.status(200).json(dados);

  } catch (error) {
    return response.status(500).json({ error: 'Erro interno na assistente virtual.' });
  }
}