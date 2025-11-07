
import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import type { Invoice } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { PlusCircle, Edit, Trash2, Share2, Search, ChevronDown, Calendar, Filter } from 'lucide-react';
import LoadingPage from '../components/ui/LoadingPage';
import CalendarComponent from '../components/ui/Calendar';

const InvoicesPage: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'all'>('all');
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


  if (!context || context.isLoading) {
    return <LoadingPage />;
  }

  const { invoices, clients, deleteInvoice, shareDocument } = context;

  const invoicesWithDetails = useMemo(() => {
    return invoices.map(invoice => {
      const client = clients.find(c => c.id === invoice.clientId);
      return {
        ...invoice,
        clientName: client?.name || 'N/A',
      };
    });
  }, [invoices, clients]);
  
  const filteredInvoices = useMemo(() => {
    return invoicesWithDetails.filter(invoice => {
        const searchTermMatch =
            invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const statusMatch = statusFilter === 'all' || invoice.status === statusFilter;

        const invoiceDate = new Date(invoice.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if(start) start.setHours(0,0,0,0);
        if(end) end.setHours(23,59,59,999);
        const dateMatch = (!start || invoiceDate >= start) && (!end || invoiceDate <= end);

        return searchTermMatch && statusMatch && dateMatch;
    });
  }, [invoicesWithDetails, searchTerm, statusFilter, startDate, endDate]);

  const statusColors: Record<Invoice['status'], string> = {
    borrador: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    enviado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    pagado: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    vencido: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                type="text" 
                placeholder="Buscar por Nº, cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-9 pr-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-light-card dark:bg-dark-card focus:ring-2 focus:ring-primary-500 focus:outline-none" 
                />
            </div>
            <div className="relative">
                <select 
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="appearance-none w-48 pl-3 pr-8 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-light-card dark:bg-dark-card focus:ring-2 focus:ring-primary-500 focus:outline-none">
                <option value="all">Todos los estados</option>
                <option value="borrador">Borrador</option>
                <option value="enviado">Enviado</option>
                <option value="pagado">Pagado</option>
                <option value="vencido">Vencido</option>
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
        <Button onClick={() => navigate('/invoices/new')} leftIcon={<PlusCircle size={18} />}>
          Crear Factura
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">ID</th>
                <th scope="col" className="px-6 py-3 font-medium">Cliente</th>
                <th scope="col" className="px-6 py-3 font-medium">Monto</th>
                <th scope="col" className="px-6 py-3 font-medium text-center">Estado</th>
                <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="text-neutral-800 dark:text-neutral-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-6 py-4 font-semibold font-mono whitespace-nowrap">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4">{invoice.clientName}</td>
                  <td className="px-6 py-4 font-mono">{formatCurrency(invoice.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[invoice.status]}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => shareDocument('invoice', invoice.id)} className="text-neutral-500 hover:text-green-500 transition-colors" title="Compartir"><Share2 size={16}/></button>
                    <button onClick={() => navigate(`/invoices/${invoice.id}/edit`)} className="text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" title="Editar"><Edit size={16}/></button>
                    <button onClick={() => deleteInvoice(invoice.id)} className="text-neutral-500 hover:text-red-500 transition-colors" title="Eliminar"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default InvoicesPage;