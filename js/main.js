// js/main.js

// Estado global do carrinho
let carrinho = JSON.parse(localStorage.getItem("carrinho_bymia")) || [];

// ==========================================
// 1. RENDERIZAÇÃO DO CATALOGO (HOME)
// ==========================================
function carregarProdutos(listaDeProdutos) {
    const grade = document.getElementById("grade-produtos");
    if (!grade) return;
    grade.innerHTML = ""; 

    listaDeProdutos.forEach(produto => {
        const classeEsgotado = produto.disponivel ? "" : "esgotado";
        
        // Cálculos de Otimização de Preço (Estilo Click Sophia)
        const precoPix = produto.preco * 0.90; // 10% de desconto no PIX
        const precoParcela = produto.preco / 3; // Parcelamento em 3x

        // O box inteiro (.produto-card) agora possui o evento de clique para a página de detalhes
        const cardHTML = `
            <div class="produto-card ${classeEsgotado}" onclick="window.location.href='produto.html?id=${produto.id}'" style="cursor: pointer;">
                <div class="produto-imagem-wrapper">
                    ${!produto.disponivel ? '<span class="badge-esgotado">Sob Encomenda</span>' : ''}
                    <img src="${produto.imagem}" alt="${produto.nome}">
                </div>
                <div class="produto-info">
                    <h3 class="produto-nome">${produto.nome}</h3>
                    <div class="bloco-precificacao">
                        <p class="produto-preco-original">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                        <p class="produto-preco-pix">R$ ${precoPix.toFixed(2).replace('.', ',')} <span class="badge-pix">no PIX (10% OFF)</span></p>
                        <p class="produto-preco-cartao">ou 3x de R$ ${precoParcela.toFixed(2).replace('.', ',')} sem juros</p>
                    </div>
                    <button class="btn-ver-produto">Ver Opções ✨</button>
                </div>
            </div>
        `;
        
        grade.innerHTML += cardHTML;
    });
}

function filtrarProdutos(categoria) {
    if (categoria === 'todos') {
        carregarProdutos(produtos);
    } else {
        const filtrados = produtos.filter(p => p.categoria === categoria);
        carregarProdutos(filtrados);
    }
}

// ==========================================
// 2. DINÂMICA DA PÁGINA DE DETALHES
// ==========================================
function carregarProdutoDetalhe() {
    const params = new URLSearchParams(window.location.search);
    const idProduto = parseInt(params.get("id"));
    
    const produto = produtos.find(p => p.id === idProduto);
    if (!produto) {
        document.getElementById("detalhe-produto-container").innerHTML = "<h2 style='text-align:center; margin: 50px 0;'>Produto não encontrado... 🌸</h2>";
        return;
    }

    const precoPix = produto.preco * 0.90;
    const precoParcela = produto.preco / 3;

    // Injeta os dados nas tags da página de detalhes
    document.getElementById("detalhe-img").src = produto.imagem;
    document.getElementById("detalhe-nome").innerText = produto.nome;
    document.getElementById("detalhe-preco-original").innerText = `R$ ${produto.preco.toFixed(2).replace('.', ',')}`;
    
    // CORREÇÃO: Remove o "R$" duplicado aqui, já que o HTML já possui o caractere fixo externo
    document.getElementById("detalhe-preco-pix").innerText = `${precoPix.toFixed(2).replace('.', ',')}`;
    document.getElementById("detalhe-preco-cartao").innerText = `ou 3x de R$ ${precoParcela.toFixed(2).replace('.', ',')} sem juros`;

    // Renderiza pílulas de Tamanhos
    const containerTamanhos = document.getElementById("seletor-tamanhos");
    if (containerTamanhos) {
        containerTamanhos.innerHTML = "";
        produto.tamanhos.forEach((t, i) => {
            containerTamanhos.innerHTML += `<button class="opcao-pilula ${i === 0 ? 'ativa' : ''}" onclick="selecionarVariacao(this)">${t}</button>`;
        });
    }

    // Renderiza pílulas de Cores
    const containerCores = document.getElementById("seletor-cores");
    if (containerCores) {
        containerCores.innerHTML = "";
        produto.cores.forEach((c, i) => {
            // Guardamos o link da imagem dentro do atributo data-imagem
            containerCores.innerHTML += `
                <button class="opcao-pilula ${i === 0 ? 'ativa' : ''}" 
                        data-imagem="${c.imagem}" 
                        onclick="selecionarVariacao(this)">
                    ${c.nome}
                </button>`;
        });
    }

    // Configura comportamento do botão de ação principal
    const btnAcao = document.getElementById("btn-adicionar-detalhe");
    if (btnAcao) {
        if (produto.disponivel) {
            btnAcao.innerHTML = "🛍️ Adicionar à Sacola";
            btnAcao.className = "btn-comprar-detalhe";
        } else {
            btnAcao.innerHTML = "📩 Encomendar no Tamanho Ideal";
            btnAcao.className = "btn-encomenda-detalhe";
        }
        btnAcao.onclick = () => adicionarAoCarrinhoComVariacao(produto.id);
    }
}

