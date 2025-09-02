import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Grid, List, Edit, Trash2, Plus, Search, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import auditoriasService from '../../services/auditoriasService';
import procesosService from '../../services/procesosService';
import { toast } from 'react-toastify';

const AuditoriasList = () => {
  
  const [auditorias, setAuditorias] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'card'
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [localError, setLocalError] = useState(null);
  
  // Cargar datos usando useCallback para evitar recreaciones innecesarias
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    setLocalError(null);
    
    try {
      console.log('Cargando datos de auditorías...');
      // Obtener auditorías
      const auditoriasData = await auditoriasService.getAllAuditorias();
      console.log('Datos de auditorías cargados:', auditoriasData);
      setAuditorias(auditoriasData || []);
      
      // Obtener procesos para el formulario de hallazgos
      try {
        console.log('Cargando datos de procesos...');
        const procesosData = await procesosService.getAll();
        console.log('Datos de procesos cargados:', procesosData);
        setProcesos(procesosData || []);
      } catch (error) {
        console.error('Error al obtener procesos:', error);
        setProcesos([]);
        toast.error('Error al cargar los procesos');
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setLocalError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
      toast.error('Error al cargar las auditorías');
    } finally {
      setLoadingData(false);
    }
  }, []);
  
  // Cargar datos al montar el componente y cuando cambie la conexión a la base de datos
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'Interna',
    fecha_inicio: '',
    fecha_fin: '',
    responsable: '',
    estado: 'Planificada',
    resultado: '',
    observaciones: ''
  });
  
  // Estado para modo edición
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        // Actualizar registro existente
        await auditoriasService.updateAuditoria(currentId, {
          ...formData,
          updated_at: new Date().toISOString()
        });
        toast.success('Auditoría actualizada correctamente');
      } else {
        // Crear nuevo registro
        await auditoriasService.createAuditoria({
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        toast.success('Auditoría creada correctamente');
      }
      
      // Recargar datos
      await fetchData();
      
      // Resetear formulario y cerrar modal
      resetForm();
      setModalOpen(false);
    } catch (err) {
      console.error('Error al guardar datos:', err);
      setLocalError('Error al guardar los datos. Por favor, intenta de nuevo.');
      toast.error('Error al guardar la auditoría');
    }
  };
  
  // Función para editar un registro
  const handleEdit = (auditoria) => {
    setFormData({
      titulo: auditoria.titulo,
      tipo: auditoria.tipo,
      fecha_inicio: auditoria.fecha_inicio,
      fecha_fin: auditoria.fecha_fin || '',
      responsable: auditoria.responsable,
      estado: auditoria.estado,
      resultado: auditoria.resultado || '',
      observaciones: auditoria.observaciones || ''
    });
    setEditMode(true);
    setCurrentId(auditoria.id);
    setModalOpen(true);
  };
  
  // Función para eliminar un registro
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta auditoría? Esta acción no se puede deshacer.')) {
      try {
        await auditoriasService.deleteAuditoria(id);
        toast.success('Auditoría eliminada correctamente');
        
        // Recargar datos
        await fetchData();
      } catch (err) {
        console.error('Error al eliminar auditoría:', err);
        setLocalError('Error al eliminar la auditoría. Por favor, intenta de nuevo.');
        toast.error('Error al eliminar la auditoría');
      }
    }
  };
  
  // Resetear formulario
  const resetForm = () => {
    setFormData({
      titulo: '',
      tipo: 'Interna',
      fecha_inicio: '',
      fecha_fin: '',
      responsable: '',
      estado: 'Planificada',
      resultado: '',
      observaciones: ''
    });
    setEditMode(false);
    setCurrentId(null);
  };

  // Abrir modal para nuevo registro
  const handleOpenNewModal = () => {
    resetForm();
    setEditMode(false);
    setModalOpen(true);
  };

  // Filtrar auditorías por término de búsqueda
  const filteredAuditorias = auditorias.filter(auditoria => {
    const searchString = `${auditoria.titulo || ''} ${auditoria.tipo || ''} ${auditoria.responsable || ''} ${auditoria.estado || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Obtener color según estado de la auditoría
  const getStatusColor = (estado) => {
    if (!estado) return 'bg-gray-100 text-gray-800';
    
    switch (estado.toLowerCase()) {
      case 'planificada':
        return 'bg-blue-100 text-blue-800';
      case 'en curso':
        return 'bg-yellow-100 text-yellow-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Este bloque ya no es necesario porque no dependemos de la conexión directa a la base de datos
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Auditorías</h1>
        <div className="flex items-center space-x-4">
          {/* Botones de vista */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setViewMode('card')} 
              className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-white shadow' : ''}`}
            >
              <Grid size={20} />
            </button>
          </div>
          
          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar auditorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          {/* Botón para agregar */}
          <button
            onClick={handleOpenNewModal}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
            disabled={isLoading || loadingData}
          >
            <Plus size={18} className="mr-2" />
            Nueva Auditoría
          </button>
        </div>
      </div>
      
      {(error || localError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="mr-2" />
          <span>{localError || error}</span>
        </div>
      )}
      
      {/* Modal para crear/editar auditoría */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editMode ? 'Editar Auditoría' : 'Nueva Auditoría'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Título</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Tipo</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="Interna">Interna</option>
                <option value="Externa">Externa</option>
                <option value="Certificación">Certificación</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Fecha de Inicio</label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Fecha de Fin (opcional)</label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Responsable</label>
              <input
                type="text"
                name="responsable"
                value={formData.responsable}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="Planificada">Planificada</option>
                <option value="En Curso">En Curso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Resultado</label>
              <input
                type="text"
                name="resultado"
                value={formData.resultado}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end mt-6 space-x-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : (editMode ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Vista de lista */}
      {viewMode === 'list' && (
        <div className="bg-white shadow-md rounded overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Título</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Responsable</th>
                <th className="px-4 py-2 text-left">Fecha Inicio</th>
                <th className="px-4 py-2 text-left">Fecha Fin</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || loadingData ? (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center">
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredAuditorias.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center py-8">
                    No hay auditorías disponibles
                  </td>
                </tr>
              ) : (
                filteredAuditorias.map(auditoria => (
                  <tr key={auditoria.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{auditoria.titulo}</td>
                    <td className="px-4 py-2">{auditoria.tipo}</td>
                    <td className="px-4 py-2">{auditoria.responsable}</td>
                    <td className="px-4 py-2">{auditoria.fecha_inicio}</td>
                    <td className="px-4 py-2">{auditoria.fecha_fin || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(auditoria.estado)}`}>
                        {auditoria.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(auditoria)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(auditoria.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Vista de tarjetas */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading || loadingData ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredAuditorias.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No hay auditorías disponibles
            </div>
          ) : (
            filteredAuditorias.map(auditoria => (
              <div key={auditoria.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-green-600 text-white p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{auditoria.titulo}</h3>
                      <p className="text-sm opacity-90">{auditoria.tipo}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(auditoria)}
                        className="p-1 hover:bg-green-700 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(auditoria.id)}
                        className="p-1 hover:bg-green-700 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <User size={16} className="text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Responsable</p>
                        <p className="font-medium">{auditoria.responsable}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(auditoria.estado)}`}>
                        {auditoria.estado}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Inicio</p>
                        <p className="font-medium">{auditoria.fecha_inicio}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Fin</p>
                        <p className="font-medium">{auditoria.fecha_fin || '-'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {auditoria.resultado && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Resultado</p>
                      <p className="text-sm">{auditoria.resultado}</p>
                    </div>
                  )}
                  
                  {auditoria.observaciones && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Observaciones</p>
                      <p className="text-sm">{auditoria.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AuditoriasList;
