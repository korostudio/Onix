import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import type { Invoice, LineItem, Client, Quote } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, PlusCircle, Trash2, Save, Hexagon, XCircle } from 'lucide-react';
import LoadingPage from '../components/ui/LoadingPage';
import { faker } from '@faker-js/faker';
import QuoteSelectorModal from '../components/modals/QuoteSelectorModal';
import SearchableSelect from '../components/ui/SearchableSelect';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Define reusable classes to avoid repetition and ensure consistency.
const inputFieldClasses = "block w-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";


const InvoiceEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const context = useContext(AppContext);

    // Form state
    const [clientId, setClientId] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [createdAt, setCreatedAt] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [items, setItems] = useState<LineItem[]>([]);
    const [notes, setNotes] = useState('Términos: Pago a 30 días.');
    const [tax, setTax] = useState(21); // Default 21% tax
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [linkedQuoteId, setLinkedQuoteId] = useState<string | null>(null);

    const isEditing = Boolean(id);

    useEffect(() => {
        if (isEditing && context?.invoices) {
            const invoiceToEdit = context.invoices.find(inv => inv.id === id);
            if (invoiceToEdit) {
                setClientId(invoiceToEdit.clientId);
                setInvoiceNumber(invoiceToEdit.invoiceNumber);
                setCreatedAt(new Date(invoiceToEdit.createdAt).toISOString().split('T')[0]);
                setDueDate(new Date(invoiceToEdit.dueDate).toISOString().split('T')[0]);
                setTax(invoiceToEdit.tax || 0);
                
                if (invoiceToEdit.items && invoiceToEdit.items.length > 0) {
                    setItems(invoiceToEdit.items);
                    setNotes(invoiceToEdit.content);
                } else {
                    // Backward compatibility for old invoices
                    setItems([{ id: faker.string.uuid(), description: invoiceToEdit.content, quantity: 1, price: invoiceToEdit.amount }]);
                    setNotes('');
                }
            }
        } else {
            // Set new invoice number for creation
            const pad = (num: number, size: number = 3) => String(num).padStart(size, '0');
            setInvoiceNumber(`INV-${pad((context?.invoices.length || 0) + 1)}`);
        }
    }, [id, context?.invoices, isEditing, context?.invoices.length]);

    if (!context || context.isLoading) {
        return <LoadingPage />;
    }
    const { clients, addInvoice, updateInvoice, quotes, companyDetails } = context;

    const handleItemChange = (itemId: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
        setItems(currentItems => currentItems.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
        ));
    };

    const handleAddItem = () => {
        setItems(currentItems => [...currentItems, { id: faker.string.uuid(), description: '', quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (itemId: string) => {
        setItems(currentItems => currentItems.filter(item => item.id !== itemId));
    };

    const handleSelectQuote = (quote: Quote) => {
        setLinkedQuoteId(quote.id);
        setClientId(quote.clientId);
        setItems(quote.items || [{ id: faker.string.uuid(), description: quote.content, quantity: 1, price: quote.amount }]);
        setNotes(quote.content || `Factura basada en la cotización aceptada el ${new Date(quote.createdAt).toLocaleDateString()}.`);
        setTax(21); // Reset to standard tax
        setIsQuoteModalOpen(false);
    };

    const handleUnlinkQuote = () => {
        setLinkedQuoteId(null);
        // Optionally reset fields or just re-enable them. Here we just re-enable.
    };

    const { subtotal, taxAmount, total } = useMemo(() => {
        const sub = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);
        const taxAmt = sub * (Number(tax) / 100);
        const finalTotal = sub + taxAmt;
        return { subtotal: sub, taxAmount: taxAmt, total: finalTotal };
    }, [items, tax]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!clientId) {
            context.addNotification("error", "Debe seleccionar un cliente.");
            return;
        }
        if (items.length === 0) {
            context.addNotification("error", "Debe añadir al menos un ítem a la factura.");
            return;
        }

        const invoiceData = {
            clientId,
            dueDate,
            items,
            content: notes,
            subtotal,
            tax: Number(tax),
            amount: total,
            projectId: clients.find(c => c.id === clientId)?.id // mock project id
        };

        if (isEditing) {
            const originalInvoice = context.invoices.find(q => q.id === id)!;
            updateInvoice({ ...originalInvoice, ...invoiceData, id: id!, invoiceNumber, createdAt });
        } else {
            addInvoice(invoiceData as any); // Type assertion to bypass partial Omit
        }

        navigate('/invoices');
    };
    
    const selectedClient = clients.find(c => c.id === clientId);
    const linkedQuoteClientName = linkedQuoteId ? clients.find(c => c.id === quotes.find(q => q.id === linkedQuoteId)?.clientId)?.name : '';


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Button variant="secondary" onClick={() => navigate('/invoices')} leftIcon={<ArrowLeft size={16} />}>
                    Volver a Facturas
                </Button>
                <h1 className="text-2xl font-bold">{isEditing ? `Editar Factura ${invoiceNumber}` : 'Crear Nueva Factura'}</h1>
                <Button onClick={handleSubmit} leftIcon={<Save size={18} />}>
                    {isEditing ? 'Guardar Cambios' : 'Guardar Factura'}
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Editor Panel */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Facturar a</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect
                                options={clients}
                                value={clientId}
                                onChange={setClientId}
                                placeholder="Seleccionar Cliente"
                                required
                                disabled={!!linkedQuoteId}
                            />
                            <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="Nº Factura" required className={inputFieldClasses} />
                            <input type="date" value={createdAt} onChange={e => setCreatedAt(e.target.value)} required className={inputFieldClasses} />
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className={inputFieldClasses} />
                         </div>
                         <div className="mt-4 pt-4 border-t dark:border-neutral-700">
                            <h3 className="text-sm font-medium mb-2 text-neutral-600 dark:text-neutral-400">Opcional</h3>
                            {linkedQuoteId ? (
                                <div className="flex justify-between items-center p-3 bg-green-100 dark:bg-green-900/50 rounded-md text-sm text-green-800 dark:text-green-200">
                                    <p className="font-medium">Vinculado a cotización de {linkedQuoteClientName}</p>
                                    <Button type="button" size="sm" variant="secondary" onClick={handleUnlinkQuote} leftIcon={<XCircle size={14}/>}>Desvincular</Button>
                                </div>
                            ) : (
                                <Button type="button" variant="secondary" onClick={() => setIsQuoteModalOpen(true)}>
                                    Vincular Cotización Aceptada
                                </Button>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-4">Conceptos</h3>
                        <div className="space-y-2">
                             {items.map((item) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                    <textarea value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} placeholder="Descripción" required rows={1} className={`${inputFieldClasses} col-span-6`} disabled={!!linkedQuoteId}/>
                                    <input type="number" value={item.quantity} min="1" onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))} required className={`${inputFieldClasses} col-span-2 text-right`} disabled={!!linkedQuoteId}/>
                                    <input type="number" value={item.price} min="0" step="0.01" onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))} required className={`${inputFieldClasses} col-span-2 text-right`} disabled={!!linkedQuoteId}/>
                                    <div className="text-right font-medium col-span-1">{formatCurrency(item.quantity * item.price)}</div>
                                    <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveItem(item.id)} className="p-2 h-auto" disabled={!!linkedQuoteId}><Trash2 size={14} /></Button>
                                </div>
                            ))}
                        </div>
                         <Button type="button" variant="secondary" size="sm" onClick={handleAddItem} leftIcon={<PlusCircle size={16}/>} className="mt-4" disabled={!!linkedQuoteId}>Agregar Ítem</Button>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-2">Notas</h3>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={inputFieldClasses} disabled={!!linkedQuoteId}/>
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
                               <h1 className="text-3xl font-bold uppercase text-neutral-400 dark:text-neutral-500">Factura</h1>
                               <p className="font-semibold text-base mt-2">{invoiceNumber}</p>
                           </div>
                       </header>
                       <section className="flex justify-between mt-6">
                            <div>
                                <p className="text-neutral-500">FACTURAR A</p>
                                <p className="font-bold">{selectedClient?.name}</p>
                                <p>{selectedClient?.company}</p>
                                <p>{selectedClient?.email}</p>
                            </div>
                            <div className="text-right">
                                <p><span className="text-neutral-500">Fecha:</span> {formatDate(createdAt)}</p>
                                <p><span className="text-neutral-500">Vence:</span> {formatDate(dueDate)}</p>
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
                                    <span>IVA (%)</span>
                                    <input type="number" value={tax} onChange={e => setTax(Number(e.target.value))} className="w-16 text-right bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-b dark:border-neutral-600 rounded-sm py-0.5 px-1 focus:outline-none focus:ring-1 focus:ring-primary-500"/>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t dark:border-neutral-600 pt-2"><span>TOTAL</span><span className="text-primary-500">{formatCurrency(total)}</span></div>
                            </div>
                       </footer>
                        {notes && <p className="text-xs text-neutral-500 mt-8 whitespace-pre-line">{notes}</p>}
                    </div>
                </div>
            </div>
             <QuoteSelectorModal
                isOpen={isQuoteModalOpen}
                onClose={() => setIsQuoteModalOpen(false)}
                onSelect={handleSelectQuote}
            />
        </div>
    );
};

export default InvoiceEditorPage;