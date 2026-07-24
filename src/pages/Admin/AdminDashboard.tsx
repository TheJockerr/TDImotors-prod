// src/pages/Admin/AdminDashboard.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminCars } from '../../hooks/useCars';
import { signOut } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import { supabase, getImageUrl, isSupabaseConfigured } from '../../lib/supabase';
import type { Car } from '../../types/car';
import { getPrimaryImage } from '../../types/car';
import { mockCars } from '../../data/mockCars';
import VehicleForm from './VehicleForm';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { session } = useAuth();
  const { cars, loading, error, refetch } = useAdminCars();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isFormActive, setIsFormActive] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'active' | 'reserved' | 'sold' | 'archived' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const highlightRowRef = useRef<HTMLTableRowElement | null>(null);

  // Scroll y resaltar fila al cargar si viene ?highlight=
  const editParam = searchParams.get('edit');
  const filterParam = searchParams.get('filter') as 'active' | 'reserved' | 'sold' | 'archived' | 'all' | null;
  useEffect(() => {
    // Aplicar filtro desde query param (ej. ?filter=all)
    if (filterParam && ['active', 'reserved', 'sold', 'archived', 'all'].includes(filterParam)) {
      setFilter(filterParam);
    }
    if (highlightId && highlightRowRef.current) {
      highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Si viene ?edit=1, abrir formulario del vehículo resaltado
    if (highlightId && editParam === '1' && cars.length > 0) {
      const targetCar = cars.find((c) => c.id === highlightId);
      if (targetCar) {
        setSelectedCar(targetCar);
        setIsFormActive(true);
      }
    }
  }, [highlightId, editParam, filterParam, cars]);

  // Limpiar query params de la URL después de procesarlos
  // para que al navegar directamente a /admin no persista el highlight
  useEffect(() => {
    if (highlightId || filterParam || editParam) {
      const timer = setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Estados para el Modal de Archivado
  const [archiveTarget, setArchiveTarget] = useState<Car | null>(null);
  const [archiveStep, setArchiveStep] = useState<1 | 2>(1);
  const [archiveConfirmText, setArchiveConfirmText] = useState('');
  const [archiving, setArchiving] = useState(false);

  // Estados para el Modal de Eliminación Permanente
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Estado para la notificación de éxito
  const [notification, setNotification] = useState<string | null>(null);

  function showSuccessNotification(message: string) {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }

  // Cerrar sesión
  async function handleLogout() {
    await signOut();
    navigate('/admin/login');
  }

  // Iniciar archivado
  function handleArchive(carToArchive: Car) {
    setArchiveTarget(carToArchive);
    setArchiveStep(1);
    setArchiveConfirmText('');
  }

  // Ejecutar archivado
  async function executeArchive() {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      if (isSupabaseConfigured) {
        const { error: dbErr } = await supabase!
          .from('vehicles')
          .update({ status: 'archived' })
          .eq('id', archiveTarget.id);

        if (dbErr) throw dbErr;
      } else {
        archiveTarget.status = 'archived';
      }
      showSuccessNotification('Vehículo archivado correctamente.');
      setArchiveTarget(null);
      refetch();
    } catch (err: any) {
      alert(`Error al archivar vehículo: ${err.message}`);
    } finally {
      setArchiving(false);
    }
  }

  // Restaurar vehículo
  async function handleRestore(carToRestore: Car) {
    try {
      if (isSupabaseConfigured) {
        const { error: dbErr } = await supabase!
          .from('vehicles')
          .update({ status: 'available' })
          .eq('id', carToRestore.id);

        if (dbErr) throw dbErr;
      } else {
        carToRestore.status = 'available';
      }
      showSuccessNotification('Vehículo restaurado correctamente.');
      refetch();
    } catch (err: any) {
      alert(`Error al restaurar vehículo: ${err.message}`);
    }
  }

  // Iniciar eliminación permanente
  function handleDeletePermanent(carToDelete: Car) {
    setDeleteTarget(carToDelete);
    setDeleteStep(1);
    setDeleteConfirmText('');
  }

  // Ejecutar eliminación permanente (base de datos + archivos en storage)
  async function executeDeletePermanent() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // 1. Borrar todas las imágenes asociadas del bucket de Storage
      if (isSupabaseConfigured && deleteTarget.vehicle_images && deleteTarget.vehicle_images.length > 0) {
        const pathsToDelete = deleteTarget.vehicle_images.map((img) => img.storage_path);
        const { error: storageErr } = await supabase!.storage
          .from(import.meta.env.VITE_STORAGE_BUCKET ?? 'vehicle-images')
          .remove(pathsToDelete);

        if (storageErr) {
          console.warn('[Storage] Error al limpiar bucket:', storageErr.message);
        }
      }

      // 2. Eliminar de la base de datos
      if (isSupabaseConfigured) {
        const { error: dbErr } = await supabase!
          .from('vehicles')
          .delete()
          .eq('id', deleteTarget.id);

        if (dbErr) throw dbErr;
      } else {
        const idx = mockCars.findIndex((c) => c.id === deleteTarget.id);
        if (idx !== -1) mockCars.splice(idx, 1);
      }

      showSuccessNotification('Vehículo eliminado permanentemente.');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      alert(`Error al eliminar vehículo: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  }

  // Actualizar un flag rápido (Destacado, Recién Llegado, Promoción)
  async function handleToggleFlag(carId: string, flag: 'is_featured' | 'is_new_arrival' | 'is_promotion', currentValue: boolean) {
    setUpdatingId(carId);
    try {
      if (isSupabaseConfigured) {
        const { error: patchErr } = await supabase!
          .from('vehicles')
          .update({ [flag]: !currentValue })
          .eq('id', carId);

        if (patchErr) throw patchErr;
      } else {
        const target = mockCars.find((c) => c.id === carId);
        if (target) target[flag] = !currentValue;
      }
      refetch();
    } catch (err: any) {
      alert(`Error al actualizar estado: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  }

  // Estadísticas calculadas
  const stats = {
    total: cars.filter((c) => c.status !== 'archived').length,
    available: cars.filter((c) => c.status === 'available').length,
    reserved: cars.filter((c) => c.status === 'reserved').length,
    sold: cars.filter((c) => c.status === 'sold').length,
    archived: cars.filter((c) => c.status === 'archived').length,
  };

  // Filtrar vehículos por tab
  const filteredCars = cars.filter((car) => {
    if (filter === 'active') return car.status === 'available';
    if (filter === 'reserved') return car.status === 'reserved';
    if (filter === 'sold') return car.status === 'sold';
    if (filter === 'archived') return car.status === 'archived';
    return car.status !== 'archived'; // 'all'
  });

  // Filtrar además por búsqueda de texto
  const displayedCars = searchQuery.trim() === ''
    ? filteredCars
    : filteredCars.filter((car) => {
        const q = searchQuery.toLowerCase();
        return (
          car.brand.toLowerCase().includes(q) ||
          car.model.toLowerCase().includes(q) ||
          String(car.year).includes(q) ||
          car.plate.toLowerCase().includes(q) ||
          (car.vehicle_type ?? '').toLowerCase().includes(q)
        );
      });

  if (isFormActive) {
    return (
      <main className={styles.container}>
        <div className="container">
          <div className={styles.dashboardCard}>
            <VehicleForm
              car={selectedCar}
              onSaved={() => {
                setIsFormActive(false);
                setSelectedCar(null);
                refetch();
              }}
              onCancel={() => {
                setIsFormActive(false);
                setSelectedCar(null);
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Panel Administrativo</h1>
            <span className={styles.userEmail}>Sesión: {session?.user?.email ?? 'Administrador Local'}</span>
          </div>
          
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => {
                setSelectedCar(null);
                setIsFormActive(true);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Vehículo
            </button>

            <button
              type="button"
              className={styles.logoutBtn}
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Notificación de éxito */}
        {notification && (
          <div className={styles.notificationBanner}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.notificationIcon}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{notification}</span>
          </div>
        )}

        {/* Resumen de estadísticas */}
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statVal}>{stats.total}</div>
            <div className={styles.statLabel}>Total Activos</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statVal} style={{ color: '#86efac' }}>{stats.available}</div>
            <div className={styles.statLabel}>Disponibles</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statVal} style={{ color: '#fde047' }}>{stats.reserved}</div>
            <div className={styles.statLabel}>Reservados</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statVal} style={{ color: '#fca5a5' }}>{stats.sold}</div>
            <div className={styles.statLabel}>Vendidos</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statVal} style={{ color: '#94a3b8' }}>{stats.archived}</div>
            <div className={styles.statLabel}>Archivados</div>
          </div>
        </div>

        {/* Buscador rápido */}
        <div className={styles.searchBar}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por marca, modelo, año, patente o tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setSearchQuery('')}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros de Inventario (Secciones/Tabs) */}
        <div className={styles.filterTabs}>
          <button
            type="button"
            className={`${styles.filterTab} ${filter === 'active' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('active')}
          >
            Activos ({stats.available})
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${filter === 'reserved' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('reserved')}
          >
            Reservados ({stats.reserved})
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${filter === 'sold' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('sold')}
          >
            Vendidos ({stats.sold})
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${filter === 'archived' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('archived')}
          >
            Archivados ({stats.archived})
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos ({stats.total})
          </button>
        </div>

        {/* Listado principal */}
        <div className={styles.dashboardCard}>
          {loading ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <p>Cargando registros...</p>
            </div>
          ) : error ? (
            <div className={styles.emptyState} style={{ color: '#fca5a5' }}>
              Error al cargar datos: {error}
            </div>
          ) : displayedCars.length === 0 ? (
            <div className={styles.emptyState}>
              {searchQuery.trim() !== '' ? `Sin resultados para "${searchQuery}"` : 'No hay vehículos registrados en este filtro.'}
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Vehículo</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Flags</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCars.map((car) => {
                    const primaryImg = getPrimaryImage(car.vehicle_images);
                    const isHighlighted = car.id === highlightId;
                    return (
                      <tr
                        key={car.id}
                        ref={isHighlighted ? highlightRowRef : null}
                        style={{
                          opacity: updatingId === car.id ? 0.6 : 1,
                          background: isHighlighted ? 'rgba(230,51,41,0.08)' : undefined,
                          boxShadow: isHighlighted ? 'inset 0 0 0 2px rgba(230,51,41,0.4)' : undefined,
                        }}
                      >
                        <td>
                          <div className={styles.carInfo}>
                            {primaryImg ? (
                              <img
                                src={getImageUrl(primaryImg, 'thumbnail')}
                                alt={`${car.brand} ${car.model}`}
                                className={styles.thumbnail}
                              />
                            ) : (
                              <div className={styles.placeholderThumb}>✕</div>
                            )}
                            <div className={styles.carMeta}>
                              <span className={styles.carName}>
                                {car.brand} {car.model} {car.year}
                              </span>
                              <span className={styles.carPlate}>
                                Patente: {car.plate} · Tipo: {car.vehicle_type || 'No especificado'} · {car.mileage.toLocaleString('es-CL')} km
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td style={{ fontWeight: 700 }}>
                          ${car.price.toLocaleString('es-CL')}
                        </td>
                        
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              car.status === 'available'
                                ? styles.statusAvailable
                                : car.status === 'reserved'
                                ? styles.statusReserved
                                : car.status === 'sold'
                                ? styles.statusSold
                                : car.status === 'draft'
                                ? styles.statusDraft
                                : styles.statusArchived
                            }`}
                          >
                            {car.status === 'available'
                              ? 'Disponible'
                              : car.status === 'reserved'
                              ? 'Reservado'
                              : car.status === 'sold'
                              ? 'Vendido'
                              : car.status === 'draft'
                              ? 'Borrador'
                              : 'Archivado'}
                          </span>
                        </td>
                        
                        <td>
                          <div className={styles.toggleCol}>
                            <label className={styles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={car.is_featured}
                                onChange={() => handleToggleFlag(car.id, 'is_featured', car.is_featured)}
                                disabled={updatingId !== null}
                              />
                              Crédito Directo
                            </label>
                            <label className={styles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={car.is_new_arrival}
                                onChange={() => handleToggleFlag(car.id, 'is_new_arrival', car.is_new_arrival)}
                                disabled={updatingId !== null}
                              />
                              Recién Llegado
                            </label>
                            <label className={styles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={car.is_promotion}
                                onChange={() => handleToggleFlag(car.id, 'is_promotion', car.is_promotion)}
                                disabled={updatingId !== null}
                              />
                              Promoción
                            </label>
                          </div>
                        </td>
                        
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              type="button"
                              className={styles.editBtn}
                              onClick={() => {
                                setSelectedCar(car);
                                setIsFormActive(true);
                              }}
                            >
                              Editar
                            </button>
                            {car.status === 'archived' ? (
                              <>
                                <button
                                  type="button"
                                  className={styles.restoreBtn}
                                  onClick={() => handleRestore(car)}
                                  style={{
                                    background: 'rgba(34,197,94,0.1)',
                                    color: '#86efac',
                                    border: '1px solid rgba(34,197,94,0.2)'
                                  }}
                                >
                                  Restaurar
                                </button>
                                <button
                                  type="button"
                                  className={styles.deleteBtn}
                                  onClick={() => handleDeletePermanent(car)}
                                >
                                  Eliminar permanente
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className={styles.archiveBtn}
                                onClick={() => handleArchive(car)}
                                style={{
                                  background: 'rgba(234,179,8,0.1)',
                                  color: '#fde047',
                                  border: '1px solid rgba(234,179,8,0.2)'
                                }}
                              >
                                Archivar publicación
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Archivado */}
      {archiveTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>¿Deseas archivar esta publicación?</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setArchiveTarget(null)}
              >
                ✕
              </button>
            </div>
            
            {archiveStep === 1 ? (
              <>
                <div className={styles.modalBody}>
                  La publicación dejará de ser visible para clientes pero podrá restaurarse posteriormente.
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setArchiveTarget(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    onClick={() => setArchiveStep(2)}
                  >
                    Continuar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.modalBody}>
                  <p>Esta acción ocultará la publicación del catálogo público.</p>
                  <div className={styles.modalVehicleName}>
                    {archiveTarget.brand} {archiveTarget.model} {archiveTarget.year}
                  </div>
                  <p style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    Escribe exactamente <strong>ARCHIVAR</strong> para confirmar:
                  </p>
                  <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="Escribe ARCHIVAR"
                    value={archiveConfirmText}
                    onChange={(e) => setArchiveConfirmText(e.target.value)}
                  />
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setArchiveTarget(null)}
                    disabled={archiving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    disabled={archiveConfirmText !== 'ARCHIVAR' || archiving}
                    onClick={executeArchive}
                  >
                    {archiving ? 'Archivando...' : 'Confirmar Archivado'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de Eliminación Permanente */}
      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle} style={{ color: 'var(--color-red)' }}>¿Eliminar permanentemente?</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setDeleteTarget(null)}
              >
                ✕
              </button>
            </div>
            
            {deleteStep === 1 ? (
              <>
                <div className={styles.modalBody}>
                  Esta acción eliminará permanentemente el vehículo y todas sus imágenes asociadas.
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setDeleteTarget(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    onClick={() => setDeleteStep(2)}
                  >
                    Continuar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.modalBody}>
                  <p>Esta acción es irreversible y se perderán todos los datos y fotos.</p>
                  <div className={styles.modalVehicleName}>
                    {deleteTarget.brand} {deleteTarget.model} {deleteTarget.year}
                  </div>
                  <p style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    Escribe exactamente <strong>ELIMINAR</strong> para confirmar:
                  </p>
                  <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="Escribe ELIMINAR"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                  />
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    disabled={deleteConfirmText !== 'ELIMINAR' || deleting}
                    onClick={executeDeletePermanent}
                  >
                    {deleting ? 'Eliminando...' : 'Eliminar permanentemente'}
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
