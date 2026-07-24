// src/pages/Contacto/Contacto.tsx
import { useState, type FormEvent } from 'react';
import styles from './Contacto.module.css';

const WHATSAPP_NUMBERS = [
  { label: '+56 9 4038 5580', href: 'https://wa.me/56940385580' },
];

const FACEBOOK_URL = 'https://www.facebook.com/share/1J5pRcCyxb/?mibextid=wwXIfr';
const TIKTOK_URL = 'https://www.tiktok.com/@tdi_motors?_r=1&_t=ZS-98H8QRgiwFe';

type FormState = { name: string; phone: string; message: string };
type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function Contacto() {
  const [form, setForm] = useState<FormState>({ name: '', phone: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Construye un mensaje de WhatsApp preconfigurado con datos del formulario
    const intro = `Hola, estoy interesado/a en consignar mi vehículo.`;
    const text = encodeURIComponent(
      `${intro}\n\nNombre: ${form.name}\nTeléfono: ${form.phone}\n\n${form.message}`
    );
    window.open(`https://wa.me/56940385580?text=${text}`, '_blank');
    setStatus('sent');
    setForm({ name: '', phone: '', message: '' });
  }

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.layout}>
          {/* Panel izquierdo — Datos */}
          <div className={styles.infoPanel}>
            <h1 className={styles.title}>Consignar mi vehículo</h1>

            <div className={styles.contactGroup}>
              <span className={styles.groupLabel}>WHATSAPP</span>
              {WHATSAPP_NUMBERS.map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                  {label}
                </a>
              ))}
            </div>

            <div className={styles.contactGroup}>
              <span className={styles.groupLabel}>INSTAGRAM</span>
              <a
                href="https://www.instagram.com/tdi_motors"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                @tdi_motors
              </a>
            </div>

            <div className={styles.contactGroup}>
              <span className={styles.groupLabel}>FACEBOOK</span>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                TDI Motors
              </a>
            </div>

            <div className={styles.contactGroup}>
              <span className={styles.groupLabel}>TIKTOK</span>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                @tdi_motors
              </a>
            </div>

            <div className={styles.scheduleCard}>
              <span className={styles.scheduleLabel}>Horario de atención</span>
              <p className={styles.scheduleDays}>Lunes a Sábados</p>
              <p className={styles.scheduleLocation}>Las Condes, Santiago (previa coordinación)</p>
            </div>
          </div>

          {/* Panel derecho — Formulario */}
          <div className={styles.formPanel}>
            <h2 className={styles.formTitle}>Solicitar consignación</h2>

            {status === 'sent' ? (
              <div className={styles.successBox}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p>¡Gracias! Te abrimos WhatsApp con tu solicitud de consignación.</p>
                <button onClick={() => setStatus('idle')} className={styles.resetBtn}>
                  Enviar otra solicitud
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label htmlFor="name" className={styles.label}>NOMBRE</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="phone" className={styles.label}>TELÉFONO / WHATSAPP</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+56 9 ..."
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="message" className={styles.label}>VEHÍCULO / DETALLES</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Ej: Tengo un MG ZS MT 1.5 2023, con 30.000 km. Quisiera saber las condiciones de consignación..."
                    required
                    rows={5}
                    className={styles.textarea}
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Solicitar consignación →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}