import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import { Users, Briefcase, ClipboardCheck, FileSignature, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingPage from '../components/ui/LoadingPage';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color }) => (
  <Card className="p-6 flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
      <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{value}</p>
    </div>
  </Card>
);

const DashboardPage: React.FC = () => {
  const context = useContext(AppContext);

  if (!context || context.isLoading) {
    return <LoadingPage />;
  }

  const { clients, projects, tasks } = context;

  const activeClients = clients.filter(c => c.status === 'activo').length;
  const projectsInProgress = projects.filter(p => p.status === 'en_curso').length;
  const pendingTasks = tasks.filter(t => t.status === 'pendiente').length;
  const activeContracts = 4; // Mock data
  const monthlyRevenue = '$12,500'; // Mock data
  
  const projectStatusData = [
    { name: 'Planificación', count: projects.filter(p => p.status === 'planificacion').length },
    { name: 'En Curso', count: projectsInProgress },
    { name: 'Completado', count: projects.filter(p => p.status === 'completado').length },
    { name: 'Cancelado', count: projects.filter(p => p.status === 'cancelado').length },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <DashboardCard title="Clientes Activos" value={activeClients} icon={<Users className="w-6 h-6 text-white"/>} color="bg-blue-500" />
        <DashboardCard title="Proyectos en Curso" value={projectsInProgress} icon={<Briefcase className="w-6 h-6 text-white"/>} color="bg-purple-500" />
        <DashboardCard title="Tareas Pendientes" value={pendingTasks} icon={<ClipboardCheck className="w-6 h-6 text-white"/>} color="bg-orange-500" />
        <DashboardCard title="Contratos Activos" value={activeContracts} icon={<FileSignature className="w-6 h-6 text-white"/>} color="bg-green-500" />
        <DashboardCard title="Ingresos (Mes)" value={monthlyRevenue} icon={<DollarSign className="w-6 h-6 text-white"/>} color="bg-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Estado de Proyectos</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={projectStatusData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700"/>
                <XAxis dataKey="name" className="text-xs"/>
                <YAxis className="text-xs"/>
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                        borderColor: '#334155' 
                    }}
                    labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Bar dataKey="count" fill="#0ea5e9" name="Nº de Proyectos"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
           <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
           <ul className="space-y-4">
            {tasks.slice(0, 5).map(task => (
                <li key={task.id} className="flex items-start space-x-3">
                    <div className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-full">
                        <ClipboardCheck className="w-5 h-5 text-primary-600 dark:text-primary-400"/>
                    </div>
                    <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Vence el {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                    </div>
                </li>
            ))}
           </ul>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;