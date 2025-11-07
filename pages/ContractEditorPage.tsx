
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import type { Contract } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, Save, Hexagon, FileSignature } from 'lucide-react';
import LoadingPage from '../components/ui/LoadingPage';
import SearchableSelect from '../components/ui/SearchableSelect';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const inputFieldClasses = "block w-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";

const ContractEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const context = useContext(AppContext);

    // Form state
    const [formData, setFormData] = useState({
        clientId: '',
        projectId: '',
        templateId: '',
        content: '',
        amount: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year default
    });

    const isEditing = Boolean(id);

    useEffect(() => {
        if (isEditing && context?.contracts) {
            const contractToEdit = context.contracts.find(c => c.id === id);
            if (contractToEdit) {
                setFormData({
                    clientId: contractToEdit.clientId,
                    projectId: contractToEdit.projectId || '',
                    templateId: contractToEdit.templateId,
                    content: contractToEdit.content,
                    amount: contractToEdit.amount,
                    startDate: new Date(contractToEdit.startDate).toISOString().split('T')[0],
                    endDate: new Date(contractToEdit.endDate).toISOString().split('T')[0],
                });
            }
        }
    }, [id, context?.contracts, isEditing]);
    
    useEffect(() => {
        // Populate content from template only when creating a new contract
        if (!isEditing && formData.templateId && context?.contractTemplates) {
            const template = context.contractTemplates.find(t => t.id === formData.templateId);
            if (template) {
                setFormData(prev => ({ ...prev, content: template.content }));
            }
        }
    }, [formData.templateId, isEditing, context?.contractTemplates]);

    if (!context || context.isLoading) {
        return <LoadingPage />;
    }
    const { clients, projects, contractTemplates, addContract, updateContract, companyDetails } = context;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).type === 'number' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.clientId) {
            context.addNotification("error", "Debe seleccionar un cliente.");
            return;
        }

        const contractData = {
            ...formData,
            projectId: formData.projectId || undefined,
        };

        if (isEditing) {
            const originalContract = context.contracts.find(c => c.id === id)!;
            updateContract({ ...originalContract, ...contractData, id: id! });
        } else {
            addContract(contractData as any);
        }

        navigate('/contracts');
    };
    
    const selectedClient = useMemo(() => clients.find(c => c.id === formData.clientId), [formData.clientId, clients]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Button variant="secondary" onClick={() => navigate('/contracts')} leftIcon={<ArrowLeft size={16} />}>
                    Volver
                </Button>
                <h1 className="text-2xl font-bold">{isEditing ? `Editar Contrato` : 'Crear Contrato'}</h1>
                <Button onClick={handleSubmit} leftIcon={<Save size={18} />}>
                    {isEditing ? 'Guardar Cambios' : 'Guardar'}
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Editor Panel */}
                <div className="space-y-6">
                    <Card className="p-6">
                         <h2 className="text-xl font-semibold mb-4">Detalles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <SearchableSelect
                                options={clients}
                                value={formData.clientId}
                                onChange={(id) => setFormData(prev => ({ ...prev, clientId: id, projectId: '' }))}
                                placeholder="Seleccionar Cliente *"
                                required
                            />
                             <SearchableSelect
                                options={projects.filter(p => p.clientId === formData.clientId)}
                                value={formData.projectId}
                                onChange={(id) => setFormData(prev => ({ ...prev, projectId: id }))}
                                placeholder="Proyecto (Opcional)"
                                disabled={!formData.clientId}
                            />
                        </div>
                        <select name="templateId" value={formData.templateId} onChange={handleChange} required className={inputFieldClasses}>
                            <option value="">Seleccionar Plantilla *</option>
                            {contractTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </Card>
                    
                    <Card className="p-6">
                         <h2 className="text-xl font-semibold mb-4">Términos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label className="block text-sm font-medium mb-1">Fecha de Inicio</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className={inputFieldClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Fecha de Fin</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className={inputFieldClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Monto Total</label>
                                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className={inputFieldClasses} />
                            </div>
                        </div>
                    </Card>

                     <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-2">Contenido del Contrato</h3>
                        <textarea name="content" value={formData.content} onChange={handleChange} rows={15} className={`${inputFieldClasses} font-mono text-xs`} />
                    </Card>
                </div>
                
                {/* Preview Panel */}
                <div className="lg:sticky top-6">
                    <div className="aspect-[210/297] bg-white dark:bg-neutral-800 shadow-lg rounded-md p-8 text-sm text-neutral-800 dark:text-neutral-200 border dark:border-neutral-700 overflow-y-auto">
                       <header className="flex justify-between items-start pb-6 border-b dark:border-neutral-700">
                           <div>
                                {companyDetails.logo ? 
                                    <img src={companyDetails.logo} alt="logo" className="h-16 w-auto mb-4"/> :
                                    <div className="h-16 flex items-center text-primary-500 mb-4"><Hexagon size={40}/></div>
                                }
                                <p className="font-bold">{companyDetails.name}</p>
                                <p className="whitespace-pre-line">{companyDetails.address}</p>
                           </div>
                           <div className="text-right">
                               <h1 className="text-3xl font-bold uppercase text-neutral-400 dark:text-neutral-500 flex items-center justify-end">
                                   <FileSignature className="mr-2"/> Contrato
                               </h1>
                           </div>
                       </header>
                       <section className="flex justify-between mt-6">
                            <div>
                                <p className="text-neutral-500">CLIENTE</p>
                                <p className="font-bold">{selectedClient?.name}</p>
                                <p>{selectedClient?.company}</p>
                                <p>{selectedClient?.email}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p><span className="text-neutral-500">Monto:</span> <span className="font-bold text-base">{formatCurrency(formData.amount)}</span></p>
                                <p><span className="text-neutral-500">Inicio:</span> {formatDate(formData.startDate)}</p>
                                <p><span className="text-neutral-500">Fin:</span> {formatDate(formData.endDate)}</p>
                            </div>
                       </section>
                       <section className="mt-8">
                           <h2 className="text-lg font-bold mb-4">TÉRMINOS Y CONDICIONES</h2>
                           <div className="text-xs whitespace-pre-wrap font-mono leading-relaxed bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-md border dark:border-neutral-700">
                               {formData.content}
                           </div>
                       </section>
                       <footer className="mt-12 grid grid-cols-2 gap-12 text-center">
                            <div>
                                <div className="border-t dark:border-neutral-600 pt-2">{companyDetails.name}</div>
                                <p className="text-xs text-neutral-500">(Firma autorizada)</p>
                            </div>
                            <div>
                                 <div className="border-t dark:border-neutral-600 pt-2">{selectedClient?.name || 'Cliente'}</div>
                                 <p className="text-xs text-neutral-500">(Firma autorizada)</p>
                            </div>
                       </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractEditorPage;
