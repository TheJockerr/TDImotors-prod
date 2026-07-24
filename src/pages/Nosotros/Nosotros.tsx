// src/pages/Nosotros/Nosotros.tsx
import styles from './Nosotros.module.css';

const VALUES = [
  {
    title: 'Consignación transparente',
    desc: 'Gestionamos la venta de tu auto de principio a fin, promocionándolo en nuestros canales para lograr la mejor venta.',
  },
  {
    title: 'Atención directa',
    desc: 'Trato personalizado sin intermediarios. Respuesta en menos de 1 hora por WhatsApp para gestionar tu consignación o compra.',
  },
  {
    title: 'Financiamiento gestionado',
    desc: 'Facilitamos la venta ofreciendo a los compradores opciones de crédito automotriz, pago con tarjeta y part payment.',
  },
  {
    title: 'Vehículos seleccionados',
    desc: 'Trabajamos con un catálogo de calidad garantizando inspección y óptimas condiciones en cada modelo.',
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
            TDI Motors -<br />
            Especialistas en Consignaciones y Venta de Autos
          </h1>
          <p className={styles.desc}>
            Somos una automotora 100% online en Santiago especializada en la consignación
            y venta de vehículos. Nos encargamos de toda la gestión comercial y financiamiento
            para que vendas o compres de forma ágil, segura y transparente. Lunes a Sábados en Las Condes (previa coordinación).
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
          <h2 className={styles.howTitle}>¿Cómo funciona la consignación?</h2>
          <div className={styles.steps}>
            {[
              { num: '01', title: 'Solicita tu consignación', desc: 'Envíanos la información de tu vehículo por la web o directo por WhatsApp.' },
              { num: '02', title: 'Evaluación y estrategia', desc: 'Revisamos tu vehículo y acordamos el precio y condiciones de venta.' },
              { num: '03', title: 'Publicación y difusión', desc: 'Promocionamos tu auto en nuestro catálogo online y redes sociales.' },
              { num: '04', title: 'Gestión y venta final', desc: 'Gestionamos compradores, opciones de financiamiento y concretamos la venta.' },
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
