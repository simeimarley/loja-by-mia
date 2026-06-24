# 💫 By Mia | Lingerie & Sex Shop

Uma vitrine digital elegante, minimalista e altamente funcional desenvolvida para a loja **By Mia**, especializada em lingeries, baby-dolls, corsets e sex shop. O projeto conta com um catálogo interativo, sacola de compras persistente e uma assistente virtual integrada com Inteligência Artificial de última geração.

🌐 **Link do Projeto:** [bymia.vercel.app](https://bymia.vercel.app)

---

## 🚀 Funcionalidades Principais

*   **Vitrine Inteligente:** Listagem dinâmica de produtos com filtros por categoria (Camisolas, Corsets, Lingeries, Sex Shop).
*   **Gestão de Disponibilidade:** Exibição diferenciada para itens em estoque (Pronta Entrega) e peças acinzentadas com a tag *Sob Encomenda*.
*   **Sacola de Compras Integrada:** Carrinho de compras dinâmico que permite gerenciar e alterar a quantidade de itens diretamente na barra lateral, utilizando `localStorage` para persistência dos dados no navegador.
*   **Fechamento via WhatsApp:** Integração nativa que compila todos os itens da sacola, calcula o valor total e envia uma mensagem perfeitamente estruturada e discriminada para o WhatsApp da loja.
*   **Assistente Virtual (Mia):** Um chatbot integrado diretamente na interface, capaz de tirar dúvidas sobre tamanhos, estoque e formas de pagamento em tempo real.

---

## 🛠️ Tecnologias Utilizadas

*   **Front-end:** HTML5, CSS3 (Variáveis nativas, Flexbox e Grid) e JavaScript Moderno (ES6+).
*   **Back-end (Serverless):** Vercel Serverless Functions (Node.js) para processamento seguro de rotas de API.
*   **Inteligência Artificial:** API da **Groq** utilizando o modelo LLM de altíssima velocidade `llama-3.3-70b-versatile`.
*   **Hospedagem & Deploy:** GitHub integrado à Vercel com CI/CD automatizado.

---

## 📁 Estrutura do Projeto

```text
├── api/
│   └── chat.js          # Rota servidora (Serverless) que conecta com a API da Groq de forma segura
├── css/
│   └── style.css        # Estilização completa, paleta de cores (Bordô/Creme) e responsividade
├── js/
│   ├── main.js          # Inteligência do front-end (Carrinho, Filtros e Conexão com a Rota de Chat)
│   └── produtos.js      # Banco de dados local contendo o array estruturado de produtos
├── img/                 # Banco de imagens e fotos das peças do catálogo
├── index.html           # Estrutura principal da aplicação
└── README.md            # Documentação do projeto