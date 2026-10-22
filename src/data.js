const baseUrl = import.meta.env?.BASE_URL || '/';
const asset = (name) => `${baseUrl}media/${name}`;

export const productos = [
  { id: 1, nombre: 'Clonazepam 0.25 mg (Bioequivalente)', precio: 15000, src: asset('clona.png'), categoria: 'Medicamentos', oferta: false },
  { id: 2, nombre: 'Preservativo masculino', precio: 3500, src: asset('condon1.png'), categoria: 'Salud sexual', oferta: true },
  { id: 3, nombre: 'Preservativo SIMIcondon', precio: 3500, src: asset('simicondon.png'), categoria: 'Salud sexual', oferta: false },
  { id: 4, nombre: 'Suplemento Nutricional Pediasure 900g', precio: 15000, src: asset('pediasure.png'), categoria: 'Alimentación', oferta: true },
  { id: 5, nombre: 'Pañales para adulto mayor', precio: 22990, src: asset('pañalespawelito.png'), categoria: 'Cuidado personal', oferta: false },
  { id: 6, nombre: 'Paracetamol 500 mg', precio: 1000, src: asset('paracetamol.png'), categoria: 'Medicamentos', oferta: false },
  { id: 7, nombre: 'Pañales Premium Besuper', precio: 9999999, src: asset('pañales.png'), categoria: 'Cuidado personal', oferta: true },
];

export const regiones = [
  { region: 'Región Metropolitana', comunas: ['Santiago', 'Ñuñoa', 'Maipú', 'Providencia'] },
  { region: 'Valparaíso', comunas: ['Valparaíso', 'Viña del Mar', 'Quilpué'] },
];

export const permisosDefault = {
  'ver-productos': true,
  comprar: true,
  'ver-carrito': true,
  'acceso-admin': false,
  'editar-perfil': true,
  'ver-historial': false,
};
