

import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import type { TeamMember, UserRole } from '../types';
import { PlusCircle, Edit, Trash2, Users, Shield, UserCheck, User } from 'lucide-react';
import LoadingPage from '../components/ui/LoadingPage';
import { Link } from 'react-router-dom';

const flatInput = "block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-card focus:ring-primary-500 sm:text-sm";

const TeamMemberForm: React.FC<{ member?: TeamMember | null; onSave: (member: any) => void; onCancel: () => void; }> = ({ member, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    email: member?.email || '',
    role: member?.role || 'colaborador',
    status: member?.status || 'activo',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...member, ...formData });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="name" placeholder="Nombre completo" value={formData.name} onChange={handleChange} required className={flatInput} />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className={flatInput} />
      <div className="grid grid-cols-2 gap-4">
        <select name="role" value={formData.role} onChange={handleChange} className={flatInput}>
          <option value="colaborador">Colaborador</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <select name="status" value={formData.status} onChange={handleChange} className={flatInput}>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>
       <div className="mt-6 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{member ? 'Guardar Cambios' : 'Añadir Miembro'}</Button>
      </div>
    </form>
  )
}

const KpiCard: React.FC<{ title: string; value: number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <Card className="p-5 flex items-center">
        <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-500 mr-4">{icon}</div>
        <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </Card>
);

const TeamPage: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all');

  if (!context || context.isLoading) return <LoadingPage />;

  const { team, tasks, projects, addTeamMember, updateTeamMember, deleteTeamMember } = context;
  
  const handleOpenModal = (member?: TeamMember) => {
    setEditingMember(member || null);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };
  const handleSaveMember = (memberData: TeamMember) => {
    if (editingMember) {
      updateTeamMember(memberData);
    } else {
      addTeamMember(memberData);
    }
    handleCloseModal();
  };
  
  const filteredTeam = useMemo(() => {
    return team.filter(member => {
      const searchMatch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = roleFilter === 'all' || member.role === roleFilter;
      const statusMatch = statusFilter === 'all' || member.status === statusFilter;
      return searchMatch && roleMatch && statusMatch;
    });
  }, [team, searchTerm, roleFilter, statusFilter]);

  const roleColors: Record<TeamMember['role'], string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    manager: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    colaborador: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
  };
  
  const statusColors: Record<TeamMember['status'], string> = {
    activo: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    inactivo: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
  };

  const getMemberTaskCount = (memberId: string) => tasks.filter(t => t.assignedTo === memberId).length;
  const getMemberProjectCount = (memberId: string) => {
      const memberTasks = tasks.filter(t => t.assignedTo === memberId);
      const projectIds = new Set(memberTasks.map(t => t.projectId));
      return projectIds.size;
  }

  return (
    <div>
      <div className="flex justify-end items-center mb-6">
        <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle size={18} />}>
          Añadir Miembro
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard title="Total Miembros" value={team.length} icon={<Users size={22}/>}/>
          <KpiCard title="Admins" value={team.filter(m => m.role === 'admin').length} icon={<Shield size={22}/>}/>
          <KpiCard title="Managers" value={team.filter(m => m.role === 'manager').length} icon={<UserCheck size={22}/>}/>
          <KpiCard title="Colaboradores" value={team.filter(m => m.role === 'colaborador').length} icon={<User size={22}/>}/>
      </div>

      <Card>
        <div className="p-4 flex flex-col md:flex-row gap-4">
            <input 
                type="text" 
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm"
            />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="w-full md:w-auto bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm">
                <option value="all">Todos los Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="colaborador">Colaborador</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full md:w-auto bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm">
                <option value="all">Todos los Estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
            </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-700 uppercase dark:text-neutral-300 border-b-2 border-light-border dark:border-dark-border">
                  <tr>
                      <th className="px-6 py-4">Miembro</th>
                      <th className="px-6 py-4">Rol</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-center">Proyectos</th>
                      <th className="px-6 py-4 text-center">Tareas</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
              </thead>
              <tbody>
                  {filteredTeam.map(member => (
                      <tr key={member.id} className="hover:bg-neutral-50 dark:hover:bg-white/5 border-b border-light-border dark:border-dark-border last:border-b-0">
                          <td className="px-6 py-4">
                              <div className="flex items-center">
                                  <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full mr-3"/>
                                  <div>
                                      <Link to={`/team/${member.id}`} className="font-semibold text-neutral-800 dark:text-white hover:underline">
                                        {member.name}
                                      </Link>
                                      <div className="text-neutral-500 dark:text-neutral-400">{member.email}</div>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[member.role]}`}>{member.role}</span>
                          </td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[member.status]}`}>{member.status}</span>
                          </td>
                          <td className="px-6 py-4 text-center font-medium">{getMemberProjectCount(member.id)}</td>
                          <td className="px-6 py-4 text-center font-medium">{getMemberTaskCount(member.id)}</td>
                          <td className="px-6 py-4 text-right">
                              <button onClick={() => handleOpenModal(member)} className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                              <button onClick={() => deleteTeamMember(member.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
        </div>
      </Card>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMember ? 'Editar Miembro' : 'Añadir Nuevo Miembro'}>
        <TeamMemberForm member={editingMember} onSave={handleSaveMember} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default TeamPage;