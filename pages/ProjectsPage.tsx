import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import type { Project, ProjectStatus } from '../types';
import { PlusCircle, Edit, Trash2, List, LayoutGrid, Search, ChevronDown, Calendar } from 'lucide-react';
import LoadingPage from '../components/ui/LoadingPage';
import CalendarComponent from '../components/ui/Calendar';
import SearchableSelect from '../components/ui/SearchableSelect';

const flatInput = "mt-1 block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-card focus:ring-primary-500 sm:text-sm";

const ProjectForm: React.FC<{ project?: Project | null; onSave: (project: any) => void; onCancel: () => void; }> = ({ project, onSave, onCancel }) => {
  const context = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: project?.name || '',
    clientId: project?.clientId || '',
    description: project?.description || '',
    status: project?.status || 'planificacion',
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    progress: project?.progress || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'progress' ? parseInt(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...project, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Nombre del Proyecto</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required className={flatInput} />
      </div>
      <div>
        <label className="block text-sm font-medium">Cliente</label>
        <SearchableSelect
            options={context?.clients || []}
            value={formData.clientId}
            onChange={(id) => handleChange({ target: { name: 'clientId', value: id } } as any)}
            placeholder="Seleccione un cliente"
            required
        />
      </div>
       <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={flatInput} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Fecha de Inicio</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className={flatInput} />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha de Fin</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className={flatInput} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Progreso (%)</label>
        <input type="number" name="progress" value={formData.progress} onChange={handleChange} min="0" max="100" className={flatInput} />
      </div>
       <div>
          <label className="block text-sm font-medium">Estado</label>
          <select name="status" value={formData.status} onChange={handleChange} className={flatInput}>
            <option value="planificacion">Planificación</option>
            <option value="en_curso">En Curso</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{project ? 'Guardar Cambios' : 'Crear Proyecto'}</Button>
      </div>
    </form>
  );
};

