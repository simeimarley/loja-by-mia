// js/main.js

// ==========================================
// 1. RENDERIZAÇÃO DOS PRODUTOS NA TELA
// ==========================================
function carregarProdutos(listaDeProdutos) {
    const grade = document.getElementById("grade-produtos");
    grade.innerHTML = ""; // Limpa a grade antes de carregar

    listaDeProdutos.forEach(produto => {
        // Verifica se o item está disponível ou esgotado para aplicar a classe certa
        const classeEsgotado = produto.disponivel ? "" : "esgotado";
        
        // Define o texto do botão e o estilo com base no estoque
        const textoBotao = produto.disponivel ? "🛍️ Comprar via WhatsApp" : "📩 Solicitar Encomenda";
        const classeBotao = produto.disponivel ? "btn-comprar" : "btn-encomenda";

        // Cria o card HTML estruturado
        const cardHTML = `
            <div class="produto-card ${classeEsgotado}">
                <div class="produto-imagem-wrapper">
                    ${!produto.disponivel ? '<span class="badge-esgotado">Sob Encomenda</span>' : ''}
                    <img src="${produto.imagem}" alt="${produto.nome}">
                </div>
                <div class="produto-info">
                    <h3 class="produto-nome">${produto.nome}</h3>
                    <p class="produto-preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                    <a href="${produto.linkWhats}" target="_blank" class="btn-acao ${classeBotao}">
                        ${textoBotao}
                    </a>
                </div>
            </div>
        `;
        
        // Injeta o card criado dentro da nossa div principal no HTML
        grade.innerHTML += cardHTML;
    });
}

// Lógica simples para os botões de filtro do topo funcionarem
function filtrarProdutos(categoria) {
    if (categoria === 'todos') {
        carregarProdutos(produtos);
    } else {
        const filtrados = produtos.filter(p => p.categoria === categoria);
        carregarProdutos(filtrados);
    }
}

// ==========================================
// 2. LÓGICA DE MINIMIZAR / ABRIR O CHATBOT
// ==========================================
const chatJanela = document.getElementById("chat-janela");
const chatHeader = document.querySelector(".chat-header");

// Inicializa o chat já minimizado por padrão ao carregar a página
chatJanela.classList.add("minimizado");
chatHeader.innerHTML += ' <span id="icone-chat">▲</span>'; // Adiciona uma setinha indicativa

// Escuta o clique no cabeçalho do robô
chatHeader.addEventListener("click", () => {
    // Altera o estado (se tiver a classe 'minimizado', remove. Se não tiver, adiciona)
    chatJanela.classList.toggle("minimizado");
    
    // Altera a setinha para cima ou para baixo para dar o feedback visual
    const icone = document.getElementById("icone-chat");
    if (chatJanela.classList.contains("minimizado")) {
        icone.innerText = "▲";
    } else {
        icone.innerText = "▼";
    }
});

// Executa automaticamente a montagem dos produtos assim que o site abre
window.onload = () => {
    carregarProdutos(produtos);
};

// ==========================================
// 3. INTEGRAÇÃO CONEXÃO DO CHATBOT (IA)
// ==========================================
const btnEnviarChat = document.getElementById("btn-enviar-chat");
const inputChat = document.getElementById("chat-input");
const containerMensagens = document.getElementById("chat-mensagens");

async function enviarMensagemParaIA() {
    const textoMensagem = inputChat.value.trim();
    if (!textoMensagem) return; // Se estiver vazio, não faz nada

    // 1. Limpa o campo de texto e adiciona a mensagem da cliente na tela
    inputChat.value = "";
    containerMensagens.innerHTML += `
        <div class="msg-usuario" style="background-color: var(--vinho-logo); color: #fff; padding: 10px 14px; border-radius: 12px 12px 0 12px; align-self: flex-end; max-width: 85%; margin-bottom: 5px;">
            ${textoMensagem}
        </div>
    `;
    
    // Rola o chat automaticamente para a última mensagem
    containerMensagens.scrollTop = containerMensagens.scrollHeight;

    // 2. Cria o balão de "digitando..." temporário para dar realismo
    const idIdCarregando = "msg-loading-" + Date.now();
    containerMensagens.innerHTML += `
        <div class="msg-bot" id="${idIdCarregando}">
            <em>Mia está digitando... ✨</em>
        </div>
    `;
    containerMensagens.scrollTop = containerMensagens.scrollHeight;

    try {
        // 3. Faz a requisição para a nossa rota do servidor na Vercel
        const resposta = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagemUsuario: textoMensagem })
        });

        const dados = await resposta.json();
        
        // Remove o indicador de carregamento
        document.getElementById(idIdCarregando).remove();

        if (!resposta.ok) {
            throw new Error("Erro na resposta do servidor");
        }

        // Pega o texto gerado pelo Gemini
        const respostaDaMia = dados.candidates[0].content.parts[0].text;

        // 4. Injeta a resposta oficial da assistente no chat
        containerMensagens.innerHTML += `
            <div class="msg-bot">
                ${respostaDaMia.replace(/\n/g, '<br>')}
            </div>
        `;

    } catch (erro) {
        console.error("Erro no chat:", erro);
        document.getElementById(idIdCarregando).remove();
        containerMensagens.innerHTML += `
            <div class="msg-bot" style="color: #ef4444;">
                Desculpe, tive um probleminha técnico. Pode tentar me perguntar de novo? 💫
            </div>
        `;
    }

    // Garante que o scroll desça até o final após a resposta chegar
    containerMensagens.scrollTop = containerMensagens.scrollHeight;
}

// Escuta o clique no botão de Enviar do chat
btnEnviarChat.addEventListener("click", enviarMensagemParaIA);

// Permite enviar a mensagem apenas apertando a tecla "Enter" no teclado
inputChat.addEventListener("keypress", (evento) => {
    if (evento.key === "Enter") {
        enviarMensagemParaIA();
    }
});