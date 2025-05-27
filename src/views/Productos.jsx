import React, { useState, useEffect } from "react";
import { Container, Button, Col } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import TablaProductos from "../components/productos/TablaProductos";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import ModalQR from "../components/qr/ModalQr";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


const Productos = () => {
    const [showQRModal, setShowQRModal] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    categoria: "",
    imagen: ""
  });
  const [productoEditado, setProductoEditado] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");

  const paginatedProductos = productosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  //Metodos para el QR
  const openQRModal = (url) =>{
    setShowQRModal(url);
    setSelectedUrl("");
  }

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    selectedUrl("");
  }

  const handleCopy = (productos) =>{
    const rowData = `Nombre: ${productos.nombre}\nPrecio: C$${productos.precio}\nCategoria: ${productos.categoria}`;
    

    navigator.clipboard
    .writeText(rowData)
    .then(() =>{
      console.log("Error el copiar al portapapeles", err);
    });
  };

  const fetchData = () => {
    // Escuchar productos
    const unsubscribeProductos = onSnapshot(productosCollection, (snapshot) => {
      const fetchedProductos = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setProductos(fetchedProductos);
      setProductosFiltrados(fetchedProductos);
      if (isOffline) {
        console.log("Offline: Productos cargados desde caché local.");
      }
    }, (error) => {
      console.error("Error al escuchar productos:", error);
      if (isOffline) {
        console.log("Offline: Mostrando datos desde caché local.");
      } else {
        alert("Error al cargar productos: " + error.message);
      }
    });

    // Escuchar categorías
    const unsubscribeCategorias = onSnapshot(categoriasCollection, (snapshot) => {
      const fetchedCategorias = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCategorias(fetchedCategorias);
      if (isOffline) {
        console.log("Offline: Categorías cargadas desde caché local.");
      }
    }, (error) => {
      console.error("Error al escuchar categorías:", error);
      if (isOffline) {
        console.log("Offline: Mostrando categorías desde caché local.");
      } else {
        alert("Error al cargar categorías: " + error.message);
      }
    });

    return () => {
      unsubscribeProductos();
      unsubscribeCategorias();
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);
    setCurrentPage(1); // Resetear página al buscar
    setProductosFiltrados(
      productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(text) ||
          producto.precio.toLowerCase().includes(text) ||
          producto.categoria.toLowerCase().includes(text)
      )
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setProductoEditado((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevoProducto((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductoEditado((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProducto = async () => {
    // Validar campos requeridos
    if (
      !nuevoProducto.nombre ||
      !nuevoProducto.precio ||
      !nuevoProducto.categoria ||
      !nuevoProducto.imagen
    ) {
      alert("Por favor, completa todos los campos, incluyendo la imagen.");
      return;
    }

    // Cerrar modal
    setShowModal(false);

    // Crear ID temporal y objeto del producto
    const tempId = `temp_${Date.now()}`;
    const productoConId = {
      ...nuevoProducto,
      id: tempId,
      precio: parseFloat(nuevoProducto.precio), // Asegurar que precio sea número
    };

    try {
      // Actualizar estado local
      setProductos((prev) => [...prev, productoConId]);
      setProductosFiltrados((prev) => [...prev, productoConId]);

      // Mensaje según estado de conexión
      if (isOffline) {
        console.log("Producto agregado localmente (sin conexión).");
        alert("Sin conexión: Producto agregado localmente. Se sincronizará al reconectar.");
      } else {
        console.log("Producto agregado exitosamente en la nube.");
      }

      // Guardar en Firestore
      await addDoc(productosCollection, {
        nombre: nuevoProducto.nombre,
        precio: parseFloat(nuevoProducto.precio),
        categoria: nuevoProducto.categoria,
        imagen: nuevoProducto.imagen,
      });

      // Limpiar formulario
      setNuevoProducto({ nombre: "", precio: "", categoria: "", imagen: "" });
    } catch (error) {
      console.error("Error al agregar el producto:", error);
      if (isOffline) {
        console.log("Offline: Producto almacenado localmente.");
      } else {
        // Revertir cambios locales si falla en la nube
        setProductos((prev) => prev.filter((prod) => prod.id !== tempId));
        setProductosFiltrados((prev) => prev.filter((prod) => prod.id !== tempId));
        alert("Error al agregar el producto: " + error.message);
      }
    }
  };

  const handleEditProducto = async () => {
    // Validar campos requeridos
    if (
      !productoEditado.nombre ||
      !productoEditado.precio ||
      !productoEditado.categoria ||
      !productoEditado.imagen
    ) {
      alert("Por favor, completa todos los campos, incluyendo la imagen.");
      return;
    }

    // Cerrar modal
    setShowEditModal(false);

    const productoRef = doc(db, "productos", productoEditado.id);

    try {
      // Actualizar estado local
      setProductos((prev) =>
        prev.map((prod) =>
          prod.id === productoEditado.id
            ? { ...productoEditado, precio: parseFloat(productoEditado.precio) }
            : prod
        )
      );
      setProductosFiltrados((prev) =>
        prev.map((prod) =>
          prod.id === productoEditado.id
            ? { ...productoEditado, precio: parseFloat(productoEditado.precio) }
            : prod
        )
      );

      // Mensaje según estado de conexión
      if (isOffline) {
        console.log("Producto actualizado localmente (sin conexión).");
        alert("Sin conexión: Producto actualizado localmente. Se sincronizará al reconectar.");
      } else {
        console.log("Producto actualizado exitosamente en la nube.");
      }

      // Actualizar en Firestore
      await updateDoc(productoRef, {
        nombre: productoEditado.nombre,
        precio: parseFloat(productoEditado.precio),
        categoria: productoEditado.categoria,
        imagen: productoEditado.imagen,
      });

    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      if (isOffline) {
        console.log("Offline: Producto actualizado localmente.");
      } else {
        // Revertir cambios locales si falla en la nube
        setProductos((prev) =>
          prev.map((prod) =>
            prod.id === productoEditado.id ? { ...prod } : prod
          )
        );
        setProductosFiltrados((prev) =>
          prev.map((prod) =>
            prod.id === productoEditado.id ? { ...prod } : prod
          )
        );
        alert("Error al actualizar el producto: " + error.message);
      }
    }
  };

  const handleDeleteProducto = async () => {
    if (!productoAEliminar) return;

    // Cerrar modal
    setShowDeleteModal(false);

    try {
      // Actualizar estado local
      setProductos((prev) => prev.filter((prod) => prod.id !== productoAEliminar.id));
      setProductosFiltrados((prev) => prev.filter((prod) => prod.id !== productoAEliminar.id));

      // Mensaje según estado de conexión
      if (isOffline) {
        console.log("Producto eliminado localmente (sin conexión).");
        alert("Sin conexión: Producto eliminado localmente. Se sincronizará al reconectar.");
      } else {
        console.log("Producto eliminado exitosamente en la nube.");
      }

      // Eliminar en Firestore
      const productoRef = doc(db, "productos", productoAEliminar.id);
      await deleteDoc(productoRef);

    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      if (isOffline) {
        console.log("Offline: Eliminación almacenada localmente.");
      } else {
        // Restaurar producto en estado local si falla en la nube
        setProductos((prev) => [...prev, productoAEliminar]);
        setProductosFiltrados((prev) => [...prev, productoAEliminar]);
        alert("Error al eliminar el producto: " + error.message);
      }
    }
  };

  const openEditModal = (producto) => {
    setProductoEditado({ ...producto });
    setShowEditModal(true);
  };

  const openDeleteModal = (producto) => {
    setProductoAEliminar(producto);
    setShowDeleteModal(true);
  };

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
  const handleOnline = () => {
    setIsOffline(false);
  };
  const handleOffline = () => {
    setIsOffline(true);
  };
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  setIsOffline(!navigator.onLine);
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);

const generarPDFProductos = () => {
    const doc = new jsPDF();
    doc.setFillColor(28, 41, 51);
    doc.rect(0, 0, 220, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text("Lista de Productos", doc.internal.pageSize.getWidth() / 2, 18, {align: "center"});

    const columnas = ["#", "Nombre", "Precio", "Categoria"];
    const filas = productosFiltrados.map((p, i) => [
      i + 1,
      p.nombre,
      `C$ ${p.precio}`,
      p.categoria
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      margin: { top: 20, left: 14, right: 14 },
      tableWidth: "auto",
      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageNumber = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Página ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      },
    });

    const fecha = new Date();
    const nombreArchivo = `productos_${fecha.getDate().toString().padStart(2, '0')}${(fecha.getMonth()+1).toString().padStart(2, '0')}${fecha.getFullYear()}.pdf`;
    doc.save(nombreArchivo);
  };


     // Generar PDF para un producto específico
  const generarPDFDetalleProducto = (producto) => {
    const pdf = new jsPDF();

    // Encabezado
    pdf.setFillColor(28, 41, 51);
    pdf.rect(0, 0, 220, 30, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text(producto.nombre, pdf.internal.pageSize.getWidth() / 2, 18, { align: "center" });

    // Imagen
    if (producto.imagen) {
      const propiedadesImagen = pdf.getImageProperties(producto.imagen);
      const anchoPagina = pdf.internal.pageSize.getWidth();
      const anchoImagen = 60;
      const altoImagen = (propiedadesImagen.height * anchoImagen) / propiedadesImagen.width;
      const posicionX = (anchoPagina - anchoImagen) / 2;
      pdf.addImage(producto.imagen, 'JPEG', posicionX, 40, anchoImagen, altoImagen);

      const posicionY = 40 + altoImagen + 10;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.text(`Precio: C$ ${producto.precio}`, anchoPagina / 2, posicionY, { align: "center" });
      pdf.text(`Categoría: ${producto.categoria}`, anchoPagina / 2, posicionY + 10, { align: "center" });
    } else {
      const anchoPagina = pdf.internal.pageSize.getWidth();
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.text(`Precio: C$ ${producto.precio}`, anchoPagina / 2, 50, { align: "center" });
      pdf.text(`Categoría: ${producto.categoria}`, anchoPagina / 2, 60, { align: "center" });
    }

    pdf.save(`${producto.nombre}.pdf`);
  };


  const exportarExcelProductos = () => {
      const datos = productosFiltrados.map( (producto, index) => ({
    "#": index + 1,
    Nombre: producto.nombre,
    Precio: parseFloat(producto.precio),
    Categoría: producto.categoria,
    }));

    // Crear hoja y libro Excel
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new( );
    XLSX. utils.book_append_sheet(libro, hoja, 'Productos' );
    // Crear el archivo binario
    const excelBuffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });

    // Guardar el Excel con un nombre basado en la fecha actual
      const fecha = new Date( );
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha. getMonth( ) + 1) . padStart(2, '0' );
      const anio = fecha.getFullYear( );
      const nombreArchivo = `Productos_${dia}${mes}${anio}.xlsx` ;
      // Guardar archivo
      const blob = new Blob( [excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, nombreArchivo);

  }



return (
  <Container className="mt-5">
    <br />
    <h4>Gestión de Productos</h4>
    <Button className="mb-3" onClick={() => setShowModal(true)}>
      Agregar producto
    </Button>

    {/* Botón para PDF de detalle (reemplaza 'producto' con el producto seleccionado) */}
    <Button
      variant="outline-secondary"
      size="sm"
      className="me-2"
      onClick={() => generarPDFDetalleProducto(productos)} // Asegúrate de definir 'producto'
    >
      <i className="bi bi-filetype-pdf"></i>
    </Button>

    <CuadroBusquedas
      searchText={searchText}
      handleSearchChange={handleSearchChange}
    />

    <TablaProductos
      openEditModal={openEditModal}
      openDeleteModal={openDeleteModal}
      handleCopy={handleCopy}
      openQRModal={openQRModal}
      productos={paginatedProductos}
      totalItems={productosFiltrados.length}
      itemsPerPage={itemsPerPage}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    />

    <ModalRegistroProducto
      showModal={showModal}
      setShowModal={setShowModal}
      nuevoProducto={nuevoProducto}
      handleInputChange={handleInputChange}
      handleImageChange={handleImageChange}
      handleAddProducto={handleAddProducto}
      categorias={categorias}
    />

    <ModalEdicionProducto
      showEditModal={showEditModal}
      setShowEditModal={setShowEditModal}
      productoEditado={productoEditado}
      handleEditInputChange={handleEditInputChange}
      handleEditImageChange={handleEditImageChange}
      handleEditProducto={handleEditProducto}
      categorias={categorias}
    />

    <ModalEliminacionProducto
      showDeleteModal={showDeleteModal}
      setShowDeleteModal={setShowDeleteModal}
      handleDeleteProducto={handleDeleteProducto}
    />

    <ModalQR
      show={showQRModal}
      handleClose={handleCloseQRModal}
      qrUrl={selectedUrl}
    />

    <Col lg={3} md={4} sm={4} xs={5}>
      <Button
        className="mb-3"
        onClick={generarPDFProductos}
        variant="secondary"
        style={{ width: "100%" }}
      >
        Generar reporte PDF
      </Button>
    </Col>

    <Col lg={3} md={4} sm={4} xs={5}>
      <Button
        className="mb-3"
        onClick={exportarExcelProductos}
        variant="secondary"
        style={{ width: "100%" }}
      >
        Generar Excel
      </Button>
    </Col>
  </Container>
);
};

export default Productos;
