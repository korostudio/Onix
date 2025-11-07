

import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { BriefTemplate, ContractTemplate, QuoteTemplate, ServiceCategory } from '../types';
import { faker } from '@faker-js/faker';

type TemplateType = 'brief' | 'contract' | 'quote';
type ManagedItemType = TemplateType | 'serviceCategory';
type ManagedItem = BriefTemplate | ContractTemplate | QuoteTemplate | ServiceCategory;
type TemplateItem = BriefTemplate | ContractTemplate | QuoteTemplate;

// Reusable input classes
const inputFieldClasses = "block w-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 rounded-btn shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";
const textareaClasses = `${inputFieldClasses} min-h-[40px] resize-y`;


const BriefTemplateForm: React.FC<{
  template?: BriefTemplate | null;
  onSave: (template: any) => void;
  onCancel: () => void;
}> = ({ template, onSave, onCancel }) => {
    const [name, setName] = useState(template?.name || '');
    const [questions, setQuestions] = useState<{id: string, text: string}[]>(
        template?.questions.map(q => ({ id: faker.string.uuid(), text: q })) || []
    );

    const handleQuestionChange = (id: string, text: string) => {
        setQuestions(qs => qs.map(q => q.id === id ? { ...q, text } : q));
    };

    const handleAddQuestion = () => {
        setQuestions(qs => [...qs, { id: faker.string.uuid(), text: '' }]);
    };
    
    const handleRemoveQuestion = (id: string) => {
        setQuestions(qs => qs.filter(q => q.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalQuestions = questions.map(q => q.text).filter(q => q.trim() !== '');
        onSave({ ...template, name, questions: finalQuestions });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la plantilla" required className={inputFieldClasses} />
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                <h3 className="text-md font-semibold text-neutral-700 dark:text-neutral-300">Preguntas</h3>
                {questions.map((q, index) => (
                    <div key={q.id} className="flex items-start space-x-2">
                        <span className="font-semibold pt-2">{index + 1}.</span>
                        <textarea
                            value={q.text}
                            onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                            placeholder="Escribe la pregunta..."
                            rows={2}
                            className={`${textareaClasses} flex-grow`}
                        />
                        <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveQuestion(q.id)} className="p-2 h-auto mt-1"><Trash2 size={16} /></Button>
                    </div>
                ))}
            </div>
             <Button type="button" variant="secondary" size="sm" onClick={handleAddQuestion} leftIcon={<PlusCircle size={16}/>}>Añadir Pregunta</Button>

            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t dark:border-neutral-800">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{template ? 'Guardar Cambios' : 'Crear Plantilla'}</Button>
            </div>
        </form>
    );
};


const GenericTemplateForm: React.FC<{
  template?: ContractTemplate | QuoteTemplate | null;
  onSave: (template: any) => void;
  onCancel: () => void;
}> = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    content: (template as any)?.content || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...template, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nombre de la plantilla" required className={inputFieldClasses} />
      <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Contenido de la plantilla..." rows={12} required className={textareaClasses} />
      <div className="mt-6 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{template ? 'Guardar Cambios' : 'Crear Plantilla'}</Button>
      </div>
    </form>
  );
};

const CategoryForm: React.FC<{
  category?: ServiceCategory | null;
  onSave: (category: any) => void;
  onCancel: () => void;
}> = ({ category, onSave, onCancel }) => {
  const [name, setName] = useState(category?.name || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...category, name });
  };
  
  return (
     <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium">Nombre de la Categoría</label>
        <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Desarrollo Web | App" required className={inputFieldClasses} />
        <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">{category ? 'Guardar Cambios' : 'Crear Categoría'}</Button>
        </div>
    </form>
  )
}

