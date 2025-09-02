import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute, { SuperAdminRoute } from "./ProtectedRoute";

// IMPORTACIÓN DIRECTA PARA DEPURACIÓN - TEMPORALMENTE DESHABILITADA
// import DocumentosListing from "../components/documentos/DocumentosListing";

// --- Componente de Carga ---
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center bg-slate-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
      <p className="text-white text-lg">Cargando componente...</p>
      <p className="text-gray-400 text-sm mt-2">Si esto tarda más de 10 segundos, hay un problema</p>
    </div>
  </div>
);

// --- Componentes Lazy Loaded ---

// Autenticación
const LoginPage = lazy(() => import("../pages/Registroylogeo/LoginPage"));
const RegisterPage = lazy(() => import("../pages/Registroylogeo/RegisterPage"));

// Páginas Web (Landing)
const WebHome = lazy(() => import("../pages/Web/WebHome"));
const WebFeatures = lazy(() => import("../pages/Web/WebFeatures"));
const WebContact = lazy(() => import("../pages/Web/WebContact"));

// Documentación - IMPORTACIÓN DIRECTA PARA DEBUG
import DocumentacionHome from "../pages/Documentacion/DocumentacionHome";
import DocumentacionLayout from "../pages/Documentacion/DocumentacionLayout";
const CasosUsoPage = lazy(() => import("../pages/Documentacion/CasosUsoPage"));
const ManualUsuarioPage = lazy(() => import("../pages/Documentacion/funcional/ManualUsuarioPage"));
const SoportePage = lazy(() => import("../pages/Documentacion/funcional/SoportePage"));
const ArquitecturaPage = lazy(() => import("../pages/Documentacion/ArquitecturaPage"));
const BaseDatosPage = lazy(() => import("../pages/Documentacion/tecnica/BaseDatosPage"));

// Menu Piramidal ISO 9001
const ProcesosISO = lazy(() => import("../pages/ProcesosISO"));
const AdministracionPage = lazy(() => import("../pages/Documentacion/tecnica/AdministracionPage"));
const ConfiguracionEntornos = lazy(() => import("../pages/Documentacion/ConfiguracionEntornos"));
const ApiDocsPage = lazy(() => import("../pages/Documentacion/ApiDocsPage"));
const GuiasPage = lazy(() => import("../pages/Documentacion/GuiasPage"));

// Páginas Principales (desde pages)
// const DashboardPage = lazy(() => import("../pages/Dashboard/DashboardPage")); // COMENTADO PARA PRUEBAS
const CalendarPage = lazy(() => import("../pages/Calendar/CalendarPage"));
const ComunicacionesPage = lazy(() => import("../pages/ComunicacionesPage"));
const MedicionesPage = lazy(() => import("../pages/MedicionesPage"));
const ConfiguracionPage = lazy(() => import("../pages/ConfiguracionPage"));
const PlanificacionDireccionPage = lazy(() => import("../pages/PlanificacionDireccionPage"));
const PlanificacionEstrategicaPage = lazy(() => import("../pages/PlanificacionEstrategicaPage"));
const RevisionDireccionPage = lazy(() => import("../pages/RevisionDireccionPage"));
const ObjetivosMetasPage = lazy(() => import("../pages/ObjetivosMetasPage"));
const MinutasPage = lazy(() => import("../pages/MinutasPage"));
const TratamientosPage = lazy(() => import("../pages/TratamientosPage"));
const VerificacionesPage = lazy(() => import("../pages/VerificacionesPage"));

// Gestión de Usuarios (desde pages)
const UsersPage = lazy(() => import("../pages/UsersPage"));
const UsuariosSingle = lazy(() => import("../pages/UsuariosSingle"));

