import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getCart, getSession, logoutUser } from '../storage';

const Icon = ({ name }) => {
  const icons = {
    cart: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z',
    plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  };
  return <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d={icons[name]} /></svg>;
};

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(getSession());
  const [cartCount, setCartCount] = useState(getCart().length);

  useEffect(() => {
    const syncSessionState = () => {
      setSession(getSession());
      setCartCount(getCart().length);
    };

    const onStorage = () => syncSessionState();
    const onSessionChange = () => syncSessionState();
    const onCartChange = () => syncSessionState();

    window.addEventListener('storage', onStorage);
    window.addEventListener('sessionchange', onSessionChange);
    window.addEventListener('cartchange', onCartChange);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('sessionchange', onSessionChange);
      window.removeEventListener('cartchange', onCartChange);
    };
  }, []);

  const handleLogout = async () => {
    logoutUser();
    setSession(null);
    await navigate('/');
  };

  const isAdmin = session?.correo === 'admin@duoc.cl';

  return (
    <div className="app-shell">
      <div className="top-announcement">
        <div className="top-announcement-item">
          <Icon name="cart" />
          <span>Genuinamente se me hizo mas facil hacerla segun rubrica q hacer una farmacia ma picante q casuela e' vienesa</span>
        </div>
      </div>
      <header className="navbar">
        <Link to="/" className="logo-container" aria-label="Farmacia de Raza, inicio">
          <div className="logo-badge"><Icon name="plus" /></div>
          <div className="logo"><h2>FarmaciaDeRaza</h2></div>
        </Link>
        <nav className="nav-links" aria-label="Navegación principal">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/nosotros">Nosotros</NavLink>
          <NavLink to="/blogs">Salud &amp; Blog</NavLink>
          <NavLink to="/contacto">Contacto</NavLink>
          {!session && <NavLink to="/login">Iniciar Sesión</NavLink>}
          {!session && <NavLink to="/registro">Crear Cuenta</NavLink>}
          {isAdmin && <NavLink to="/admin" className="admin-link">Panel Admin</NavLink>}
          {session && <button id="nav-logout" type="button" onClick={handleLogout}>Cerrar Sesión</button>}
        </nav>
        <Link to="/carrito" className="cart-status" aria-label={`Mi carrito, ${cartCount} productos`}>
          <Icon name="cart" />
          <span>Mi Carrito</span>
          <span className="cart-badge" id="cart-count">{cartCount}</span>
        </Link>
      </header>
      <main>{children}</main>
      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <h3>Farmacia de Raza</h3>
            <p>Red de farmacias comprometida con el acceso oportuno a medicamentos y productos de salud de alta calidad.</p>
          </div>
          <div className="footer-col">
            <h5>Navegación</h5>
            <ul><li><Link to="/">Inicio</Link></li><li><Link to="/productos">Catálogo Completo</Link></li><li><Link to="/nosotros">Nuestra Historia</Link></li><li><Link to="/blogs">Artículos Médicos</Link></li></ul>
          </div>
          <div className="footer-col">
            <h5>Atención al Cliente</h5>
            <ul><li><Link to="/contacto">Centro de Ayuda</Link></li><li><Link to="/login">Acceso Clientes</Link></li><li><Link to="/registro">Registro de Usuarios</Link></li></ul>
          </div>
          <div className="footer-col">
            <h5>Legal &amp; Calidad</h5>
            <ul><li><Link to="/">Términos y Condiciones</Link></li><li><Link to="/">Política de Privacidad</Link></li><li><Link to="/">Resolución Sanitaria</Link></li></ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 UnaFarmaciaPeroDeRazaRaaaaza. Todos los derechos reservados.</p>
          <p>Plataforma de Producción v3.0.0</p>
        </div>
      </footer>
    </div>
  );
}
