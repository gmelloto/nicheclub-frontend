import './Teste.css';

export default function Teste() {
  return (
    <div className="teste-page">
      {/* 1 DECANTS */}
      <section className="section">
        <div className="content">
          <div className="eyebrow">DECANTS</div>
          <div className="title">Descubra as melhores fragrâncias do mundo</div>
          <div className="subtitle">
            Experimente antes de escolher.<br />
            Uma curadoria dos perfumes mais exclusivos em formatos práticos.
          </div>
          <button className="btn">DESCOBRIR</button>
        </div>
        <div className="image">
          <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1400&q=80" alt="Decants" />
        </div>
      </section>

      {/* 2 LACRADOS */}
      <section className="section dark">
        <div className="content">
          <div className="eyebrow">PERFUMES LACRADOS</div>
          <div className="title">Perfumes Lacrados</div>
          <div className="subtitle">
            Autenticidade, luxo e exclusividade em cada detalhe.
          </div>
          <button className="btn">CONHECER</button>
        </div>
        <div className="image">
          <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1400&q=80" alt="Lacrados" />
        </div>
      </section>

      {/* 3 CATALOGO */}
      <section className="section dark">
        <div className="content">
          <div className="eyebrow">CATÁLOGO</div>
          <div className="title">Catálogo Completo</div>
          <div className="subtitle">
            Explore todas as fragrâncias, marcas e novidades.
          </div>
          <button className="btn">EXPLORAR</button>
        </div>
        <div className="image">
          <img src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1400&q=80" alt="Catálogo" />
        </div>
      </section>
    </div>
  );
}
