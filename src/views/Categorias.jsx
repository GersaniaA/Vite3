import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

import TablaCategorias from "../components/Categorias/TablaCategorias";
import ModalRegistroCategoria from "../components/Categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/Categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/Categorias/ModalEliminacionCategoria";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion"; // <-- Añadido

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modal, setModal] = useState({ type: null, data: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const categoriasCollection = collection(db, "categorias");

  const fetchCategorias = async () => {
    try {
      const data = await getDocs(categoriasCollection);
      const fetchedCategorias = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setCategorias(fetchedCategorias);
      setCategoriasFiltradas(fetchedCategorias);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleSearchChange = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);
    const filtradas = categorias.filter((categoria) =>
      categoria.nombre.toLowerCase().includes(text) ||
      categoria.descripcion.toLowerCase().includes(text)
    );
    setCategoriasFiltradas(filtradas);
    setCurrentPage(1); // Reiniciar a la primera página
  };

  const handleAddCategoria = async (nuevaCategoria) => {
    try {
      await addDoc(categoriasCollection, nuevaCategoria);
      setModal({ type: null, data: null });
      await fetchCategorias();
    } catch (error) {
      console.error("Error al agregar la categoría:", error);
    }
  };

  const handleEditCategoria = async (categoriaEditada) => {
    try {
      if (!categoriaEditada) return;
      const categoriaRef = doc(db, "categorias", categoriaEditada.id);
      await updateDoc(categoriaRef, categoriaEditada);
      setModal({ type: null, data: null });
      await fetchCategorias();
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);
    }
  };

  const handleDeleteCategoria = async (categoriaId) => {
    try {
      if (!categoriaId) return;
      const categoriaRef = doc(db, "categorias", categoriaId);
      await deleteDoc(categoriaRef);
      setModal({ type: null, data: null });
      await fetchCategorias();
    } catch (error) {
      console.error("Error al eliminar la categoría:", error);
    }
  };

  // Paginación de categorías filtradas
  const totalItems = categoriasFiltradas.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const categoriasPaginadas = categoriasFiltradas.slice(startIndex, endIndex);

  return (
    <Container className="mt-5">
      <h4>Gestión de Categorías</h4>
      <Button className="mb-3" onClick={() => setModal({ type: "add", data: null })}>
        Agregar categoría
      </Button>

      <CuadroBusquedas searchText={searchText} handleSearchChange={handleSearchChange} />

      <TablaCategorias
        categorias={categoriasPaginadas}
        openEditModal={(categoria) => setModal({ type: "edit", data: categoria })}
        openDeleteModal={(categoria) => setModal({ type: "delete", data: categoria })}
      />

      {/* Paginación */}
      <Paginacion
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Modales */}
      {modal.type === "add" && (
        <ModalRegistroCategoria
          showModal={true}
          setShowModal={() => setModal({ type: null, data: null })}
          handleAddCategoria={handleAddCategoria}
        />
      )}
      {modal.type === "edit" && modal.data && (
        <ModalEdicionCategoria
          showEditModal={true}
          setShowEditModal={() => setModal({ type: null, data: null })}
          categoriaEditada={modal.data}
          handleEditCategoria={handleEditCategoria}
        />
      )}
      {modal.type === "delete" && modal.data && (
        <ModalEliminacionCategoria
          showDeleteModal={true}
          setShowDeleteModal={() => setModal({ type: null, data: null })}
          handleDeleteCategoria={() => handleDeleteCategoria(modal.data.id)}
        />
      )}
    </Container>
  );
};

export default Categorias;
