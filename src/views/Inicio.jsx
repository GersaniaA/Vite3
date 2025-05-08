import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import ModalInstalacionIOS from '../components/inicio/ModalInstalacionIOS';

const Inicio = () => {
  const navigate = useNavigate();

  const [solicitudInstalacion, setSolicitudInstalacion] = useState(null);
  const [mostrarBotonInstalacion, setMostrarBotonInstalacion] = useState(false);
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);
  const [mostrarModalInstrucciones, setMostrarModalInstrucciones] = useState(false);

  // Detectar dispositivo iOS
  useEffect(() => {
    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setEsDispositivoIOS(esIOS);
  }, []);

  // Manejar evento beforeinstallprompt (solo en Android o navegadores compatibles)
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
    <Container className="text-center my-5">
      <h1>Inicio</h1>
      <div className="d-grid gap-2 my-3">
        <Button variant="secondary" onClick={() => handleNavigate('/categorias')}>
          Ir a Categorías
        </Button>
        <Button variant="secondary" onClick={() => handleNavigate('/productos')}>
          Ir a Productos
        </Button>
        <Button variant="secondary" onClick={() => handleNavigate('/catalogos')}>
          Ir a Catálogos
        </Button>
      </div>

      {!esDispositivoIOS && mostrarBotonInstalacion && (
        <div className="my-4">
          <Button className="sombra" variant="primary" onClick={instalarPWA}>
            Instalar app La miel de los pajaritos <i className="bi bi-download"></i>
          </Button>
        </div>
      )}

      {esDispositivoIOS && (
        <div className="my-4">
          <Button className="sombra" variant="primary" onClick={() => setMostrarModalInstrucciones(true)}>
            Cómo instalar La miel de los pajaritos en iPhone <i className="bi bi-phone"></i>
          </Button>
        </div>
      )}

      <ModalInstalacionIOS
        mostrar={mostrarModalInstrucciones}
        cerrar={() => setMostrarModalInstrucciones(false)}
      />
    </Container>
  );
};

export default Inicio;
