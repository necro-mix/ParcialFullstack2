import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';

export default function Home() {
  return (
    <>
      <div className="hero-parallax-section">
        <div className="hero-parallax-bg" id="hero-bg" />
        <section className="hero">
          <div>
            <span className="hero-pill">Servicio Farmacéutico Autorizado</span>
            <h1>Tu salud en manos expertas, con entrega prioritaria.</h1>
            <p>Accede a fármacos bioequivalentes, cuidado personal e insumos médicos con respaldo profesional y certificación oficial.</p>
            <div className="search-bar-fake">
              <label className="sr-only" htmlFor="home-search">Buscar productos</label>
              <input id="home-search" type="search" placeholder="Buscar por medicamento, principio activo o marca..." />
              <button type="button" onClick={() => document.getElementById('products-container')?.scrollIntoView({ behavior: 'smooth' })}>Buscar</button>
            </div>
          </div>
          <div className="hero-image-wrapper"><img src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=800" alt="Farmacéutico profesional atendiendo" /></div>
        </section>
      </div>
      <div className="main-content">
        <main className="container">
          <ProductGrid compact onCartChange={() => setCartCount(getCart().length)} />
        </main>
      </div>
      <section className="media-section container" aria-labelledby="health-video-title">
        <div className="section-title"><h3 id="health-video-title">Video embedido porque era requisito</h3><p>Y como era requisito aquí tiene un video de un episodio de Hágalo usted mismo.</p></div>
        <video controls preload="metadata" poster={`${import.meta.env.BASE_URL}src/pediasure.png`}><source src={`${import.meta.env.BASE_URL}src/video.mp4`} type="video/mp4" /><track kind="captions" src={`${import.meta.env.BASE_URL}src/video-captions.vtt`} srcLang="es" label="Español" />Tu navegador no admite la reproducción de videos.</video>
      </section>
      <section className="container home-actions"><Link to="/ofertas" className="btn-submit">Ver ofertas</Link><Link to="/categorias" className="btn-secondary">Ver categorías</Link></section>
    </>
  );
}
