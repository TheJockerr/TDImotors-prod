// src/components/layout/Footer.tsx
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const WHATSAPP_NUMBERS = ['+56 9 4038 5580', '+56 9 7737 0010', '+56 9 5219 1321'];
const WHATSAPP_PRIMARY = '56940385580';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <span>TDI</span><span className={styles.red}>Motors</span>
          </Link>
          <p className={styles.tagline}>
            Venta de autos usados certificados en Santiago.
            <br />Documentación al día · Financiamiento gestionado.
          </p>
          <div className={styles.socials}>
            <a
              href={`https://wa.me/${WHATSAPP_PRIMARY}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
            >
              WhatsApp
            </a>
            <a
              href="https://www.instagram.com/automotors"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialBtn} ${styles.ig}`}
            >
              Instagram
            </a>
          </div>
        </div>

        {/* Nav links */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Navegación</h4>
          <ul className={styles.colList}>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/catalogo">Catálogo</Link></li>
            <li><Link to="/nosotros">Nosotros</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        {/* Contacto */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contacto</h4>
          <ul className={styles.colList}>
            {WHATSAPP_NUMBERS.map((n) => (
              <li key={n}>
                <a href={`https://wa.me/${n.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                  {n}
                </a>
              </li>
            ))}
            <li>@tdimotors</li>
          </ul>
        </div>

        {/* Horario */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Atención</h4>
          <ul className={styles.colList}>
            <li>Lunes a Sábados</li>
            <li>Las Condes, Santiago</li>
            <li className={styles.small}>(previa coordinación)</li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <span>© {year} TDI Motors — tdimotors.cl</span>
          <span className={styles.bottomRight}> - Santiago -Chile</span>
        </div>
      </div>
    </footer>
  );
}