import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

    i18n
        .use(LanguageDetector )
        .use(initReactI18next)
        . init({
        fallbackLng: 'es',
        interpolation: {
        escapeValue: false,
        },
        resources: {
        en: {
        translation: {
        menu: {
        inicio: "Home",
        categorias: "Categories",
        productos: "Products",
        catalogo: "Catalog",
        libros: "Books",
        clima: "Weather",
        pronunciacion: "Pronunciation",
        estadisticas: "Statistics",
        empleados: "Employees",
        cerrarSesion: "Logout",
        iniciarSesion: "Login",
        idioma: "Language",
        español: "Spanish",
        ingles: "English",
        }
    }
},
        es: {
        translation: {
        menu: {
        inicio: "Inicio",
        categorias: "Categorias",
        productos: "Productos",
        catalogo: "Catálogo",
        libros: "Libros",
        clima: "Clima",
        pronunciacion: "Pronunciación",
        estadísticas: "Estadísticas",
        cerrarSesion: "Cerrar Sesión",
        iniciarSesion: "Iniciar Sesión",
        idioma: "Idioma",
        español: "Español",
        ingles: "Inglés",
        }
    }
}
        },
    });

export default i18n;

