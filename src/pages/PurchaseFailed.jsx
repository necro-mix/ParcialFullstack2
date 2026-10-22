import { Link } from 'react-router-dom';

export default function PurchaseFailed() {
  return <section className="container content-section"><h1>No se pudo realizar el pago</h1><p>El proceso de pago no fue completado. Inténtalo nuevamente cuando estés listo.</p><Link to="/carrito" className="btn-submit">Volver al carrito</Link></section>;
}
