import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clearCart, getCart, removeFromCart } from '../storage';
import OfferBadge from '../components/OfferBadge';

export default function Cart() {
  const [cart, setCart] = useState(getCart());

  useEffect(() => {
    const syncCart = () => setCart(getCart());
    window.addEventListener('cartchange', syncCart);
    return () => window.removeEventListener('cartchange', syncCart);
  }, []);

  const total = cart.reduce((sum, product) => sum + product.precio, 0);
  const update = (index) => { setCart(removeFromCart(index)); };
  const empty = cart.length === 0;

  return (
    <section className="container cart-page">
      <div className="section-header"><div className="section-title"><h1>Mi Carrito</h1><p>Revisa los productos que has seleccionado.</p></div></div>
      <div className="cart-layout">
        <div>
          <div className="cart-items">
            {cart.map((product, index) => <article className="cart-item" key={`${product.id}-${index}`}><img src={product.src} alt={product.nombre} /><div className="cart-item-info"><OfferBadge product={product} /><h3>{product.nombre}</h3><p>${product.precio.toLocaleString('es-CL')}</p></div><button className="cart-remove" type="button" onClick={() => update(index)}>Eliminar</button></article>)}
          </div>
          {empty && <p className="cart-empty">Tu carrito esta vacío. <Link to="/productos">Volver al catálogo</Link></p>}
        </div>
        <aside className="cart-summary"><h2>Resumen de compra</h2><div className="cart-total-row"><span>Total</span><strong>${total.toLocaleString('es-CL')}</strong></div><button className="cart-clear" type="button" disabled={empty} onClick={() => { clearCart(); setCart([]); }}>Vaciar carrito</button><Link to="/checkout" className="btn-submit checkout-link" aria-disabled={empty}>Continuar al checkout</Link></aside>
      </div>
    </section>
  );
}
