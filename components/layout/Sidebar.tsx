
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, ClipboardCheck, Users2, FileText, FileSignature,
  FileBarChart, Receipt, Lightbulb, BarChart3, Settings, Menu, X, Hexagon, Wrench, CalendarDays, FileCog, Repeat
} from 'lucide-react';

const mainNavLinks = [
  { to: '/', icon: <LayoutDashboard size={20} />, text: 'Dashboard' },
  { to: '/clients', icon: <Users size={20} />, text: 'Clientes' },
  { to: '/projects', icon: <Briefcase size={20} />, text: 'Proyectos' },
  { to: '/tasks', icon: <ClipboardCheck size={20} />, text: 'Tareas' },
  { to: '/team', icon: <Users2 size={20} />, text: 'Equipo' },
  { to: '/calendar', icon: <CalendarDays size={20} />, text: 'Calendario' },
];

const docsNavLinks = [
  { to: '/briefs', icon: <FileText size={20} />, text: 'Briefs' },
  { to: '/contracts', icon: <FileSignature size={20} />, text: 'Contratos' },
  { to: '/quotes', icon: <FileBarChart size={20} />, text: 'Cotizaciones' },
  { to: '/invoices', icon: <Receipt size={20} />, text: 'Facturas' },
];

const otherNavLinks = [
    { to: '/services', icon: <Wrench size={20} />, text: 'Servicios' },
    { to: '/subscriptions', icon: <Repeat size={20} />, text: 'Suscripciones' },
    { to: '/templates', icon: <FileCog size={20} />, text: 'Plantillas' },
    { to: '/notes', icon: <Lightbulb size={20} />, text: 'Notas' },
    { to: '/reports', icon: <BarChart3 size={20} />, text: 'Reportes' },
    { to: '/settings', icon: <Settings size={20} />, text: 'Configuración' },
];

const Sidebar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const renderNavLink = (link: { to: string, icon: React.ReactNode, text: string }) => (
        <NavLink
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-btn text-sm font-medium transition-colors duration-200 ${isActive
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-500/10'
                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-border'
                }`
            }
            onClick={() => setIsMobileMenuOpen(false)}
        >
            {link.icon}
            <span className="ml-3">
                {link.text}
            </span>
        </NavLink>
    );

    const sidebarContent = (
         <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-6 flex-shrink-0">
                <Hexagon className="w-8 h-8 text-primary-500" />
                <span className="ml-2 text-xl font-bold tracking-wider">ONIX</span>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <div>
                    <h3 className="px-4 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Principal</h3>
                    {mainNavLinks.map(link => <div key={link.to}>{renderNavLink(link)}</div>)}
                </div>
                <div>
                     <h3 className="px-4 mt-4 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Documentos</h3>
                    {docsNavLinks.map(link => <div key={link.to}>{renderNavLink(link)}</div>)}
                </div>
                 <div>
                     <h3 className="px-4 mt-4 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Otros</h3>
                    {otherNavLinks.map(link => <div key={link.to}>{renderNavLink(link)}</div>)}
                </div>
            </nav>
        </div>
    );

    return (
        <>
            {/* Mobile menu button */}
            <div className="md:hidden fixed top-3 left-4 z-30">
                 <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-btn bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm border border-light-border dark:border-dark-border">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
            
            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-10"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar for mobile */}
            <aside className={`fixed top-0 left-0 w-64 h-full bg-light-card dark:bg-dark-card z-20 transform transition-transform md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {sidebarContent}
            </aside>

             {/* Sidebar for desktop */}
            <aside className="hidden md:block w-64 bg-light-card dark:bg-dark-card flex-shrink-0 border-r border-light-border dark:border-dark-border">
                {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;