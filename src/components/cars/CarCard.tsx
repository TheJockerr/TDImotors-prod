// src/components/cars/CarCard.tsx
import { Link } from 'react-router-dom';
import type { Car } from '../../types/car';
import styles from './CarCard.module.css';

interface Props {
  car: Car;
}

function formatPrice(price: number): string {
  return '$' + price.toLocaleString('es-CL');
}

function formatMileage(km: number): string {
  return km.toLocaleString('es-CL') + ' km';
}

const WHATSAPP_BASE = 'https://wa.me/56940385580?text=';

export default function CarCard({ car }: Props) {
  const waText = encodeURIComponent(
    `Hola, me interesa el ${car.brand} ${car.model} ${car.year} que vi en tdimotors.cl. ¿Está disponible?`
  );
  const waUrl = WHATSAPP_BASE + waText;

  const hasImage = car.images && car.images.length > 0;

  return (
    <article className={styles.card}>
      {/* Imagen */}
      <div className={styles.imageWrapper}>
        {hasImage ? (
          <img src={car.images[0]} alt={`${car.brand} ${car.model}`} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" />
              <rect x="9" y="11" width="14" height="10" rx="2" />
              <circle cx="12" cy="16" r="1" />
              <circle cx="20" cy="16" r="1" />
            </svg>
          </div>
        )}
        {car.badge && (
          <span className={`${styles.badge} ${car.badge === 'OFERTA' ? styles.badgeRed : styles.badgeDark}`}>
            {car.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className={styles.body}>
        <p className={styles.brand}>{car.brand}</p>
        <h3 className={styles.model}>{car.model}</h3>
        <p className={styles.year}>{car.year}</p>

        <div className={styles.specs}>
          <span className={styles.spec}>
            <span className={styles.dot} />
            {formatMileage(car.mileage)}
          </span>
          <span className={styles.spec}>
            <span className={styles.dot} />
            {car.fuel}
          </span>
        </div>

        <p className={styles.price}>
          <span className="price-clp">{formatPrice(car.price)}</span>
          <span className={styles.currency}> CLP</span>
        </p>

        <div className={styles.actions}>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.btnWa}>
            WA
          </a>
          <Link to={`/catalogo/${car.id}`} className={styles.btnDetail}>
            Ver más →
          </Link>
        </div>
      </div>
    </article>
  );
}