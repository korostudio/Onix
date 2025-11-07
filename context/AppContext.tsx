import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { faker } from '@faker-js/faker';
import type {
  TeamMember, Client, Project, Task, Service, ServiceCategory,
  BriefTemplate, ContractTemplate, QuoteTemplate,
  Brief, BriefQuestion, Contract, Quote, Invoice, Note, Notification,
  DocumentType, BriefStatus, Subscription, TaskStatus, TaskUrgency, TaskImportance,
  Meeting
} from '../types';
import * as mockData from '../data/mockData';

type Theme = 'light' | 'dark';
type BorderRadius = 'sharp' | 'soft' | 'rounded';
type FontFamily = 'sans' | 'montserrat' | 'poppins';

interface CompanyDetails {
  name: string;
  address: string;
  taxId: string;
  logo: string;
}

const colorThemes: Record<string, Record<string, string>> = {
  sky: { '50': '240 249 255', '100': '224 242 254', '200': '186 230 253', '300': '125 211 252', '400': '56 189 248', '500': '14 165 233', '600': '2 132 199', '700': '3 105 161', '800': '7 89 133', '900': '12 74 110', '950': '8 47 73' },
  emerald: { '50': '236 253 245', '100': '209 250 229', '200': '167 243 208', '300': '110 231 183', '400': '52 211 153', '500': '16 185 129', '600': '5 150 105', '700': '4 120 87', '800': '6 95 70', '900': '6 78 59', '950': '2 44 34' },
  rose: { '50': '255 241 242', '100': '255 228 230', '200': '254 205 211', '300': '253 164 175', '400': '251 113 133', '500': '244 63 94', '600': '225 29 72', '700': '190 18 60', '800': '159 18 57', '900': '136 19 55', '950': '76 5 25' },
  amber: { '50': '255 251 235', '100': '254 243 199', '200': '253 230 138', '300': '252 211 77', '400': '251 191 36', '500': '245 158 11', '600': '217 119 6', '700': '180 83 6', '800': '146 64 14', '900': '120 53 15', '950': '69 28 9' },
  slate: { '50': '248 250 252', '100': '241 245 249', '200': '226 232 240', '300': '203 213 225', '400': '148 163 184', '500': '100 116 139', '600': '71 85 105', '700': '51 65 85', '800': '30 41 59', '900': '15 23 42', '950': '2 6 23' },
};

const radiusValues: Record<BorderRadius, { card: string; btn: string }> = {
    sharp: { card: '0px', btn: '0px' },
    soft: { card: '0.5rem', btn: '0.375rem' },
    rounded: { card: '1rem', btn: '9999px' },
};

const fontValues: Record<FontFamily, string> = {
    sans: 'Inter, sans-serif',
    montserrat: 'Montserrat, sans-serif',
    poppins: 'Poppins, sans-serif',
};

