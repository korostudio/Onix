import React, { useContext, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingPage from '../components/ui/LoadingPage';
import type { Access, AccessType, Brief, Contract, Client } from '../types';
import { 
    ArrowLeft, Mail, Phone, Building, Briefcase, KeyRound, PlusCircle, 
    Edit, Trash2, Instagram, Facebook, Globe, Server, FolderKanban, 
    MoreHorizontal, Eye, EyeOff, FileText, FileSignature, DollarSign, Activity
} from 'lucide-react';
import { faker } from '@faker-js/faker';

const accessIcons: Record<AccessType, React.ReactNode> = {
    Instagram: <Instagram size={20} className="text-pink-500" />,
    Facebook: <Facebook size={20} className="text-blue-600" />,
    Wordpress: <Globe size={20} className="text-blue-400" />,
    Hosting: <Server size={20} className="text-green-500" />,
    'Google Drive': <FolderKanban size={20} className="text-yellow-500" />,
    Otro: <MoreHorizontal size={20} className="text-neutral-500" />
};

const flatInput = "mt-1 block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-card focus:ring-primary-500 sm:text-sm";

const AccessForm: React.FC<{
    access?: Access | null;
    onSave: (access: Omit<Access, 'id'> | Access) => void;
    onCancel: () => void;
}> = ({ access, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        type: access?.type || 'Instagram',
        username: access?.username || '',
        password: access?.password || '',
        link: access?.link || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...access, ...formData });
    };

    const accessTypes: AccessType[] = ['Instagram', 'Facebook', 'Wordpress', 'Hosting', 'Google Drive', 'Otro'];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <select name="type" value={formData.type} onChange={handleChange} className={flatInput}>
                {accessTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <input type="text" name="username" placeholder="Usuario" value={formData.username} onChange={handleChange} required className={flatInput} />
            <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required className={flatInput} />
            <input type="url" name="link" placeholder="Link (Opcional)" value={formData.link} onChange={handleChange} className={flatInput} />
            <div className="mt-6 flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{access ? 'Guardar Cambios' : 'Añadir Acceso'}</Button>
            </div>
        </form>
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


type ClientDetailTab = 'overview' | 'projects' | 'documents' | 'accesses';

const ClientDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const context = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<ClientDetailTab>('overview');
    const [isAccessModalOpen, setAccessModalOpen] = useState(false);
    const [editingAccess, setEditingAccess] = useState<Access | null>(null);
    const [showPasswordId, setShowPasswordId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);


    if (!context || context.isLoading) return <LoadingPage />;

    const { clients, projects, briefs, contracts, invoices, updateClient } = context;

    const { client, clientProjects, clientBriefs, clientContracts, totalInvoiced } = useMemo(() => {
        const currentClient = clients.find(c => c.id === id);
        if (!currentClient) return { client: null, clientProjects: [], clientBriefs: [], clientContracts: [], totalInvoiced: 0 };

        const projectsForClient = projects.filter(p => p.clientId === id);
        const projectIds = projectsForClient.map(p => p.id);
        const briefsForClient = briefs.filter(b => projectIds.includes(b.projectId));
        const contractsForClient = contracts.filter(c => c.clientId === id);
        const invoicedAmount = invoices
            .filter(i => i.clientId === id && i.status === 'pagado')
            .reduce((sum, i) => sum + i.amount, 0);

        return {
            client: currentClient,
            clientProjects: projectsForClient,
            clientBriefs: briefsForClient,
            clientContracts: contractsForClient,
            totalInvoiced: invoicedAmount
        };
    }, [id, clients, projects, briefs, contracts, invoices]);

    if (!client) {
        return <div>Cliente no encontrado.</div>;
    }

    const handleOpenAccessModal = (access?: Access) => {
        setEditingAccess(access || null);
        setAccessModalOpen(true);
    };

    const handleCloseAccessModal = () => {
        setEditingAccess(null);
        setAccessModalOpen(false);
    };
    
    const handleOpenEditModal = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleSaveClientDetails = (clientData: Client) => {
        updateClient(clientData);
        handleCloseEditModal();
    };

    const handleSaveAccess = (accessData: Omit<Access, 'id'> | Access) => {
        if (!client) return;
        let updatedAccesses: Access[];

        if ('id' in accessData) { // Editing
            updatedAccesses = (client.accesses || []).map(acc => acc.id === accessData.id ? accessData : acc);
        } else { // Adding
            const newAccess = { ...accessData, id: faker.string.uuid() };
            updatedAccesses = [...(client.accesses || []), newAccess];
        }
        updateClient({ ...client, accesses: updatedAccesses });
        handleCloseAccessModal();
    };

    const handleDeleteAccess = (accessId: string) => {
        if (!client) return;
        const updatedAccesses = (client.accesses || []).filter(acc => acc.id !== accessId);
        updateClient({ ...client, accesses: updatedAccesses });
    };

    const togglePasswordVisibility = (accessId: string) => {
        setShowPasswordId(prev => (prev === accessId ? null : accessId));
    };
    
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    const statusColors: Record<typeof client.status, string> = {
        activo: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        prospecto: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        inactivo: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
    };
    
    const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
        <Card className="p-4 flex items-center">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-500 mr-4">{icon}</div>
            <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
            <p className="text-xl font-bold">{value}</p>
            </div>
        </Card>
    );

    const tabs: { id: ClientDetailTab; label: string }[] = [
        { id: 'overview', label: 'Resumen' },
        { id: 'projects', label: 'Proyectos' },
        { id: 'documents', label: 'Documentos' },
        { id: 'accesses', label: 'Accesos' },
    ];
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <KpiCard title="Proyectos Activos" value={clientProjects.filter(p => p.status === 'en_curso').length} icon={<Briefcase size={22} />} />
                                <KpiCard title="Total Facturado" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalInvoiced)} icon={<DollarSign size={22} />} />
                                <KpiCard title="Tareas Pendientes" value={5} icon={<Activity size={22} />} />
                             </div>
                        </div>
                         <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center"><Activity size={18} className="mr-2"/> Actividad Reciente</h3>
                            <ul className="space-y-3">
                                <li className="text-sm text-neutral-600 dark:text-neutral-400">Contrato firmado para "Rediseño Web"</li>
                                <li className="text-sm text-neutral-600 dark:text-neutral-400">Factura #INV-1024 pagada</li>
                                <li className="text-sm text-neutral-600 dark:text-neutral-400">Nuevo brief aprobado para "Campaña RRSS"</li>
                            </ul>
                        </Card>
                    </div>
                );
            case 'projects':
                return (
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Proyectos ({clientProjects.length})</h3>
                        <div className="space-y-4">
                            {clientProjects.length > 0 ? clientProjects.map(project => (
                                <div key={project.id} className="p-4 rounded-lg border dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                    <h4 className="font-semibold">{project.name}</h4>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Estado: <span className="capitalize">{project.status.replace('_', ' ')}</span></p>
                                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mt-2">
                                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                    </div>
                                </div>
                            )) : <p className="text-neutral-500">No hay proyectos.</p>}
                        </div>
                    </Card>
                );
            case 'documents':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Briefs ({clientBriefs.length})</h3>
                            <div className="space-y-3">
                                {clientBriefs.length > 0 ? clientBriefs.map(brief => <div key={brief.id} className="p-3 rounded-lg border dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-sm font-medium truncate" title={brief.title}>{brief.title}</div>) : <p className="text-sm text-neutral-500">No hay briefs.</p>}
                            </div>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Contratos ({clientContracts.length})</h3>
                            <div className="space-y-3">
                                {clientContracts.length > 0 ? clientContracts.map(contract => <div key={contract.id} className="p-3 rounded-lg border dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-sm font-medium">Contrato del {new Date(contract.startDate).toLocaleDateString()}</div>) : <p className="text-sm text-neutral-500">No hay contratos.</p>}
                            </div>
                        </Card>
                    </div>
                );
            case 'accesses':
                return (
                     <Card>
                        <div className="p-6 border-b dark:border-neutral-800 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Credenciales de Acceso</h3>
                            <Button size="sm" onClick={() => handleOpenAccessModal()} leftIcon={<PlusCircle size={16} />}>Añadir</Button>
                        </div>
                        <div className="p-6 space-y-4">
                            {(client.accesses && client.accesses.length > 0) ? (
                                client.accesses.map(access => (
                                    <div key={access.id} className="p-4 rounded-lg border dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-start justify-between group">
                                        <div className="flex items-start space-x-4">
                                            <div className="p-2 bg-white dark:bg-neutral-800 rounded-full border dark:border-neutral-700">{accessIcons[access.type]}</div>
                                            <div>
                                                <h4 className="font-semibold text-base">{access.type}</h4>
                                                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 space-y-1">
                                                    <p>Usuario: {access.username}</p>
                                                    <div className="flex items-center">
                                                        <span>Contraseña:</span>
                                                        <span className="ml-2 font-mono">{showPasswordId === access.id ? access.password : '••••••••'}</span>
                                                        <button onClick={() => togglePasswordVisibility(access.id)} className="ml-2 p-1"><Eye size={14} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                                            <button onClick={() => handleOpenAccessModal(access)} className="p-2 text-blue-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteAccess(access.id)} className="p-2 text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))
                            ) : <p className="text-neutral-500 text-center py-4">No hay accesos guardados.</p>}
                        </div>
                    </Card>
                );
            default:
                return null;
        }
    }

    return (
        <div>
            <Link to="/clients" className="flex items-center text-sm text-primary-500 hover:underline mb-6">
                <ArrowLeft size={16} className="mr-1" />
                Volver a Clientes
            </Link>

            <Card className="mb-6 p-6">
                 <div className="flex items-start">
                    <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mr-6 flex-shrink-0">
                        <span className="font-bold text-3xl text-primary-600 dark:text-primary-300">{getInitials(client.name)}</span>
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                             <div>
                                <h1 className="text-3xl font-bold">{client.name}</h1>
                                <p className="text-lg text-neutral-500 dark:text-neutral-400">{client.company}</p>
                             </div>
                            <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${statusColors[client.status]}`}>{client.status}</span>
                                <Button variant="secondary" size="sm" onClick={handleOpenEditModal} leftIcon={<Edit size={14} />}>
                                    Editar
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-neutral-500 dark:text-neutral-400 border-t dark:border-neutral-800 pt-2">
                            <div className="flex items-center"><Mail size={14} className="mr-1.5" /> {client.email}</div>
                            <div className="flex items-center"><Phone size={14} className="mr-1.5" /> {client.phone}</div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="border-b border-light-border dark:border-dark-border mb-6">
                <nav className="flex space-x-4" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                                activeTab === tab.id
                                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>{renderTabContent()}</div>

            <Modal isOpen={isAccessModalOpen} onClose={handleCloseAccessModal} title={editingAccess ? 'Editar Acceso' : 'Añadir Acceso'}>
                <AccessForm access={editingAccess} onSave={handleSaveAccess} onCancel={handleCloseAccessModal} />
            </Modal>
            
             <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Editar Cliente">
                <ClientForm client={client} onSave={handleSaveClientDetails} onCancel={handleCloseEditModal} />
            </Modal>
        </div>
    );
};

export default ClientDetailPage;