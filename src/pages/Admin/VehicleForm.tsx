// src/pages/Admin/VehicleForm.tsx
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Car, VehicleImage, CarFormData } from '../../types/car';
import VehicleImages from '../../components/admin/VehicleImages';
import styles from './VehicleForm.module.css';

const VEHICLE_TYPES = [
  'CityCar',
  'Sedan',
  'Hatchback',
  'SUV',
  'Camioneta',
  'Convertible',
  'Coupé',
  'Station Wagon',
  'Furgón',
  'Comercial'
];

interface Props {
  car: Car | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function VehicleForm({ car, onSaved, onCancel }: Props) {
  // Generar UUID si es nuevo, o usar el ID del auto a editar
  const [vehicleId] = useState(() => car?.id ?? crypto.randomUUID());
  
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [price, setPrice] = useState(0);
  const [mileage, setMileage] = useState(0);
  const [fuel, setFuel] = useState('Bencina');
  const [transmission, setTransmission] = useState('Manual');
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [description, setDescription] = useState('');
  const [ownerCount, setOwnerCount] = useState(1);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  // Flags visuales y estado
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isPromotion, setIsPromotion] = useState(false);
  const [status, setStatus] = useState<Car['status']>('available');

  // Galería de imágenes
  const [images, setImages] = useState<VehicleImage[]>([]);

  // Estados de control de la UI
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar campos si estamos editando
  useEffect(() => {
    if (car) {
      setBrand(car.brand);
      setModel(car.model);
      setYear(car.year);
      setPrice(car.price);
      setMileage(car.mileage);
      setFuel(car.fuel);
      setTransmission(car.transmission);
      setPlate(car.plate);
      setVehicleType(car.vehicle_type ?? '');
      setDescription(car.description ?? '');
      setOwnerCount(car.owner_count ?? 1);
      setFeatures(car.features ?? []);
      setIsFeatured(car.is_featured ?? false);
      setIsNewArrival(car.is_new_arrival ?? false);
      setIsPromotion(car.is_promotion ?? false);
      setStatus(car.status ?? 'available');
      setImages(car.vehicle_images ?? []);
    }
  }, [car]);

  // Manejo de features (características)
  function handleAddFeature(e: React.FormEvent) {
    e.preventDefault();
    if (!newFeature.trim()) return;
    if (features.includes(newFeature.trim())) return;
    setFeatures([...features, newFeature.trim()]);
    setNewFeature('');
  }

  function handleRemoveFeature(index: number) {
    setFeatures(features.filter((_, idx) => idx !== index));
  }

  // Guardar auto completo
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validar mínimo 1 imagen
    if (images.length === 0) {
      setError('Debes agregar al menos 1 imagen del vehículo.');
      return;
    }

    // Validar tipo de vehículo seleccionado
    if (!vehicleType) {
      setError('Debes seleccionar un tipo de vehículo.');
      return;
    }

    setSaving(true);

    try {
      const vehiclePayload = {
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year),
        price: Number(price),
        mileage: Number(mileage),
        fuel,
        transmission,
        plate: plate.trim().toUpperCase(),
        vehicle_type: vehicleType,
        description: description.trim() || null,
        owner_count: Number(ownerCount),
        features,
        is_featured: isFeatured,
        is_new_arrival: isNewArrival,
        is_promotion: isPromotion,
        status,
      };

      // Si no hay Supabase, simulamos guardado
      if (!isSupabaseConfigured) {
        await new Promise((r) => setTimeout(r, 1000));
        onSaved();
        return;
      }

      // 1. Guardar en tabla vehicles (Insert o Update)
      if (car) {
        // Modo Edición
        const { error: vehicleErr } = await supabase!
          .from('vehicles')
          .update(vehiclePayload)
          .eq('id', vehicleId);

        if (vehicleErr) throw vehicleErr;
      } else {
        // Modo Creación
        const { error: vehicleErr } = await supabase!
          .from('vehicles')
          .insert({
            id: vehicleId,
            ...vehiclePayload,
          });

        if (vehicleErr) throw vehicleErr;
      }

      // 2. Sincronizar imágenes: Borrar anteriores de la base de datos e insertar las actuales
      const { error: deleteImagesErr } = await supabase!
        .from('vehicle_images')
        .delete()
        .eq('vehicle_id', vehicleId);

      if (deleteImagesErr) throw deleteImagesErr;

