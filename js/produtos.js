// js/produtos.js

const produtos = [
  {
    id: 1,
    nome: "Baby-doll de Renda Premium",
    categoria: "camisolas",
    preco: 129.90,
    imagem: "img/teste1.jpg", // Caminho da foto na pasta img
    disponivel: true,
    tamanhos: ["P", "M", "G", "GG"],
    cores: [
      { nome: "Vermelho", imagem: "img/camisola-vermelha.jpg" },
      { nome: "Preto", imagem: "img/camisola-preta.jpg" },
      { nome: "Azul", imagem: "img/camisola-azul.jpg" }
    ]
  },
  {
    id: 2,
    nome: "Conjunto Lingerie Rendada",
    categoria: "lingerie",
    preco: 89.90,
    imagem: "img/teste.jpg", // Caminho da foto na pasta img
    disponivel: true,
    tamanhos: ["P", "M", "G", "GG"],
    cores: [
      { nome: "Lilas", imagem: "img/lingerie-lilas.jpg" },
      { nome: "Preta", imagem: "img/lingerie-preta.jpg" },
      { nome: "Branca", imagem: "img/lingerie-branca.jpg" }
    ]
  },
  {
    id: 3,
    nome: "Corset de Sedução",
    categoria: "corsets",
    preco: 159.90,
    imagem: "img/teste3.jpg",
    disponivel: false, // Fora de estoque -> vai ficar cinza
    tamanhos: ["P", "M", "G", "GG"],
    cores: [
      { nome: "Preto", imagem: "img/corset-preto.jpg" },
      { nome: "Vermelho", imagem: "img/corset-vermelho.jpg" },
      { nome: "Preto Floral", imagem: "img/corset-preto-floral.jpg" }
    ]
  }
];