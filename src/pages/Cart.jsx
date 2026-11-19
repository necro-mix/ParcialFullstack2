import { Link } from 'react-router-dom';

export default function Cart() {
  return (
    <section className="container cart-page">
      <div className="section-header"><div className="section-title"><h1>Carrito</h1><p>Las compras estarán disponibles cuando la API incluya carrito y pedidos.</p></div></div>
      <p className="error-msg" role="status">El backend aún no ofrece endpoints para carrito o checkout; no se guardan compras en el navegador.</p>
      <Link to="/productos" className="btn-submit">Volver al catálogo</Link>
    </section>
  );
}
