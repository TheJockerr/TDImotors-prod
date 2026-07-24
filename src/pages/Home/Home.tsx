// src/pages/Home/Home.tsx
import { Link } from 'react-router-dom';
import { useCars } from '../../hooks/useCars';
import { useMemo } from 'react';
import CarCard from '../../components/cars/CarCard';
import styles from './Home.module.css';


const WHATSAPP_NUMBER = '56965655135';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Consignaciones y gestión',
    desc: 'Disponibilidad de consignar y gestionar su vehículo',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Respuesta rápida',
    desc: 'Atención bajo 1 hora por WhatsApp Lun–Sáb.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: 'Financiamiento gestionado',
    desc: 'Crédito, tarjeta y part payment disponible.',
  },
];

export default function Home() {
  const { allInventory, allBrands, loading } = useCars();

  // Autos con badge (Oferta, Crédito Directo o Recién Llegado) en orden aleatorio
  const featured = useMemo(() => {
    const flagged = allInventory.filter(
      (c) => c.is_featured || c.is_new_arrival || c.is_promotion
    );
    // Fisher-Yates shuffle para que cada visita sea distinta
    const shuffled = [...flagged];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 6);
  }, [allInventory]);

  // Estado de carga
  if (loading) {
    return <div className="container" style={{ paddingTop: '120px', minHeight: '60vh' }}>Cargando...</div>;
  }

  return (
    <main className={styles.main}>
      {/* ——— HERO ——— */}
      <section className={styles.hero}>
        <div className={`${styles.heroInner} container`}>
          <span className={styles.heroPill}>
            <span className={styles.heroPillDot} />
            Consignaciones para venta de vehículos
          </span>

          <h1 className={styles.heroTitle}>
            Tu próximo auto,<br />
            al mejor <span className={styles.heroAccent}>precio</span>
          </h1>

          <p className={styles.heroDesc}>
            Venta de autos usados certificados en Santiago. Financiamiento gestionado,
            pago con tarjeta y part payment. Atención Lunes a Sábados.
          </p>

          <div className={styles.heroCtas}>
            <Link to="/catalogo" className={styles.btnPrimary}>
              Ver catálogo
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnSecondary}
            >
              Contactar por WhatsApp
            </a>
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>
                {allInventory.length > 0 ? allInventory.length : '8'}
                <span className={styles.statPlus}>+</span>
              </span>
              <span className={styles.statLabel}>Autos disponibles</span>
            </div>

            <div className={styles.statDivider} />

            <div className={styles.stat}>
              <span className={styles.statNum}>
                &lt;1<span className={styles.statPct}>h</span>
              </span>
              <span className={styles.statLabel}>Atención por WhatsApp</span>
            </div>

            <div className={styles.statDivider} />

            <div className={styles.stat}>
              <span className={styles.statNum}>
                {allBrands.length > 0 ? allBrands.length : '4'} <span className={styles.statSub}>marcas</span>
              </span>
              <span className={styles.statLabel}>
                {allBrands.length > 0
                  ? allBrands.slice(0, 4).join(' · ')
                  : 'MG · Kia · Suzuki · Hyundai'}
              </span>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className={styles.ticker}>
          <div className={styles.tickerTrack}>
            {[
              'Financiamiento gestionado',
              'Tarjeta aceptada',
              'Part payment de autos',
              'Seguro automotriz',
            ].map((item, i) => (
              <span key={i} className={styles.tickerItem}>
                <span className={styles.tickerDot} />
                {item}
              </span>
            ))}

            {/* loop */}
            {[
              'Financiamiento gestionado',
              'Tarjeta aceptada',
              'Part payment de autos',
              'Seguro automotriz',
            ].map((item, i) => (
              <span key={`dup-${i}`} className={styles.tickerItem}>
                <span className={styles.tickerDot} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ——— DESTACADOS ——— */}
      {featured.length > 0 && (
        <section className={styles.featured}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Autos con oferta y destacados</h2>
              <Link to="/catalogo" className={styles.seeAll}>
                Ver catálogo completo →
              </Link>
            </div>

            <div className={styles.carGrid}>
              {featured.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——— ABOUT ——— */}
      <section className={styles.about}>
        <div className="container">
          <div className={styles.aboutHeader}>
            <span className={styles.aboutTag}>Sobre nosotros</span>
            <h2 className={styles.aboutTitle}>
              TDI Motors — Venta online, atención personal
            </h2>
            <p className={styles.aboutDesc}>
              Automotora 100% online con autos seleccionados, posibilidad de consignar
              y atención directa de Lunes a Sábados en Santiago.
            </p>
          </div>

          <div className={styles.features}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{icon}</span>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2 className={styles.ctaTitle}>
            ¿Listo para encontrar tu auto?
          </h2>
          <p className={styles.ctaDesc}>
            Escríbenos y te atendemos en menos de 1 hora.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaBtn}
          >
            Contactar por WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}