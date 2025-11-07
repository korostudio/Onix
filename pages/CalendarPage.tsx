import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import LoadingPage from '../components/ui/LoadingPage';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import type { Meeting } from '../types';
import { ChevronLeft, ChevronRight, ClipboardCheck, Briefcase, Receipt, FileSignature, Clock, PlusCircle, Trash2, Edit } from 'lucide-react';
import { faker } from '@faker-js/faker';

type CalendarItem = {
  id: string;
  title: string;
  type: 'task' | 'project' | 'invoice' | 'contract' | 'meeting';
  color: string;
  icon: React.ReactNode;
  start?: string;
  end?: string;
  attendees?: any[];
  description?: string;
  rawItem: any;
};

const flatInput = "mt-1 block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-card focus:ring-primary-500 sm:text-sm";

// Meeting Form Component
const MeetingForm: React.FC<{
  meeting?: Meeting | null;
  defaultDate?: Date | null;
  onSave: (meeting: any) => void;
  onCancel: () => void;
}> = ({ meeting, defaultDate, onSave, onCancel }) => {
    const context = useContext(AppContext);
    const [formData, setFormData] = useState({
        title: meeting?.title || '',
        description: meeting?.description || '',
        startDate: meeting?.startDate ? new Date(meeting.startDate).toISOString().slice(0, 10) : defaultDate?.toISOString().slice(0, 10) || '',
        startTime: meeting?.startDate ? new Date(meeting.startDate).toTimeString().slice(0, 5) : '09:00',
        endDate: meeting?.endDate ? new Date(meeting.endDate).toISOString().slice(0, 10) : defaultDate?.toISOString().slice(0, 10) || '',
        endTime: meeting?.endDate ? new Date(meeting.endDate).toTimeString().slice(0, 5) : '10:00',
        attendees: meeting?.attendees || []
    });

    const allPossibleAttendees = useMemo(() => {
        if (!context) return [];
        return [
            ...context.team.map(t => ({ id: t.id, name: t.name, type: 'team' })),
            ...context.clients.map(c => ({ id: c.id, name: `${c.name} (Cliente)`, type: 'client' }))
        ];
    }, [context]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAttendeeToggle = (id: string) => {
        setFormData(prev => ({
            ...prev,
            attendees: prev.attendees.includes(id) ? prev.attendees.filter(aId => aId !== id) : [...prev.attendees, id]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

        onSave({
            ...meeting,
            title: formData.title,
            description: formData.description,
            startDate: startDateTime,
            endDate: endDateTime,
            attendees: formData.attendees
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Título de la reunión" required className={flatInput} />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción (opcional)" rows={3} className={flatInput} />
            <div className="grid grid-cols-2 gap-4">
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className={flatInput} />
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className={flatInput} />
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className={flatInput} />
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className={flatInput} />
            </div>
             <div>
                <label className="block text-sm font-medium mb-2">Asistentes</label>
                <div className="max-h-48 overflow-y-auto border dark:border-dark-border rounded-md p-2 space-y-2 bg-light-bg dark:bg-dark-bg">
                    {allPossibleAttendees.map(p => (
                        <label key={p.id} htmlFor={`att-${p.id}`} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800/50 cursor-pointer">
                            <input type="checkbox" id={`att-${p.id}`} checked={formData.attendees.includes(p.id)} onChange={() => handleAttendeeToggle(p.id)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                            <span className="text-sm">{p.name}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t dark:border-dark-border">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{meeting ? 'Guardar Cambios' : 'Crear Reunión'}</Button>
            </div>
        </form>
    );
};


const CalendarPage: React.FC = () => {
    const context = useContext(AppContext);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDayModalOpen, setDayModalOpen] = useState(false);
    const [isMeetingModalOpen, setMeetingModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<{ date: Date, items: CalendarItem[] } | null>(null);
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

    const eventsByDate = useMemo(() => {
        if (!context) return new Map();
        const { tasks, projects, invoices, contracts, clients, meetings } = context;
        const eventsMap = new Map<string, CalendarItem[]>();

        const addEvent = (date: Date, item: CalendarItem) => {
            const dateString = date.toISOString().split('T')[0];
            if (!eventsMap.has(dateString)) eventsMap.set(dateString, []);
            eventsMap.get(dateString)!.push(item);
        };
        
        meetings.forEach(meeting => addEvent(new Date(meeting.startDate), {
            id: meeting.id, title: meeting.title, type: 'meeting', color: 'bg-cyan-500', icon: <Clock size={16} className="text-cyan-500" />,
            start: meeting.startDate, end: meeting.endDate, attendees: meeting.attendees, description: meeting.description, rawItem: meeting
        }));
        tasks.forEach(task => addEvent(new Date(task.dueDate), {
            id: task.id, title: `Vence: ${task.title}`, type: 'task', color: 'bg-orange-500', icon: <ClipboardCheck size={16} className="text-orange-500" />, rawItem: task
        }));
        projects.forEach(p => addEvent(new Date(p.endDate), {
            id: p.id, title: `Fin: ${p.name}`, type: 'project', color: 'bg-purple-500', icon: <Briefcase size={16} className="text-purple-500" />, rawItem: p
        }));
        invoices.forEach(i => addEvent(new Date(i.dueDate), {
            id: i.id, title: `Vence Factura: ${i.invoiceNumber}`, type: 'invoice', color: 'bg-red-500', icon: <Receipt size={16} className="text-red-500" />, rawItem: i
        }));
        contracts.forEach(c => addEvent(new Date(c.endDate), {
            id: c.id, title: `Fin Contrato: ${clients.find(cl => cl.id === c.clientId)?.name || 'N/A'}`, type: 'contract', color: 'bg-green-500', icon: <FileSignature size={16} className="text-green-500" />, rawItem: c
        }));

        return eventsMap;
    }, [context]);

    if (!context || context.isLoading) return <LoadingPage />;

    const { addMeeting, updateMeeting, deleteMeeting } = context;

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();
    const calendarDays: any[] = [];
    const prevMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthEndDate - i);
        calendarDays.push({ key: `prev-${i}`, day: prevMonthEndDate - i, date: date, isCurrentMonth: false, items: eventsByDate.get(date.toISOString().split('T')[0]) || [] });
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        calendarDays.push({ key: `day-${day}`, day, date, isCurrentMonth: true, items: eventsByDate.get(date.toISOString().split('T')[0]) || [] });
    }
    const remainingSlots = (7 - (calendarDays.length % 7)) % 7;
    for (let i = 1; i <= remainingSlots; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
        calendarDays.push({ key: `next-${i}`, day: i, date, isCurrentMonth: false, items: eventsByDate.get(date.toISOString().split('T')[0]) || [] });
    }

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const handleToday = () => setCurrentDate(new Date());

    const handleDayClick = (dayData: { date: Date, items: CalendarItem[] }) => {
        setSelectedDay(dayData);
        setDayModalOpen(true);
    };

    const handleOpenMeetingModal = (meeting?: Meeting | null, date?: Date | null) => {
        setEditingMeeting(meeting || null);
        setMeetingModalOpen(true);
        if (isDayModalOpen) setDayModalOpen(false);
    };

    const handleCloseMeetingModal = () => {
        setMeetingModalOpen(false);
        setEditingMeeting(null);
    };

    const handleSaveMeeting = (meetingData: any) => {
        if (editingMeeting) {
            updateMeeting(meetingData);
        } else {
            addMeeting(meetingData);
        }
        handleCloseMeetingModal();
    };
    
    const handleDeleteMeeting = (id: string) => {
        deleteMeeting(id);
        setDayModalOpen(false);
    };
    
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6 px-1">
                <Button onClick={() => handleOpenMeetingModal(null, new Date())} leftIcon={<PlusCircle size={18} />}>Crear Reunión</Button>
                <div className="flex items-center space-x-2">
                    <button onClick={handleToday} className="px-4 py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/50 rounded-btn hover:bg-primary-200 dark:hover:bg-primary-800/50 transition">Hoy</button>
                    <button onClick={handlePrevMonth} className="p-2 rounded-btn hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"><ChevronLeft size={20} /></button>
                    <h2 className="text-xl font-semibold w-40 text-center">{currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}</h2>
                    <button onClick={handleNextMonth} className="p-2 rounded-btn hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="bg-light-card dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border shadow-sm flex-grow flex flex-col">
                <div className="grid grid-cols-7">{weekdays.map(day => <div key={day} className="py-3 text-center text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 border-b border-r border-light-border dark:border-dark-border last:border-r-0">{day}</div>)}</div>
                <div className="grid grid-cols-7 grid-rows-6 flex-grow">
                    {calendarDays.map((dayInfo) => {
                        const isToday = today.toISOString().split('T')[0] === dayInfo.date.toISOString().split('T')[0] && dayInfo.isCurrentMonth;
                        return (
                            <div key={dayInfo.key} className="relative p-2 flex flex-col overflow-hidden transition border-r border-b border-light-border dark:border-dark-border cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50" onClick={() => handleDayClick(dayInfo)}>
                                <span className={`font-semibold text-sm ${!dayInfo.isCurrentMonth ? 'text-neutral-400 dark:text-neutral-600' : ''} ${isToday ? 'bg-primary-500 text-white rounded-full w-7 h-7 flex items-center justify-center' : ''}`}>{dayInfo.day}</span>
                                <div className="mt-1.5 space-y-1 overflow-y-auto text-xs flex-grow">
                                    {dayInfo.items.slice(0, 3).map(item => <div key={item.id} className="flex items-center p-1 rounded-md" style={{ backgroundColor: `${item.color.replace('bg-', '#')}20` }}><span className={`w-2 h-2 rounded-full ${item.color} mr-1.5 flex-shrink-0`}></span><span className="truncate">{item.title}</span></div>)}
                                    {dayInfo.items.length > 3 && <div className="text-xs text-center text-neutral-500">+ {dayInfo.items.length - 3} más</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Modal isOpen={isDayModalOpen} onClose={() => setDayModalOpen(false)} title={`Eventos para ${selectedDay?.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`}>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Reuniones</h3>
                        <div className="space-y-2">
                            {selectedDay?.items.filter(i => i.type === 'meeting').length > 0
                                ? selectedDay?.items.filter(i => i.type === 'meeting').map(item => (
                                    <div key={item.id} className="group flex items-center justify-between p-3 rounded-btn bg-neutral-100 dark:bg-neutral-800">
                                        <div className="flex items-center">
                                            <div className="mr-3">{item.icon}</div>
                                            <div>
                                                <p className="font-semibold text-sm">{new Date(item.start!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {item.title}</p>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenMeetingModal(item.rawItem)} className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                                            <button onClick={() => handleDeleteMeeting(item.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                ))
                                : <p className="text-sm text-neutral-500">No hay reuniones agendadas.</p>}
                        </div>
                    </div>
                    <div>
                         <h3 className="font-semibold text-lg mb-2">Vencimientos y Plazos</h3>
                        <div className="space-y-2">
                            {selectedDay?.items.filter(i => i.type !== 'meeting').map(item => (
                                <div key={item.id} className="flex items-center p-3 rounded-btn bg-neutral-100 dark:bg-neutral-800">
                                    <div className="mr-3">{item.icon}</div>
                                    <p className="font-semibold text-sm">{item.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pt-4 border-t dark:border-dark-border text-center">
                        <Button onClick={() => handleOpenMeetingModal(null, selectedDay?.date)} leftIcon={<PlusCircle size={16}/>}>Agendar Reunión para este día</Button>
                    </div>
                </div>
            </Modal>
             <Modal isOpen={isMeetingModalOpen} onClose={handleCloseMeetingModal} title={editingMeeting ? 'Editar Reunión' : 'Agendar Nueva Reunión'}>
                <MeetingForm meeting={editingMeeting} defaultDate={selectedDay?.date} onSave={handleSaveMeeting} onCancel={handleCloseMeetingModal}/>
            </Modal>
        </div>
    );
};

export default CalendarPage;