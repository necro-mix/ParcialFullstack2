import { useEffect, useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import { getProducts } from '../storage';

export default function ProductGrid({ compact = false, onCartChange }) {
  const [products, setProducts] = useState(getProducts);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [added, setAdded] = useState(null);
  const categories = ['Todas', ...new Set(products.map((producto) => producto.categoria))];
  const filtered = useMemo(() => products.filter((producto) => {
    const normalized = search.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matchesSearch = producto.nombre.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized);
    const matchesCategory = category === 'Todas' || producto.categoria === category;
    return matchesSearch && matchesCategory;
  }), [products, search, category]);

  useEffect(() => {
    const refreshProducts = () => setProducts(getProducts());
    window.addEventListener('productschange', refreshProducts);
    return () => window.removeEventListener('productschange', refreshProducts);
  }, []);

  const handleAdded = (producto) => {
    setAdded(producto.id);
    onCartChange?.();
    window.setTimeout(() => setAdded(null), 1000);
  };

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
            <ProductCard producto={producto} onAdded={handleAdded} />
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="empty-state">No se encontraron productos para esa búsqueda.</p>}
      {added && <p className="added-feedback" role="status">Producto agregado al carrito.</p>}
    </section>
  );
}
