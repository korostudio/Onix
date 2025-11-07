
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import { DollarSign, Briefcase, ClipboardCheck, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingPage from '../components/ui/LoadingPage';

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
  <Card className="p-5">
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/50 mr-4 text-primary-500">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
        <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{value}</p>
      </div>
    </div>
  </Card>
);

const ReportsPage: React.FC = () => {
  const context = useContext(AppContext);

  if (!context || context.isLoading) {
    return <LoadingPage />;
  }

  const { contracts, quotes, projects, tasks, clients, team } = context;

  const totalRevenue = useMemo(() => {
    const contractRevenue = contracts.filter(c => c.status === 'firmado').reduce((sum, c) => sum + c.amount, 0);
    const quoteRevenue = quotes.filter(q => q.status === 'aceptado').reduce((sum, q) => sum + q.amount, 0);
    return contractRevenue + quoteRevenue;
  }, [contracts, quotes]);

  const projectsByClientData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    projects.forEach(p => {
      const clientName = clients.find(c => c.id === p.clientId)?.name || 'N/A';
      counts[clientName] = (counts[clientName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [projects, clients]);
  
  const revenueByMonthData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    const docs = [...contracts.filter(c => c.status === 'firmado'), ...quotes.filter(q => q.status === 'aceptado')];
    
    docs.forEach(doc => {
      const month = new Date(doc.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyData[month] = (monthlyData[month] || 0) + doc.amount;
    });

    return Object.entries(monthlyData).map(([name, revenue]) => ({ name, revenue }));
  }, [contracts, quotes]);


  const taskDistributionData = useMemo(() => {
    return team.map(member => {
      const memberTasks = tasks.filter(t => t.assignedTo === member.id);
      return {
        name: member.name,
        pendiente: memberTasks.filter(t => t.status === 'pendiente').length,
        en_progreso: memberTasks.filter(t => t.status === 'en_progreso').length,
        completada: memberTasks.filter(t => t.status === 'completada').length,
      };
    });
  }, [team, tasks]);

  const COLORS = ['#0ea5e9', '#6366f1', '#f97316', '#10b981', '#ef4444'];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Ingresos Totales" value={totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<DollarSign size={22} />} />
        <KpiCard title="Proyectos Totales" value={projects.length} icon={<Briefcase size={22} />} />
        <KpiCard title="Tareas Completadas" value={tasks.filter(t => t.status === 'completada').length} icon={<ClipboardCheck size={22} />} />
        <KpiCard title="Total de Clientes" value={clients.length} icon={<Users size={22} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <Card className="lg:col-span-3 p-6">
          <h2 className="text-xl font-semibold mb-4">Ingresos por Mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByMonthData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-light-border dark:stroke-dark-border" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: context.theme === 'dark' ? '#2d3748' : '#ffffff',
                    borderColor: context.theme === 'dark' ? '#4a5568' : '#e2e8f0',
                    borderRadius: '0.75rem',
                }}
                labelStyle={{ color: context.theme === 'dark' ? '#e2e8f0' : '#1a202c' }}
              />
              <Bar dataKey="revenue" fill="#0ea5e9" name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-semibold mb-4">Proyectos por Cliente</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={projectsByClientData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {projectsByClientData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: context.theme === 'dark' ? '#2d3748' : '#ffffff',
                    borderColor: context.theme === 'dark' ? '#4a5568' : '#e2e8f0',
                    borderRadius: '0.75rem',
                }}
                labelStyle={{ color: context.theme === 'dark' ? '#e2e8f0' : '#1a202c' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
       <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Distribución de Tareas por Equipo</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-neutral-600 dark:text-neutral-300 border-b-2 border-light-border dark:border-dark-border">
                <tr>
                  <th className="py-2 px-4">Miembro del Equipo</th>
                  <th className="py-2 px-4 text-center">Pendiente</th>
                  <th className="py-2 px-4 text-center">En Progreso</th>
                  <th className="py-2 px-4 text-center">Completada</th>
                </tr>
              </thead>
              <tbody>
                {taskDistributionData.map((member, index) => (
                  <tr key={index} className="border-t border-light-border dark:border-dark-border">
                    <td className="py-3 px-4 font-medium">{member.name}</td>
                    <td className="py-3 px-4 text-center">{member.pendiente}</td>
                    <td className="py-3 px-4 text-center">{member.en_progreso}</td>
                    <td className="py-3 px-4 text-center">{member.completada}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default ReportsPage;