interface AppContextProps {
  theme: Theme;
  toggleTheme: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  borderRadius: BorderRadius;
  setBorderRadius: (radius: BorderRadius) => void;
  fontFamily: FontFamily;
  setFontFamily: (family: FontFamily) => void;
  isLoading: boolean;
  currentUser: TeamMember;
  companyDetails: CompanyDetails;
  updateCompanyDetails: (details: CompanyDetails) => void;
  team: TeamMember[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  services: Service[];
  serviceCategories: ServiceCategory[];
  subscriptions: Subscription[];
  meetings: Meeting[];
  briefTemplates: BriefTemplate[];
  contractTemplates: ContractTemplate[];
  quoteTemplates: QuoteTemplate[];
  briefs: Brief[];
  contracts: Contract[];
  quotes: Quote[];
  invoices: Invoice[];
  notes: Note[];
  notifications: Notification[];
  addClient: (client: Omit<Client, 'id' | 'clientCode' | 'createdAt'>) => Client;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addProject: (project: Omit<Project, 'id' | 'projectCode'>) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  updateTaskMatrixPosition: (taskId: string, urgency: TaskUrgency, importance: TaskImportance) => void;
  addTeamMember: (member: Omit<TeamMember, 'id' | 'avatar'>) => void;
  updateTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (id: string) => void;
  addService: (service: Omit<Service, 'id'>) => Service;
  updateService: (service: Service) => void;
  deleteService: (id: string) => void;
  addServiceCategory: (category: Omit<ServiceCategory, 'id'>) => ServiceCategory;
  updateServiceCategory: (category: ServiceCategory) => void;
  deleteServiceCategory: (id: string) => void;
  addSubscription: (subscription: Omit<Subscription, 'id'>) => Subscription;
  updateSubscription: (subscription: Subscription) => void;
  deleteSubscription: (id: string) => void;
  addMeeting: (meeting: Omit<Meeting, 'id'>) => Meeting;
  updateMeeting: (meeting: Meeting) => void;
  deleteMeeting: (id: string) => void;
  addBriefTemplate: (template: Omit<BriefTemplate, 'id'>) => BriefTemplate;
  updateBriefTemplate: (template: BriefTemplate) => void;
  deleteBriefTemplate: (id: string) => void;
  addContractTemplate: (template: Omit<ContractTemplate, 'id'>) => ContractTemplate;
  updateContractTemplate: (template: ContractTemplate) => void;
  deleteContractTemplate: (id: string) => void;
  addQuoteTemplate: (template: Omit<QuoteTemplate, 'id'>) => QuoteTemplate;
  updateQuoteTemplate: (template: QuoteTemplate) => void;
  deleteQuoteTemplate: (id: string) => void;
  addBrief: (brief: Omit<Brief, 'id' | 'createdAt' | 'status' | 'briefCode'>) => void;
  updateBrief: (brief: Brief) => void;
  deleteBrief: (id: string) => void;
  addContract: (contract: Omit<Contract, 'id' | 'createdAt' | 'status' | 'contractCode'>) => void;
  updateContract: (contract: Contract) => void;
  deleteContract: (id: string) => void;
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'status' | 'quoteNumber'>) => void;
  updateQuote: (quote: Quote) => void;
  deleteQuote: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'status' | 'invoiceNumber'>) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  addNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;
  shareDocument: (type: DocumentType, id: string) => void;
  processClientAction: (type: DocumentType, id: string, payload?: any) => void;
}

export const AppContext = createContext<AppContextProps | null>(null);

