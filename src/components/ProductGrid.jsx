import { useEffect, useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import { apiGetProducts } from '../api';

export default function ProductGrid({ compact = false, offersOnly = false }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const categories = ['Todas', ...new Set(products.map((producto) => producto.categoria))];
  const filtered = useMemo(() => products.filter((producto) => {
    const normalized = search.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matchesSearch = producto.nombre.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized);
    const matchesCategory = category === 'Todas' || producto.categoria === category;
    return matchesSearch && matchesCategory && (!offersOnly || producto.oferta);
  }), [products, search, category, offersOnly]);

  useEffect(() => {
    let active = true;
    const refreshProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const remoteProducts = await apiGetProducts();
        if (active) setProducts(remoteProducts);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    window.addEventListener('productschange', refreshProducts);
    refreshProducts();
    return () => {
      active = false;
      window.removeEventListener('productschange', refreshProducts);
    };
  }, []);

  return (
    <section className="catalog-section">
      <div className="section-header">
        <div className="section-title"><h3>{compact ? 'Catálogo de Productos Destacados' : 'Catálogo de productos'}</h3><p>Disponibilidad inmediata con despacho directo a domicilio.</p></div>
      </div>
      <div className="catalog-tools">
        <label className="search-bar-fake" htmlFor="product-search-input">
          <span className="visually-hidden">Buscar productos</span>
          <input id="product-search-input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por medicamento, principio activo o marca..." />
          <button type="button" onClick={() => document.getElementById('products-container')?.scrollIntoView({ behavior: 'smooth' })}>Buscar</button>
        </label>
        <select className="category-select" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filtrar por categoría">
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="row g-4 catalog-products" id="products-container">
        {filtered.map((producto) => (
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={producto.id}>
            <ProductCard producto={producto} />
          </div>
        ))}
      </div>
      {loading && <p role="status">Cargando productos…</p>}
      {error && <p className="error-msg" role="alert">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p className="empty-state">No se encontraron productos para esa búsqueda.</p>}
    </section>
  );
}