      // Insertar imágenes actuales con orden correcto
      if (images.length > 0) {
        const imagesPayload = images.map((img, idx) => ({
          vehicle_id: vehicleId,
          storage_path: img.storage_path,
          public_url: img.public_url,
          sort_order: idx,
          is_primary: img.is_primary,
        }));

        const { error: insertImagesErr } = await supabase!
          .from('vehicle_images')
          .insert(imagesPayload);

        if (insertImagesErr) throw insertImagesErr;
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el vehículo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {car ? `Editar: ${car.brand} ${car.model}` : 'Registrar Nuevo Vehículo'}
        </h2>
        <button type="button" className={styles.closeBtn} onClick={onCancel}>
          ✕
        </button>
      </div>

      {error && <div className={styles.cancelBtn} style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid var(--color-red)' }}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Columna Izquierda: Información Principal */}
        <div className={styles.leftCol}>
          <h3 className={styles.sectionTitle}>Datos del Vehículo</h3>
          
          <div className={styles.gridFields}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="brand">Marca</label>
              <input
                id="brand"
                type="text"
                required
                placeholder="Ej. MG, Kia, Hyundai"
                className={styles.input}
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="model">Modelo</label>
              <input
                id="model"
                type="text"
                required
                placeholder="Ej. ZS MT 1.5, Sportage"
                className={styles.input}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="year">Año</label>
              <input
                id="year"
                type="number"
                required
                min={1990}
                max={new Date().getFullYear() + 1}
                className={styles.input}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                disabled={saving}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="plate">Patente</label>
              <input
                id="plate"
                type="text"
                required
                maxLength={8}
                placeholder="Ej. SYFX-98"
                className={styles.input}
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="price">Precio (CLP)</label>
              <input
                id="price"
                type="number"
                required
                min={1}
                placeholder="Ej. 10990000"
                className={styles.input}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                disabled={saving}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="mileage">Kilometraje</label>
              <input
                id="mileage"
                type="number"
                required
                min={0}
                placeholder="Ej. 13000"
                className={styles.input}
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                disabled={saving}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="fuel">Combustible</label>
              <select
                id="fuel"
                className={styles.select}
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                disabled={saving}
              >
                <option value="Bencina">Bencina</option>
                <option value="Diesel">Diesel</option>
                <option value="Eléctrico">Eléctrico</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="transmission">Transmisión</label>
              <select
                id="transmission"
                className={styles.select}
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                disabled={saving}
              >
                <option value="Manual">Manual</option>
                <option value="Automático">Automático</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="vehicleType">Tipo de Vehículo</label>
              <select
                id="vehicleType"
                className={styles.select}
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                disabled={saving}
              >
                <option value="">Selecciona un tipo de vehículo</option>
                {VEHICLE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ownerCount">Número de Dueños</label>
              <input
                id="ownerCount"
                type="number"
                required
                min={1}
                className={styles.input}
                value={ownerCount}
                onChange={(e) => setOwnerCount(Number(e.target.value))}
                disabled={saving}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="status">Estado de Venta</label>
              <select
                id="status"
                className={styles.select}
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={saving}
              >
                <option value="draft">Borrador (Draft)</option>
                <option value="available">Disponible</option>
                <option value="reserved">Reservado</option>
                <option value="sold">Vendido</option>
                <option value="archived">Archivado</option>
              </select>
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="description">Descripción</label>
              <textarea
                id="description"
                rows={3}
                placeholder="Escribe una breve descripción del auto..."
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Características e Imágenes */}
        <div className={styles.rightCol}>
          <h3 className={styles.sectionTitle}>Visualización y Tags</h3>
          
          <div className={styles.checkboxesGrid}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                disabled={saving}
              />
              Destacado
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                disabled={saving}
              />
              Recién Llegado
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isPromotion}
                onChange={(e) => setIsPromotion(e.target.checked)}
                disabled={saving}
              />
              Promoción
            </label>
          </div>

          <div className={styles.featuresWrap} style={{ marginTop: '16px' }}>
            <label className={styles.label}>Equipamiento / Características</label>
            <div className={styles.featuresInputRow}>
              <input
                type="text"
                placeholder="Ej. Climatizador, Bluetooth"
                className={styles.input}
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                disabled={saving}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFeature(e)}
              />
              <button
                type="button"
                className={styles.addFeatureBtn}
                onClick={handleAddFeature}
                disabled={saving}
              >
                Agregar
              </button>
            </div>
            
            <div className={styles.featuresList}>
              {features.map((feature, idx) => (
                <span key={idx} className={styles.featureTag}>
                  {feature}
                  <button
                    type="button"
                    className={styles.removeFeatureBtn}
                    onClick={() => handleRemoveFeature(idx)}
                    disabled={saving}
                  >
                    ✕
                  </button>
                </span>
              ))}
              {features.length === 0 && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  No se han agregado equipamientos aún.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sección de imágenes — se reordena debajo en mobile */}
        <div className={styles.imagesSection}>
          <VehicleImages
            vehicleId={vehicleId}
            images={images}
            onChange={setImages}
          />
        </div>

        {/* Botones de acción del Formulario */}
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className={styles.saveBtn}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className={styles.spinner} />
                Guardando auto...
              </>
            ) : (
              'Guardar Vehículo'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