const ProjectsPage: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [isDatepickerOpen, setIsDatepickerOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const datepickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datepickerRef.current && !datepickerRef.current.contains(event.target as Node)) {
        setIsDatepickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!context || context.isLoading) return <LoadingPage />;

  const { projects, clients, addProject, updateProject, deleteProject } = context;
  
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
        const client = clients.find(c => c.id === project.clientId);
        const clientName = client?.name || '';
        const searchTermMatch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                project.projectCode.toLowerCase().includes(searchTerm.toLowerCase());
      
        const statusMatch = statusFilter === 'all' || project.status === statusFilter;

        const projectDate = new Date(project.startDate);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if(start) start.setHours(0,0,0,0);
        if(end) end.setHours(23,59,59,999);
        const dateMatch = (!start || projectDate >= start) && (!end || projectDate <= end);

        return searchTermMatch && statusMatch && dateMatch;
    });
  }, [projects, clients, searchTerm, statusFilter, startDate, endDate]);
  
  const handleOpenModal = (project?: Project) => {
    setEditingProject(project || null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };
  
  const handleSaveProject = (projectData: Project) => {
    if (editingProject) {
      updateProject(projectData);
    } else {
      addProject(projectData);
    }
    handleCloseModal();
  };


  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'N/A';
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const statusInfo: Record<Project['status'], { label: string; color: string; }> = {
    planificacion: { label: 'Planificación', color: 'bg-gray-500' },
    en_curso: { label: 'En Curso', color: 'bg-blue-500' },
    completado: { label: 'Completado', color: 'bg-green-500' },
    cancelado: { label: 'Cancelado', color: 'bg-red-500' },
  };

  const ViewSwitcher = () => (
    <div className="flex items-center rounded-btn border border-light-border dark:border-dark-border p-0.5">
        <button 
            onClick={() => setViewMode('list')} 
            className={`p-1.5 rounded-btn transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-border'}`}
            aria-label="Vista de lista"
        >
            <List size={18} />
        </button>
        <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-btn transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-border'}`}
            aria-label="Vista de cuadrícula"
        >
            <LayoutGrid size={18} />
        </button>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por código, proyecto..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-56 pl-9 pr-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-light-card dark:bg-dark-card focus:ring-2 focus:ring-primary-500 focus:outline-none" 
                />
            </div>
             <div className="relative">
                <select 
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="appearance-none w-40 pl-3 pr-8 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-light-card dark:bg-dark-card focus:ring-2 focus:ring-primary-500 focus:outline-none">
                <option value="all">Todos los estados</option>
                <option value="planificacion">Planificación</option>
                <option value="en_curso">En Curso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
            <div className="relative" ref={datepickerRef}>
                <button 
                    onClick={() => setIsDatepickerOpen(prev => !prev)} 
                    className="p-2 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    aria-haspopup="true"
                    aria-expanded={isDatepickerOpen}
                >
                    <Calendar size={18} />
                </button>
                {isDatepickerOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-lg z-10">
                    <CalendarComponent 
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                    />
                     <div className="flex justify-between items-center mt-2 p-3 border-t border-light-border dark:border-dark-border">
                        <div className="text-xs space-y-1">
                            <p>Desde: <span className="font-semibold">{startDate ? new Date(startDate+'T00:00:00').toLocaleDateString() : '...'}</span></p>
                            <p>Hasta: <span className="font-semibold">{endDate ? new Date(endDate+'T00:00:00').toLocaleDateString() : '...'}</span></p>
                        </div>
                        <div className="space-x-2">
                            <Button variant="secondary" size="sm" onClick={() => { setStartDate(''); setEndDate(''); }}>Limpiar</Button>
                            <Button size="sm" onClick={() => setIsDatepickerOpen(false)}>Aplicar</Button>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <ViewSwitcher />
            <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle size={18} />}>
            Añadir Proyecto
            </Button>
        </div>
      </div>

        {viewMode === 'list' ? (
            <Card>
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium">ID</th>
                            <th scope="col" className="px-6 py-3 font-medium">Proyecto</th>
                            <th scope="col" className="px-6 py-3 font-medium">Cliente</th>
                            <th scope="col" className="px-6 py-3 font-medium">Progreso</th>
                            <th scope="col" className="px-6 py-3 font-medium text-center">Estado</th>
                            <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="text-neutral-800 dark:text-neutral-200">
                        {filteredProjects.map(project => (
                            <tr key={project.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                <td className="px-6 py-4 font-semibold font-mono text-xs">{project.projectCode}</td>
                                <td className="px-6 py-4 font-semibold whitespace-nowrap">{project.name}</td>
                                <td className="px-6 py-4">{getClientName(project.clientId)}</td>
                                <td className="px-6 py-4">
                                     <div className="flex items-center">
                                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mr-2">
                                            <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                        </div>
                                        <span className="text-xs font-semibold">{project.progress}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${statusInfo[project.status].color}`}>
                                    {statusInfo[project.status].label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button onClick={() => handleOpenModal(project)} className="text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"><Edit size={16}/></button>
                                    <button onClick={() => deleteProject(project.id)} className="text-neutral-500 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                <Card key={project.id} className="p-5 flex flex-col justify-between">
                    <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold mb-1">{project.name}</h2>
                            <p className="text-sm text-primary-500 font-medium mb-3">{getClientName(project.clientId)}</p>
                        </div>
                        <div className="text-right">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${statusInfo[project.status].color}`}>
                            {statusInfo[project.status].label}
                            </span>
                            <p className="text-xs font-semibold font-mono text-neutral-400 mt-2">{project.projectCode}</p>
                        </div>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 h-16 overflow-hidden">
                        {project.description}
                    </p>
                    </div>
                    <div>
                    <div className="flex justify-between items-center text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                        <span>Progreso</span>
                        <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-4">
                        <div 
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="secondary" onClick={() => handleOpenModal(project)} leftIcon={<Edit size={14}/>}>Editar</Button>
                            <Button size="sm" variant="danger" onClick={() => deleteProject(project.id)} leftIcon={<Trash2 size={14}/>}>Eliminar</Button>
                    </div>
                    </div>
                </Card>
                ))}
            </div>
        )}
      
       <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProject ? 'Editar Proyecto' : 'Añadir Nuevo Proyecto'}>
        <ProjectForm project={editingProject} onSave={handleSaveProject} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default ProjectsPage;