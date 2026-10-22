import { addToCart, getCart, getSession } from '../storage';

export default function ProductCard({ producto, onAdded }) {
  const addProduct = () => {
    if (!getSession()) return;
    addToCart(producto);
    onAdded(producto);
  };

  return (
    <article className="card product-card">
      <div className="card-img-wrapper"><img src={producto.src} alt={producto.nombre} /></div>
      <div>
        <h3>{producto.nombre}</h3>
        <p>${producto.precio.toLocaleString('es-CL')}</p>
      </div>
      <button className="btn-add" type="button" onClick={addProduct}>
        <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
        Añadir al Carrito
      </button>
    </article>
  );
}
