

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationPanel from '../ui/NotificationPanel';

const Layout: React.FC = () => {
  return (
    <div className={`flex h-screen bg-light-bg dark:bg-dark-bg text-neutral-800 dark:text-neutral-200 font-sans`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <NotificationPanel />
    </div>
  );
};

export default Layout;