// Componentes usados como páginas (desde components)
const DepartamentosPage = lazy(() => import("../components/departamentos/DepartamentosListing"));
const PuestosPage = lazy(() => import("../components/puestos/PuestosListing"));
const PersonalPage = lazy(() => import("../components/personal/PersonalListing"));
const PersonalSingle = lazy(() => import("../components/personal/PersonalSingle"));
const ProcesosPage = lazy(() => import("../components/procesos/ProcesosListing"));
const ProcesoSingle = lazy(() => import("../components/procesos/ProcesoSingle"));
const DocumentosPage = lazy(() => import("../components/documentos/DocumentosListing"));
const DocumentoSingle = lazy(() => import("../components/documentos/DocumentoSingle"));
const NormasPage = lazy(() => import("../components/normas/NormasList"));
const NormaSingleView = lazy(() => import("../components/normas/NormaSingleView"));
const ObjetivosCalidadPage = lazy(() => import("../components/procesos/ObjetivosListing"));
const IndicadoresPage = lazy(() => import("../components/procesos/IndicadoresListing"));
const IndicadorSingle = lazy(() => import("../components/procesos/IndicadorSingle"));
const CapacitacionesPage = lazy(() => import('../components/capacitaciones/CapacitacionesListing'));
const ProductosPage = lazy(() => import("../components/productos/ProductosListing"));
// NUEVO: Componente con TypeScript y DataTable genérico
const ProductosListingNEW = lazy(() => import("../components/productos/ProductosListingNEW"));
const EncuestasPage = lazy(() => import("../components/encuestas/EncuestasListing"));
const ResponderEncuesta = lazy(() => import("../components/encuestas/ResponderEncuesta"));
const TicketsPage = lazy(() => import("../components/tickets/TicketsListing"));

// Auditorías
const AuditoriasPage = lazy(() => import("../components/auditorias/AuditoriasListing"));
const AuditoriaSinglePage = lazy(() => import("../components/auditorias/AuditoriaSingle"));
const AuditoriaFormPage = lazy(() => import("../components/auditorias/AuditoriaForm"));

// Menú de Tarjetas
const MainMenuCards = lazy(() => import("../components/menu/MainMenuCards"));

// Dashboard Multitenant
const MultitenantDashboard = lazy(() => import("../pages/MultitenantDashboard"));

// Menús de Segundo Nivel - Ahora manejados por SecondLevelSidebar
// const CalidadMenu = lazy(() => import("../components/menu/CalidadMenu"));
// const RRHHMenu = lazy(() => import("../components/menu/RRHHMenu"));
// const ProcesosMenu = lazy(() => import("../components/menu/ProcesosMenu"));
// const CRMSatisfaccionMenu = lazy(() => import("../components/menu/CRMSatisfaccionMenu"));
// const AdminMenu = lazy(() => import("../components/menu/AdminMenu"));

// Páginas de Mejora
const HallazgosPage = lazy(() => import("../pages/Hallazgos/HallazgosPage2"));
const HallazgoSingle = lazy(() => import('../components/hallazgos/HallazgoSingle'));
const AccionesPage = lazy(() => import("../pages/Acciones/AccionesPage"));
const AccionSingle = lazy(() => import('../components/acciones/AccionSingle'));

// Componente de prueba
const TestSimpleComponent = lazy(() => import("../components/TestSimpleComponent"));

// Planes y Suscripciones
const PlanesPage = lazy(() => import("../components/planes/PlanesListing"));

// Programaciones de Evaluación de Competencias (Temporalmente deshabilitado)
// const EvalcompeProgramacionListing = lazy(() => import('../components/competencias/EvalcompeProgramacionListing'));
// const EvalcompeProgramacionSingle = lazy(() => import('../components/competencias/EvalcompeProgramacionSingle'));

// Competencias
const CompetenciasListing = lazy(() => import('../pages/Competencias/CompetenciasListing'));
const CompetenciaSingle = lazy(() => import('../pages/Competencias/CompetenciaSingle'));
const SGCHierarchyPage = lazy(() => import('../components/sgc/SGCHierarchyView'));

// Evaluaciones de Competencias Individuales
const EvaluacionesDashboard = lazy(() => import('../pages/EvaluacionCompetencias/EvaluacionesDashboardSimple'));
const EvaluacionesIndividualesList = lazy(() => import('../pages/EvaluacionCompetencias/EvaluacionesIndividualesList'));
const EvaluacionesIndividualesPage = lazy(() => import('../pages/EvaluacionCompetencias/EvaluacionesIndividualesPage'));

// Evaluaciones de Programas (Temporalmente deshabilitado)
// const ProgramacionCompetenciasList = lazy(() => import('../pages/Evaluaciones-programas/ProgramacionCompetenciasList'));
// const ProgramacionCompetenciasModal = lazy(() => import('../pages/Evaluaciones-programas/ProgramacionCompetenciasModal'));


// Base de Datos y Esquemas
const DatabaseSchemaPage = lazy(() => import("../pages/DatabaseSchemaPage"));

// Política de Calidad
const PoliticaCalidadPage = lazy(() => import("../pages/PoliticaCalidadPage"));


