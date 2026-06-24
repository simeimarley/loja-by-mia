export default async function handler(request, response) {
  // Cabeçalhos de CORS para evitar bloqueios de requisição
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
  
  // Puxa a chave da Groq que você já configurou no painel da Vercel
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'Chave GROQ_API_KEY não encontrada no servidor.' });
  }

  try {
    const urlGroq = "https://api.groq.com/openai/v1/chat/completions";

    // Mantendo a personalidade elegante da Mia intacta
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

    const respostaGroq = await fetch(urlGroq, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        "model": "llama-3.3-70b-versatile",
        "messages": [
          {
            "role": "system",
            "content": instrucaoSistema
          },
          {
            "role": "user",
            "content": mensagemUsuario
          }
        ]
      })
    });

    const dados = await respostaGroq.json();

    if (!respostaGroq.ok) {
      return response.status(respostaGroq.status).json(dados);
    }

    // Jogada mestre: Extraímos o texto aqui no servidor e mandamos mastigado pro front-end
    const textoPuro = dados.choices[0].message.content;
    return response.status(200).json({ respostaMia: textoPuro });

  } catch (error) {
    return response.status(500).json({ error: 'Erro interno na assistente virtual da Groq.' });
  }
}