import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import logo from "../assets/react.svg";
import { useAuth } from "../database/authcontext";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../App.css";

const Encabezado = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setIsCollapsed(false);
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminPassword");
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsCollapsed(false);
  };

  return (
    <Navbar expand="sm" fixed="top" className="color-navbar">
      <Container>
        <Navbar.Brand onClick={() => handleNavigate("/inicio")} className="text-white" style={{ cursor: "pointer" }}>
          <img alt="" src={logo} width="30" height="30" className="d-inline-block align-top" />{" "}
          <strong>La miel de los pajaritos</strong>
        </Navbar.Brand>
        
              
        <Navbar.Toggle aria-controls="offcanvasNavbar-expand-sm" onClick={() => setIsCollapsed(!isCollapsed)} />
        <Navbar.Offcanvas
          id="offcanvasNavbar-expand-sm"
          aria-labelledby="offcanvasNavbarLabel-expand-sm"
          placement="end"
          show={isCollapsed}
          onHide={() => setIsCollapsed(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel-expand-sm" className={isCollapsed ? "color-texto-marca" : "text-white"}>
              Menú
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              <Nav.Link onClick={() => handleNavigate("/inicio")} className={isCollapsed ? "color-texto-marca" : "text-white"}>
                {isCollapsed ? <i className="bi-house-door-fill me-2"></i> : null}
                <strong>Inicio</strong>
              </Nav.Link>
              <div className="d-flex gap-2">
          <Nav.Link onClick={() => handleNavigate("/productos")} className="text-white">
            Productos
          </Nav.Link>
          <Nav.Link onClick={() => handleNavigate("/categorias")} className="text-white">
            Categorías
          </Nav.Link>
          <Nav.Link onClick={() => handleNavigate("/catalogo")} className="text-white">
            Catalogo
          </Nav.Link>
          <Nav.Link onClick={() => handleNavigate("/libros")} className="text-white">
            Libros
          </Nav.Link>
          <Nav.Link
            onClick={() => handleNavigate("/clima")}
            className={isCollapsed ? "color-texto-marca" : "text-white"}
          >
            {isCollapsed ? <i className="bi-cloud-sun-fill me-2"></i> : null}
            <strong>Clima</strong>

          </Nav.Link>
        </div>
              {isLoggedIn ? (
                <Nav.Link onClick={handleLogout} className={isCollapsed ? "text-black" : "text-white"}>
                  Cerrar Sesión
                </Nav.Link>
              ) : location.pathname === "/" && (
                <Nav.Link onClick={() => handleNavigate("/")} className={isCollapsed ? "text-black" : "text-white"}>
                  Iniciar Sesión
                </Nav.Link>
              )}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Encabezado;