const TemplatesPage: React.FC = () => {
    const context = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ManagedItem | null>(null);
    const [currentItemType, setCurrentItemType] = useState<ManagedItemType>('brief');

    const handleOpenModal = (type: ManagedItemType, item?: ManagedItem) => {
        setCurrentItemType(type);
        setEditingItem(item || null);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };
    
    const handleSaveItem = (itemData: any) => {
        const action = editingItem ? 'update' : 'add';
        let functionToCall: any;

        switch (currentItemType) {
            case 'brief': 
                functionToCall = action === 'add' ? context?.addBriefTemplate : context?.updateBriefTemplate; 
                break;
            case 'contract': 
                functionToCall = action === 'add' ? context?.addContractTemplate : context?.updateContractTemplate; 
                break;
            case 'quote': 
                functionToCall = action === 'add' ? context?.addQuoteTemplate : context?.updateQuoteTemplate; 
                break;
            case 'serviceCategory': 
                functionToCall = action === 'add' ? context?.addServiceCategory : context?.updateServiceCategory; 
                break;
        }
        
        if (functionToCall) {
            functionToCall(itemData);
        }
        handleCloseModal();
    };
    
    const handleDeleteItem = (type: ManagedItemType, id: string) => {
        let functionToCall: any;
        switch (type) {
            case 'brief': functionToCall = context?.deleteBriefTemplate; break;
            case 'contract': functionToCall = context?.deleteContractTemplate; break;
            case 'quote': functionToCall = context?.deleteQuoteTemplate; break;
            case 'serviceCategory': functionToCall = context?.deleteServiceCategory; break;
        }
        if (functionToCall) {
            functionToCall(id);
        }
    }

    const getTemplatesForType = (type: TemplateType): (BriefTemplate | ContractTemplate | QuoteTemplate)[] => {
        switch (type) {
            case 'brief': return context?.briefTemplates || [];
            case 'contract': return context?.contractTemplates || [];
            case 'quote': return context?.quoteTemplates || [];
            default: return [];
        }
    }

    const renderTemplateSection = (type: TemplateType, title: string) => (
        <Card>
            <div className="p-5 border-b dark:border-neutral-800 flex justify-between items-center">
                <h2 className="text-xl font-semibold">{title}</h2>
                <Button onClick={() => handleOpenModal(type)} size="sm" leftIcon={<PlusCircle size={16} />}>
                    Nueva Plantilla
                </Button>
            </div>
            <ul className="divide-y dark:divide-neutral-800">
                {getTemplatesForType(type).map(template => (
                <li key={template.id} className="p-4 flex justify-between items-center group">
                    <span className="font-medium">{template.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(type, template)} className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                    <button onClick={() => handleDeleteItem(type, template.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </div>
                </li>
                ))}
                {getTemplatesForType(type).length === 0 && <p className="p-4 text-neutral-500">No hay plantillas.</p>}
            </ul>
        </Card>
    );

    const renderCategorySection = () => (
        <Card>
            <div className="p-5 border-b dark:border-neutral-800 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Categorías de Servicios</h2>
                <Button onClick={() => handleOpenModal('serviceCategory')} size="sm" leftIcon={<PlusCircle size={16} />}>
                    Nueva Categoría
                </Button>
            </div>
            <ul className="divide-y dark:divide-neutral-800">
                {context?.serviceCategories.map(category => (
                <li key={category.id} className="p-4 flex justify-between items-center group">
                    <span className="font-medium">{category.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal('serviceCategory', category)} className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                    <button onClick={() => handleDeleteItem('serviceCategory', category.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </div>
                </li>
                ))}
                {context?.serviceCategories.length === 0 && <p className="p-4 text-neutral-500">No hay categorías.</p>}
            </ul>
        </Card>
    );

    const getModalTitle = () => {
        const action = editingItem ? 'Editar' : 'Crear';
        let itemTypeName = '';
        switch(currentItemType) {
            case 'brief': itemTypeName = 'Plantilla de Brief'; break;
            case 'contract': itemTypeName = 'Plantilla de Contrato'; break;
            case 'quote': itemTypeName = 'Plantilla de Cotización'; break;
            case 'serviceCategory': itemTypeName = 'Categoría de Servicio'; break;
        }
        return `${action} ${itemTypeName}`;
    };

    const renderModalContent = () => {
        switch (currentItemType) {
            case 'brief':
                return <BriefTemplateForm template={editingItem as BriefTemplate | null} onSave={handleSaveItem} onCancel={handleCloseModal} />;
            case 'contract':
            case 'quote':
                return <GenericTemplateForm template={editingItem as ContractTemplate | QuoteTemplate | null} onSave={handleSaveItem} onCancel={handleCloseModal} />;
            case 'serviceCategory':
                return <CategoryForm category={editingItem as ServiceCategory | null} onSave={handleSaveItem} onCancel={handleCloseModal} />;
            default:
                return null;
        }
    }

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {renderTemplateSection('brief', 'Plantillas de Briefs')}
                    {renderTemplateSection('contract', 'Plantillas de Contratos')}
                    {renderTemplateSection('quote', 'Plantillas de Cotizaciones')}
                </div>
                <div className="space-y-8">
                    {renderCategorySection()}
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title={getModalTitle()}
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default TemplatesPage;