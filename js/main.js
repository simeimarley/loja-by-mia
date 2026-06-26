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
    document.getElementById("detalhe-preco-pix").innerText = `R$ ${precoPix.toFixed(2).replace('.', ',')}`;
    document.getElementById("detalhe-preco-cartao").innerText = `ou 3x de R$ ${precoParcela.toFixed(2).replace('.', ',')} sem juros`;

    // Renderiza pílulas de Tamanhos
    const containerTamanhos = document.getElementById("seletor-tamanhos");
    containerTamanhos.innerHTML = "";
    produto.tamanhos.forEach((t, i) => {
        containerTamanhos.innerHTML += `<button class="opcao-pilula ${i === 0 ? 'ativa' : ''}" onclick="selecionarVariacao(this)">${t}</button>`;
    });

    // Renderiza pílulas de Cores
    const containerCores = document.getElementById("seletor-cores");
    containerCores.innerHTML = "";
    produto.cores.forEach((c, i) => {
        containerCores.innerHTML += `<button class="opcao-pilula ${i === 0 ? 'ativa' : ''}" onclick="selecionarVariacao(this)">${c}</button>`;
    });

    // Configura comportamento do botão de ação principal
    const btnAcao = document.getElementById("btn-adicionar-detalhe");
    if (produto.disponivel) {
        btnAcao.innerHTML = "🛍️ Adicionar à Sacola";
        btnAcao.className = "btn-comprar-detalhe";
    } else {
        btnAcao.innerHTML = "📩 Encomendar no Tamanho Ideal";
        btnAcao.className = "btn-encomenda-detalhe";
    }
    
    btnAcao.onclick = () => adicionarAoCarrinhoComVariacao(produto.id);
}

function selecionarVariacao(botao) {
    const botoesIrmaos = botao.parentNode.querySelectorAll(".opcao-pilula");
    botoesIrmaos.forEach(b => b.classList.remove("ativa"));
    botao.classList.add("ativa");
}

function adicionarAoCarrinhoComVariacao(idDeProduto) {
    const produto = produtos.find(p => p.id === idDeProduto);
    if (!produto) return;

    const tamAtivo = document.querySelector("#seletor-tamanhos .opcao-pilula.ativa");
    const corAtiva = document.querySelector("#seletor-cores .opcao-pilula.ativa");

    const tamanhoEscolhido = tamAtivo ? tamAtivo.innerText : "Único";
    const corEscolhida = corAtiva ? corAtiva.innerText : "Padrão";

    // Chave única para diferenciar produtos com variações distintas na sacola
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
    document.getElementById("carrinho-lateral").classList.add("aberto");
    document.getElementById("carrinho-overlay").classList.add("aberto");
}

let fecharCarrinho = () => {
    document.getElementById("carrinho-lateral").classList.remove("aberto");
    document.getElementById("carrinho-overlay").classList.remove("aberto");
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

    let numeroWhats = "5571999999999"; // Ajuste o número real aqui
    let textoMensagem = "Olá, Mia! ✨\nGostaria de encomendar os seguintes itens do site:\n\n";
    let total = 0;

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        const etiquetaEstoque = item.disponivel ? "[Pronta Entrega]" : "[PEDIDO SOB ENCOMENDA]";
        
        textoMensagem += `🔹 ${item.quantidade}x ${item.nome}\n`;
        textoMensagem += `    Tamanho: ${item.tamanhoEscolhido} | Cor: ${item.corEscolhida}\n`;
        textoMensagem += `    Status: ${etiquetaEstoque}\n`;
        textoMensagem += `    Valor: R$ ${subtotal.toFixed(2).replace('.', ',')}\n\n`;
    });

    textoMensagem += `-----------------------------\n`;
    textoMensagem += `💰 *Valor Total:* R$ ${total.toFixed(2).replace('.', ',')}\n\n`;
    textoMensagem += `Como faço para prosseguir com o pagamento? 🥰`;

    window.open(`https://wa.me/${numeroWhats}?text=${encodeURIComponent(textoMensagem)}`, "_blank");
}

// ==========================================
// 4. INTEGRAÇÃO DOS CHATS (MIA / GROQ)
// ==========================================
// (Deixe a sua lógica antiga de 'enviarMensagemParaIA' e controle do ChatJanela idêntica aqui abaixo)

// ROTEADOR DE INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("grade-produtos")) {
        carregarProdutos(produtos);
    }
    if (document.getElementById("detalhe-produto-container")) {
        carregarProdutoDetalhe();
    }
    atualizarInterfaceCarrinho();
});