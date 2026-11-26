import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClearCart, apiGetCart, apiRemoveCartItem, apiUpdateCartItem } from '../api';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCart = async () => {
    const token = localStorage.getItem('apiAccessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setError('');
      const data = await apiGetCart();
      setCart(data);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el carrito.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('cartchange', loadCart);
    return () => window.removeEventListener('cartchange', loadCart);
  }, []);

  const handleQuantityChange = async (itemId, newQty) => {
    try {
      if (newQty <= 0) {
        await apiRemoveCartItem(itemId);
      } else {
        await apiUpdateCartItem(itemId, newQty);
      }
      await loadCart();
    } catch (err) {
      setError(err.message || 'Error al actualizar cantidad.');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await apiRemoveCartItem(itemId);
      await loadCart();
    } catch (err) {
      setError(err.message || 'Error al eliminar producto.');
    }
  };

  const handleClear = async () => {
    try {
      await apiClearCart();
      await loadCart();
    } catch (err) {
      setError(err.message || 'Error al vaciar el carrito.');
    }
  };

  const isLoggedIn = Boolean(localStorage.getItem('apiAccessToken'));

  if (!isLoggedIn) {
    return (
      <section className="container cart-page">
        <div className="section-header">
          <div className="section-title">
            <h1>Carrito</h1>
            <p>Inicia sesión para ver y gestionar tu carrito de compras.</p>
          </div>
        </div>
        <Link to="/login" className="btn-submit">Iniciar Sesión</Link>
      </section>
    );
  }

  return (
    <section className="container cart-page">
      <div className="section-header">
        <div className="section-title">
          <h1>Carrito de Compras</h1>
          <p>Revisa tus productos seleccionados antes de confirmar tu pedido.</p>
        </div>
      </div>

      {error && <p className="error-msg" role="alert">{error}</p>}

      {loading ? (
        <p>Cargando carrito...</p>
      ) : cart.items.length === 0 ? (
        <div>
          <p>Tu carrito está vacío.</p>
          <Link to="/productos" className="btn-submit">Volver al catálogo</Link>
        </div>
      ) : (
        <div>
          <div className="cart-items-list" style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {item.producto?.src && (
                    <img
                      src={item.producto.src}
                      alt={item.producto.nombre}
                      style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                    />
                  )}
                  <div>
                    <h3>{item.producto?.nombre || `Producto #${item.productId}`}</h3>
                    <p>Precio unitario: ${(item.producto?.precio || 0).toLocaleString('es-CL')}</p>
                    <p><strong>Subtotal: ${item.subtotal.toLocaleString('es-CL')}</strong></p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 'bold' }}>
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn-add"
                    style={{ marginLeft: '0.5rem' }}
                    onClick={() => handleRemove(item.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h2>Total: ${cart.total.toLocaleString('es-CL')}</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn-add" onClick={handleClear}>
                Vaciar carrito
              </button>
              <button type="button" className="btn-submit" onClick={() => navigate('/checkout')}>
                Continuar al pago
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}