import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Service } from '../../types';
import { Search } from 'lucide-react';

interface ServiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (services: Service[]) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const ServiceSelectorModal: React.FC<ServiceSelectorModalProps> = ({ isOpen, onClose, onSelect }) => {
  const context = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  const categories = useMemo(() => {
    if (!context?.serviceCategories) return [];
    return [{ id: 'all', name: 'Todas' }, ...context.serviceCategories];
  }, [context?.serviceCategories]);

  const filteredServices = useMemo(() => {
    if (!context?.services) return [];
    return context.services.filter(service => {
        const categoryMatch = selectedCategoryId === 'all' || service.categoryId === selectedCategoryId;
        const searchMatch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
    });
  }, [context?.services, searchTerm, selectedCategoryId]);

  const handleToggleSelection = (serviceId: string) => {
    setSelectedServiceIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const handleConfirmSelection = () => {
    if (!context?.services) return;
    const selectedServices = context.services.filter(s => selectedServiceIds.has(s.id));
    onSelect(selectedServices);
    handleClose();
  };
  
  const handleClose = () => {
      setSelectedServiceIds(new Set());
      setSearchTerm('');
      setSelectedCategoryId('all');
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Seleccionar Servicios del Catálogo">
        <div className="flex flex-col md:flex-row h-[70vh] md:space-x-4">
            {/* Categories Sidebar */}
            <div className="w-full md:w-1/4 mb-4 md:mb-0 border-b md:border-b-0 md:border-r dark:border-neutral-800 pr-4">
                <h3 className="text-lg font-semibold mb-2">Categorías</h3>
                <ul className="space-y-1">
                    {categories.map(category => (
                        <li key={category.id}>
                            <button 
                                onClick={() => setSelectedCategoryId(category.id)}
                                className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition ${selectedCategoryId === category.id ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 font-semibold' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                            >
                                {category.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Services List */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="relative mb-4">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Buscar servicio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                </div>

                <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-2">
                    {filteredServices.length > 0 ? filteredServices.map(service => (
                        <label key={service.id} htmlFor={`service-${service.id}`} className={`flex items-start p-3 rounded-lg border-2 transition cursor-pointer ${selectedServiceIds.has(service.id) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'}`}>
                            <input
                                type="checkbox"
                                id={`service-${service.id}`}
                                checked={selectedServiceIds.has(service.id)}
                                onChange={() => handleToggleSelection(service.id)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="ml-3 text-sm flex-grow">
                                <span className="font-bold text-neutral-800 dark:text-neutral-100">{service.name}</span>
                                <p className="text-neutral-500 dark:text-neutral-400">{service.description}</p>
                            </div>
                            <div className="ml-4 font-semibold text-neutral-800 dark:text-neutral-200">
                                {formatCurrency(service.price)}
                            </div>
                        </label>
                    )) : (
                        <div className="text-center py-10 text-neutral-500">No se encontraron servicios.</div>
                    )}
                </div>
            </div>
        </div>
        
        <div className="mt-6 pt-4 border-t dark:border-neutral-800 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button type="button" onClick={handleConfirmSelection} disabled={selectedServiceIds.size === 0}>
                Añadir {selectedServiceIds.size > 0 ? `(${selectedServiceIds.size})` : ''} Ítems
            </Button>
        </div>
    </Modal>
  );
};

export default ServiceSelectorModal;