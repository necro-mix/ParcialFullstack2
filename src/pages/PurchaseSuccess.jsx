import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiGetOrders } from '../api';

export default function PurchaseSuccess() {
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (order) return;
    const loadLatestOrder = async () => {
      try {
        const orders = await apiGetOrders();
        if (orders.length > 0) setOrder(orders[0]);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    loadLatestOrder();
  }, [order]);

  if (loading) {
    return (
      <section className="container content-section">
        <p>Cargando comprobante...</p>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="container content-section">
        <h1>No hay pedidos confirmados</h1>
        <p>Aún no has realizado ninguna compra en esta sesión.</p>
        <Link to="/productos" className="btn-submit">Ir al catálogo</Link>
      </section>
    );
  }

  return (
    <section className="container content-section">
      <h1>¡Compra Confirmada!</h1>
      <p>Tu pedido <strong>#{order.id}</strong> ha sido registrado exitosamente.</p>

      <div className="card" style={{ padding: '1.5rem', margin: '1.5rem 0' }}>
        <h3>Detalle de la Orden #{order.id}</h3>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          Fecha: {new Date(order.created_at).toLocaleString('es-CL')}
        </p>
        <ul style={{ margin: '1rem 0', paddingLeft: '1.25rem' }}>
          {(order.items_snapshot || []).map((item, idx) => (
            <li key={idx}>
              {item.product_detail?.nombre || item.product_detail?.name || `Producto #${item.product}`} × {item.quantity} — ${Number(item.subtotal).toLocaleString('es-CL')}
            </li>
          ))}
        </ul>
        <h2>Total Pagado: ${Number(order.total).toLocaleString('es-CL')}</h2>
      </div>

      <Link to="/productos" className="btn-submit">Seguir comprando</Link>
    </section>
  );
}
