// src/pages/Catalogo/Catalogo.tsx
import { useState, useMemo, useRef, useCallback } from 'react';
import { useCars } from '../../hooks/useCars';
import CarCard from '../../components/cars/CarCard';
import CarFilter, { type FilterState, DEFAULT_FILTERS } from '../../components/cars/CarFilter';
import styles from './Catalogo.module.css';

export default function Catalogo() {
  const { cars, loading, loadingMore, hasMore, loadMore } = useCars();
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS });
  const [searchQuery, setSearchQuery] = useState('');
  const [displayQuery, setDisplayQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce de 180ms para no filtrar en cada tecla en inventarios grandes
  const handleSearch = useCallback((value: string) => {
    setDisplayQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(value), 180);
  }, []);

  function clearSearch() {
    setDisplayQuery('');
    setSearchQuery('');
  }

  // Marcas únicas de los vehículos cargados
  const brands = useMemo(() => {
    const set = new Set(cars.map((c) => c.brand));
    return Array.from(set).sort();
  }, [cars]);

  // Filtrado en cliente sobre los datos ya paginados
  const filtered = useMemo(() => {
    return cars.filter((car) => {
      // ─ Filtros del panel ─
      if (filters.brand !== 'Todos' && car.brand !== filters.brand) return false;

      const priceMin = filters.priceMin !== '' ? Number(filters.priceMin) : 0;
      const priceMax = filters.priceMax !== '' ? Number(filters.priceMax) : Infinity;
      if (car.price < priceMin || car.price > priceMax) return false;

      const yearMin = filters.yearMin !== '' ? Number(filters.yearMin) : 0;
      const yearMax = filters.yearMax !== '' ? Number(filters.yearMax) : Infinity;
      if (car.year < yearMin || car.year > yearMax) return false;

      const mileageMax = filters.mileageMax !== '' ? Number(filters.mileageMax) : Infinity;
      if (car.mileage > mileageMax) return false;

      if (filters.fuel !== 'Todos' && car.fuel !== filters.fuel) return false;

      // ─ Búsqueda de texto (sin patente) ─
      if (searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        const match =
          car.brand.toLowerCase().includes(q) ||
          car.model.toLowerCase().includes(q) ||
          String(car.year).includes(q) ||
          car.fuel.toLowerCase().includes(q) ||
          (car.vehicle_type ?? '').toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [cars, filters, searchQuery]);

  return (
    <main className={styles.main}>
      {/* Header */}
      <section className={styles.header}>
        <div className="container">
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>Catálogo de vehículos</h1>
              <p className={styles.subtitle}>
                Todos nuestros autos con documentación al día · Lunes a Sábados
              </p>
            </div>
            <span className={styles.totalBadge}>{cars.length} vehículos</span>
          </div>

          {/* Barra de búsqueda */}
          <div className={styles.searchBar}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="catalogo-search"
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por marca, modelo, año, combustible o tipo de vehículo..."
              value={displayQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            {displayQuery && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <CarFilter
            brands={brands}
            filters={filters}
            onChange={setFilters}
            total={cars.length}
            showing={filtered.length}
          />
        </div>
      </section>

      {/* Grid */}
      <section className={styles.grid}>
        <div className="container">
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Cargando vehículos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              {searchQuery.trim() !== '' ? (
                <>
                  <p>No hay vehículos que coincidan con <strong>"{displayQuery}"</strong>.</p>
                  <button onClick={clearSearch} className={styles.resetBtn}>Limpiar búsqueda</button>
                </>
              ) : (
                <>
                  <p>No hay vehículos que coincidan con los filtros aplicados.</p>
                  <button onClick={() => setFilters({ ...DEFAULT_FILTERS })} className={styles.resetBtn}>Limpiar filtros</button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className={styles.carGrid}>
                {filtered.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>

              {/* Botón "Cargar más" */}
              {hasMore && (
                <div className={styles.loadMoreWrapper}>
                  <button
                    className={styles.loadMoreBtn}
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <span className={styles.loadMoreSpinner} />
                        Cargando...
                      </>
                    ) : (
                      'Cargar más vehículos'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}