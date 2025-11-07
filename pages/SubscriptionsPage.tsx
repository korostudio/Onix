
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import type { Subscription, BillingCycle, SubscriptionStatus } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { PlusCircle, Edit, Trash2, ExternalLink, DollarSign, List, LayoutGrid, PieChart } from 'lucide-react';
import Modal from '../components/ui/Modal';
import LoadingPage from '../components/ui/LoadingPage';
import SearchableSelect from '../components/ui/SearchableSelect';

const flatInput = "mt-1 block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-card focus:ring-primary-500 sm:text-sm";

const SubscriptionForm: React.FC<{
  subscription?: Subscription | null;
  onSave: (subscription: Omit<Subscription, 'id'> | Subscription) => void;
  onCancel: () => void;
}> = ({ subscription, onSave, onCancel }) => {
  const context = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: subscription?.name || '',
    assignedTo: subscription?.assignedTo || '',
    cost: subscription?.cost || 0,
    billingCycle: subscription?.billingCycle || 'mensual',
    renewalDate: subscription?.renewalDate ? new Date(subscription.renewalDate).toISOString().split('T')[0] : '',
    status: subscription?.status || 'activo',
    url: subscription?.url || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).type === 'number' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...subscription, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Nombre del Servicio</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required className={flatInput} />
      </div>
       <div>
        <label className="block text-sm font-medium">Asignado a</label>
        <SearchableSelect
            options={context?.team || []}
            value={formData.assignedTo}
            onChange={(id) => handleChange({ target: { name: 'assignedTo', value: id } } as any)}
            placeholder="Seleccionar miembro"
            required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium">Costo</label>
            <input type="number" name="cost" value={formData.cost} onChange={handleChange} step="0.01" required className={flatInput} />
        </div>
        <div>
            <label className="block text-sm font-medium">Ciclo de Facturación</label>
            <select name="billingCycle" value={formData.billingCycle} onChange={handleChange} className={flatInput}>
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
            </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Fecha de Renovación</label>
        <input type="date" name="renewalDate" value={formData.renewalDate} onChange={handleChange} required className={flatInput} />
      </div>
       <div>
          <label className="block text-sm font-medium">URL (Opcional)</label>
          <input type="url" name="url" value={formData.url} onChange={handleChange} className={flatInput} />
        </div>
      <div>
        <label className="block text-sm font-medium">Estado</label>
        <select name="status" value={formData.status} onChange={handleChange} className={flatInput}>
          <option value="activo">Activo</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{subscription ? 'Guardar Cambios' : 'Crear Suscripción'}</Button>
      </div>
    </form>
  );
};

