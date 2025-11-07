import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Quote } from '../../types';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

interface QuoteSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (quote: Quote) => void;
}

const QuoteSelectorModal: React.FC<QuoteSelectorModalProps> = ({ isOpen, onClose, onSelect }) => {
  const context = useContext(AppContext);

  const acceptedQuotes = useMemo(() => {
    if (!context?.quotes) return [];
    return context.quotes.filter(q => q.status === 'aceptado');
  }, [context?.quotes]);

  const getClientName = (clientId: string) => {
    return context?.clients.find(c => c.id === clientId)?.name || 'N/A';
  };

  const handleSelect = (quote: Quote) => {
    onSelect(quote);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar Cotización Aceptada">
      <div className="h-[60vh] flex flex-col">
        <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-2">
          {acceptedQuotes.length > 0 ? acceptedQuotes.map(quote => (
            <div key={quote.id} className="flex items-center justify-between p-3 rounded-lg border dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/50">
              <div>
                <p className="font-semibold">{getClientName(quote.clientId)}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {new Date(quote.createdAt).toLocaleDateString()} - {formatCurrency(quote.amount)}
                </p>
              </div>
              <Button size="sm" onClick={() => handleSelect(quote)}>Seleccionar</Button>
            </div>
          )) : (
            <div className="text-center py-10 text-neutral-500">
              <p>No hay cotizaciones aceptadas para facturar.</p>
              <p className="text-xs mt-1">Asegúrate de que el estado de la cotización sea 'aceptado'.</p>
            </div>
          )}
        </div>
      </div>
       <div className="mt-6 pt-4 border-t dark:border-neutral-800 flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
    </Modal>
  );
};

export default QuoteSelectorModal;