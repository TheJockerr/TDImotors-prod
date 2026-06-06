// src/components/cars/CarFilter.tsx
import { useRef, useEffect, useState } from 'react';
import styles from './CarFilter.module.css';

export interface FilterState {
  brand: string;
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
  mileageMax: string;
  fuel: string;
}

export const DEFAULT_FILTERS: FilterState = {
  brand: 'Todos',
  priceMin: '',
  priceMax: '',
  yearMin: '',
  yearMax: '',
  mileageMax: '',
  fuel: 'Todos',
};

interface Props {
  brands: string[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  total: number;
  showing: number;
}

const FUELS = ['Todos', 'Bencina', 'Diesel', 'Eléctrico', 'Híbrido'];

export default function CarFilter({ brands, filters, onChange, total, showing }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const activeCount = [
    filters.brand !== 'Todos',
    filters.priceMin !== '' || filters.priceMax !== '',
    filters.yearMin !== '' || filters.yearMax !== '',
    filters.mileageMax !== '',
    filters.fuel !== 'Todos',
  ].filter(Boolean).length;

  function set<K extends keyof FilterState>(key: K, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function reset() {
    onChange({ ...DEFAULT_FILTERS });
    setOpen(false);
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {/* ——— Barra ——— */}
      <div className={styles.bar}>
        {/* Botón trigger */}
        <button
          className={`${styles.toggleBtn} ${open ? styles.toggleOpen : ''}`}
          onClick={() => setOpen(!open)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Filtros
          {activeCount > 0 && (
            <span className={styles.badge}>{activeCount}</span>
          )}
          <svg
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {activeCount > 0 && (
          <button className={styles.clearBtn} onClick={reset}>
            Limpiar ✕
          </button>
        )}

        <p className={styles.count}>
          <strong>{showing}</strong> de {total} vehículos
        </p>
      </div>

      {/* ——— Panel flotante ——— */}
      {open && (
        <div className={styles.dropdown}>
          {/* Header del panel */}
          <div className={styles.dropHeader}>
            <span className={styles.dropTitle}>Filtrar vehículos</span>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className={styles.dropBody}>

            {/* MARCA */}
            <div className={styles.group}>
              <label className={styles.groupLabel}>Marca</label>
              <div className={styles.pills}>
                {['Todos', ...brands].map((b) => (
                  <button
                    key={b}
                    className={`${styles.pill} ${filters.brand === b ? styles.pillActive : ''}`}
                    onClick={() => set('brand', b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* PRECIO */}
            <div className={styles.group}>
              <label className={styles.groupLabel}>Precio (CLP)</label>
              <div className={styles.inputRow}>
                <div className={styles.inputWrap}>
                  <span className={styles.inputPrefix}>Desde $</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.priceMin}
                    onChange={(e) => set('priceMin', e.target.value)}
                    className={styles.input}
                    min={0}
                  />
                </div>
                <span className={styles.inputSep}>—</span>
                <div className={styles.inputWrap}>
                  <span className={styles.inputPrefix}>Hasta $</span>
                  <input
                    type="number"
                    placeholder="Sin límite"
                    value={filters.priceMax}
                    onChange={(e) => set('priceMax', e.target.value)}
                    className={styles.input}
                    min={0}
                  />
                </div>
              </div>
            </div>

            {/* AÑO */}
            <div className={styles.group}>
              <label className={styles.groupLabel}>Año</label>
              <div className={styles.inputRow}>
                <div className={styles.inputWrap}>
                  <span className={styles.inputPrefix}>Desde</span>
                  <input
                    type="number"
                    placeholder="2015"
                    value={filters.yearMin}
                    onChange={(e) => set('yearMin', e.target.value)}
                    className={styles.input}
                    min={1990}
                    max={new Date().getFullYear()}
                  />
                </div>
                <span className={styles.inputSep}>—</span>
                <div className={styles.inputWrap}>
                  <span className={styles.inputPrefix}>Hasta</span>
                  <input
                    type="number"
                    placeholder={String(new Date().getFullYear())}
                    value={filters.yearMax}
                    onChange={(e) => set('yearMax', e.target.value)}
                    className={styles.input}
                    min={1990}
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>

            {/* KILOMETRAJE */}
            <div className={styles.group}>
              <label className={styles.groupLabel}>Kilometraje máximo</label>
              <div className={styles.inputWrapFull}>
                <span className={styles.inputPrefix}>Hasta</span>
                <input
                  type="number"
                  placeholder="Sin límite"
                  value={filters.mileageMax}
                  onChange={(e) => set('mileageMax', e.target.value)}
                  className={styles.input}
                  min={0}
                />
                <span className={styles.inputSuffix}>km</span>
              </div>
            </div>

            {/* COMBUSTIBLE */}
            <div className={styles.group}>
              <label className={styles.groupLabel}>Combustible</label>
              <div className={styles.pills}>
                {FUELS.map((f) => (
                  <button
                    key={f}
                    className={`${styles.pill} ${filters.fuel === f ? styles.pillActive : ''}`}
                    onClick={() => set('fuel', f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className={styles.dropFooter}>
            <button className={styles.footerReset} onClick={reset}>
              Limpiar todo
            </button>
            <button className={styles.footerApply} onClick={() => setOpen(false)}>
              Ver {showing} resultado{showing !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}