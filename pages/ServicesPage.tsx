

import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import LoadingPage from '../components/ui/LoadingPage';
import Modal from '../components/ui/Modal';
import type { Service } from '../types';

const flatInput = "mt-1 block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-card focus:ring-primary-500 sm:text-sm";

const ServiceForm: React.FC<{ service?: Service | null; onSave: (service: any) => void; onCancel: () => void; }> = ({ service, onSave, onCancel }) => {
  const context = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    categoryId: service?.categoryId || '',
    price: service?.price || 0,
    status: service?.status || 'activo',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).type === 'number' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...service, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nombre del Servicio</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required className={flatInput} />
      </div>
      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={flatInput} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Categoría</label>
          <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className={flatInput}>
            <option value="">Seleccione una categoría</option>
            {context?.serviceCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Precio</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required className={flatInput} />
        </div>
      </div>
       <div>
          <label className="block text-sm font-medium">Estado</label>
          <select name="status" value={formData.status} onChange={handleChange} className={flatInput}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{service ? 'Guardar Cambios' : 'Añadir Servicio'}</Button>
      </div>
    </form>
  );
};


const ServicesPage: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  if (!context || context.isLoading) return <LoadingPage />;

  const { services, serviceCategories, addService, updateService, deleteService } = context;

  const handleOpenModal = (service?: Service) => {
    setEditingService(service || null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSaveService = (serviceData: Service) => {
    if (editingService) {
      updateService(serviceData);
    } else {
      addService(serviceData);
    }
    handleCloseModal();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };
  
  const getCategoryName = (categoryId: string): string => {
    return serviceCategories.find(c => c.id === categoryId)?.name || 'Sin Categoría';
  };

  const statusColors = {
    activo: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    inactivo: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
  };

  return (
    <div>
      <div className="flex justify-end items-center mb-6">
        <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle size={18} />}>
          Añadir Servicio
        </Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-neutral-500 dark:text-neutral-400">
            <thead className="text-xs text-neutral-700 uppercase dark:text-neutral-300 border-b-2 border-light-border dark:border-dark-border">
              <tr>
                <th scope="col" className="px-6 py-4">Nombre del Servicio</th>
                <th scope="col" className="px-6 py-4">Categoría</th>
                <th scope="col" className="px-6 py-4">Precio</th>
                <th scope="col" className="px-6 py-4">Estado</th>
                <th scope="col" className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id} className="hover:bg-neutral-50 dark:hover:bg-white/5 border-b border-light-border dark:border-dark-border last:border-b-0">
                  <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white whitespace-nowrap">{service.name}</td>
                  <td className="px-6 py-4">{getCategoryName(service.categoryId)}</td>
                  <td className="px-6 py-4 font-mono">{formatPrice(service.price)}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[service.status]}`}>{service.status}</span>
                  </td>
                   <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(service)} className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                    <button onClick={() => deleteService(service.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingService ? 'Editar Servicio' : 'Añadir Nuevo Servicio'}>
        <ServiceForm service={editingService} onSave={handleSaveService} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default ServicesPage;