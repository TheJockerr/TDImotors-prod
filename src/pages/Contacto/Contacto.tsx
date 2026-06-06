// src/pages/Contacto/Contacto.tsx
import { useState,type FormEvent } from 'react';
import styles from './Contacto.module.css';

const WHATSAPP_NUMBERS = [
  { label: '+56 9 4038 5580', href: 'https://wa.me/56940385580' },
  { label: '+56 9 7737 0010', href: 'https://wa.me/56977370010' },
  { label: '+56 9 5219 1321', href: 'https://wa.me/56952191321' },
];

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
    // Construye un mensaje de WhatsApp con los datos del formulario
    const text = encodeURIComponent(
      `Hola, soy ${form.name}.\n\nTeléfono: ${form.phone}\n\n${form.message}`
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
            <h1 className={styles.title}>Contáctanos</h1>

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
                href="https://www.instagram.com/tdimotors"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                @tdimotors
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
            <h2 className={styles.formTitle}>Envíanos un mensaje</h2>

            {status === 'sent' ? (
              <div className={styles.successBox}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p>¡Gracias! Te abrimos WhatsApp con tu mensaje.</p>
                <button onClick={() => setStatus('idle')} className={styles.resetBtn}>
                  Enviar otro mensaje
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
                  <label htmlFor="message" className={styles.label}>MENSAJE O CONSULTA</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Ej: Me interesa el MG ZS MT 1.5 2023..."
                    required
                    rows={5}
                    className={styles.textarea}
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Enviar consulta →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}