const defaultCompanyDetails: CompanyDetails = {
    name: 'ONIX Systems',
    address: 'Calle Falsa 123, Springfield',
    taxId: 'ESB12345678',
    logo: ''
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [primaryColor, setPrimaryColorState] = useState('sky');
  const [borderRadius, setBorderRadiusState] = useState<BorderRadius>('soft');
  const [fontFamily, setFontFamilyState] = useState<FontFamily>('sans');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [currentUser, setCurrentUser] = useState<TeamMember>(mockData.currentUser);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(defaultCompanyDetails);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [briefTemplates, setBriefTemplates] = useState<BriefTemplate[]>([]);
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([]);
  const [quoteTemplates, setQuoteTemplates] = useState<QuoteTemplate[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setTimeout(() => {
        setTeam(mockData.team);
        setClients(mockData.clients);
        setProjects(mockData.projects);
        setTasks(mockData.tasks);
        setServices(mockData.services);
        setServiceCategories(mockData.serviceCategories);
        setSubscriptions(mockData.subscriptions);
        setMeetings(mockData.meetings);
        setBriefTemplates(mockData.briefTemplates);
        setContractTemplates(mockData.contractTemplates);
        setQuoteTemplates(mockData.quoteTemplates);
        setBriefs(mockData.briefs);
        setContracts(mockData.contracts);
        setQuotes(mockData.quotes);
        setInvoices(mockData.invoices);
        setNotes(mockData.notes);
        setIsLoading(false);
    }, 1000);
    
    // Load theme settings from local storage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    const savedPrimaryColor = localStorage.getItem('primaryColor');
    if (savedPrimaryColor && colorThemes[savedPrimaryColor]) {
        setPrimaryColorState(savedPrimaryColor);
    }
    const savedBorderRadius = localStorage.getItem('borderRadius') as BorderRadius;
    if (savedBorderRadius && radiusValues[savedBorderRadius]) {
        setBorderRadiusState(savedBorderRadius);
    }
    const savedFontFamily = localStorage.getItem('fontFamily') as FontFamily;
    if (savedFontFamily && fontValues[savedFontFamily]) {
        setFontFamilyState(savedFontFamily);
    }

    const savedCompanyDetails = localStorage.getItem('onix-company-details');
    if (savedCompanyDetails) {
        setCompanyDetails(JSON.parse(savedCompanyDetails));
    }
  }, []);
  
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply Primary Color
    const colors = colorThemes[primaryColor];
    if (colors) {
      for (const [shade, value] of Object.entries(colors)) {
        root.style.setProperty(`--primary-${shade}`, value);
      }
    }

    // Apply Border Radius
    const radii = radiusValues[borderRadius];
    if (radii) {
        root.style.setProperty('--radius-card', radii.card);
        root.style.setProperty('--radius-btn', radii.btn);
    }

    // Apply Font Family
    const font = fontValues[fontFamily];
    if (font) {
        root.style.setProperty('--font-family', font);
    }

  }, [primaryColor, borderRadius, fontFamily]);


  const toggleTheme = () => {
    setTheme(prevTheme => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        return newTheme;
    });
  };
  
  const setPrimaryColor = (color: string) => {
    if (colorThemes[color]) {
      setPrimaryColorState(color);
      localStorage.setItem('primaryColor', color);
    }
  };

  const setBorderRadius = (radius: BorderRadius) => {
    if (radiusValues[radius]) {
      setBorderRadiusState(radius);
      localStorage.setItem('borderRadius', radius);
    }
  };
  
  const setFontFamily = (family: FontFamily) => {
    if (fontValues[family]) {
      setFontFamilyState(family);
      localStorage.setItem('fontFamily', family);
    }
  };
  
  const updateCompanyDetails = (details: CompanyDetails) => {
    setCompanyDetails(details);
    localStorage.setItem('onix-company-details', JSON.stringify(details));
    addNotification('success', 'Datos de la empresa actualizados.');
  }

  const addNotification = (type: Notification['type'], message: string) => {
    const newNotification: Notification = { id: faker.string.uuid(), type, message };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => removeNotification(newNotification.id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const pad = (num: number, size: number = 3) => String(num).padStart(size, '0');

  const createCrudFunctions = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, entityName: string) => ({
    add: (item: Omit<T, 'id'>): T => {
        const newItem = { ...item, id: faker.string.uuid() } as T;
        setter(prev => [newItem, ...prev]);
        addNotification('success', `${entityName} creado con éxito.`);
        return newItem;
    },
    update: (item: T) => {
        setter(prev => prev.map(i => i.id === item.id ? item : i));
        addNotification('success', `${entityName} actualizado con éxito.`);
    },
    delete: (id: string) => {
        setter(prev => prev.filter(i => i.id !== id));
        addNotification('info', `${entityName} eliminado.`);
    },
  });
  
  const addClient = (client: Omit<Client, 'id' | 'clientCode' | 'createdAt'>): Client => {
    const newClient = { ...client, id: faker.string.uuid(), createdAt: new Date().toISOString(), clientCode: `CLI-${pad(clients.length + 1)}` } as Client;
    setClients(prev => [newClient, ...prev]);
    addNotification('success', `Cliente creado con éxito.`);
    return newClient;
  };
  const updateClient = (client: Client) => {
    setClients(prev => prev.map(i => i.id === client.id ? client : i));
    addNotification('success', `Cliente actualizado con éxito.`);
  };
  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(i => i.id !== id));
    addNotification('info', `Cliente eliminado.`);
  };

  const addProject = (project: Omit<Project, 'id' | 'projectCode'>): Project => {
    const newProject = { ...project, id: faker.string.uuid(), projectCode: `PRJ-${pad(projects.length + 1)}` } as Project;
    setProjects(prev => [newProject, ...prev]);
    addNotification('success', `Proyecto creado con éxito.`);
    return newProject;
  };
  const updateProject = (project: Project) => {
    setProjects(prev => prev.map(i => i.id === project.id ? project : i));
    addNotification('success', `Proyecto actualizado con éxito.`);
  };
  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(i => i.id !== id));
    addNotification('info', `Proyecto eliminado.`);
  };
  
  const { add: addService, update: updateService, delete: deleteService } = createCrudFunctions<Service>(setServices, 'Servicio');
  const { add: addServiceCategory, update: updateServiceCategory, delete: deleteServiceCategory } = createCrudFunctions<ServiceCategory>(setServiceCategories, 'Categoría de Servicio');
  const { add: addSubscription, update: updateSubscription, delete: deleteSubscription } = createCrudFunctions<Subscription>(setSubscriptions, 'Suscripción');
  const { add: addMeeting, update: updateMeeting, delete: deleteMeeting } = createCrudFunctions<Meeting>(setMeetings, 'Reunión');
  const { add: addBriefTemplate, update: updateBriefTemplate, delete: deleteBriefTemplate } = createCrudFunctions<BriefTemplate>(setBriefTemplates, 'Plantilla de Brief');
  const { add: addContractTemplate, update: updateContractTemplate, delete: deleteContractTemplate } = createCrudFunctions<ContractTemplate>(setContractTemplates, 'Plantilla de Contrato');
  const { add: addQuoteTemplate, update: updateQuoteTemplate, delete: deleteQuoteTemplate } = createCrudFunctions<QuoteTemplate>(setQuoteTemplates, 'Plantilla de Cotización');
  const { update: updateBrief, delete: deleteBrief } = createCrudFunctions<Brief>(setBriefs, 'Brief');
  const { update: updateContract, delete: deleteContract } = createCrudFunctions<Contract>(setContracts, 'Contrato');
  const { update: updateQuote, delete: deleteQuote } = createCrudFunctions<Quote>(setQuotes, 'Cotización');
  // FIX: Corrected destructuring to avoid redeclaring 'updateInvoice' and correctly alias 'delete' to 'deleteInvoice'.
  const { update: updateInvoice, delete: deleteInvoice } = createCrudFunctions<Invoice>(setInvoices, 'Factura');
  const { update: updateNote, delete: deleteNote } = createCrudFunctions<Note>(setNotes, 'Nota');
  
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
      const newTask = { ...task, id: faker.string.uuid(), createdAt: new Date().toISOString()};
      setTasks(prev => [newTask, ...prev]);
      addNotification('success', `Tarea "${task.title}" creada.`);
  };
  const updateTask = (task: Task) => {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      addNotification('success', `Tarea "${task.title}" actualizada.`);
  };
  const deleteTask = (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
      addNotification('info', `Tarea eliminada.`);
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    addNotification('info', 'Estado de la tarea actualizado.');
  };
  
  const updateTaskMatrixPosition = (taskId: string, urgency: TaskUrgency, importance: TaskImportance) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, urgency, importance } : task
    ));
    addNotification('info', 'Prioridad de la tarea actualizada.');
  };


  const addTeamMember = (member: Omit<TeamMember, 'id' | 'avatar'>) => {
      const newMember = { ...member, id: faker.string.uuid(), avatar: faker.image.avatar() };
      setTeam(prev => [newMember, ...prev]);
      addNotification('success', `Miembro ${member.name} añadido.`);
  };
   const updateTeamMember = (member: TeamMember) => {
      setTeam(prev => prev.map(m => m.id === member.id ? member : m));
      addNotification('success', `Miembro ${member.name} actualizado.`);
  };
  const deleteTeamMember = (id: string) => {
      setTeam(prev => prev.filter(m => m.id !== id));
      addNotification('info', `Miembro eliminado.`);
  };
  
  const addBrief = (brief: Omit<Brief, 'id'|'createdAt'|'status'| 'briefCode'>) => {
      const newBrief = { ...brief, id: faker.string.uuid(), briefCode: `BRF-${pad(briefs.length + 1)}`, createdAt: new Date().toISOString(), status: 'borrador' as const };
      setBriefs(prev => [newBrief, ...prev]);
      addNotification('success', 'Brief creado.');
  };
  const addContract = (contract: Omit<Contract, 'id'|'createdAt'|'status'| 'contractCode'>) => {
      const newContract = { ...contract, id: faker.string.uuid(), contractCode: `CTR-${pad(contracts.length + 1)}`, createdAt: new Date().toISOString(), status: 'borrador' as const };
      setContracts(prev => [newContract, ...prev]);
      addNotification('success', 'Contrato creado.');
  };
  const addQuote = (quote: Omit<Quote, 'id'|'createdAt'|'status'| 'quoteNumber'>) => {
      const newQuote = { ...quote, id: faker.string.uuid(), quoteNumber: `QTN-${pad(quotes.length + 1)}`, createdAt: new Date().toISOString(), status: 'borrador' as const };
      setQuotes(prev => [newQuote, ...prev]);
      addNotification('success', 'Cotización creada.');
  };
  const addInvoice = (invoice: Omit<Invoice, 'id'|'createdAt'|'status'|'invoiceNumber'>) => {
      const newInvoice = { ...invoice, id: faker.string.uuid(), invoiceNumber: `INV-${pad(invoices.length + 1)}`, createdAt: new Date().toISOString(), status: 'borrador' as const };
      setInvoices(prev => [newInvoice, ...prev]);
      addNotification('success', 'Factura creada.');
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote = { ...note, id: faker.string.uuid(), createdAt: new Date().toISOString() };
    setNotes(prev => [newNote, ...prev]);
    addNotification('success', 'Nota creada.');
  };

  const shareDocument = (type: DocumentType, id: string) => {
    const url = `${window.location.origin}/#view/${type}/${id}`;
    navigator.clipboard.writeText(url);
    
    let doc: any;
    let updater: any;
    switch(type) {
        case 'brief': doc = briefs.find(d => d.id === id); updater = setBriefs; break;
        case 'contract': doc = contracts.find(d => d.id === id); updater = setContracts; break;
        case 'quote': doc = quotes.find(d => d.id === id); updater = setQuotes; break;
        case 'invoice': doc = invoices.find(d => d.id === id); updater = setInvoices; break;
    }
    if(doc && doc.status === 'borrador') {
        updater((prev: any[]) => prev.map(d => d.id === id ? {...d, status: 'enviado'} : d));
    }
    addNotification('success', 'Enlace copiado al portapapeles y documento enviado.');
  };
  
  const processClientAction = (type: DocumentType, id: string, payload?: any) => {
    let newStatus: string = '';
    let updater: any;
    let extraUpdate: (doc: any) => any = (doc) => doc;

    switch (type) {
      case 'brief':
        newStatus = 'aprobado';
        updater = setBriefs;
        if (payload) {
          extraUpdate = (briefDoc) => {
            const updatedQuestions = briefDoc.questions.map((q: BriefQuestion) => ({
              ...q,
              answer: payload[q.id] || q.answer,
            }));
            return { ...briefDoc, questions: updatedQuestions };
          };
        }
        break;
      case 'contract': newStatus = 'firmado'; updater = setContracts; break;
      case 'quote': newStatus = 'aceptado'; updater = setQuotes; break;
      case 'invoice': newStatus = 'pagado'; updater = setInvoices; break;
    }
    if (updater) {
      updater((prev: any[]) => prev.map(d => d.id === id ? { ...extraUpdate(d), status: newStatus } : d));
    }
  };

  const value: AppContextProps = {
    theme, toggleTheme, isLoading, currentUser, companyDetails, updateCompanyDetails,
    primaryColor, setPrimaryColor, borderRadius, setBorderRadius, fontFamily, setFontFamily,
    team, clients, projects, tasks, services, serviceCategories, subscriptions, meetings,
    briefTemplates, contractTemplates, quoteTemplates, briefs, contracts, quotes, invoices, notes,
    notifications, addNotification, removeNotification,
    addClient, updateClient, deleteClient,
    addProject, updateProject, deleteProject,
    addTask, updateTask, deleteTask, updateTaskStatus, updateTaskMatrixPosition,
    addTeamMember, updateTeamMember, deleteTeamMember,
    addService, updateService, deleteService,
    addServiceCategory, updateServiceCategory, deleteServiceCategory,
    addSubscription, updateSubscription, deleteSubscription,
    addMeeting, updateMeeting, deleteMeeting,
    addBriefTemplate, updateBriefTemplate, deleteBriefTemplate,
    addContractTemplate, updateContractTemplate, deleteContractTemplate,
    addQuoteTemplate, updateQuoteTemplate, deleteQuoteTemplate,
    addBrief, updateBrief, deleteBrief,
    addContract, updateContract, deleteContract,
    addQuote, updateQuote, deleteQuote,
    addInvoice, updateInvoice, deleteInvoice,
    addNote, updateNote, deleteNote,
    shareDocument, processClientAction
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};