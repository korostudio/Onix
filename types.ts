// FIX: Define UserRole here to break a circular dependency with TeamPage.tsx.
export type UserRole = 'admin' | 'manager' | 'colaborador';

export type ClientStatus = 'prospecto' | 'activo' | 'inactivo';
export type ProjectStatus = 'planificacion' | 'en_curso' | 'completado' | 'cancelado';
export type TaskStatus = 'pendiente' | 'en_progreso' | 'en_revision' | 'completada';
export type TaskPriority = 'baja' | 'media' | 'alta';
export type TaskUrgency = 'alta' | 'baja';
export type TaskImportance = 'alta' | 'baja';
export type ServiceStatus = 'activo' | 'inactivo';
export type BriefStatus = 'borrador' | 'enviado' | 'aprobado';
export type ContractStatus = 'borrador' | 'enviado' | 'firmado' | 'vencido';
export type QuoteStatus = 'borrador' | 'enviado' | 'aceptado' | 'rechazado';
export type InvoiceStatus = 'borrador' | 'enviado' | 'pagado' | 'vencido';
export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple';
export type AccessType = 'Instagram' | 'Facebook' | 'Wordpress' | 'Hosting' | 'Google Drive' | 'Otro';
export type SubscriptionStatus = 'activo' | 'cancelado';
export type BillingCycle = 'mensual' | 'anual';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: 'activo' | 'inactivo';
}

export interface Access {
    id: string;
    type: AccessType;
    username: string;
    password: string;
    link?: string;
}

export interface Client {
  id: string;
  clientCode: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: ClientStatus;
  accesses?: Access[];
  createdAt: string;
}

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  clientId: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  progress: number;
}
export interface Subtask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Tag {
    id: string;
    text: string;
    color: string;
}

export interface Task {
  id:string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  createdAt: string;
  subtasks?: Subtask[];
  tags?: Tag[];
  urgency: TaskUrgency;
  importance: TaskImportance;
}

export interface ServiceCategory {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  status: ServiceStatus;
}

export interface Subscription {
  id: string;
  name: string;
  assignedTo: string; // TeamMember ID
  cost: number;
  billingCycle: BillingCycle;
  renewalDate: string;
  status: SubscriptionStatus;
  url?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO string for start datetime
  endDate: string; // ISO string for end datetime
  attendees: string[]; // TeamMember or Client IDs
}

export interface BriefTemplate {
  id: string;
  name: string;
  questions: string[]; // Replaces content
}

export interface ContractTemplate {
  id: string;
  name: string;
  content: string;
}
export interface QuoteTemplate {
  id: string;
  name: string;
  content: string;
}

export interface BriefQuestion {
  id: string;
  question: string;
  answer: string; // This will be filled by the client
}

export interface Brief {
    id: string;
    briefCode: string;
    projectId: string;
    title: string; // New field
    questions: BriefQuestion[]; // Replaces content and templateId
    status: BriefStatus;
    createdAt: string;
}
export interface Contract {
    id: string;
    contractCode: string;
    clientId: string;
    projectId?: string;
    templateId: string;
    content: string;
    amount: number;
    startDate: string;
    endDate: string;
    status: ContractStatus;
    createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Quote {
    id:string;
    quoteNumber: string;
    clientId: string;
    projectId?: string;
    templateId?: string;
    content: string; // Will store notes for new quotes
    amount: number; // Final total
    status: QuoteStatus;
    createdAt: string;
    expiresAt: string;
    // New fields for itemized quotes
    items?: LineItem[];
    subtotal?: number;
    discount?: number; // Stored as percentage
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    clientId: string;
    projectId?: string;
    content: string; // Legacy for notes/description
    amount: number; // Final total
    status: InvoiceStatus;
    createdAt: string; // Issue Date
    dueDate: string;
    // New fields for itemized invoices
    items?: LineItem[];
    subtotal?: number;
    tax?: number; // Stored as percentage
}
export interface Note {
    id: string;
    title: string;
    content: string;
    color: NoteColor;
    createdAt: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
}

export type DocumentType = 'brief' | 'contract' | 'quote' | 'invoice';