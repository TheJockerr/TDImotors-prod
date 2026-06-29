// src/pages/Catalogo/Catalogo.tsx
import { useState, useMemo } from 'react';
import { useCars } from '../../hooks/useCars';
import CarCard from '../../components/cars/CarCard';
import CarFilter, { type FilterState, DEFAULT_FILTERS } from '../../components/cars/CarFilter';
import styles from './Catalogo.module.css';

export default function Catalogo() {
  const { cars, loading, loadingMore, hasMore, loadMore } = useCars();
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS });

  // Marcas únicas de los vehículos cargados
  const brands = useMemo(() => {
    const set = new Set(cars.map((c) => c.brand));
    return Array.from(set).sort();
  }, [cars]);

  // Filtrado en cliente sobre los datos ya paginados
  const filtered = useMemo(() => {
    return cars.filter((car) => {
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

      return true;
    });
  }, [cars, filters]);

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
              <p>No hay vehículos que coincidan con los filtros aplicados.</p>
              <button
                onClick={() => setFilters({ ...DEFAULT_FILTERS })}
                className={styles.resetBtn}
              >
                Limpiar filtros
              </button>
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