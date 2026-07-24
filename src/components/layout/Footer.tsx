// src/components/layout/Footer.tsx
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const WHATSAPP_NUMBERS = ['+56 9 6565 5135'];
const WHATSAPP_PRIMARY = '56965655135';
const FACEBOOK_URL = 'https://www.facebook.com/share/1J5pRcCyxb/?mibextid=wwXIfr';
const TIKTOK_URL = 'https://www.tiktok.com/@tdi_motors?_r=1&_t=ZS-98H8QRgiwFe';

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
            <br />Consignaciones y ventas · Financiamiento gestionado.
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
              href="https://www.instagram.com/tdi_motors"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialBtn} ${styles.ig}`}
            >
              Instagram
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialBtn} ${styles.fb}`}
            >
              Facebook
            </a>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialBtn} ${styles.tt}`}
            >
              TikTok
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
            <li><Link to="/contacto">Consignaciones</Link></li>
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
            <li>
              <a href="https://www.instagram.com/tdi_motors" target="_blank" rel="noopener noreferrer">@tdi_motors (IG)</a>
            </li>
            <li>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">TDI Motors (FB)</a>
            </li>
            <li>
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer">@tdi_motors (TK)</a>
            </li>
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
          <span>© {year} TDI Motors - tdimotors.cl</span>
          <span className={styles.bottomRight}> - Santiago - Chile - Desarrollado por Makinova Devs 🔥 | <a href="https://descchile.cl" target="_blank">descchile.cl</a></span>
        </div>
      </div>
    </footer>
  );
}