// src/components/cars/CarDetail.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCarById } from '../../hooks/useCars';
import { useAuth } from '../../hooks/useAuth';
import { getCarBadge } from '../../types/car';
import { getImageUrl, supabase, isSupabaseConfigured } from '../../lib/supabase';
import styles from './CarDetail.module.css';

function formatPrice(price: number): string {
  return '$' + price.toLocaleString('es-CL');
}

const WHATSAPP_BASE = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER ?? '56965655135'}?text=`;

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const { car, loading } = useCarById(id ?? '');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // ── Modal de archivado ───────────────────────────────────────
  const [archiveStep, setArchiveStep] = useState<1 | 2>(1);
  const [archiveConfirmText, setArchiveConfirmText] = useState('');
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  // ── Galería mejorada ─────────────────────────────────────────
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // ── Helpers de navegación ────────────────────────────────────
  const goNext = useCallback((total: number) => {
    setActiveImg((p) => (p + 1) % total);
    setImgLoaded(false);
    setImgError(false);
  }, []);

  const goPrev = useCallback((total: number) => {
    setActiveImg((p) => (p - 1 + total) % total);
    setImgLoaded(false);
    setImgError(false);
  }, []);

  function openArchiveModal() {
    setArchiveStep(1);
    setArchiveConfirmText('');
    setArchiveModalOpen(true);
  }

  function closeArchiveModal() {
    setArchiveModalOpen(false);
    setArchiveConfirmText('');
    setArchiveStep(1);
  }

  async function executeArchive() {
    if (!car) return;
    setArchiving(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error: dbErr } = await supabase
          .from('vehicles')
          .update({ status: 'archived' })
          .eq('id', car.id);
        if (dbErr) throw dbErr;
      }
      closeArchiveModal();
      navigate('/admin');
    } catch (err: any) {
      alert(`Error al archivar: ${err.message}`);
    } finally {
      setArchiving(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.spinner} />
      </main>
    );
  }

  if (!car) {
    return (
      <main className={styles.notFound}>
        <h1>Vehículo no encontrado</h1>
        <Link to="/catalogo" className={styles.backBtn}>← Volver al catálogo</Link>
      </main>
    );
  }

  const vehicleUrl = window.location.href;
  const waText = encodeURIComponent(
    `Hola, me interesa el vehículo ${car.brand} ${car.model} ${car.year} que vi publicado en la página web.\n\nLink de la publicación:\n${vehicleUrl}\n\n¿Sigue disponible?`
  );
  const waUrl = WHATSAPP_BASE + waText;

  const badge = getCarBadge(car);

  // Imágenes ordenadas por sort_order
  const images = (car.vehicle_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  const hasImages = images.length > 0;
  const activeImageUrl = hasImages ? images[activeImg]?.public_url : null;

  return (
    <main className={styles.main}>

      {/* ── Barra administrativa (solo admins) ───────────────── */}
      {isAdmin && (
        <div className={styles.adminBar}>
          <div className={styles.adminBarLeft}>
            <span className={styles.adminBarLabel}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Vista Admin
            </span>
          </div>
          <div className={styles.adminBarActions}>
            <button
              type="button"
              className={styles.adminBarBtn}
              onClick={() => navigate(`/admin?highlight=${car.id}&filter=all`)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              Abrir en dashboard
            </button>
            <button
              type="button"
              className={styles.adminBarBtn}
              onClick={() => navigate(`/admin?highlight=${car.id}&filter=all&edit=1`)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar vehículo
            </button>
            <button
              type="button"
              className={styles.adminBarBtnDanger}
              onClick={openArchiveModal}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
              Archivar publicación
            </button>
          </div>
        </div>
      )}

      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/catalogo">← Volver al catálogo</Link>
          <span className={styles.breadSep}>·</span>
          <span>{car.brand} {car.model} {car.year}</span>
        </nav>

        <div className={styles.layout}>

          {/* ── Galería mejorada ──────────────────────────────── */}
          <GallerySection
            images={images}
            hasImages={hasImages}
            activeImg={activeImg}
            setActiveImg={setActiveImg}
            activeImageUrl={activeImageUrl}
            imgLoaded={imgLoaded}
            setImgLoaded={setImgLoaded}
            imgError={imgError}
            setImgError={setImgError}
            galleryRef={galleryRef}
            touchStartX={touchStartX}
            touchStartY={touchStartY}
            goNext={goNext}
            goPrev={goPrev}
            badge={badge}
            carName={`${car.brand} ${car.model}`}
            onOpenLightbox={() => setLightboxOpen(true)}
          />

          {/* Info */}
          <div className={styles.info}>
            <p className={styles.brand}>{car.brand}</p>
            <h1 className={styles.model}>{car.model}</h1>
            <p className={styles.meta}>
              {car.year} · {car.owner_count === 1 ? 'Único dueño' : `${car.owner_count} dueños`}
            </p>

            <p className={styles.price}>
              <span className="price-clp">{formatPrice(car.price)}</span>
              <span className={styles.currency}> CLP</span>
            </p>

            {/* Specs grid */}
            <div className={styles.specsGrid}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Kilometraje</span>
                <span className={styles.specValue}>{car.mileage.toLocaleString('es-CL')} km</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Combustible</span>
                <span className={styles.specValue}>{car.fuel}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Transmisión</span>
                <span className={styles.specValue}>{car.transmission}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Tipo de vehículo</span>
                <span className={styles.specValue}>{car.vehicle_type || 'No especificado'}</span>
              </div>
            </div>

            {/* Descripción */}
            {car.description && (
              <div className={styles.description}>
                <p>{car.description}</p>
              </div>
            )}

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className={styles.features}>
                {car.features.map((f) => (
                  <span key={f} className={styles.feature}>
                    <span className={styles.featureDot} />
                    {f}
                  </span>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className={styles.actions}>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.btnWa}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Consultar por este auto
              </a>
              <a href={`tel:+${import.meta.env.VITE_WHATSAPP_NUMBER ?? '56965655135'}`} className={styles.btnCall}>
                Llamar · +56 9 6565 5135
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && hasImages && (
        <div
          className={styles.lightbox}
          onClick={() => setLightboxOpen(false)}
        >
          <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)}>✕</button>
          <img
            src={getImageUrl(images[activeImg]?.public_url, 'full')}
            alt={`${car.brand} ${car.model} — foto ${activeImg + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <>
              <button
                className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                onClick={(e) => { e.stopPropagation(); setActiveImg((p) => (p - 1 + images.length) % images.length); }}
              >‹</button>
              <button
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={(e) => { e.stopPropagation(); setActiveImg((p) => (p + 1) % images.length); }}
              >›</button>
            </>
          )}
        </div>
      )}

      {/* ── Modal de archivado ──────────────────────────────────── */}
      {archiveModalOpen && isAdmin && (
        <div className={styles.modalOverlay} onClick={closeArchiveModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {archiveStep === 1 ? (
              <>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>¿Deseas archivar esta publicación?</h2>
                  <button className={styles.modalCloseBtn} onClick={closeArchiveModal}>✕</button>
                </div>
                <p className={styles.modalBody}>
                  La publicación dejará de ser visible para clientes pero podrá restaurarse posteriormente desde el dashboard.
                </p>
                <div className={styles.modalActions}>
                  <button className={styles.cancelBtn} onClick={closeArchiveModal}>Cancelar</button>
                  <button className={styles.confirmBtn} onClick={() => setArchiveStep(2)}>Continuar</button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Confirmar archivado</h2>
                  <button className={styles.modalCloseBtn} onClick={closeArchiveModal}>✕</button>
                </div>
                <p className={styles.modalBody}>
                  Esta acción ocultará la publicación del catálogo público. Para confirmar, escribe <strong>ARCHIVAR</strong>:
                </p>
                <div className={styles.modalVehicleName}>
                  {car.brand} {car.model} {car.year}
                </div>
                <input
                  className={styles.modalInput}
                  type="text"
                  placeholder="Escribe ARCHIVAR"
                  value={archiveConfirmText}
                  onChange={(e) => setArchiveConfirmText(e.target.value)}
                  autoFocus
                />
                <div className={styles.modalActions}>
                  <button className={styles.cancelBtn} onClick={closeArchiveModal} disabled={archiving}>
                    Cancelar
                  </button>
                  <button
                    className={styles.confirmBtn}
                    onClick={executeArchive}
                    disabled={archiveConfirmText !== 'ARCHIVAR' || archiving}
                  >
                    {archiving ? 'Archivando...' : 'Archivar publicación'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

// ── Componente separado para la galería ──────────────────────────
interface GalleryProps {
  images: any[];
  hasImages: boolean;
  activeImg: number;
  setActiveImg: (i: number) => void;
  activeImageUrl: string | null;
  imgLoaded: boolean;
  setImgLoaded: (v: boolean) => void;
  imgError: boolean;
  setImgError: (v: boolean) => void;
  galleryRef: React.RefObject<HTMLDivElement | null>;
  touchStartX: React.RefObject<number | null>;
  touchStartY: React.RefObject<number | null>;
  goNext: (total: number) => void;
  goPrev: (total: number) => void;
  badge: string | null;
  carName: string;
  onOpenLightbox: () => void;
}

function GallerySection({
  images, hasImages, activeImg, setActiveImg, activeImageUrl,
  imgLoaded, setImgLoaded, imgError, setImgError,
  galleryRef, touchStartX, touchStartY,
  goNext, goPrev, badge, carName, onOpenLightbox,
}: GalleryProps) {

  // Teclado
  useEffect(() => {
    if (!hasImages || images.length <= 1) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext(images.length);
      if (e.key === 'ArrowLeft') goPrev(images.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasImages, images.length, goNext, goPrev]);

  // Precarga adyacentes
  useEffect(() => {
    if (!hasImages || images.length <= 1) return;
    const preload = (url: string | null | undefined) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
    };
    preload(images[(activeImg - 1 + images.length) % images.length]?.public_url);
    preload(images[(activeImg + 1) % images.length]?.public_url);
  }, [activeImg, hasImages, images]);

  // Reset al cambiar imagen
  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [activeImg, setImgLoaded, setImgError]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext(images.length);
      else goPrev(images.length);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  function selectImg(i: number) {
    setActiveImg(i);
    setImgLoaded(false);
    setImgError(false);
  }

  return (
    <div className={styles.gallery} ref={galleryRef}>
      {badge && (
        <span className={`${styles.badge} ${badge === 'OFERTA' ? styles.badgeRed : ''}`}>
          {badge}
        </span>
      )}

      {/* Imagen principal */}
      <div
        className={styles.mainImage}
        onTouchStart={hasImages && images.length > 1 ? onTouchStart : undefined}
        onTouchEnd={hasImages && images.length > 1 ? onTouchEnd : undefined}
        aria-label="Galería de imágenes del vehículo"
        role="region"
      >
        {/* Skeleton de carga */}
        {hasImages && !imgLoaded && !imgError && (
          <div className={styles.imgSkeleton}>
            <div className={styles.imgSkeletonSpinner} />
          </div>
        )}

        {/* Imagen con fade */}
        {hasImages && !imgError ? (
          <img
            ref={(el) => {
              // Si la imagen ya está en caché del navegador,
              // onLoad no se dispara — verificamos complete al montar
              if (el && el.complete && !imgLoaded) {
                setImgLoaded(true);
              }
            }}
            src={getImageUrl(activeImageUrl, 'medium')}
            srcSet={`${getImageUrl(activeImageUrl, 'medium')} 800w, ${getImageUrl(activeImageUrl, 'full')} 1200w`}
            sizes="(max-width: 768px) 100vw, 55vw"
            alt={`${carName} — foto ${activeImg + 1}`}
            loading="eager"
            decoding="async"
            className={`${styles.galleryImg} ${imgLoaded ? styles.galleryImgVisible : ''}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
            onClick={onOpenLightbox}
            style={{ cursor: 'zoom-in' }}
          />
        ) : hasImages && imgError ? (
          <div className={styles.imgErrorState}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Imagen no disponible</span>
          </div>
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
        )}

        {/* Botones prev / next */}
        {hasImages && images.length > 1 && (
          <>
            <button
              className={`${styles.galleryNav} ${styles.galleryPrev}`}
              onClick={(e) => { e.stopPropagation(); goPrev(images.length); }}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              className={`${styles.galleryNav} ${styles.galleryNext}`}
              onClick={(e) => { e.stopPropagation(); goNext(images.length); }}
              aria-label="Siguiente imagen"
            >
              ›
            </button>
          </>
        )}

        {/* Contador */}
        {hasImages && (
          <span className={styles.imageCounter}>{activeImg + 1} / {images.length}</span>
        )}
      </div>

      {/* Dots indicadores */}
      {hasImages && images.length > 1 && images.length <= 10 && (
        <div className={styles.galleryDots}>
          {images.map((_, i) => (
            <button
              key={i}
              className={`${styles.galleryDot} ${i === activeImg ? styles.galleryDotActive : ''}`}
              onClick={() => selectImg(i)}
              aria-label={`Ir a foto ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Miniaturas */}
      {hasImages && images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((img, i) => (
            <button
              key={img.id ?? i}
              className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
              onClick={() => selectImg(i)}
              aria-label={`Ver foto ${i + 1}`}
            >
              <img
                src={getImageUrl(img.public_url, 'thumbnail')}
                alt={`Foto ${i + 1}`}
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