const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/encuestas/responder/:id" element={<ResponderEncuesta />} />

        {/* Rutas Web (Landing) */}
        <Route path="/" element={<WebHome />} />
        <Route path="/caracteristicas" element={<WebFeatures />} />
        <Route path="/contacto" element={<WebContact />} />

        {/* Rutas Protegidas de la aplicación (con /app prefix) */}
        <Route 
          path="/app/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  {/* Dashboard - COMENTADO PARA PRUEBAS */}
                  {/* <Route path="tablero" element={<DashboardPage />} /> */}
                  
                  {/* Menú Principal de Tarjetas */}
                  <Route path="menu-cards" element={<MainMenuCards />} />
                  
                  {/* Menús de Segundo Nivel - Ahora manejados por SecondLevelSidebar */}
                  <Route path="calidad" element={<div className="p-6"><h1>Módulo de Calidad</h1><p>Selecciona una opción del sidebar</p></div>} />
                  <Route path="rrhh" element={<div className="p-6"><h1>Módulo de RRHH</h1><p>Selecciona una opción del sidebar</p></div>} />
                  <Route path="procesos-menu" element={<div className="p-6"><h1>Módulo de Procesos</h1><p>Selecciona una opción del sidebar</p></div>} />
                  <Route path="crm" element={<div className="p-6"><h1>Módulo CRM</h1><p>Selecciona una opción del sidebar</p></div>} />
                  <Route path="administracion" element={<div className="p-6"><h1>Módulo de Administración</h1><p>Selecciona una opción del sidebar</p></div>} />
                  
                  {/* Páginas principales */}
                  <Route path="calendario" element={<CalendarPage />} />
                  <Route path="comunicaciones" element={<ComunicacionesPage />} />
                  <Route path="mediciones" element={<MedicionesPage />} />
                  <Route path="configuracion" element={<ConfiguracionPage />} />
                  <Route path="planificacion-revision" element={<PlanificacionDireccionPage />} />
                  <Route path="tratamientos" element={<TratamientosPage />} />
                  <Route path="verificaciones" element={<VerificacionesPage />} />
                  
                  {/* Planificación y Revisión */}
                  <Route path="planificacion-estrategica" element={<PlanificacionEstrategicaPage />} />
                  <Route path="revision-direccion" element={<RevisionDireccionPage />} />
                  <Route path="objetivos-metas" element={<ObjetivosMetasPage />} />
                  <Route path="minutas" element={<MinutasPage />} />
                  
                  {/* Recursos Humanos */}
                  <Route path="departamentos" element={<DepartamentosPage />} />
                  <Route path="puestos" element={<PuestosPage />} />
                  <Route path="personal/:id" element={<PersonalSingle />} />
                  <Route path="personal" element={<PersonalPage />} />
                  <Route path="capacitaciones" element={<CapacitacionesPage />} />
                  
                  {/* Sistema de Gestión */}
                  <Route path="auditorias" element={<AuditoriasPage />} />
                  <Route path="auditorias/nueva" element={<AuditoriaFormPage />} />
                  <Route path="auditorias/:id" element={<AuditoriaSinglePage />} />
                  <Route path="auditorias/:id/editar" element={<AuditoriaFormPage />} />
                  <Route path="procesos" element={<ProcesosPage />} />
                  <Route path="procesos/:id" element={<ProcesoSingle />} />
                  <Route path="politica-calidad" element={<PoliticaCalidadPage />} />
                  <Route path="documentos" element={<DocumentosPage />} />
                  <Route path="documentos/:id" element={<DocumentoSingle />} />
                  <Route path="normas" element={<NormasPage />} />
                  <Route path="normas/:id" element={<NormaSingleView />} />
                  <Route path="objetivos-calidad" element={<ObjetivosCalidadPage />} />
                  <Route path="indicadores" element={<IndicadoresPage />} />
                  <Route path="indicadores/:id" element={<IndicadorSingle />} />
                  
                  {/* Mejora */}
                  <Route path="hallazgos" element={<HallazgosPage />} />
                  <Route path="hallazgos/:id" element={<HallazgoSingle />} />
                  <Route path="acciones" element={<AccionesPage />} />
                  <Route path="acciones/:id" element={<AccionSingle />} />
                  
                  {/* Menu Piramidal ISO 9001 */}
                  <Route path="procesos-iso" element={<ProcesosISO />} />
                  
                  {/* Otros */}
                  <Route path="productos" element={<ProductosPage />} />
                  
                  {/* RUTA DE PRUEBA: Nuevo componente con TypeScript */}
                  <Route path="productos-test" element={<ProductosListingNEW />} />
                  
                  <Route path="tickets" element={<TicketsPage />} />
                  <Route path="encuestas" element={<EncuestasPage />} />
                  {/* Rutas de Evaluación de Competencias (Temporalmente deshabilitado) */}
                  {/* <Route path="evalcompe-programacion" element={<EvalcompeProgramacionListing />} /> */}
                  {/* <Route path="evalcompe-programacion/:id" element={<EvalcompeProgramacionSingle />} /> */}
                  <Route path="competencias" element={<CompetenciasListing />} />
                  <Route path="competencias/:id" element={<CompetenciaSingle />} />
                  
                  {/* Evaluaciones de Competencias Individuales */}
                  <Route path="evaluaciones-individuales" element={<EvaluacionesIndividualesPage />} />
                  <Route path="evaluaciones-individuales-list" element={<EvaluacionesIndividualesList />} />
                  <Route path="evaluaciones-dashboard" element={<EvaluacionesDashboard />} />
                  
                  {/* Evaluaciones de Programas (Temporalmente deshabilitado) */}
                  {/* <Route path="evaluacion-competencias" element={<ProgramacionCompetenciasList />} /> */}
                  {/* <Route path="evaluacion-competencias-modal" element={<ProgramacionCompetenciasModal />} /> */}
                  
                  {/* Administración */}
                  <Route path="usuarios" element={<UsersPage />} />
                  <Route path="usuarios-single" element={<UsuariosSingle />} />

                  {/* Documentación */}
                  <Route path="documentacion" element={<DocumentacionLayout />}>
                    <Route index element={<DocumentacionHome />} />
                    <Route path="casos-uso" element={<CasosUsoPage />} />
                    <Route path="manual-usuario" element={<ManualUsuarioPage />} />
                    <Route path="soporte" element={<SoportePage />} />
                    <Route path="arquitectura" element={<ArquitecturaPage />} />
                    <Route path="base-datos" element={<BaseDatosPage />} />
                    <Route path="administracion" element={<AdministracionPage />} />
                    <Route path="configuracion-entornos" element={<ConfiguracionEntornos />} />
                    <Route path="api" element={<ApiDocsPage />} />
                    <Route path="guias" element={<GuiasPage />} />
                  </Route>

                  {/* Base de Datos y Esquemas */}
                  <Route path="database-schema" element={<DatabaseSchemaPage />} />

                  {/* Prueba de renderizado */}
                  <Route path="test-simple" element={<TestSimpleComponent />} />

                  {/* Planes y Suscripciones */}
                  <Route path="planes" element={<PlanesPage />} />

                  {/* Jerarquía SGC */}
                  <Route path="sgc-hierarchy" element={<SGCHierarchyPage />} />
                  
                  {/* Dashboard Multitenant - Verificación del Sistema */}
                  <Route path="multitenant-dashboard" element={<MultitenantDashboard />} />

                  {/* Ruta temporal para Super Admin Dashboard */}
                  <Route path="super-admin/tablero" element={
                    <SuperAdminRoute>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Tablero Super Administrador</h1>
                        <p>Esta es la página del tablero para el Super Admin.</p>
                        <p>Usuario: {user?.email}</p>
                        <p>Rol: {user?.role}</p>
                        <p>Organización: {user?.organization_name}</p>
                        <p>ID Organización: {user?.organization_id}</p>
                      </div>
                    </SuperAdminRoute>
                  } />

                  {/* Ruta de prueba para verificar autenticación */}
                  <Route path="test-auth" element={
                    <div className="p-6">
                      <h1 className="text-2xl font-bold mb-4">Prueba de Autenticación</h1>
                      <div className="space-y-2">
                        <p><strong>Autenticado:</strong> {isAuthenticated ? '✅ Sí' : '❌ No'}</p>
                        <p><strong>Usuario:</strong> {user?.email || 'N/A'}</p>
                        <p><strong>Rol:</strong> {user?.role || 'N/A'}</p>
                        <p><strong>Organización:</strong> {user?.organization_name || 'N/A'}</p>
                        <p><strong>ID Org:</strong> {user?.organization_id || 'N/A'}</p>
                        <p><strong>Token:</strong> {localStorage.getItem('token') ? '✅ Presente' : '❌ Ausente'}</p>
                      </div>
                    </div>
                  } />

                  {/* Redirección por defecto dentro del layout */}
                  <Route path="/" element={<Navigate to="/app/menu-cards" replace />} />
                  <Route path="*" element={<Navigate to="/app/menu-cards" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
