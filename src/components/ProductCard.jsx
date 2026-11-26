import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OfferBadge from './OfferBadge';
import { apiAddToCart } from '../api';

export default function ProductCard({ producto }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    const token = localStorage.getItem('apiAccessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      await apiAddToCart(producto.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      alert(err.message || 'No se pudo agregar al carrito.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="card product-card">
      <div className="card-img-wrapper">
        <img src={producto.src} alt={producto.nombre} />
      </div>
      <div>
        <OfferBadge product={producto} />
        <h3>{producto.nombre}</h3>
        <p>${producto.precio.toLocaleString('es-CL')}</p>
      </div>
      <button
        className="btn-add"
        type="button"
        disabled={loading}
        onClick={handleAdd}
      >
        <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        {loading ? 'Agregando...' : added ? 'Agregado ✓' : 'Agregar al carrito'}
      </button>
    </article>
  );
}