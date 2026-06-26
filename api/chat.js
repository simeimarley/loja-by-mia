export default async function handler(request, response) {
  console.log("=== NOVA REQUISIÇÃO RECEBIDA ===");
  console.log("Método HTTP:", request.method);

  // Configuração dos cabeçalhos de CORS
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    console.log("Requisição de PREFLIGHT (OPTIONS). Respondendo 200.");
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    console.log("Erro: Método não permitido:", request.method);
    return response.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log("Verificando corpo da requisição...");
    if (!request.body) {
      console.log("Erro: O request.body está vindo vazio ou indefinido.");
      return response.status(400).json({ error: 'Corpo da requisição inválido.' });
    }

    const { mensagemUsuario } = request.body;
    console.log("Mensagem recebida do usuário:", mensagemUsuario);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.log("Erro Crítico: A variável GROQ_API_KEY não foi encontrada no ambiente da Vercel.");
      return response.status(500).json({ error: 'Chave GROQ_API_KEY não configurada no servidor.' });
    }

    console.log("Chave encontrada com sucesso. Preparando chamada para a Groq...");
    const urlGroq = "https://api.groq.com/openai/v1/chat/completions";

    const instrucaoSistema = `
      Você é a Mia, assistente virtual inteligente da loja "By Mia" (Lingeries, Baby-dolls, Corsets, Sex Shop, Camisolas, Produtos de cuidados pessoais e íntimos, etc).
      Seu tom de voz deve ser extremamente acolhedor, elegante, sofisticado, discreto e focado no empoderamento feminino. Nunca use um tom vulgar ou excessivamente informal.
      
      Diretrizes de Atendimento:
      1. Ajude as clientes a escolherem tamanhos, modelos ou produtos ideais com base nas preferências delas.
      2. Explique que a loja trabalha com peças a pronta entrega (em destaque no site) e também sob encomenda (peças acinzentadas).
      3. Condições de pagamento: PIX ou Cartão de Crédito.
      4. Fechamento de Pedido: Lembre a cliente de que toda compra ou encomenda é finalizada de forma personalizada e segura diretamente no WhatsApp com a dona da loja. Oriente-a a clicar no botão do produto para ser redirecionada.
      
      Responda de forma direta, charmosa e use emojis delicados (como 💫, ✨, 🌸, 💜), não seja muito longo nas respostas para não cansar o cliente na leitura.
    `;

    console.log("Disparando fetch externo para api.groq.com...");
    const respostaGroq = await fetch(urlGroq, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        "model": "llama-3.3-70b-versatile",
        "messages": [
          { "role": "system", "content": instrucaoSistema },
          { "role": "user", "content": mensagemUsuario }
        ]
      })
    });

    console.log("Resposta da Groq recebida. Status HTTP:", respostaGroq.status);
    const dados = await respostaGroq.json();

    if (!respostaGroq.ok) {
      console.log("A API da Groq retornou um erro interno:", dados);
      return response.status(respostaGroq.status).json(dados);
    }

    const textoPuro = dados.choices[0].message.content;
    console.log("Sucesso! Texto gerado pela IA com sucesso. Enviando ao front-end.");
    
    return response.status(200).json({ respostaMia: textoPuro });

  } catch (error) {
    console.error("OCORREU UM ERRO NO CATCH INTERNO:", error);
    return response.status(500).json({ error: 'Erro interno na assistente virtual da Groq.', detalhes: error.message });
  }
}