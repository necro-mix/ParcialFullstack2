import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import PurchaseSuccess from './pages/PurchaseSuccess';
import PurchaseFailed from './pages/PurchaseFailed';
import Offers from './pages/Offers';
import Categories from './pages/Categories';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/ofertas" element={<Offers />} />
        <Route path="/nosotros" element={<About />} />
        <Route path="/blogs" element={<Blog />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/compra-exitosa" element={<PurchaseSuccess />} />
        <Route path="/compra-no-realizada" element={<PurchaseFailed />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}