function selecionarVariacao(botao) {
    // Mantém a lógica visual de acender o botão clicado e apagar os outros
    const botoesIrmaos = botao.parentNode.querySelectorAll(".opcao-pilula");
    botoesIrmaos.forEach(b => b.classList.remove("ativa"));
    botao.classList.add("ativa");

    // MÁGICA DA COR: Se o botão clicado tiver uma imagem guardada nele, nós trocamos a foto da tela
    const novaImagem = botao.getAttribute("data-imagem");
    if (novaImagem) {
        const elementoFotoPrincipal = document.getElementById("detalhe-img");
        if (elementoFotoPrincipal) {
            elementoFotoPrincipal.src = novaImagem;
        }
    }
}

function adicionarAoCarrinhoComVariacao(idDeProduto) {
    const produto = produtos.find(p => p.id === idDeProduto);
    if (!produto) return;

    const tamAtivo = document.querySelector("#seletor-tamanhos .opcao-pilula.ativa");
    const corAtiva = document.querySelector("#seletor-cores .opcao-pilula.ativa");

    const tamanhoEscolhido = tamAtivo ? tamAtivo.innerText : "Único";
    const corEscolhida = corAtiva ? corAtiva.innerText : "Padrão";

    const carrinhoId = `${idDeProduto}-${tamanhoEscolhido}-${corEscolhida}`;
    const itemExistente = carrinho.find(item => item.carrinhoId === carrinhoId);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({
            ...produto,
            carrinhoId: carrinhoId,
            tamanhoEscolhido: tamanhoEscolhido,
            corEscolhida: corEscolhida,
            quantidade: 1
        });
    }

    localStorage.setItem("carrinho_bymia", JSON.stringify(carrinho));
    atualizarInterfaceCarrinho();
    abrirCarrinho();
}

// ==========================================
// 3. CONTROLE DA SACOLA DE COMPRAS
// ==========================================
function abrirCarrinho() {
    const lateral = document.getElementById("carrinho-lateral");
    const overlay = document.getElementById("carrinho-overlay");
    if (lateral) lateral.classList.add("aberto");
    if (overlay) overlay.classList.add("aberto");
}

let fecharCarrinho = () => {
    const lateral = document.getElementById("carrinho-lateral");
    const overlay = document.getElementById("carrinho-overlay");
    if (lateral) lateral.classList.remove("aberto");
    if (overlay) overlay.classList.remove("aberto");
}

function removerDoCarrinho(carrinhoId) {
    carrinho = carrinho.filter(item => item.carrinhoId !== carrinhoId);
    localStorage.setItem("carrinho_bymia", JSON.stringify(carrinho));
    atualizarInterfaceCarrinho();
}

function alterarQuantidade(carrinhoId, mudanca) {
    const item = carrinho.find(item => item.carrinhoId === carrinhoId);
    if (item) {
        item.quantidade += mudanca;
        if (item.quantidade <= 0) {
            removerDoCarrinho(carrinhoId);
            return;
        }
        localStorage.setItem("carrinho_bymia", JSON.stringify(carrinho));
        atualizarInterfaceCarrinho();
    }
}

function atualizarInterfaceCarrinho() {
    const containerItens = document.getElementById("itens-carrinho");
    const contadorTopo = document.getElementById("contador-carrinho");
    const totalTela = document.getElementById("valor-total-carrinho");
    
    if (!containerItens) return;
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

        containerItens.innerHTML += `
            <div class="item-sacola">
                <div class="item-sacola-info">
                    <h4>${item.nome}${statusEstoque}</h4>
                    <small style="color: #71717a; display: block; margin: 2px 0 6px 0;">Tam: ${item.tamanhoEscolhido} | Cor: ${item.corEscolhida}</small>
                    <p>R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                    <div class="item-quantidade-controles">
                        <button onclick="alterarQuantidade('${item.carrinhoId}', -1)">-</button>
                        <span>${item.quantidade}</span>
                        <button onclick="alterarQuantidade('${item.carrinhoId}', 1)">+</button>
                    </div>
                </div>
                <button class="btn-remover-item" onclick="removerDoCarrinho('${item.carrinhoId}')">Remover</button>
            </div>
        `;
    });

    if(contadorTopo) contadorTopo.innerText = totalItens;
    if(totalTela) totalTela.innerText = `R$ ${totalAcumulado.toFixed(2).replace('.', ',')}`;
}

