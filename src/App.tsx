import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home/Home';
import Catalogo from './pages/Catalogo/Catalogo';
import CarDetail from './components/cars/CarDetailTemp';
import Nosotros from './pages/Nosotros/Nosotros';
import Contacto from './pages/Contacto/Contacto';
import './index.css';

// Componente para restaurar scroll (compatible con BrowserRouter)
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* El componente de scroll DEBE ir dentro de BrowserRouter */}
      <ScrollToTop />
      
      <Navbar />
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/catalogo/:id" element={<CarDetail />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          
          {/* 404 redirect al home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}
