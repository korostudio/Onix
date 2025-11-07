import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import type { Client } from '../types';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import {
  PlusCircle, Edit, Trash2, Search, ChevronDown, List, LayoutGrid, MoreVertical,
  Users, UserCheck, UserPlus, Mail, Phone, Briefcase
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import LoadingPage from '../components/ui/LoadingPage';
import Card from '../components/ui/Card';

// Reusable input class
const flatInput = "mt-1 block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-card focus:ring-primary-500 sm:text-sm";

// --- HELPER COMPONENTS & CONSTANTS ---

const statusInfo: Record<Client['status'], { label: string; color: string; }> = {
  prospecto: { label: 'Prospecto', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
  activo: { label: 'Activo', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  inactivo: { label: 'Inactivo', color: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300' },
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const KpiCard: React.FC<{ title: string; value: number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
  <Card className="p-5 flex items-center">
    <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-500 mr-4">{icon}</div>
    <div>
      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </Card>
);

const ActionsMenu: React.FC<{ client: Client, onEdit: () => void, onDelete: () => void }> = ({ client, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-haspopup="true" aria-expanded={isOpen} aria-label="More actions">
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-light-card dark:bg-dark-card rounded-md shadow-lg border dark:border-dark-border z-10">
          <Link to={`/clients/${client.id}`} className="flex items-center w-full px-4 py-2 text-sm text-left text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => setIsOpen(false)}>
            <Users size={16} className="mr-2" />
            Ver Perfil
          </Link>
          <button onClick={onEdit} className="flex items-center w-full px-4 py-2 text-sm text-left text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <Edit size={16} className="mr-2" />
            Editar
          </button>
          <button onClick={onDelete} className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-b-md">
            <Trash2 size={16} className="mr-2" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

const ClientForm: React.FC<{ client?: Client | null; onSave: (client: any) => void; onCancel: () => void; }> = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    company: client?.company || '',
    email: client?.email || '',
    phone: client?.phone || '',
    status: client?.status || 'prospecto',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...client, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="name" placeholder="Nombre completo" value={formData.name} onChange={handleChange} required className={flatInput} />
      <input type="text" name="company" placeholder="Empresa" value={formData.company} onChange={handleChange} required className={flatInput} />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className={flatInput} />
      <input type="tel" name="phone" placeholder="Teléfono" value={formData.phone} onChange={handleChange} required className={flatInput} />
      <select name="status" value={formData.status} onChange={handleChange} className={flatInput}>
        <option value="prospecto">Prospecto</option>
        <option value="activo">Activo</option>
        <option value="inactivo">Inactivo</option>
      </select>
      <div className="mt-6 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{client ? 'Guardar Cambios' : 'Crear Cliente'}</Button>
      </div>
    </form>
  );
};

// --- MAIN PAGE COMPONENT ---
const ClientsPage: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Client['status'] | 'all'>('all');

  if (!context || context.isLoading) return <LoadingPage />;

  const { clients, projects, addClient, updateClient, deleteClient } = context;

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const searchTermMatch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.clientCode.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = statusFilter === 'all' || client.status === statusFilter;

      return searchTermMatch && statusMatch;
    });
  }, [clients, searchTerm, statusFilter]);

  const handleOpenModal = (client?: Client) => {
    setEditingClient(client || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSaveClient = (clientData: Omit<Client, 'id' | 'clientCode' | 'createdAt' | 'accesses'>) => {
    if (editingClient) {
      updateClient({ ...editingClient, ...clientData });
    } else {
      addClient(clientData);
    }
    handleCloseModal();
  };
  
  const getProjectCount = (clientId: string) => projects.filter(p => p.clientId === clientId).length;

  const kpis = {
      total: clients.length,
      active: clients.filter(c => c.status === 'activo').length,
      prospects: clients.filter(c => c.status === 'prospecto').length,
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KpiCard title="Total Clientes" value={kpis.total} icon={<Users size={22}/>}/>
          <KpiCard title="Clientes Activos" value={kpis.active} icon={<UserCheck size={22}/>}/>
          <KpiCard title="Prospectos" value={kpis.prospects} icon={<UserPlus size={22}/>}/>
      </div>
    
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por código, nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-9 pr-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-btn bg-light-card dark:bg-dark-card focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="appearance-none w-48 pl-3 pr-8 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-btn bg-light-card dark:bg-dark-card focus:ring-2 focus:ring-primary-500 focus:outline-none">
              <option value="all">Todos los estados</option>
              <option value="prospecto">Prospecto</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
            <div className="flex items-center rounded-btn border border-light-border dark:border-dark-border p-0.5">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-btn transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-border'}`} aria-label="Vista de lista"><List size={18} /></button>
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-btn transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-border'}`} aria-label="Vista de cuadrícula"><LayoutGrid size={18} /></button>
            </div>
          <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle size={18} />}>Añadir Cliente</Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">ID</th>
                  <th scope="col" className="px-6 py-3 font-medium">Cliente</th>
                  <th scope="col" className="px-6 py-3 font-medium">Contacto</th>
                  <th scope="col" className="px-6 py-3 font-medium">Fecha de Alta</th>
                  <th scope="col" className="px-6 py-3 font-medium text-center">Proyectos</th>
                  <th scope="col" className="px-6 py-3 font-medium text-center">Estado</th>
                  <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="text-neutral-800 dark:text-neutral-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-6 py-4 font-semibold font-mono text-xs">{client.clientCode}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="font-bold text-primary-600 dark:text-primary-300">{getInitials(client.name)}</span>
                        </div>
                        <div>
                          <Link to={`/clients/${client.id}`} className="font-semibold hover:underline">{client.name}</Link>
                          <div className="text-xs text-neutral-500">{client.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{client.email}</div>
                      <div className="text-xs text-neutral-500">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4">{new Date(client.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center font-medium">{getProjectCount(client.id)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo[client.status].color}`}>{statusInfo[client.status].label}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionsMenu client={client} onEdit={() => handleOpenModal(client)} onDelete={() => deleteClient(client.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map(client => (
            <Card key={client.id} className="p-5 flex flex-col group">
              <div className="flex items-start justify-between">
                 <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="font-bold text-lg text-primary-600 dark:text-primary-300">{getInitials(client.name)}</span>
                    </div>
                    <div>
                      <Link to={`/clients/${client.id}`} className="font-bold text-lg hover:underline">{client.name}</Link>
                      <p className="text-sm text-neutral-500">{client.company}</p>
                    </div>
                 </div>
                 <div className="flex flex-col items-end">
                    <ActionsMenu client={client} onEdit={() => handleOpenModal(client)} onDelete={() => deleteClient(client.id)} />
                    <span className="text-xs font-semibold font-mono text-neutral-400 mt-2">{client.clientCode}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm flex-grow">
                  <div className="flex items-center text-neutral-600 dark:text-neutral-300"><Mail size={14} className="mr-2 text-neutral-400"/> {client.email}</div>
                  <div className="flex items-center text-neutral-600 dark:text-neutral-300"><Phone size={14} className="mr-2 text-neutral-400"/> {client.phone}</div>
              </div>
              
              <div className="mt-4 pt-4 border-t dark:border-dark-border flex justify-between items-center text-sm">
                <div className="flex items-center text-neutral-600 dark:text-neutral-300">
                    <Briefcase size={14} className="mr-2 text-neutral-400"/> 
                    {getProjectCount(client.id)} Proyectos
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo[client.status].color}`}>{statusInfo[client.status].label}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}>
        <ClientForm client={editingClient} onSave={handleSaveClient} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default ClientsPage;