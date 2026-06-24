// js/main.js

// Estado global do carrinho (Tenta puxar do navegador, se não existir começa vazio)
let carrinho = JSON.parse(localStorage.getItem("carrinho_bymia")) || [];

// ==========================================
// 1. RENDERIZAÇÃO DOS PRODUTOS NA TELA
// ==========================================
function carregarProdutos(listaDeProdutos) {
    const grade = document.getElementById("grade-produtos");
    grade.innerHTML = ""; 

    listaDeProdutos.forEach(produto => {
        const classeEsgotado = produto.disponivel ? "" : "esgotado";
        
        // Agora ambos os botões chamam funções internas do JS em vez de links diretos
        const textoBotao = produto.disponivel ? "🛍️ Adicionar ao Carrinho" : "📩 Solicitar Encomenda";
        const classeBotao = produto.disponivel ? "btn-comprar" : "btn-encomenda";

        const cardHTML = `
            <div class="produto-card ${classeEsgotado}">
                <div class="produto-imagem-wrapper">
                    ${!produto.disponivel ? '<span class="badge-esgotado">Sob Encomenda</span>' : ''}
                    <img src="${produto.imagem}" alt="${produto.nome}">
                </div>
                <div class="produto-info">
                    <h3 class="produto-nome">${produto.nome}</h3>
                    <p class="produto-preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                    <button onclick="adicionarAoCarrinho(${produto.id})" class="btn-acao ${classeBotao}">
                        ${textoBotao}
                    </button>
                </div>
            </div>
        `;
        
        grade.innerHTML += cardHTML;
    });
    
    // Inicializa os números do carrinho na tela caso o cliente já tivesse itens salvos
    atualizarInterfaceCarrinho();
}

// Cole este bloco dentro de js/main.js (pode ser logo após a função carregarProdutos)
function filtrarProdutos(categoria) {
    if (categoria === 'todos') {
        carregarProdutos(produtos);
    } else {
        const filtrados = produtos.filter(p => p.categoria === categoria);
        carregarProdutos(filtrados);
    }
}

// ==========================================
// 2. GERENCIAMENTO DA CARRINHO DE COMPRAS
// ==========================================

function abrirCarrinho() {
    document.getElementById("carrinho-lateral").classList.add("aberto");
    document.getElementById("carrinho-overlay").classList.add("aberto");
}

function fecharCarrinho() {
    document.getElementById("carrinho-lateral").classList.remove("aberto");
    document.getElementById("carrinho-overlay").classList.remove("aberto");
}

function adicionarAoCarrinho(idDeProduto) {
    // Procura o produto completo dentro do array do arquivo produtos.js
    const produtoEncontrado = produtos.find(p => p.id === idDeProduto);
    
    if (produtoEncontrado) {
        // Verifica se o item já está no carrinho para aumentar apenas a quantidade
        const itemExistente = carrinho.find(item => item.id === idDeProduto);
        
        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            carrinho.push({
                ...produtoEncontrado,
                quantidade: 1
            });
        }
        
        // Salva as alterações no navegador do cliente
        localStorage.setItem("carrinho_bymia", JSON.stringify(carrinho));
        
        // Atualiza as contagens e abre o carrinho para dar feedback visual de sucesso
        atualizarInterfaceCarrinho();
        abrirCarrinho();
    }
}

function removerDoCarrinho(idDeProduto) {
    carrinho = carrinho.filter(item => item.id !== idDeProduto);
    localStorage.setItem("carrinho_bymia", JSON.stringify(carrinho));
    atualizarInterfaceCarrinho();
}

function atualizarInterfaceCarrinho() {
    const containerItens = document.getElementById("itens-carrinho");
    const contadorTopo = document.getElementById("contador-carrinho");
    const totalTela = document.getElementById("valor-total-carrinho");
    
    containerItens.innerHTML = "";
    let totalAcumulado = 0;
    let totalItens = 0;

    if (carrinho.length === 0) {
        containerItens.innerHTML = `<p style="text-align:center; color:#71717a; margin-top:20px;">Sua sacola está vazia... 🌸</p>`;
    }

    carrinho.forEach(item => {
        totalAcumulado += item.preco * item.quantidade;
        totalItens += item.quantidade;

        const statusEstoque = item.disponivel ? "" : " <small style='color:#ef4444;'>(Sob Encomenda)</small>";

        // Modificamos aqui para criar os botões de [+] e [-] ao lado da quantidade
        containerItens.innerHTML += `
            <div class="item-sacola">
                <div class="item-sacola-info">
                    <h4>${item.nome}${statusEstoque}</h4>
                    <p>R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                    
                    <div class="item-quantidade-controles">
                        <button onclick="alterarQuantidade(${item.id}, -1)">-</button>
                        <span>${item.quantidade}</span>
                        <button onclick="alterarQuantidade(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="btn-remover-item" onclick="removerDoCarrinho(${item.id})">Remover</button>
            </div>
        `;
    });

    contadorTopo.innerText = totalItens;
    totalTela.innerText = `R$ ${totalAcumulado.toFixed(2).replace('.', ',')}`;
}

