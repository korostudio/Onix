import { faker } from '@faker-js/faker';
import type {
  TeamMember, Client, Project, Task, Service, ServiceCategory,
  BriefTemplate, ContractTemplate, QuoteTemplate,
  Brief, Contract, Quote, Invoice, Note, Access, LineItem,
  Subscription, Meeting
} from '../types';

faker.seed(123);

const pad = (num: number) => String(num).padStart(3, '0');

// Current User
export const currentUser: TeamMember = {
    id: 'user-0',
    name: 'Alex Romero',
    email: 'alex.romero@onix.com',
    role: 'admin',
    avatar: faker.image.avatar(),
    status: 'activo',
};


// Team Members
export const team: TeamMember[] = Array.from({ length: 8 }, (_, i) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(['admin', 'manager', 'colaborador']),
    avatar: faker.image.avatar(),
    status: faker.helpers.arrayElement(['activo', 'inactivo']),
}));
team.unshift(currentUser);

// Clients
export const clients: Client[] = Array.from({ length: 15 }, (_, i) => {
    const accesses: Access[] = Array.from({ length: faker.number.int({min: 1, max: 4})}, () => ({
        id: faker.string.uuid(),
        type: faker.helpers.arrayElement(['Instagram', 'Facebook', 'Wordpress', 'Hosting', 'Google Drive', 'Otro']),
        username: faker.internet.displayName(),
        password: faker.internet.password(),
        link: faker.internet.url()
    }));
    return {
        id: faker.string.uuid(),
        clientCode: `CLI-${pad(i + 1)}`,
        name: faker.person.fullName(),
        company: faker.company.name(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        status: faker.helpers.arrayElement(['prospecto', 'activo', 'inactivo']),
        accesses,
        createdAt: faker.date.past().toISOString(),
    };
});

// Custom Spanish data for projects and tasks
const projectNames = [
    "Desarrollo de E-commerce para 'Moda Urbana'",
    "Rediseño de Landing Page para 'Soluciones Tech'",
    "Campaña de Marketing Digital para 'Viajes del Sur'",
    "Creación de Branding para 'Café del Monte'",
    "Optimización SEO para 'Clínica Bienestar'",
    "Desarrollo de App Móvil 'FitTrack'",
    "Plataforma de E-learning para 'EducaOnline'",
    "Sistema de Reservas para 'Hotel Paraíso'",
    "Consultoría Estratégica para 'Finanzas Hoy'",
    "Diseño UI/UX para App de Delivery 'RápidoCome'",
    "Backend para SaaS de gestión de proyectos",
    "Sitio Web Corporativo para 'Abogados y Asociados'",
    "Campaña de Google Ads para 'Autos Veloz'",
    "Diseño de Identidad Visual para 'Dulce Bocado'",
    "Mantenimiento Web y Soporte para 'Global Corp'"
];

const taskTitles = [
    "Maquetar la página de inicio (Homepage)",
    "Configurar la pasarela de pagos con Stripe",
    "Investigación de palabras clave para el blog",
    "Diseñar wireframes de la app en Figma",
    "Implementar autenticación de usuarios (Backend)",
    "Crear calendario de contenidos para redes sociales",
    "Reunión de kick-off con el cliente",
    "Realizar pruebas de usabilidad del prototipo",
    "Optimizar la velocidad de carga del sitio web",
    "Desarrollar endpoint para perfil de usuario",
    "Crear copies para campaña de email marketing",
    "Diseñar propuestas de logo",
    "Configurar Google Analytics y Tag Manager",
    "Resolver bug en el carrito de compras",
    "Reunión de seguimiento semanal",
    "Crear componentes reutilizables en React",
    "Normalizar estructura de base de datos",
    "Realizar auditoría SEO técnica",
    "Diseñar mockups de alta fidelidad",
    "Definir arquitectura del proyecto"
];


// Projects
export const projects: Project[] = Array.from({ length: 20 }, (_, i) => ({
  id: faker.string.uuid(),
  projectCode: `PRJ-${pad(i + 1)}`,
  name: faker.helpers.arrayElement(projectNames),
  clientId: faker.helpers.arrayElement(clients).id,
  description: faker.lorem.paragraph(),
  status: faker.helpers.arrayElement(['planificacion', 'en_curso', 'completado', 'cancelado']),
  startDate: faker.date.past().toISOString(),
  endDate: faker.date.future().toISOString(),
  progress: faker.number.int({ min: 0, max: 100 }),
}));

// Tasks
export const tasks: Task[] = Array.from({ length: 50 }, () => {
    const createdAtDate = faker.date.past();
    const dueDate = faker.date.future({ refDate: createdAtDate });
    const startDate = faker.date.between({ from: createdAtDate, to: dueDate });
    
    return {
        id: faker.string.uuid(),
        title: faker.helpers.arrayElement(taskTitles),
        description: faker.lorem.sentence(),
        projectId: faker.helpers.arrayElement(projects).id,
        assignedTo: faker.helpers.arrayElement(team).id,
        status: faker.helpers.arrayElement(['pendiente', 'en_progreso', 'en_revision', 'completada']),
        priority: faker.helpers.arrayElement(['baja', 'media', 'alta']),
        startDate: startDate.toISOString(),
        dueDate: dueDate.toISOString(),
        createdAt: createdAtDate.toISOString(),
        urgency: faker.helpers.arrayElement(['alta', 'baja']),
        importance: faker.helpers.arrayElement(['alta', 'baja']),
        subtasks: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => ({
            id: faker.string.uuid(),
            text: faker.lorem.sentence(5),
            completed: faker.datatype.boolean(),
        })),
        tags: faker.helpers.arrayElements([
            { id: 'tag1', text: 'Frontend', color: 'blue' },
            { id: 'tag2', text: 'Backend', color: 'green' },
            { id: 'tag3', text: 'Bug', color: 'red' },
            { id: 'tag4', text: 'UI/UX', color: 'purple' },
        ], { min: 0, max: 2 }),
    };
});


