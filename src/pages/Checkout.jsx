import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, clearCart } from '../storage';

export default function Checkout() {
  const navigate = useNavigate();
  const cart = getCart();
  const [delivery, setDelivery] = useState('delivery');
  const total = cart.reduce((sum, product) => sum + product.precio, 0);
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!cart.length) { setError('Tu carrito está vacío.'); return; }
    const fields = ['nombre', 'apellido', 'direccion', 'correo'];
    if (fields.some((field) => !event.currentTarget.elements[field].value.trim())) { setError('Completa todos los datos de envío.'); return; }
    clearCart();
    navigate('/compra-exitosa');
  };

  if (!cart.length) return <section className="container content-section"><h1>Checkout</h1><p>Tu carrito está vacío.</p><Link to="/productos" className="btn-submit">Volver al catálogo</Link></section>;

  return (
    <section className="container cart-page">
      <div className="section-header"><div className="section-title"><h1>Checkout</h1><p>Agrega tu dirección y selecciona una opción de entrega.</p></div></div>
      <form className="form-card" onSubmit={submit}>
        <div className="form-grid">
          <div className="form-group"><label htmlFor="checkout-nombre">Nombre</label><input id="checkout-nombre" name="nombre" required autoComplete="given-name" /></div>
          <div className="form-group"><label htmlFor="checkout-apellido">Apellidos</label><input id="checkout-apellido" name="apellido" required autoComplete="family-name" /></div>
          <div className="form-group full-width"><label htmlFor="checkout-direccion">Dirección de envío</label><input id="checkout-direccion" name="direccion" required autoComplete="street-address" /></div>
          <div className="form-group full-width"><label htmlFor="checkout-correo">Correo electrónico</label><input id="checkout-correo" name="correo" type="email" required autoComplete="email" /></div>
          <fieldset className="form-group full-width"><legend>Modalidad de entrega</legend><label><input type="radio" name="delivery" value="delivery" checked={delivery === 'delivery'} onChange={() => setDelivery('delivery')} /> Entrega a domicilio</label><label><input type="radio" name="delivery" value="pickup" checked={delivery === 'pickup'} onChange={() => setDelivery('pickup')} /> Retiro en farmacia</label></fieldset>
          <div className="form-group full-width"><strong>Resumen total: ${total.toLocaleString('es-CL')}</strong></div>
          {error && <small className="error-msg full-width" role="alert">{error}</small>}
          <button className="btn-submit" type="submit">Confirmar compra</button>
        </div>
      </form>
    </section>
  );
}
