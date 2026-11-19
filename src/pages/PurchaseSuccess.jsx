import { Link } from 'react-router-dom';

export default function PurchaseSuccess() {
  return <section className="container content-section"><h1>No hay pedidos confirmados</h1><p>La API todavía no ofrece un endpoint para crear pedidos; esta página no representa una compra real.</p><Link to="/" className="btn-submit">Volver al inicio</Link></section>;
}