function finalizarPedidoWhats() {
    if (carrinho.length === 0) return;

    let numeroWhats = "5571982752913"; // Ajuste o número real aqui
    let textoMensagem = "Olá, Mia! \nGostaria de encomendar os seguintes itens do site:\n\n";
    let total = 0;

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        const etiquetaEstoque = item.disponivel ? "[Pronta Entrega]" : "[PEDIDO SOB ENCOMENDA]";
        
        textoMensagem += ` ${item.quantidade}x ${item.nome}\n`;
        textoMensagem += `    Tamanho: ${item.tamanhoEscolhido} | Cor: ${item.corEscolhida}\n`;
        textoMensagem += `    Status: ${etiquetaEstoque}\n`;
        textoMensagem += `    Valor: R$ ${subtotal.toFixed(2).replace('.', ',')}\n\n`;
    });

    textoMensagem += `-----------------------------\n`;
    textoMensagem += ` *Valor Total:* R$ ${total.toFixed(2).replace('.', ',')}\n\n`;
    textoMensagem += `Como faço para prosseguir com o pagamento? `;

    window.open(`https://wa.me/${numeroWhats}?text=${encodeURIComponent(textoMensagem)}`, "_blank");
}

// ==========================================
// 4. INTEGRAÇÃO DOS CHATS (MIA / GROQ)
// ==========================================
async function enviarMensagemParaIA() {
    const inputChat = document.getElementById("chat-input");
    const containerMensagens = document.getElementById("chat-mensagens");
    if (!inputChat || !containerMensagens) return;

    const textoMensagem = inputChat.value.trim();
    if (!textoMensagem) return; 

    inputChat.value = "";
    containerMensagens.innerHTML += `
        <div class="msg-usuario" style="background-color: var(--vinho-logo); color: #fff; padding: 10px 14px; border-radius: 12px 12px 0 12px; align-self: flex-end; max-width: 85%; margin-bottom: 5px;">
            ${textoMensagem}
        </div>
    `;
    
    containerMensagens.scrollTop = containerMensagens.scrollHeight;

    const idIdCarregando = "msg-loading-" + Date.now();
    containerMensagens.innerHTML += `
        <div class="msg-bot" id="${idIdCarregando}">
            <em>Mia está digitando... ✨</em>
        </div>
    `;
    containerMensagens.scrollTop = containerMensagens.scrollHeight;

    try {
        const resposta = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagemUsuario: textoMensagem })
        });

        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.error || "Erro na resposta do servidor");

        const respostaDaMia = dados.respostaMia;
        containerMensagens.innerHTML += `
            <div class="msg-bot">
                ${respostaDaMia.replace(/\n/g, '<br>')}
            </div>
        `;

    } catch (erro) {
        console.error("Erro no chat:", erro);
        containerMensagens.innerHTML += `
            <div class="msg-bot" style="color: #ef4444;">
                Desculpe, tive um probleminha técnico para me conectar. Pode tentar de novo? 💫
            </div>
        `;
    } finally {
        const elementoLoading = document.getElementById(idIdCarregando);
        if (elementoLoading) elementoLoading.remove();
        containerMensagens.scrollTop = containerMensagens.scrollHeight;
    }
}

// ROTEADOR DE INICIALIZAÇÃO SEGURO
document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializa o catálogo se estiver na Home
    if (document.getElementById("grade-produtos")) {
        carregarProdutos(produtos);
    }
    
    // 2. Inicializa os detalhes se estiver na página do Produto
    if (document.getElementById("detalhe-produto-container")) {
        carregarProdutoDetalhe();
    }
    
    // 3. Renderiza o estado atual do carrinho
    atualizarInterfaceCarrinho();

    // 4. ATIVAÇÃO DO CLIQUE PARA ABRIR/MINIMIZAR O CHAT
    const chatHeader = document.querySelector(".chat-header");
    const chatJanela = document.querySelector(".chat-janela");

    if (chatHeader && chatJanela) {
        chatJanela.classList.add("minimizado");
        chatHeader.addEventListener("click", () => {
            chatJanela.classList.toggle("minimizado");
        });
    }

    // 5. ATIVAÇÃO BLINDADA DO ENVIO DE MENSAGENS (Apenas se os elementos existirem)
    const btnEnviarChat = document.getElementById("btn-enviar-chat");
    const inputChat = document.getElementById("chat-input");

    if (btnEnviarChat && inputChat) {
        btnEnviarChat.addEventListener("click", enviarMensagemParaIA);
        inputChat.addEventListener("keypress", (evento) => {
            if (evento.key === "Enter") {
                enviarMensagemParaIA();
            }
        });
    }
});