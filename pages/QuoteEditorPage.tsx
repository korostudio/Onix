import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import type { Quote, LineItem, Service, Client } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, PlusCircle, Trash2, Save, BookOpen, Hexagon } from 'lucide-react';
import LoadingPage from '../components/ui/LoadingPage';
import { faker } from '@faker-js/faker';
import ServiceSelectorModal from '../components/modals/ServiceSelectorModal';
import SearchableSelect from '../components/ui/SearchableSelect';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const inputFieldClasses = "block w-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";

const QuoteEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const context = useContext(AppContext);

    const [isServiceModalOpen, setServiceModalOpen] = useState(false);
    
    type ClientEntryMode = 'select' | 'manual';
    const [clientEntryMode, setClientEntryMode] = useState<ClientEntryMode>('select');

    // Form state
    const [createdAt, setCreatedAt] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '', status: 'prospecto' as const });
    const [projectId, setProjectId] = useState('');
    const [expiresAt, setExpiresAt] = useState(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Default 15 days validity
    const [items, setItems] = useState<LineItem[]>([]);
    const [notes, setNotes] = useState('Condiciones de pago: 50% por adelantado, 50% a la entrega.\nValidez de la cotización: 15 días.');
    const [discount, setDiscount] = useState(0);

    const isEditing = Boolean(id);

    useEffect(() => {
        if (isEditing && context?.quotes) {
            const quoteToEdit = context.quotes.find(q => q.id === id);
            if (quoteToEdit) {
                setClientEntryMode('select');
                setCreatedAt(new Date(quoteToEdit.createdAt).toISOString().split('T')[0]);
                setSelectedClientId(quoteToEdit.clientId);
                setProjectId(quoteToEdit.projectId || '');
                setExpiresAt(new Date(quoteToEdit.expiresAt).toISOString().split('T')[0]);
                setDiscount(quoteToEdit.discount || 0);

                if (quoteToEdit.items && quoteToEdit.items.length > 0) {
                    setItems(quoteToEdit.items);
                    setNotes(quoteToEdit.content || '');
                } else {
                    setItems([{ id: faker.string.uuid(), description: quoteToEdit.content, quantity: 1, price: quoteToEdit.amount }]);
                    setNotes('');
                }
            }
        }
    }, [id, context?.quotes, isEditing]);

    if (!context || context.isLoading) {
        return <LoadingPage />;
    }
    const { clients, projects, addQuote, updateQuote, addClient, companyDetails } = context;
    
    const handleNewClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewClient(prev => ({...prev, [name]: value}));
    }

    const handleItemChange = (itemId: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
        setItems(currentItems => currentItems.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
        ));
    };

    const handleAddManualItem = () => {
        setItems(currentItems => [...currentItems, { id: faker.string.uuid(), description: '', quantity: 1, price: 0 }]);
    };
    
    const handleAddServices = (selectedServices: Service[]) => {
        const newItems: LineItem[] = selectedServices.map(service => ({
            id: faker.string.uuid(),
            description: `${service.name}`,
            quantity: 1,
            price: service.price
        }));
        setItems(currentItems => [...currentItems, ...newItems]);
        setServiceModalOpen(false);
    }

    const handleRemoveItem = (itemId: string) => {
        setItems(currentItems => currentItems.filter(item => item.id !== itemId));
    };

    const { subtotal, discountAmount, total } = useMemo(() => {
        const sub = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);
        const discAmount = sub * (Number(discount) / 100);
        const finalTotal = sub - discAmount;
        return { subtotal: sub, discountAmount: discAmount, total: finalTotal };
    }, [items, discount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalClientId = selectedClientId;
        let finalClient = clients.find(c => c.id === finalClientId);

        if (clientEntryMode === 'manual') {
            if (!newClient.name || !newClient.email) {
                context.addNotification("error", "El nombre y el email son requeridos para un nuevo cliente.");
                return;
            }
            const createdClient = addClient(newClient);
            finalClientId = createdClient.id;
            finalClient = createdClient;
        }

        if (!finalClientId) {
            context.addNotification("error", "Debe seleccionar o crear un cliente.");
            return;
        }
        if (items.length === 0) {
            context.addNotification("error", "Debe añadir al menos un ítem a la cotización.");
            return;
        }

        const quoteData = {
            clientId: finalClientId,
            projectId: projectId || undefined,
            expiresAt,
            items,
            content: notes,
            subtotal,
            discount: Number(discount),
            amount: total,
        };

        if (isEditing) {
            const originalQuote = context.quotes.find(q => q.id === id)!;
            updateQuote({ ...originalQuote, ...quoteData, id: id!, createdAt });
        } else {
            addQuote(quoteData as any);
        }

        navigate('/quotes');
    };
    
    const selectedClient = useMemo(() => {
        if (clientEntryMode === 'manual') {
            return { ...newClient, id: 'temp-id' };
        }
        return clients.find(c => c.id === selectedClientId);
    }, [clientEntryMode, selectedClientId, newClient, clients]);


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Button variant="secondary" onClick={() => navigate('/quotes')} leftIcon={<ArrowLeft size={16} />}>
                    Volver
                </Button>
                <h1 className="text-2xl font-bold">{isEditing ? `Editar Cotización` : 'Crear Cotización'}</h1>
                <Button onClick={handleSubmit} leftIcon={<Save size={18} />}>
                    {isEditing ? 'Guardar Cambios' : 'Guardar'}
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Editor Panel */}
                <div className="space-y-6">
                    <Card className="p-6">
                         <h2 className="text-xl font-semibold mb-4">Detalles</h2>
                         <div className="flex space-x-4 mb-4 border-b dark:border-neutral-700">
                            <button type="button" onClick={() => setClientEntryMode('select')} className={`py-2 px-4 text-sm font-medium ${clientEntryMode === 'select' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-neutral-500'}`}>Seleccionar existente</button>
                            <button type="button" onClick={() => setClientEntryMode('manual')} className={`py-2 px-4 text-sm font-medium ${clientEntryMode === 'manual' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-neutral-500'}`}>Ingresar nuevo</button>
                         </div>

                         {clientEntryMode === 'select' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SearchableSelect
                                    options={clients}
                                    value={selectedClientId}
                                    onChange={(id) => { setSelectedClientId(id); setProjectId(''); }}
                                    placeholder="Seleccionar Cliente *"
                                    required
                                />
                                <SearchableSelect
                                    options={projects.filter(p => p.clientId === selectedClientId)}
                                    value={projectId}
                                    onChange={setProjectId}
                                    placeholder="Proyecto (Opcional)"
                                    disabled={!selectedClientId}
                                />
                            </div>
                         ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" name="name" placeholder="Nombre completo *" value={newClient.name} onChange={handleNewClientChange} required className={inputFieldClasses} />
                                <input type="text" name="company" placeholder="Empresa" value={newClient.company} onChange={handleNewClientChange} className={inputFieldClasses} />
                                <input type="email" name="email" placeholder="Email *" value={newClient.email} onChange={handleNewClientChange} required className={inputFieldClasses} />
                                <input type="tel" name="phone" placeholder="Teléfono" value={newClient.phone} onChange={handleNewClientChange} className={inputFieldClasses} />
                            </div>
                         )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <input type="date" value={createdAt} onChange={e => setCreatedAt(e.target.value)} required className={inputFieldClasses} />
                            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required className={inputFieldClasses} />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Conceptos</h3>
                            <div className="flex space-x-2">
                                <Button type="button" variant="secondary" size="sm" onClick={handleAddManualItem} leftIcon={<PlusCircle size={16}/>}>Manual</Button>
                                <Button type="button" size="sm" onClick={() => setServiceModalOpen(true)} leftIcon={<BookOpen size={16}/>}>Catálogo</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                             {items.map((item) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                    <textarea value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} placeholder="Descripción" required rows={1} className={`${inputFieldClasses} col-span-6`} />
                                    <input type="number" value={item.quantity} min="1" onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))} required className={`${inputFieldClasses} col-span-2 text-right`} />
                                    <input type="number" value={item.price} min="0" step="0.01" onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))} required className={`${inputFieldClasses} col-span-2 text-right`} />
                                    <div className="text-right font-medium col-span-1">{formatCurrency(item.quantity * item.price)}</div>
                                    <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveItem(item.id)} className="p-2 h-auto"><Trash2 size={14} /></Button>
                                </div>
                            ))}
                        </div>
                    </Card>

                     <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-2">Notas</h3>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className={inputFieldClasses} />
                    </Card>
                </div>
                
                {/* Preview Panel */}
                <div className="lg:sticky top-6">
                    <div className="aspect-[210/297] bg-white dark:bg-neutral-800 shadow-lg rounded-md p-8 text-sm text-neutral-800 dark:text-neutral-200 border dark:border-neutral-700">
                       <header className="flex justify-between items-start pb-6 border-b dark:border-neutral-700">
                           <div>
                                {companyDetails.logo ? 
                                    <img src={companyDetails.logo} alt="logo" className="h-16 w-auto mb-4"/> :
                                    <div className="h-16 flex items-center text-primary-500 mb-4"><Hexagon size={40}/></div>
                                }
                                <p className="font-bold">{companyDetails.name}</p>
                                <p className="whitespace-pre-line">{companyDetails.address}</p>
                                <p>{companyDetails.taxId}</p>
                           </div>
                           <div className="text-right">
                               <h1 className="text-3xl font-bold uppercase text-neutral-400 dark:text-neutral-500">Cotización</h1>
                           </div>
                       </header>
                       <section className="flex justify-between mt-6">
                            <div>
                                <p className="text-neutral-500">CLIENTE</p>
                                <p className="font-bold">{selectedClient?.name}</p>
                                <p>{selectedClient?.company}</p>
                                <p>{selectedClient?.email}</p>
                            </div>
                            <div className="text-right">
                                <p><span className="text-neutral-500">Fecha:</span> {formatDate(createdAt)}</p>
                                <p><span className="text-neutral-500">Válido hasta:</span> {formatDate(expiresAt)}</p>
                            </div>
                       </section>
                       <section className="mt-8">
                           <table className="w-full text-left">
                               <thead className="bg-neutral-100 dark:bg-neutral-900">
                                   <tr className="text-neutral-600 dark:text-neutral-300">
                                       <th className="p-2 font-semibold">Concepto</th>
                                       <th className="p-2 font-semibold text-center w-20">Cant.</th>
                                       <th className="p-2 font-semibold text-right w-24">Precio</th>
                                       <th className="p-2 font-semibold text-right w-28">Total</th>
                                   </tr>
                               </thead>
                               <tbody>
                                    {items.map(item => (
                                        <tr key={item.id} className="border-b dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">
                                            <td className="p-2 align-top">{item.description}</td>
                                            <td className="p-2 text-center align-top">{item.quantity}</td>
                                            <td className="p-2 text-right align-top">{formatCurrency(item.price)}</td>
                                            <td className="p-2 text-right align-top font-medium">{formatCurrency(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                               </tbody>
                           </table>
                       </section>
                       <footer className="mt-8 flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                <div className="flex justify-between items-center">
                                    <span>Descuento (%)</span>
                                    <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-16 text-right bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-b dark:border-neutral-600 rounded-sm py-0.5 px-1 focus:outline-none focus:ring-1 focus:ring-primary-500"/>
                                </div>
                                {discount > 0 && 
                                    <div className="flex justify-between text-red-500">
                                        <span>Ahorro</span>
                                        <span>- {formatCurrency(discountAmount)}</span>
                                    </div>
                                }
                                <div className="flex justify-between font-bold text-lg border-t dark:border-neutral-600 pt-2"><span>TOTAL</span><span className="text-primary-500">{formatCurrency(total)}</span></div>
                            </div>
                       </footer>
                        {notes && <p className="text-xs text-neutral-500 mt-8 whitespace-pre-line">{notes}</p>}
                    </div>
                </div>
            </div>

            <ServiceSelectorModal 
                isOpen={isServiceModalOpen}
                onClose={() => setServiceModalOpen(false)}
                onSelect={handleAddServices}
            />
        </div>
    );
};

export default QuoteEditorPage;