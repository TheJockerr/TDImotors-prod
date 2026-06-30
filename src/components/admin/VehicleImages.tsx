// src/components/admin/VehicleImages.tsx
import { useState, useRef } from 'react';
import { supabase, getImageUrl, isSupabaseConfigured } from '../../lib/supabase';
import type { VehicleImage } from '../../types/car';
import styles from './VehicleImages.module.css';

interface Props {
  vehicleId: string;
  images: VehicleImage[];
  onChange: (images: VehicleImage[]) => void;
}

export default function VehicleImages({ vehicleId, images, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reordenar: subir en la lista
  function moveUp(index: number) {
    if (index === 0) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index - 1];
    newImages[index - 1] = temp;
    
    // Actualizar sort_order e is_primary
    updateImageMetaData(newImages);
  }

  // Reordenar: bajar en la lista
  function moveDown(index: number) {
    if (index === images.length - 1) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index + 1];
    newImages[index + 1] = temp;

    // Actualizar sort_order e is_primary
    updateImageMetaData(newImages);
  }

  // Establecer como imagen principal
  function setPrimary(index: number) {
    const newImages = images.map((img, idx) => ({
      ...img,
      is_primary: idx === index,
    }));
    onChange(newImages);
  }

  // Helper para reasignar sort_order
  function updateImageMetaData(list: VehicleImage[]) {
    const updated = list.map((img, idx) => ({
      ...img,
      sort_order: idx,
      is_primary: idx === 0, // La primera siempre es la principal por defecto si no hay otra
    }));
    
    // Si alguna ya era primary, mantenerla como primary
    const hasPrimary = updated.some(img => img.is_primary);
    if (!hasPrimary && updated.length > 0) {
      updated[0].is_primary = true;
    }
    
    onChange(updated);
  }

  // Eliminar imagen de la lista y de Supabase Storage
  async function handleDelete(index: number) {
    const imgToDelete = images[index];
    setError(null);

    // Si Supabase está configurado, borramos el archivo de Storage
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: err } = await supabase.storage
          .from(import.meta.env.VITE_STORAGE_BUCKET ?? 'vehicle-images')
          .remove([imgToDelete.storage_path]);

        if (err) {
          console.warn('[Storage] Error al borrar archivo:', err.message);
        }
      } catch (e) {
        console.error('Error deleting from storage:', e);
      }
    }

    const filtered = images.filter((_, idx) => idx !== index);
    updateImageMetaData(filtered);
  }

  // Subir imagen a Supabase Storage
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 8) {
      setError('Un vehículo puede tener un máximo de 8 imágenes.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const newUploadedImages: VehicleImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`El archivo ${file.name} supera el límite de 5MB.`);
        }

        // Modo mock
        if (!isSupabaseConfigured) {
          await new Promise((r) => setTimeout(r, 600)); // simular upload
          const fakeUrl = `https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800`;
          newUploadedImages.push({
            id: crypto.randomUUID(),
            vehicle_id: vehicleId,
            storage_path: `vehicles/${vehicleId}/${file.name}`,
            public_url: fakeUrl,
            sort_order: images.length + i,
            is_primary: images.length + i === 0,
            created_at: new Date().toISOString(),
          });
          continue;
        }

        // Subir archivo real a Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `vehicles/${vehicleId}/${fileName}`;

        const { error: uploadError } = await supabase!.storage
          .from(import.meta.env.VITE_STORAGE_BUCKET ?? 'vehicle-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Obtener la URL pública del archivo subido
        const { data: { publicUrl } } = supabase!.storage
          .from(import.meta.env.VITE_STORAGE_BUCKET ?? 'vehicle-images')
          .getPublicUrl(filePath);

        newUploadedImages.push({
          id: crypto.randomUUID(), // ID temporal para control de UI
          vehicle_id: vehicleId,
          storage_path: filePath,
          public_url: publicUrl,
          sort_order: images.length + i,
          is_primary: images.length + i === 0,
          created_at: new Date().toISOString(),
        });
      }

      const combined = [...images, ...newUploadedImages];
      updateImageMetaData(combined);
    } catch (err: any) {
      setError(err.message || 'Error al subir una o más imágenes.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  }

  return (
    <div className={styles.container}>
      <label className={styles.uploadText}>Imágenes del Vehículo ({images.length}/8)</label>
      
      {error && <div className={styles.errorMessage}>{error}</div>}

      {images.length < 8 && (
        <div 
          className={styles.uploadArea}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <svg className={styles.uploadIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className={styles.uploadText}>
            {uploading ? 'Subiendo archivos...' : 'Haz clic para seleccionar imágenes'}
          </span>
          <span className={styles.uploadSubtext}>Soporta JPG, PNG, WEBP (Máx. 5MB por imagen)</span>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            ref={fileInputRef}
            className={styles.hiddenInput}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      )}

      {uploading && images.length === 0 && (
        <div className={styles.uploadArea}>
          <div className={styles.spinner} />
          <span>Subiendo primera imagen...</span>
        </div>
      )}

      {images.length > 0 && (
        <div className={styles.imageGrid}>
          {images.map((img, index) => (
            <div 
              key={img.id} 
              className={`${styles.imageItem} ${img.is_primary ? styles.imageItemActive : ''}`}
            >
              <img 
                src={getImageUrl(img.public_url, 'thumbnail')} 
                alt={`Miniatura ${index + 1}`} 
                className={styles.thumb}
              />
              
              {img.is_primary && <span className={styles.primaryBadge}>Principal</span>}
              <span className={styles.indexBadge}>{index + 1}</span>

              {/* Controles al hacer hover */}
              <div className={styles.overlayControls}>
                <div className={styles.topRow}>
                  {!img.is_primary && (
                    <button 
                      type="button" 
                      className={styles.actionBtn}
                      title="Hacer imagen principal"
                      onClick={() => setPrimary(index)}
                    >
                      ★
                    </button>
                  )}
                  <div style={{ flex: 1 }} />
                  <button 
                    type="button" 
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    title="Eliminar imagen"
                    onClick={() => handleDelete(index)}
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.bottomRow}>
                  <button 
                    type="button" 
                    className={styles.actionBtn}
                    title="Mover arriba"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    style={{ opacity: index === 0 ? 0.3 : 1 }}
                  >
                    ↑
                  </button>
                  <button 
                    type="button" 
                    className={styles.actionBtn}
                    title="Mover abajo"
                    onClick={() => moveDown(index)}
                    disabled={index === images.length - 1}
                    style={{ opacity: index === images.length - 1 ? 0.3 : 1 }}
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
