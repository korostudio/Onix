

import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import ThemeToggle from '../ThemeToggle';
import { Bell } from 'lucide-react';

const Header: React.FC = () => {
  const context = useContext(AppContext);
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    const titleMap: { [key: string]: string } = {
        dashboard: 'Dashboard',
        clients: 'Clientes',
        projects: 'Proyectos',
        tasks: 'Tareas',
        team: 'Equipo',
        calendar: 'Calendario',
        briefs: 'Briefs',
        contracts: 'Contratos',
        quotes: 'Cotizaciones',
        invoices: 'Facturas',
        services: 'Servicios',
        subscriptions: 'Suscripciones',
        templates: 'Plantillas',
        notes: 'Notas',
        reports: 'Reportes',
        settings: 'Configuración'
    };
    
    const title = titleMap[path] ? titleMap[path] : path.charAt(0).toUpperCase() + path.slice(1);
    setPageTitle(title);
  }, [location]);


  if (!context) return null;
  const { currentUser } = context;

  return (
    <header className="h-16 flex items-center justify-between px-6 flex-shrink-0 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{pageTitle}</h1>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <button className="relative p-2 rounded-btn border border-light-border dark:border-dark-border hover:bg-neutral-100 dark:hover:bg-dark-border transition-colors duration-150">
          <Bell className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-800 dark:bg-neutral-900 text-white text-[10px] font-bold">3</span>
        </button>
        {currentUser && (
            <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full" />
        )}
      </div>
    </header>
  );
};

export default Header;