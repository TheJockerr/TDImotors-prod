// src/pages/Nosotros/Nosotros.tsx
import styles from './Nosotros.module.css';

const VALUES = [
  {
    title: 'Documentación al día',
    desc: 'Cada auto que publicamos tiene sus papeles verificados y en regla. Sin sorpresas.',
  },
  {
    title: 'Atención directa',
    desc: 'Hablás directo con el dueño, sin intermediarios. Respuesta en menos de 1 hora por WhatsApp.',
  },
  {
    title: 'Financiamiento gestionado',
    desc: 'Gestionamos crédito con diversas instituciones. También aceptamos tarjeta y part payment.',
  },
  {
    title: 'Autos seleccionados',
    desc: 'Trabajamos solo con vehículos que cumplan nuestros estándares de estado y documentación.',
  },
];

export default function Nosotros() {
  return (
    <main className={styles.main}>
      {/* Header */}
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.tag}>Sobre nosotros</span>
          <h1 className={styles.title}>
            TDI Motors —<br />
            Venta online, atención personal
          </h1>
          <p className={styles.desc}>
            Somos una automotora 100% online con base en Santiago. Nos especializamos en
            autos usados seleccionados con documentación al día, atención directa y financiamiento
            gestionado. Lunes a Sábados, en Las Condes (previa coordinación).
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className={styles.values}>
        <div className="container">
          <h2 className={styles.valuesTitle}>Lo que nos diferencia</h2>
          <div className={styles.valuesGrid}>
            {VALUES.map(({ title, desc }) => (
              <div key={title} className={styles.valueCard}>
                <h3 className={styles.valueTitle}>{title}</h3>
                <p className={styles.valueDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className={styles.how}>
        <div className="container">
          <h2 className={styles.howTitle}>¿Cómo funciona?</h2>
          <div className={styles.steps}>
            {[
              { num: '01', title: 'Revisa el catálogo', desc: 'Explora todos nuestros vehículos disponibles con fotos, especificaciones y precio.' },
              { num: '02', title: 'Contáctanos por WhatsApp', desc: 'Escríbenos directamente. Te respondemos en menos de 1 hora de Lunes a Sábados.' },
              { num: '03', title: 'Coordinamos una visita', desc: 'Agendamos para que puedas ver el auto en Las Condes, Santiago.' },
              { num: '04', title: 'Gestionamos el financiamiento', desc: 'Si necesitas crédito, tarjeta o part payment, lo gestionamos por ti.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className={styles.step}>
                <span className={styles.stepNum}>{num}</span>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}