// Service Categories
export const serviceCategories: ServiceCategory[] = [
    { id: 'cat-1', name: 'Desarrollo Web | App' },
    { id: 'cat-2', name: 'Ingeniería de Software | Backend' },
    { id: 'cat-3', name: 'Marketing Digital | SEO' },
    { id: 'cat-4', name: 'Diseño Gráfico | UI/UX' },
    { id: 'cat-5', name: 'Consultoría Estratégica' },
];

// Services Data
const servicesData: { categoryId: string, services: { name: string, description: string, price: number }[] }[] = [
    {
        categoryId: 'cat-1',
        services: [
            { name: 'Sitio Web Corporativo', description: 'Diseño y desarrollo de un sitio web profesional para presentar tu empresa.', price: 2500 },
            { name: 'Tienda Online (E-commerce)', description: 'Creación de una plataforma de venta online completa y autogestionable.', price: 4500 },
            { name: 'Landing Page Optimizada', description: 'Página de aterrizaje diseñada para maximizar conversiones.', price: 800 },
            { name: 'Aplicación Móvil (MVP)', description: 'Desarrollo de la primera versión funcional de tu app para iOS y Android.', price: 12000 },
            { name: 'Mantenimiento Web Mensual', description: 'Soporte técnico, actualizaciones y copias de seguridad para tu sitio web.', price: 150 },
        ]
    },
    {
        categoryId: 'cat-2',
        services: [
            { name: 'Desarrollo de API RESTful', description: 'Creación de APIs robustas y escalables para conectar tus aplicaciones.', price: 3800 },
            { name: 'Optimización de Base de Datos', description: 'Análisis y mejora del rendimiento de tus bases de datos.', price: 1200 },
            { name: 'Integración con Sistemas de Terceros', description: 'Conexión de tu software con servicios externos (pasarelas de pago, CRMs, etc.).', price: 2200 },
            { name: 'Arquitectura de Microservicios', description: 'Diseño de una arquitectura moderna y desacoplada para tus sistemas.', price: 5500 },
        ]
    },
    {
        categoryId: 'cat-3',
        services: [
            { name: 'Auditoría SEO Completa', description: 'Análisis exhaustivo de tu sitio web para identificar oportunidades de mejora SEO.', price: 950 },
            { name: 'Gestión de Campañas Google Ads', description: 'Creación y optimización de campañas de publicidad en Google.', price: 600 },
            { name: 'Marketing de Contenidos (Pack Básico)', description: 'Creación de 4 artículos de blog optimizados para SEO al mes.', price: 500 },
            { name: 'Gestión de Redes Sociales', description: 'Manejo profesional de tus perfiles en redes sociales para aumentar tu comunidad.', price: 450 },
        ]
    },
    {
        categoryId: 'cat-4',
        services: [
            { name: 'Diseño de Identidad Visual (Branding)', description: 'Creación de logo, paleta de colores, tipografías y manual de marca.', price: 1800 },
            { name: 'Diseño de Interfaz de Usuario (UI) para App', description: 'Diseño visual de hasta 10 pantallas para tu aplicación móvil.', price: 2800 },
            { name: 'Prototipado y Test de Usuario (UX)', description: 'Creación de prototipos interactivos y pruebas con usuarios reales.', price: 2100 },
            { name: 'Sistema de Diseño (Design System)', description: 'Creación de una librería de componentes de UI reutilizables.', price: 4200 },
        ]
    },
    {
        categoryId: 'cat-5',
        services: [
            { name: 'Consultoría de Transformación Digital', description: 'Asesoramiento estratégico para digitalizar y optimizar tus procesos de negocio.', price: 3000 },
            { name: 'Estrategia de Producto Digital', description: 'Definición de roadmap, funcionalidades y modelo de negocio para tu producto.', price: 2500 },
            { name: 'Workshop de Design Thinking', description: 'Taller práctico para identificar problemas y generar soluciones innovadoras.', price: 1500 },
        ]
    }
];

