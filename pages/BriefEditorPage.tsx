import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import type { Brief, BriefQuestion } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, PlusCircle, Trash2, Save, Hexagon, FileText } from 'lucide-react';
import LoadingPage from '../components/ui/LoadingPage';
import { faker } from '@faker-js/faker';
import SearchableSelect from '../components/ui/SearchableSelect';

const inputFieldClasses = "block w-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";
const textareaClasses = `${inputFieldClasses} min-h-[40px] resize-y`;

const BriefEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const context = useContext(AppContext);

    // Form state
    const [clientId, setClientId] = useState('');
    const [projectId, setProjectId] = useState('');
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState<Omit<BriefQuestion, 'answer'>[]>([]);
    const [templateId, setTemplateId] = useState('');

    const isEditing = Boolean(id);

    // Initial load for editing existing brief
    useEffect(() => {
        if (isEditing && context?.briefs) {
            const briefToEdit = context.briefs.find(b => b.id === id);
            if (briefToEdit) {
                const project = context.projects.find(p => p.id === briefToEdit.projectId);
                setClientId(project?.clientId || '');
                setProjectId(briefToEdit.projectId);
                setTitle(briefToEdit.title);
                setQuestions(briefToEdit.questions.map(({answer, ...rest}) => rest));
            }
        } else {
             // Default questions for a new brief without a template
            setQuestions([
                { id: faker.string.uuid(), question: '¿Cuáles son los objetivos principales del proyecto?' },
                { id: faker.string.uuid(), question: '¿Quién es el público objetivo?' },
                { id: faker.string.uuid(), question: '¿Cuáles son los competidores directos e indirectos?' },
            ]);
        }
    }, [id, isEditing, context?.briefs, context?.projects]);

    // Handle template selection
    useEffect(() => {
        if (isEditing) return;

        if (templateId && context?.briefTemplates) {
            const template = context.briefTemplates.find(t => t.id === templateId);
            if (template) {
                setTitle(template.name);
                const templateQuestions = template.questions.map(q => ({
                    id: faker.string.uuid(),
                    question: q
                }));
                setQuestions(templateQuestions);
            }
        } else {
            setTitle('');
            setQuestions([
                { id: faker.string.uuid(), question: '¿Cuáles son los objetivos principales del proyecto?' },
                { id: faker.string.uuid(), question: '¿Quién es el público objetivo?' },
            ]);
        }
    }, [templateId, isEditing, context?.briefTemplates]);

    if (!context || context.isLoading) {
        return <LoadingPage />;
    }
    const { clients, projects, briefs, briefTemplates, addBrief, updateBrief, companyDetails } = context;

    const handleQuestionChange = (qId: string, value: string) => {
        setQuestions(currentQs => currentQs.map(q => q.id === qId ? { ...q, question: value } : q));
    };

    const handleAddQuestion = () => {
        setQuestions(currentQs => [...currentQs, { id: faker.string.uuid(), question: '' }]);
    };
    
    const handleRemoveQuestion = (qId: string) => {
        setQuestions(currentQs => currentQs.filter(q => q.id !== qId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!clientId || !projectId || !title) {
            context.addNotification("error", "Cliente, proyecto y título son requeridos.");
            return;
        }
        if (questions.some(q => !q.question.trim())) {
            context.addNotification("error", "Todas las preguntas deben tener texto.");
            return;
        }

        const briefData = {
            projectId,
            title,
            questions: questions.map(q => ({...q, answer: ''})), // Add empty answer field for the final brief object
        };

        if (isEditing) {
            const originalBrief = briefs.find(b => b.id === id)!;
            updateBrief({ ...originalBrief, ...briefData, id: id! });
        } else {
            addBrief(briefData);
        }

        navigate('/briefs');
    };
    
    const selectedClient = useMemo(() => clients.find(c => c.id === clientId), [clientId, clients]);
    const selectedProject = useMemo(() => projects.find(p => p.id === projectId), [projectId, projects]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Button variant="secondary" onClick={() => navigate('/briefs')} leftIcon={<ArrowLeft size={16} />}>
                    Volver a Briefs
                </Button>
                <h1 className="text-2xl font-bold">{isEditing ? `Editar Brief` : 'Crear Nuevo Brief'}</h1>
                <Button onClick={handleSubmit} leftIcon={<Save size={18} />}>
                    {isEditing ? 'Guardar Cambios' : 'Guardar Brief'}
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Editor Panel */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Información General</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <SearchableSelect
                                options={clients}
                                value={clientId}
                                onChange={(id) => { setClientId(id); setProjectId(''); }}
                                placeholder="Seleccionar Cliente *"
                                required
                            />
                            <SearchableSelect
                                options={projects.filter(p => p.clientId === clientId)}
                                value={projectId}
                                onChange={setProjectId}
                                placeholder="Seleccionar Proyecto *"
                                disabled={!clientId}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <select
                                value={templateId}
                                onChange={(e) => setTemplateId(e.target.value)}
                                className={`${inputFieldClasses} disabled:bg-neutral-100 dark:disabled:bg-neutral-800/50`}
                                disabled={isEditing}
                                aria-label="Seleccionar plantilla de brief"
                            >
                                <option value="">Usar plantilla (Opcional)</option>
                                {briefTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título del Brief *" required className={inputFieldClasses} />
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-4">Preguntas del Brief</h3>
                        <div className="space-y-4">
                            {questions.map((q, index) => (
                                <div key={q.id} className="flex items-start space-x-2">
                                    <span className="font-semibold pt-2">{index + 1}.</span>
                                    <textarea 
                                        value={q.question}
                                        onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                                        placeholder="Escribe tu pregunta aquí..."
                                        rows={2}
                                        className={`${textareaClasses} flex-grow`}
                                    />
                                    <Button 
                                        type="button" 
                                        variant="danger" 
                                        size="sm" 
                                        onClick={() => handleRemoveQuestion(q.id)} 
                                        className="p-2 h-auto mt-1"
                                        aria-label="Eliminar pregunta"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm" 
                            onClick={handleAddQuestion} 
                            leftIcon={<PlusCircle size={16}/>} 
                            className="mt-4"
                        >
                            Añadir Pregunta
                        </Button>
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
                            </div>
                            <div className="text-right">
                                <h1 className="text-3xl font-bold uppercase text-neutral-400 dark:text-neutral-500 flex items-center justify-end">
                                    <FileText className="mr-2"/> Brief
                                </h1>
                            </div>
                        </header>
                        <section className="mt-6">
                            <p className="text-neutral-500">CLIENTE</p>
                            <p className="font-bold">{selectedClient?.name || 'Nombre del Cliente'}</p>
                            <p>{selectedClient?.company || 'Empresa del Cliente'}</p>
                        </section>
                        <section className="mt-4">
                            <p className="text-neutral-500">PROYECTO</p>
                            <p className="font-bold">{selectedProject?.name || 'Nombre del Proyecto'}</p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-xl font-bold mb-2">{title || 'Título del Brief'}</h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">Por favor, responde a las siguientes preguntas para ayudarnos a entender mejor tus necesidades.</p>
                            <div className="space-y-6">
                                {questions.map((q, index) => (
                                    <div key={q.id}>
                                        <label htmlFor={`q-preview-${q.id}`} className="block text-sm font-semibold mb-2">
                                            {index + 1}. {q.question || 'Pregunta sin texto...'}
                                        </label>
                                        <textarea 
                                            id={`q-preview-${q.id}`}
                                            rows={4}
                                            placeholder="El cliente escribirá su respuesta aquí..."
                                            disabled
                                            className={`${textareaClasses} disabled:bg-neutral-100 dark:disabled:bg-neutral-800/50`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BriefEditorPage;
