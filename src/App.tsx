// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import './index.css';

// ─── Lazy loading de páginas ─────────────────────────────────────
// Cada página se cargará solo cuando el usuario navegue a ella
const Home      = lazy(() => import('./pages/Home/Home'));
const Catalogo  = lazy(() => import('./pages/Catalogo/Catalogo'));
const CarDetail = lazy(() => import('./components/cars/CarDetail'));
const Nosotros  = lazy(() => import('./pages/Nosotros/Nosotros'));
const Contacto  = lazy(() => import('./pages/Contacto/Contacto'));

// Admin (chunk completamente separado — no se carga a usuarios públicos)
const AdminLogin     = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const PrivateRoute   = lazy(() => import('./components/admin/PrivateRoute'));

// ─── Spinner de carga para Suspense ─────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-red)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}

// ─── Scroll al inicio en cada cambio de ruta ─────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// ─── App principal ───────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      {/* Navbar no se carga con lazy — es crítico y pequeño */}
      <Navbar />

      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/"            element={<Home />} />
            <Route path="/catalogo"    element={<Catalogo />} />
            <Route path="/catalogo/:id" element={<CarDetail />} />
            <Route path="/vehiculo/:id" element={<CarDetail />} />
            <Route path="/nosotros"    element={<Nosotros />} />
            <Route path="/contacto"    element={<Contacto />} />

            {/* Rutas de administración (chunk separado) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* 404 → Home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </BrowserRouter>
  );
}