// Services
export const services: Service[] = servicesData.flatMap(categoryData => 
    categoryData.services.map(service => ({
        id: faker.string.uuid(),
        ...service,
        categoryId: categoryData.categoryId,
        status: faker.helpers.arrayElement(['activo', 'inactivo']),
    }))
);


// Subscriptions
export const subscriptions: Subscription[] = [
    {
        id: faker.string.uuid(),
        name: 'Adobe Creative Cloud',
        assignedTo: faker.helpers.arrayElement(team).id,
        cost: 59.99,
        billingCycle: 'mensual',
        renewalDate: faker.date.future().toISOString(),
        status: 'activo',
        url: 'https://www.adobe.com/creativecloud.html'
    },
    {
        id: faker.string.uuid(),
        name: 'Figma',
        assignedTo: faker.helpers.arrayElement(team).id,
        cost: 15.00,
        billingCycle: 'mensual',
        renewalDate: faker.date.future().toISOString(),
        status: 'activo',
        url: 'https://www.figma.com/'
    },
    {
        id: faker.string.uuid(),
        name: 'Webflow',
        assignedTo: faker.helpers.arrayElement(team).id,
        cost: 29.00,
        billingCycle: 'mensual',
        renewalDate: faker.date.future().toISOString(),
        status: 'activo',
        url: 'https://webflow.com/'
    },
    {
        id: faker.string.uuid(),
        name: 'Slack Pro',
        assignedTo: 'user-0', // Alex Romero
        cost: 8.75,
        billingCycle: 'mensual',
        renewalDate: faker.date.future().toISOString(),
        status: 'activo',
        url: 'https://slack.com/'
    },
     {
        id: faker.string.uuid(),
        name: 'Notion AI',
        assignedTo: 'user-0', // Alex Romero
        cost: 10.00,
        billingCycle: 'mensual',
        renewalDate: faker.date.past().toISOString(),
        status: 'cancelado',
        url: 'https://www.notion.so/'
    }
];

