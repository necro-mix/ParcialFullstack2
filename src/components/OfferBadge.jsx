export default function OfferBadge({ product }) {
  if (!product.oferta) return null;

  return <span className="offer-badge">En oferta</span>;
}
