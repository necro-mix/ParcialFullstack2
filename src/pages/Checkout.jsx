import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiCheckoutCart, apiGetCart } from '../api';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGetCart();
        setCart(data);
      } catch (err) {
        setError(err.message || 'No se pudo cargar el resumen del pedido.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleConfirmPurchase = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      setError('');
      const order = await apiCheckoutCart();
      navigate('/compra-exitosa', { state: { order } });
    } catch (err) {
      setError(err.message || 'No se pudo procesar la compra.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <section className="container content-section">
        <p>Cargando resumen de compra...</p>
      </section>
    );
  }

  if (cart.items.length === 0) {
    return (
      <section className="container content-section">
        <h1>No hay productos para pagar</h1>
        <p>Agrega productos a tu carrito antes de continuar al checkout.</p>
        <Link to="/productos" className="btn-submit">Volver al catálogo</Link>
      </section>
    );
  }

  return (
    <section className="container content-section">
      <h1>Confirmar Compra</h1>
      {error && <p className="error-msg" role="alert">{error}</p>}

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3>Resumen del Pedido</h3>
        <ul style={{ margin: '1rem 0', paddingLeft: '1.25rem' }}>
          {cart.items.map((item) => (
            <li key={item.id}>
              {item.producto?.nombre} × {item.cantidad} — ${item.subtotal.toLocaleString('es-CL')}
            </li>
          ))}
        </ul>
        <h2>Total a pagar: ${cart.total.toLocaleString('es-CL')}</h2>
      </div>

      <form onSubmit={handleConfirmPurchase} style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/carrito" className="btn-add">Volver al carrito</Link>
        <button type="submit" className="btn-submit" disabled={processing}>
          {processing ? 'Procesando pedido...' : 'Confirmar y Pagar'}
        </button>
      </form>
    </section>
  );
}
