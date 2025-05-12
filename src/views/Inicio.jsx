import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Card } from 'react-bootstrap';
import ModalInstalacionIOS from '../components/inicio/ModalInstalacionIOS';
import 'bootstrap-icons/font/bootstrap-icons.css';
import  '../views/Inicio.css'; // Importa tu CSS personalizado

const Inicio = () => {
  const navigate = useNavigate();

  const [solicitudInstalacion, setSolicitudInstalacion] = useState(null);
  const [mostrarBotonInstalacion, setMostrarBotonInstalacion] = useState(false);
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);
  const [mostrarModalInstrucciones, setMostrarModalInstrucciones] = useState(false);

  useEffect(() => {
    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setEsDispositivoIOS(esIOS);
  }, []);

  useEffect(() => {
    const manejarBeforeInstallPrompt = (evento) => {
      evento.preventDefault();
      setSolicitudInstalacion(evento);
      setMostrarBotonInstalacion(true);
    };

    window.addEventListener('beforeinstallprompt', manejarBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', manejarBeforeInstallPrompt);
    };
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const instalarPWA = async () => {
    if (!solicitudInstalacion) return;
    try {
      await solicitudInstalacion.prompt();
      const { outcome } = await solicitudInstalacion.userChoice;
      console.log(outcome === 'accepted' ? 'Instalación aceptada' : 'Instalación rechazada');
    } catch (error) {
      console.error('Error al intentar instalar la PWA:', error);
    } finally {
      setSolicitudInstalacion(null);
      setMostrarBotonInstalacion(false);
    }
  };

  return (
    <div className="inicio-fondo d-flex justify-content-center align-items-center min-vh-100">
      <Container className="text-center">
        <Card className="p-4 shadow-lg rounded-4 bg-white">
          <h2 className="mb-4 fw-bold">Bienvenido</h2>
          <div className="d-grid gap-3">
            <Button variant="outline-primary" size="lg" className="rounded-pill" onClick={() => handleNavigate('/categorias')}>
              <i className="bi bi-tags me-2"></i> Ir a Categorías
            </Button>
            <Button variant="outline-success" size="lg" className="rounded-pill" onClick={() => handleNavigate('/productos')}>
              <i className="bi bi-box-seam me-2"></i> Ir a Productos
            </Button>
            <Button variant="outline-warning" size="lg" className="rounded-pill" onClick={() => handleNavigate('/catalogos')}>
              <i className="bi bi-book me-2"></i> Ir a Catálogos
            </Button>
          </div>

          {!esDispositivoIOS && mostrarBotonInstalacion && (
            <div className="my-4">
              <Button variant="primary" size="lg" className="rounded-pill sombra" onClick={instalarPWA}>
                <i className="bi bi-download me-2"></i> Instalar app La miel de los pajaritos
              </Button>
            </div>
          )}

          {esDispositivoIOS && (
            <div className="my-4">
              <Button variant="info" size="lg" className="rounded-pill sombra" onClick={() => setMostrarModalInstrucciones(true)}>
                <i className="bi bi-phone me-2"></i> Cómo instalar en iPhone
              </Button>
            </div>
          )}
        </Card>
        <ModalInstalacionIOS
          mostrar={mostrarModalInstrucciones}
          cerrar={() => setMostrarModalInstrucciones(false)}
        />
      </Container>
    </div>
  );
};

export default Inicio;