// NOVA FUNÇÃO: Controla o clique no + e - dentro do carrinho
function alterarQuantidade(idDeProduto, mudanca) {
    // Encontra o item dentro do carrinho
    const itemEncontrado = carrinho.find(item => item.id === idDeProduto);
    
    if (itemEncontrado) {
        itemEncontrado.quantidade += mudanca;
        
        // Se a quantidade chegar a 0 ou menos, removemos o item da sacola automaticamente
        if (itemEncontrado.quantidade <= 0) {
            removerDoCarrinho(idDeProduto);
            return;
        }
        
        // Salva a nova quantidade no navegador e atualiza a tela
        localStorage.setItem("carrinho_bymia", JSON.stringify(carrinho));
        atualizarInterfaceCarrinho();
    }
}

// ==========================================
// 3. COMPILAÇÃO E DISPARO PARA O WHATSAPP
// ==========================================
function finalizarPedidoWhats() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    let numeroWhats = "5571982752913"; // Substitua pelo número real dela
    let textoMensagem = "Olá, Mia! \nGostaria de fazer o pedido dos seguintes itens do site:\n\n";
    let total = 0;

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        const etiquetaEstoque = item.disponivel ? "[Pronta Entrega]" : "[PEDIDO SOB ENCOMENDA]";
        
        textoMensagem += `    ${item.quantidade}x ${item.nome}\n`;
        textoMensagem += `    Status: ${etiquetaEstoque}\n`;
        textoMensagem += `    Valor: R$ ${subtotal.toFixed(2).replace('.', ',')}\n\n`;
    });

    textoMensagem += `-----------------------------\n`;
    textoMensagem += ` *Valor Total do Pedido:* R$ ${total.toFixed(2).replace('.', ',')}\n\n`;
    textoMensagem += `Como faço para prosseguir com o pagamento e entrega? `;

    // Converte o texto plano em um formato de URL seguro para a internet
    const linkFinal = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(textoMensagem)}`;
    
    // Abre o WhatsApp em uma nova aba
    window.open(linkFinal, "_blank");
}

// O restante do código abaixo (Lógica de abrir/fechar chat e conexão com a API da Groq) CONTINUA IGUALZINHO.

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
    
    containerMensagens.scrollTop = containerMensagens.scrollHeight;

    // 2. Cria o balão de "digitando..."
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

        if (!resposta.ok) {
            throw new Error(dados.error || "Erro na resposta do servidor");
        }

        // Pega o texto gerado pela Groq que o nosso back-end mastigou
        const respostaDaMia = dados.respostaMia;

        // 4. Injeta a resposta oficial da assistente no chat
        containerMensagens.innerHTML += `
            <div class="msg-bot">
                ${respostaDaMia.replace(/\n/g, '<br>')}
            </div>
        `;

    } catch (erro) {
        console.error("Erro no chat:", erro);
        // Agora, se houver erro, ele será exibido graciosamente na tela
        containerMensagens.innerHTML += `
            <div class="msg-bot" style="color: #ef4444;">
                Desculpe, tive um probleminha técnico para me conectar. Pode tentar de novo? 💫
            </div>
        `;
    } finally {
        // O bloco 'finally' roda SEMPRE (dando certo ou errado) e remove o carregamento com segurança
        const elementoLoading = document.getElementById(idIdCarregando);
        if (elementoLoading) {
            elementoLoading.remove();
        }
        containerMensagens.scrollTop = containerMensagens.scrollHeight;
    }
}

// Escuta o clique no botão de Enviar do chat
btnEnviarChat.addEventListener("click", enviarMensagemParaIA);

// Permite enviar a mensagem apenas apertando a tecla "Enter" no teclado
inputChat.addEventListener("keypress", (evento) => {
    if (evento.key === "Enter") {
        enviarMensagemParaIA();
    }
});