// Meetings
export const meetings: Meeting[] = Array.from({ length: 10 }, () => {
    const startDate = faker.date.soon({ days: 30 });
    const endDate = new Date(startDate.getTime() + faker.helpers.arrayElement([30, 60, 90]) * 60 * 1000); // 30, 60, or 90 minutes
    return {
        id: faker.string.uuid(),
        title: `Reunión: ${faker.lorem.words(3)}`,
        description: faker.lorem.sentence(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        attendees: faker.helpers.arrayElements([...team.map(t => t.id), ...clients.map(c => c.id)], { min: 2, max: 5 })
    };
});


// Templates
export const briefTemplates: BriefTemplate[] = [
    { 
        id: 'bt-1', 
        name: 'Brief de Diseño Web', 
        questions: [
            '¿Cuál es el objetivo principal del nuevo sitio web? (Ej: vender productos, generar leads, informar)',
            '¿Quién es tu público objetivo? Describe a tu cliente ideal.',
            '¿Puedes nombrar 3 sitios web que te gusten y explicar por qué?',
            '¿Qué funcionalidades son indispensables para el lanzamiento? (Ej: blog, e-commerce, galería)',
            '¿Cuentas con un manual de marca o logo en alta calidad?',
            '¿Qué palabras clave definen tu negocio o servicio?'
        ] 
    },
    { 
        id: 'bt-2', 
        name: 'Brief de Campaña de Redes Sociales', 
        questions: [
            '¿Cuál es el objetivo de esta campaña? (Ej: aumentar seguidores, generar ventas, promocionar un evento)',
            '¿A qué plataformas de redes sociales nos dirigiremos?',
            '¿Cuál es el presupuesto total o mensual para la campaña?',
            '¿Qué tipo de contenido prefieres? (Ej: videos, imágenes, historias, reels)',
            '¿Quién es tu competencia principal en redes sociales?',
            '¿Qué métricas (KPIs) consideraremos un éxito para esta campaña?'
        ]
    },
    {
        id: 'bt-3',
        name: 'Brief de Branding y Logo',
        questions: [
            'Describe tu empresa en 3 palabras.',
            '¿Qué valores y emociones quieres que tu marca transmita?',
            '¿Hay algún color o tipografía que prefieras o que debamos evitar?',
            '¿Dónde se utilizará principalmente el logo? (Ej: web, impresos, productos)',
            'Menciona 2-3 logos de otras marcas que admires y por qué.'
        ]
    }
];

export const contractTemplates: ContractTemplate[] = [
    { id: 'ct-1', name: 'Contrato de Desarrollo de Software', content: 'Este contrato establece los términos para el desarrollo de software entre [Cliente] y [Empresa].' },
    { id: 'ct-2', name: 'Contrato de Servicios de Marketing', content: 'Acuerdo de servicios de marketing digital entre [Cliente] y [Empresa].' },
];

export const quoteTemplates: QuoteTemplate[] = [
    { id: 'qt-1', name: 'Cotización Estándar Web', content: 'Detalle de costos para proyecto de desarrollo web.' },
    { id: 'qt-2', name: 'Cotización SEO Mensual', content: 'Detalle de costos para servicios de SEO recurrentes.' },
];

// Documents
export const briefs: Brief[] = Array.from({ length: 5 }, (_, i) => {
    const project = faker.helpers.arrayElement(projects);
    return {
        id: faker.string.uuid(),
        briefCode: `BRF-${pad(i + 1)}`,
        projectId: project.id,
        title: `Brief para ${project.name}`,
        questions: [
            { id: faker.string.uuid(), question: '¿Cuál es el objetivo principal de este proyecto?', answer: faker.lorem.paragraph() },
            { id: faker.string.uuid(), question: '¿Quién es nuestro público objetivo?', answer: faker.lorem.sentence() },
            { id: faker.string.uuid(), question: '¿Qué estilo visual o referencias debemos considerar?', answer: '' },
        ],
        status: faker.helpers.arrayElement(['borrador', 'enviado', 'aprobado']),
        createdAt: faker.date.past().toISOString(),
    };
});

const generateLineItems = (): LineItem[] => {
    return Array.from({ length: faker.number.int({ min: 2, max: 5 })}, () => ({
        id: faker.string.uuid(),
        description: faker.commerce.productName(),
        quantity: faker.number.int({ min: 1, max: 10 }),
        price: parseFloat(faker.commerce.price()),
    }));
};

export const contracts: Contract[] = Array.from({ length: 8 }, (_, i) => {
    const template = faker.helpers.arrayElement(contractTemplates);
    return {
        id: faker.string.uuid(),
        contractCode: `CTR-${pad(i + 1)}`,
        clientId: faker.helpers.arrayElement(clients).id,
        projectId: faker.helpers.arrayElement(projects).id,
        templateId: template.id,
        content: template.content,
        amount: parseFloat(faker.commerce.price({ min: 1000, max: 10000 })),
        startDate: faker.date.past().toISOString(),
        endDate: faker.date.future().toISOString(),
        status: faker.helpers.arrayElement(['borrador', 'enviado', 'firmado', 'vencido']),
        createdAt: faker.date.past().toISOString(),
    };
});

export const quotes: Quote[] = Array.from({ length: 12 }, (_, i) => {
    const items = generateLineItems();
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const discount = faker.helpers.arrayElement([0, 10, 15]);
    const amount = subtotal * (1 - discount / 100);
    return {
        id: faker.string.uuid(),
        quoteNumber: `QTN-${pad(i + 1)}`,
        clientId: faker.helpers.arrayElement(clients).id,
        projectId: faker.helpers.arrayElement(projects).id,
        items,
        subtotal,
        discount,
        amount,
        content: `Validez de la cotización: 15 días.`,
        status: faker.helpers.arrayElement(['borrador', 'enviado', 'aceptado', 'rechazado']),
        createdAt: faker.date.past().toISOString(),
        expiresAt: faker.date.future().toISOString(),
    }
});


export const invoices: Invoice[] = Array.from({ length: 18 }, (_, i) => {
    const items = generateLineItems();
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const tax = 21;
    const amount = subtotal * (1 + tax / 100);
    return {
        id: faker.string.uuid(),
        invoiceNumber: `INV-${pad(i + 1)}`,
        clientId: faker.helpers.arrayElement(clients).id,
        projectId: faker.helpers.arrayElement(projects).id,
        items,
        subtotal,
        tax,
        amount,
        content: 'Términos de pago: 30 días netos.',
        status: faker.helpers.arrayElement(['borrador', 'enviado', 'pagado', 'vencido']),
        createdAt: faker.date.past().toISOString(),
        dueDate: faker.date.future().toISOString(),
    }
});

// Notes
export const notes: Note[] = Array.from({ length: 10 }, () => ({
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    color: faker.helpers.arrayElement(['yellow', 'blue', 'green', 'pink', 'purple']),
    createdAt: faker.date.past().toISOString(),
}));