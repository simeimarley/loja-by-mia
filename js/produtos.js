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
      { nome: "Vermelho", imagem: "img/teste1.jpg" },
      { nome: "Preto", imagem: "img/babydoll-preto.jpg" },
      { nome: "Romance", imagem: "img/babydoll-romance.jpg" }
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
      { nome: "Lilas", imagem: "img/teste.jpg" },
      { nome: "Romance", imagem: "img/conjunto-romance.jpg" },
      { nome: "Marsala", imagem: "img/conjunto-marsala.jpg" }
    ]
  },
  {
    id: 3,
    nome: "Corset de Sedução - Branco",
    categoria: "corsets",
    preco: 159.90,
    imagem: "img/teste3.jpg",
    disponivel: false, // Fora de estoque -> vai ficar cinza
    tamanhos: ["P", "M", "G", "GG"],
    cores: [
      { nome: "Branco", imagem: "img/teste3.jpg" },
      { nome: "Preto", imagem: "img/corset-preto.jpg" },
      { nome: "Vermelho", imagem: "img/corset-vermelho.jpg" }
    ]
  }
];