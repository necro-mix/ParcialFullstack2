import { useMemo, useState } from 'react';
import { productos } from '../data';
import ProductCard from './ProductCard';

export default function ProductGrid({ compact = false, onCartChange }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [added, setAdded] = useState(null);
  const categories = ['Todas', ...new Set(productos.map((producto) => producto.categoria))];
  const filtered = useMemo(() => productos.filter((producto) => {
    const normalized = search.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matchesSearch = producto.nombre.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized);
    const matchesCategory = category === 'Todas' || producto.categoria === category;
    return matchesSearch && matchesCategory;
  }), [search, category]);

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
      <div className="products-grid" id="products-container">
        {filtered.map((producto) => <ProductCard key={producto.id} producto={producto} onAdded={handleAdded} />)}
      </div>
      {filtered.length === 0 && <p className="empty-state">No se encontraron productos para esa búsqueda.</p>}
      {added && <p className="added-feedback" role="status">Producto agregado al carrito.</p>}
    </section>
  );
}
