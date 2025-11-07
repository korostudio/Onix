import React, { useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import { ArrowLeft, Mail, Briefcase, ClipboardCheck, User, Shield, UserCheck } from 'lucide-react';
import LoadingPage from '../components/ui/LoadingPage';
import type { Task } from '../types';

const TeamMemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const context = useContext(AppContext);

  if (!context || context.isLoading) return <LoadingPage />;

  const { team, projects, tasks } = context;

  const member = team.find(m => m.id === id);

  const memberTasks = useMemo(() => tasks.filter(t => t.assignedTo === id), [tasks, id]);
  
  const memberProjects = useMemo(() => {
    const projectIds = new Set(memberTasks.map(t => t.projectId));
    return projects.filter(p => projectIds.has(p.id));
  }, [projects, memberTasks]);

  if (!member) {
    return <div>Miembro del equipo no encontrado.</div>;
  }

  const roleInfo = {
    admin: { icon: <Shield size={16} className="mr-1.5"/>, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' },
    manager: { icon: <UserCheck size={16} className="mr-1.5"/>, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' },
    colaborador: { icon: <User size={16} className="mr-1.5"/>, color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300' },
  };

  const statusColors = {
    activo: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    inactivo: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
  };
  
  const renderTaskList = (tasksToRender: Task[], title: string) => (
    <div>
        <h4 className="font-semibold mb-2 text-neutral-700 dark:text-neutral-300">{title} ({tasksToRender.length})</h4>
        <div className="space-y-2">
            {tasksToRender.length > 0 ? tasksToRender.map(task => (
                <div key={task.id} className="p-3 text-sm bg-white dark:bg-neutral-800/50 border dark:border-neutral-700/50 rounded-md">
                    <p className="font-medium text-neutral-800 dark:text-neutral-100">{task.title}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Vence: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
            )) : <p className="text-sm text-neutral-500 dark:text-neutral-400">No hay tareas.</p>}
        </div>
    </div>
  );

  return (
    <div>
      <Link to="/team" className="flex items-center text-sm text-primary-500 hover:underline mb-4">
        <ArrowLeft size={16} className="mr-1" />
        Volver al Equipo
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-6 text-center">
            <img src={member.avatar} alt={member.name} className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-white dark:border-neutral-800 shadow-md" />
            <h1 className="text-2xl font-bold">{member.name}</h1>
            <div className="flex items-center justify-center mt-2 space-x-2 text-neutral-500 dark:text-neutral-400">
                <Mail size={14}/>
                <span>{member.email}</span>
            </div>
            <div className="mt-4 flex justify-center items-center gap-2">
               <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center ${roleInfo[member.role].color}`}>
                 {roleInfo[member.role].icon}
                 {member.role}
               </span>
               <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[member.status]}`}>
                 {member.status}
               </span>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <div className="p-5">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Briefcase size={20} className="mr-2 text-primary-500"/>
                        Proyectos Asignados ({memberProjects.length})
                    </h2>
                    <div className="space-y-3">
                        {memberProjects.length > 0 ? memberProjects.map(project => (
                             <div key={project.id} className="p-4 rounded-lg border dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                <h3 className="font-semibold">{project.name}</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Estado: {project.status}</p>
                                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mt-2">
                                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                </div>
                            </div>
                        )) : <p className="text-neutral-500">No hay proyectos asignados.</p>}
                    </div>
                </div>
            </Card>

            <Card>
                <div className="p-5">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <ClipboardCheck size={20} className="mr-2 text-primary-500"/>
                        Tareas Asignadas ({memberTasks.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {renderTaskList(memberTasks.filter(t => t.status === 'pendiente'), 'Pendiente')}
                        {renderTaskList(memberTasks.filter(t => t.status === 'en_progreso'), 'En Progreso')}
                        {renderTaskList(memberTasks.filter(t => t.status === 'completada'), 'Completada')}
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDetailPage;
