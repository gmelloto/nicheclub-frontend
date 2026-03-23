import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [itens, setItens] = useState([]);

  function adicionar(perfume, tamanho, preco, ml) {
    setItens(prev => [...prev, {
      id: Date.now(),
      perfume_id: perfume.id,
      nome: perfume.nome,
      marca: perfume.marca,
      tamanho,
      preco,
      ml,
    }]);
  }

  function remover(id) {
    setItens(prev => prev.filter(i => i.id !== id));
  }

  function limpar() { setItens([]); }

  const total = itens.reduce((s, i) => s + i.preco, 0);
  const quantidade = itens.length;

  return (
    <CartContext.Provider value={{ itens, adicionar, remover, limpar, total, quantidade }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
