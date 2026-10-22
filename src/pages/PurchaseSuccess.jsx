import { Link } from 'react-router-dom';

export default function PurchaseSuccess() {
  return <section className="container content-section"><h1>Compra exitosa</h1><p>Tu pedido fue confirmado correctamente.</p><p>Un representante podrá coordinar la entrega con tu información.</p><Link to="/" className="btn-submit">Volver al inicio</Link></section>;
}