const SubscriptionsPage: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card' | 'summary'>('list');

  if (!context || context.isLoading) return <LoadingPage />;

  const { subscriptions, team, addSubscription, updateSubscription, deleteSubscription } = context;
  
  const handleOpenModal = (subscription?: Subscription) => {
    setEditingSubscription(subscription || null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubscription(null);
  };

  const handleSaveSubscription = (subscriptionData: Subscription) => {
    if (editingSubscription) {
      updateSubscription(subscriptionData);
    } else {
      addSubscription(subscriptionData);
    }
    handleCloseModal();
  };
  
  const statusColors: Record<SubscriptionStatus, string> = {
    activo: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };

  const getTeamMember = (memberId: string) => team.find(m => m.id === memberId);

  const formatPrice = (price: number, cycle: BillingCycle) => {
      const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
      return `${formattedPrice} / ${cycle === 'mensual' ? 'mes' : 'año'}`;
  }
  
  const ViewSwitcher = () => (
    <div className="flex items-center rounded-btn border border-light-border dark:border-dark-border p-0.5">
        <button 
            onClick={() => setViewMode('list')} 
            className={`p-1.5 rounded-btn transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-border'}`}
            aria-label="Vista de lista"
        >
            <List size={18} />
        </button>
        <button 
            onClick={() => setViewMode('card')}
            className={`p-1.5 rounded-btn transition-colors ${viewMode === 'card' ? 'bg-primary-500 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-border'}`}
            aria-label="Vista de tarjetas"
        >
            <LayoutGrid size={18} />
        </button>
        <button 
            onClick={() => setViewMode('summary')}
            className={`p-1.5 rounded-btn transition-colors ${viewMode === 'summary' ? 'bg-primary-500 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-border'}`}
            aria-label="Vista de resumen"
        >
            <PieChart size={18} />
        </button>
    </div>
  );

  const ListView = () => (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-neutral-500 dark:text-neutral-400">
          <thead className="text-xs text-neutral-700 uppercase dark:text-neutral-300 border-b-2 border-light-border dark:border-dark-border">
            <tr>
              <th scope="col" className="px-6 py-4">Servicio</th>
              <th scope="col" className="px-6 py-4">Asignado a</th>
              <th scope="col" className="px-6 py-4">Costo</th>
              <th scope="col" className="px-6 py-4">Próxima Renovación</th>
              <th scope="col" className="px-6 py-4">Estado</th>
              <th scope="col" className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map(subscription => {
              const member = getTeamMember(subscription.assignedTo);
              return (
                  <tr key={subscription.id} className="hover:bg-neutral-50 dark:hover:bg-white/5 border-b border-light-border dark:border-dark-border last:border-b-0">
                      <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center">
                             <span>{subscription.name}</span>
                             {subscription.url && (
                                 <a href={subscription.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary-500 hover:text-primary-700">
                                     <ExternalLink size={14} />
                                 </a>
                             )}
                          </div>
                      </td>
                      <td className="px-6 py-4">
                          {member && (
                              <div className="flex items-center">
                                  <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full mr-3"/>
                                  <span>{member.name}</span>
                              </div>
                          )}
                      </td>
                      <td className="px-6 py-4 font-mono">{formatPrice(subscription.cost, subscription.billingCycle)}</td>
                      <td className="px-6 py-4">{new Date(subscription.renewalDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[subscription.status]}`}>{subscription.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleOpenModal(subscription)} className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                          <button onClick={() => deleteSubscription(subscription.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                      </td>
                  </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subscriptions.map(subscription => {
        const member = getTeamMember(subscription.assignedTo);
        return (
          <Card key={subscription.id} className="p-5 flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 flex items-center">
                  {subscription.name}
                  {subscription.url && (
                    <a href={subscription.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary-500 hover:text-primary-700">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[subscription.status]}`}>{subscription.status}</span>
              </div>
              <p className="font-semibold text-xl font-mono text-primary-500 mb-3">
                {formatPrice(subscription.cost, subscription.billingCycle)}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Próxima renovación: <span className="font-medium text-neutral-700 dark:text-neutral-300">{new Date(subscription.renewalDate).toLocaleDateString()}</span>
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border flex justify-between items-center">
              {member && (
                <div className="flex items-center text-sm">
                  <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full mr-2" />
                  <span className="font-medium">{member.name}</span>
                </div>
              )}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                <button onClick={() => handleOpenModal(subscription)} className="p-2 text-blue-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full"><Edit size={16} /></button>
                <button onClick={() => deleteSubscription(subscription.id)} className="p-2 text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full"><Trash2 size={16} /></button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const SummaryView = () => {
    const totalMonthlyCost = useMemo(() => {
        return subscriptions
          .filter(sub => sub.status === 'activo')
          .reduce((total, sub) => {
            if (sub.billingCycle === 'anual') {
              return total + sub.cost / 12;
            }
            return total + sub.cost;
          }, 0);
      }, [subscriptions]);

    const costByMember = useMemo(() => {
        const memberCosts: Record<string, { name: string; avatar: string; cost: number }> = {};
        subscriptions
            .filter(sub => sub.status === 'activo')
            .forEach(sub => {
                const member = getTeamMember(sub.assignedTo);
                if (member) {
                    if (!memberCosts[member.id]) {
                        memberCosts[member.id] = { name: member.name, avatar: member.avatar, cost: 0 };
                    }
                    const monthlyCost = sub.billingCycle === 'anual' ? sub.cost / 12 : sub.cost;
                    memberCosts[member.id].cost += monthlyCost;
                }
            });
        return Object.values(memberCosts).sort((a, b) => b.cost - a.cost);
    }, [subscriptions, team]);
    
    const upcomingRenewals = useMemo(() => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const today = new Date();
        today.setHours(0,0,0,0); // set to start of day
        return subscriptions
            .filter(sub => sub.status === 'activo' && new Date(sub.renewalDate) <= thirtyDaysFromNow && new Date(sub.renewalDate) >= today)
            .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
    }, [subscriptions]);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-5 lg:col-span-1">
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50 mr-4 text-green-600 dark:text-green-400">
                        <DollarSign size={22} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Gasto Mensual Total</p>
                        <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalMonthlyCost)}
                        </p>
                    </div>
                </div>
            </Card>
            <Card className="p-5 lg:col-span-1">
                <h3 className="font-semibold mb-3">Costos por Miembro (Mensual)</h3>
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {costByMember.map(member => (
                        <li key={member.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <img src={member.avatar} alt={member.name} className="w-7 h-7 rounded-full mr-2"/>
                                <span>{member.name}</span>
                            </div>
                            <span className="font-semibold font-mono">{formatPrice(member.cost, 'mensual').split(' / ')[0]}</span>
                        </li>
                    ))}
                </ul>
            </Card>
            <Card className="p-5 lg:col-span-1">
                <h3 className="font-semibold mb-3">Próximas Renovaciones (30 días)</h3>
                 <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {upcomingRenewals.length > 0 ? upcomingRenewals.map(sub => (
                        <li key={sub.id} className="flex items-center justify-between text-sm">
                            <span>{sub.name}</span>
                            <span className="font-semibold">{new Date(sub.renewalDate).toLocaleDateString()}</span>
                        </li>
                    )) : <p className="text-sm text-neutral-500">No hay renovaciones próximas.</p>}
                </ul>
            </Card>
        </div>
    );
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div /> {/* Empty div for alignment */}
        <div className="flex items-center space-x-4">
          <ViewSwitcher />
          <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle size={18} />}>
            Añadir Suscripción
          </Button>
        </div>
      </div>

      {viewMode === 'list' && <ListView />}
      {viewMode === 'card' && <CardView />}
      {viewMode === 'summary' && <SummaryView />}
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSubscription ? 'Editar Suscripción' : 'Añadir Nueva Suscripción'}>
        <SubscriptionForm subscription={editingSubscription} onSave={handleSaveSubscription} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default SubscriptionsPage;
