// src/pages/Admin/AdminLogin.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const navigate = useNavigate();
  const { session, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && session && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [session, isAdmin, authLoading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoadingSubmit(true);

    try {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err);
      } else {
        navigate('/admin', { replace: true });
      }
    } catch (e: any) {
      setError('Ocurrió un error inesperado al intentar iniciar sesión.');
    } finally {
      setLoadingSubmit(false);
    }
  }

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            TDI <span className={styles.logoRed}>Motors</span>
          </div>
          <p className={styles.subtitle}>Portal de Administración</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              className={styles.input}
              placeholder="ejemplo@tdimotors.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loadingSubmit}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loadingSubmit}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loadingSubmit}>
            {loadingSubmit ? (
              <>
                <span className={styles.spinner} />
                Iniciando sesión...
              </>
            ) : (
              'Ingresar al panel →'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
