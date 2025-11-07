

import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingPage from './components/ui/LoadingPage';

// Lazy load pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const ClientDetailPage = lazy(() => import('./pages/ClientDetailPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const TeamMemberDetailPage = lazy(() => import('./pages/TeamMemberDetailPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const BriefsPage = lazy(() => import('./pages/BriefsPage'));
const BriefEditorPage = lazy(() => import('./pages/BriefEditorPage'));
const ContractsPage = lazy(() => import('./pages/ContractsPage'));
const ContractEditorPage = lazy(() => import('./pages/ContractEditorPage'));
const QuotesPage = lazy(() => import('./pages/QuotesPage'));
const QuoteEditorPage = lazy(() => import('./pages/QuoteEditorPage'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const InvoiceEditorPage = lazy(() => import('./pages/InvoiceEditorPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ClientViewPage = lazy(() => import('./pages/ClientViewPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'));

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:id" element={<ClientDetailPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="team/:id" element={<TeamMemberDetailPage />} />
            <Route path="briefs" element={<BriefsPage />} />
            <Route path="briefs/new" element={<BriefEditorPage />} />
            <Route path="briefs/:id/edit" element={<BriefEditorPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="contracts/new" element={<ContractEditorPage />} />
            <Route path="contracts/:id/edit" element={<ContractEditorPage />} />
            <Route path="quotes" element={<QuotesPage />} />
            <Route path="quotes/new" element={<QuoteEditorPage />} />
            <Route path="quotes/:id/edit" element={<QuoteEditorPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="invoices/new" element={<InvoiceEditorPage />} />
            <Route path="invoices/:id/edit" element={<InvoiceEditorPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="templates" element={<TemplatesPage />} />
          </Route>
          <Route path="/view/:type/:id" element={<ClientViewPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;