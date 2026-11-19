import { Link, useNavigate } from 'react-router-dom';

export default function Checkout() {
  return (
    <section className="container content-section">
      <h1>Checkout no disponible</h1>
      <p>La API aún no ofrece endpoints para guardar carritos ni crear pedidos. No se simulará una compra que el servidor no haya confirmado.</p>
      <Link to="/productos" className="btn-submit">Volver al catálogo</Link>
    </section>
  );
}
