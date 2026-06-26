// js/produtos.js

const produtos = [
  {
    id: 1,
    nome: "Baby-doll de Renda Premium - Vermelho",
    categoria: "camisolas",
    preco: 129.90,
    imagem: "img/teste1.jpg", // Caminho da foto na pasta img
    disponivel: true,
    tamanhos: ["P", "M", "G", "GG"],
    cores: ["Preto", "Romance", "Marala"]
  },
  {
    id: 2,
    nome: "Conjunto Lingerie Rendada - Roxo",
    categoria: "lingerie",
    preco: 89.90,
    imagem: "img/teste.jpg", // Caminho da foto na pasta img
    disponivel: false, // Fora de estoque -> vai ficar cinza
    tamanhos: ["P", "M", "G", "GG"],
    cores: ["Preto", "Romance", "Marala"]
  },
  {
    id: 3,
    nome: "Corset de Sedução - Branco",
    categoria: "corsets",
    preco: 159.90,
    imagem: "img/teste3.jpg",
    disponivel: true,
    tamanhos: ["P", "M", "G", "GG"],
    cores: ["Preto", "Romance", "Marala"]
  }
];