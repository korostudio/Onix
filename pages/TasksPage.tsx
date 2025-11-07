
import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import type { Task, TeamMember, TaskPriority, TaskStatus, Subtask, Tag, TaskImportance, TaskUrgency, Project } from '../types';
import { PlusCircle, Edit, Trash2, Search, Filter, LayoutDashboard, Target, Grid, GanttChartSquare, Check, X, CheckSquare, Square, Calendar, MessageSquare, Paperclip, MoreVertical, Play, Pause, RotateCcw, ChevronDown, ChevronLeft, ChevronRight, Loader, Info, CheckCircle2, Flag, User } from 'lucide-react';
import LoadingPage from '../components/ui/LoadingPage';
import { faker } from '@faker-js/faker';
import SearchableSelect from '../components/ui/SearchableSelect';

// --- TYPES & CONSTANTS ---
type TaskView = 'kanban' | 'focus' | 'matrix' | 'timeline';
const flatInput = "block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-card focus:ring-primary-500 sm:text-sm";

const KANBAN_COLUMNS: { title: string; status: TaskStatus; icon: React.ReactNode; textColor: string; columnBg: string; addTaskTextColor: string; }[] = [
    { title: 'Pendiente', status: 'pendiente', icon: <Loader size={14} />, textColor: 'text-neutral-500 dark:text-neutral-400', columnBg: 'bg-neutral-100 dark:bg-dark-card', addTaskTextColor: 'text-neutral-500 dark:text-neutral-400' },
    { title: 'En Curso', status: 'en_progreso', icon: <Info size={14} />, textColor: 'text-violet-500 dark:text-violet-400', columnBg: 'bg-violet-100/50 dark:bg-violet-900/30', addTaskTextColor: 'text-violet-500 dark:text-violet-400' },
    { title: 'Completado', status: 'completada', icon: <CheckCircle2 size={14} />, textColor: 'text-emerald-500 dark:text-emerald-400', columnBg: 'bg-emerald-100/50 dark:bg-emerald-900/30', addTaskTextColor: 'text-emerald-500 dark:text-emerald-400' },
];

// --- HELPER FUNCTIONS ---
const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`;
};

// --- SUB-COMPONENTS ---
const TaskCard: React.FC<{ task: Task; onDragStart: (e: React.DragEvent, taskId: string) => void; onClick: () => void; }> = ({ task, onDragStart, onClick }) => {
  const context = useContext(AppContext);
  const project = context?.projects.find(p => p.id === task.projectId);
  const assignee = context?.team.find(m => m.id === task.assignedTo);
  
  const priorityInfo: Record<TaskPriority, { label: string; color: string; }> = {
    baja: { label: 'Baja', color: 'text-sky-600 dark:text-sky-400' },
    media: { label: 'Media', color: 'text-amber-600 dark:text-amber-400' },
    alta: { label: 'Alta', color: 'text-red-600 dark:text-red-400' },
  };
  const currentPriority = priorityInfo[task.priority];

  return (
    <div 
      draggable={task.status !== 'completada'}
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={onClick}
      className="group relative p-4 mb-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700/80 shadow-sm cursor-pointer hover:border-primary-500/50 transition-all duration-150"
    >
      {/* Hover actions */}
      <div className="absolute top-2 right-2 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-100/90 dark:bg-neutral-700/90 rounded-md p-0.5">
          <button onClick={(e) => { e.stopPropagation(); context?.updateTaskStatus(task.id, 'completada'); }} className="p-1.5 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:text-black dark:hover:text-white" title="Completar"><Check size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); /* Add subtask logic */ }} className="p-1.5 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:text-black dark:hover:text-white" title="Añadir Subtarea"><PlusCircle size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="p-1.5 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:text-black dark:hover:text-white" title="Editar"><Edit size={16} /></button>
          <button className="p-1.5 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:text-black dark:hover:text-white" title="Más"><MoreVertical size={16} /></button>
      </div>

      <h4 className={`font-semibold text-neutral-800 dark:text-neutral-100 mb-1`}>{task.title}</h4>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">{project?.name || 'Proyecto no asignado'}</p>
      
      <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center">
            <User size={14} className="mr-2 text-neutral-400"/>
            {assignee ? assignee.name : 'No asignado'}
        </div>
        <div className="flex items-center">
            <Calendar size={14} className="mr-2 text-neutral-400"/>
            {new Date(task.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
        </div>
        <div className={`flex items-center ${currentPriority.color}`}>
            <Flag size={14} className="mr-2"/>
            {currentPriority.label}
        </div>
      </div>
    </div>
  );
};

const KanbanView: React.FC<{ tasks: Task[]; onCardClick: (task: Task) => void; onNewTask: (status: TaskStatus) => void; }> = ({ tasks, onCardClick, onNewTask }) => {
  const context = useContext(AppContext);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      context?.updateTaskStatus(taskId, status);
      setDraggedTaskId(null);
    }
  };
  
  return (
    <div className="flex items-start overflow-x-auto space-x-4 pb-4 h-full bg-white dark:bg-dark-bg p-4 -m-6">
      {KANBAN_COLUMNS.map(column => {
          const columnTasks = tasks.filter(task => task.status === column.status);
          return (
            <div 
              key={column.status} 
              className={`w-80 flex-shrink-0 ${column.columnBg} rounded-xl flex flex-col`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              <div className="flex items-center justify-between p-3">
                  <div className={`flex items-center space-x-2 font-semibold text-sm uppercase tracking-wider ${column.textColor}`}>
                    {column.icon}
                    <h3>{column.title}</h3>
                  </div>
                  <span className="text-sm font-bold bg-black/5 dark:bg-white/10 text-neutral-500 dark:text-neutral-300 rounded-full px-2.5 py-0.5">{columnTasks.length}</span>
              </div>
              <div className="overflow-y-auto flex-grow p-2">
                {columnTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onCardClick(task)}
                    />
                  ))}
              </div>
               <button 
                  onClick={() => onNewTask(column.status)} 
                  className={`m-2 p-2 text-sm font-medium ${column.addTaskTextColor} hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center`}
                >
                    <PlusCircle size={16} className="mr-2"/> Añadir Tarea
                </button>
            </div>
          )
        })}
        <div className="w-80 flex-shrink-0">
            <button className="w-full p-3 text-sm font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-card rounded-lg transition-colors flex items-center">
                <PlusCircle size={16} className="mr-2"/> Añadir grupo
            </button>
        </div>
    </div>
  );
};


const MatrixView: React.FC<{ tasks: Task[]; onCardClick: (task: Task) => void }> = ({ tasks, onCardClick }) => {
    const context = useContext(AppContext);
    const quadrants: { title: string; importance: TaskImportance; urgency: TaskUrgency; color: string; }[] = [
        { title: 'Hacer Ahora', importance: 'alta', urgency: 'alta', color: 'border-red-500' },
        { title: 'Planificar', importance: 'alta', urgency: 'baja', color: 'border-blue-500' },
        { title: 'Delegar', importance: 'baja', urgency: 'alta', color: 'border-orange-500' },
        { title: 'Eliminar', importance: 'baja', urgency: 'baja', color: 'border-gray-500' },
    ];
    
    // Minimal Task Card for Matrix view to avoid clutter
    const MatrixTaskCard: React.FC<{ task: Task; onDragStart: (e: React.DragEvent, taskId: string) => void; onClick: () => void; }> = ({ task, onDragStart, onClick }) => (
         <div draggable onDragStart={(e) => onDragStart(e, task.id)} onClick={onClick} className="p-2 mb-2 bg-light-card dark:bg-dark-card rounded-md border border-light-border dark:border-dark-border cursor-pointer text-sm">
            {task.title}
        </div>
    );

    const handleDragStart = (e: React.DragEvent, taskId: string) => e.dataTransfer.setData('taskId', taskId);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (e: React.DragEvent, importance: TaskImportance, urgency: TaskUrgency) => {
        const taskId = e.dataTransfer.getData('taskId');
        context?.updateTaskMatrixPosition(taskId, urgency, importance);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            {quadrants.map(q => (
                <div 
                    key={q.title} 
                    className={`p-4 rounded-card bg-neutral-50 dark:bg-dark-bg/50 border-2 border-dashed ${q.color} flex flex-col`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, q.importance, q.urgency)}
                >
                    <h3 className={`font-bold text-xl mb-3 text-center ${q.color.replace('border-', 'text-')}`}>{q.title}</h3>
                    <div className="overflow-y-auto flex-grow pr-2 -mr-2">
                        {tasks
                            .filter(t => t.importance === q.importance && t.urgency === q.urgency)
                            .map(task => <MatrixTaskCard key={task.id} task={task} onDragStart={(e) => handleDragStart(e, task.id)} onClick={() => onCardClick(task)} />)}
                    </div>
                </div>
            ))}
        </div>
    );
};

const TimeInput: React.FC<{ seconds: number; onChange: (seconds: number) => void; disabled: boolean; }> = ({ seconds, onChange, disabled }) => {
    const time = useMemo(() => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return { h, m, s };
    }, [seconds]);

    const handleChange = (part: 'h' | 'm' | 's', value: string) => {
        const numValue = parseInt(value, 10) || 0;
        const newTime = { ...time, [part]: numValue };
        onChange(newTime.h * 3600 + newTime.m * 60 + newTime.s);
    };
    
    const inputClasses = "w-14 text-center bg-light-bg dark:bg-dark-bg p-2 rounded-md font-mono text-sm focus:ring-1 focus:ring-primary-500 focus:outline-none disabled:opacity-70";

    return (
        <div className="flex items-center space-x-1">
            <input type="number" min="0" max="99" value={time.h.toString().padStart(2, '0')} onChange={e => handleChange('h', e.target.value)} disabled={disabled} className={inputClasses} aria-label="Hours"/>
            <span className="font-bold text-neutral-400">:</span>
            <input type="number" min="0" max="59" value={time.m.toString().padStart(2, '0')} onChange={e => handleChange('m', e.target.value)} disabled={disabled} className={inputClasses} aria-label="Minutes"/>
            <span className="font-bold text-neutral-400">:</span>
            <input type="number" min="0" max="59" value={time.s.toString().padStart(2, '0')} onChange={e => handleChange('s', e.target.value)} disabled={disabled} className={inputClasses} aria-label="Seconds"/>
        </div>
    );
};


const FocusView: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const context = useContext(AppContext);
    const [workDuration, setWorkDuration] = useState(25 * 60);
    const [breakDuration, setBreakDuration] = useState(5 * 60);
    const [mode, setMode] = useState<'work' | 'break'>('work');
    const [timeLeft, setTimeLeft] = useState(workDuration);
    const [isActive, setIsActive] = useState(false);
    const [selectedFocusTaskId, setSelectedFocusTaskId] = useState<string | null>(null);
    const timerRef = useRef<number | null>(null);

    const focusTasks = useMemo(() => {
        return tasks.filter(t => 
            t.status !== 'completada' && 
            (
                (t.importance === 'alta' && t.urgency === 'alta') ||
                t.assignedTo === context?.currentUser.id
            )
        ).slice(0, 5); // Limit to 5 tasks for focus
    }, [tasks, context?.currentUser.id]);

    useEffect(() => {
        if (!selectedFocusTaskId && focusTasks.length > 0) {
            setSelectedFocusTaskId(focusTasks[0].id);
        }
    }, [focusTasks, selectedFocusTaskId]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsActive(false);
            const nextMode = mode === 'work' ? 'break' : 'work';
            setMode(nextMode);
            setTimeLeft(nextMode === 'work' ? workDuration : breakDuration);
            new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3').play();
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) };
    }, [isActive, timeLeft, mode, workDuration, breakDuration]);
    
    useEffect(() => {
        if (!isActive) {
            setTimeLeft(mode === 'work' ? workDuration : breakDuration);
        }
    }, [workDuration, breakDuration, mode, isActive]);

    const toggleTimer = () => setIsActive(!isActive);
    
    const resetTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsActive(false);
        setTimeLeft(mode === 'work' ? workDuration : breakDuration);
    };
    
    const switchMode = (newMode: 'work' | 'break') => {
        if (isActive) return;
        setMode(newMode);
    };

    const totalDuration = mode === 'work' ? workDuration : breakDuration;
    const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
    const selectedTask = tasks.find(t => t.id === selectedFocusTaskId);
    
    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
            <Card className="lg:col-span-1 p-6 flex flex-col items-center justify-between">
                <div className="w-full">
                    <div className="flex justify-center bg-neutral-100 dark:bg-dark-bg p-1 rounded-full mb-6">
                        <button onClick={() => switchMode('work')} className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors ${mode === 'work' ? 'bg-white dark:bg-dark-card shadow' : ''}`}>Foco</button>
                        <button onClick={() => switchMode('break')} className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors ${mode === 'break' ? 'bg-white dark:bg-dark-card shadow' : ''}`}>Descanso</button>
                    </div>

                    <div className="relative text-center">
                        <p className={`text-6xl font-mono font-bold transition-colors ${mode === 'work' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            {formatTime(timeLeft)}
                        </p>
                        <p className="mt-2 text-lg font-medium text-neutral-600 dark:text-neutral-300 truncate h-7">
                            {mode === 'work' ? (selectedTask?.title || 'Selecciona una tarea') : 'Toma un respiro'}
                        </p>
                    </div>

                    <div className="w-full mt-6">
                        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                            <div className={`h-2 rounded-full transition-all duration-500 ${mode === 'work' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <label className="font-semibold text-neutral-700 dark:text-neutral-300">Duración Foco</label>
                        <TimeInput seconds={workDuration} onChange={setWorkDuration} disabled={isActive} />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <label className="font-semibold text-neutral-700 dark:text-neutral-300">Duración Descanso</label>
                        <TimeInput seconds={breakDuration} onChange={setBreakDuration} disabled={isActive} />
                    </div>
                </div>
                
                <div className="flex items-center justify-center space-x-6 w-full">
                    <button
                        onClick={toggleTimer}
                        className={`
                            w-28 h-28 rounded-full flex flex-col items-center justify-center text-white
                            font-bold uppercase tracking-wider text-sm transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105
                            focus:outline-none focus:ring-4 ring-opacity-50 ring-offset-2 dark:focus:ring-offset-dark-card
                            ${mode === 'work'
                                ? (isActive ? 'bg-red-700 hover:bg-red-800 focus:ring-red-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500')
                                : (isActive ? 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500')
                            }
                        `}
                        aria-label={isActive ? 'Pausar temporizador' : 'Iniciar temporizador'}
                    >
                        {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1"/>}
                        <span className="mt-1">{isActive ? 'Pausar' : 'Iniciar'}</span>
                    </button>
                    
                    <Button 
                        onClick={resetTimer} 
                        size="lg" 
                        variant="secondary" 
                        className="!rounded-full !w-20 !h-20 !p-0"
                        aria-label="Resetear temporizador"
                    >
                        <RotateCcw size={24}/>
                    </Button>
                </div>

            </Card>

            <Card className="lg:col-span-2 p-6">
                <h3 className="text-2xl font-bold mb-4">Lista de Foco</h3>
                <div className="space-y-3 h-full overflow-y-auto">
                    {focusTasks.map(task => (
                        <div 
                            key={task.id} 
                            onClick={() => setSelectedFocusTaskId(task.id)}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedFocusTaskId === task.id ? 'bg-primary-100 dark:bg-primary-900/50 ring-2 ring-primary-500' : 'bg-light-bg dark:bg-dark-bg hover:bg-neutral-100 dark:hover:bg-neutral-800/50'}`}
                        >
                            <div>
                                <p className="font-semibold">{task.title}</p>
                                <p className="text-xs text-neutral-500">{context?.projects.find(p => p.id === task.projectId)?.name}</p>
                            </div>
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); context?.updateTaskStatus(task.id, 'completada'); if (selectedFocusTaskId === task.id) setSelectedFocusTaskId(null); }} leftIcon={<Check size={16}/>}>Completar</Button>
                        </div>
                    ))}
                    {focusTasks.length === 0 && <p className="text-neutral-500 text-center py-8">¡Sin tareas urgentes! Tómate un respiro.</p>}
                </div>
            </Card>
        </div>
    );
};

// --- REDESIGNED TIMELINE VIEW ---
const TimelineView: React.FC<{ tasks: Task[]; projects: Project[]; onTaskClick: (task: Task) => void; team: TeamMember[] }> = ({ tasks, projects, onTaskClick, team }) => {
    type ViewMode = 'week' | 'month' | 'quarter';
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [referenceDate, setReferenceDate] = useState(new Date());
    const [tooltip, setTooltip] = useState<{ content: React.ReactNode; x: number; y: number } | null>(null);

    const statusColors: Record<TaskStatus, { bg: string; border: string }> = {
        pendiente: { bg: 'bg-sky-500/80', border: 'border-sky-700' },
        en_progreso: { bg: 'bg-amber-500/80', border: 'border-amber-700' },
        en_revision: { bg: 'bg-violet-500/80', border: 'border-violet-700' },
        completada: { bg: 'bg-emerald-500/80', border: 'border-emerald-700' },
    };

    const dateHelpers = useMemo(() => {
        const addDays = (date: Date, days: number) => {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };
        const differenceInDays = (later: Date, earlier: Date) => {
            const utcLater = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate());
            const utcEarlier = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
            return Math.floor((utcLater - utcEarlier) / (1000 * 60 * 60 * 24));
        };
        return { addDays, differenceInDays };
    }, []);

    const { range, headers, totalDays } = useMemo(() => {
        const startOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
        const endOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
        const startOfWeek = dateHelpers.addDays(referenceDate, -referenceDate.getDay());
        const endOfWeek = dateHelpers.addDays(startOfWeek, 6);
        const startOfQuarter = new Date(referenceDate.getFullYear(), Math.floor(referenceDate.getMonth() / 3) * 3, 1);
        const endOfQuarter = new Date(startOfQuarter.getFullYear(), startOfQuarter.getMonth() + 3, 0);

        let rangeStart: Date, rangeEnd: Date;
        let primaryHeaders: { label: string; colSpan: number }[] = [];
        let secondaryHeaders: { label: string }[] = [];

        switch (viewMode) {
            case 'week':
                rangeStart = startOfWeek;
                rangeEnd = endOfWeek;
                for (let i = 0; i < 7; i++) {
                    const day = dateHelpers.addDays(rangeStart, i);
                    primaryHeaders.push({ label: day.toLocaleString('es-ES', { weekday: 'short', day: 'numeric' }), colSpan: 1 });
                }
                break;
            case 'quarter':
                 rangeStart = startOfQuarter;
                 rangeEnd = endOfQuarter;
                 for (let i = 0; i < 3; i++) {
                     const monthDate = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + i, 1);
                     const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
                     primaryHeaders.push({ label: monthDate.toLocaleString('es-ES', { month: 'long' }), colSpan: daysInMonth });
                 }
                 break;
            case 'month':
            default:
                rangeStart = startOfMonth;
                rangeEnd = endOfMonth;
                const daysInMonth = endOfMonth.getDate();
                for (let i = 1; i <= daysInMonth; i++) {
                    secondaryHeaders.push({ label: i.toString() });
                }
                const weeks = Math.ceil((daysInMonth + startOfMonth.getDay()) / 7);
                for (let i = 0; i < weeks; i++) {
                    const weekStartDay = i * 7 - startOfMonth.getDay() + 1;
                    const colSpan = Math.min(7, daysInMonth - weekStartDay + 1);
                    if (colSpan > 0) primaryHeaders.push({ label: `Semana ${i + 1}`, colSpan });
                }
                break;
        }
        
        const totalDays = dateHelpers.differenceInDays(rangeEnd, rangeStart) + 1;
        return { range: { start: rangeStart, end: rangeEnd }, headers: { primary: primaryHeaders, secondary: secondaryHeaders }, totalDays };
    }, [viewMode, referenceDate, dateHelpers]);

    const projectsWithTasks = useMemo(() =>
        projects
            .map(p => ({ ...p, tasks: tasks.filter(t => t.projectId === p.id && new Date(t.startDate) <= range.end && new Date(t.dueDate) >= range.start) }))
            .filter(p => p.tasks.length > 0)
    , [projects, tasks, range]);

    const getTaskStyle = (task: Task) => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.dueDate);

        const start = new Date(Math.max(taskStart.getTime(), range.start.getTime()));
        const end = new Date(Math.min(taskEnd.getTime(), range.end.getTime()));
        
        const startDay = dateHelpers.differenceInDays(start, range.start) + 1;
        const duration = dateHelpers.differenceInDays(end, start) + 1;

        if (startDay > totalDays || startDay + duration <= 1) return { display: 'none' };

        return {
            gridColumnStart: startDay,
            gridColumnEnd: `span ${duration}`,
        };
    };

    const handleNav = (direction: 'prev' | 'next' | 'today') => {
        if (direction === 'today') {
            setReferenceDate(new Date());
            return;
        }
        const newDate = new Date(referenceDate);
        const increment = direction === 'prev' ? -1 : 1;
        if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7 * increment);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + increment);
        if (viewMode === 'quarter') newDate.setMonth(newDate.getMonth() + 3 * increment);
        setReferenceDate(newDate);
    };

    const handleMouseMove = (e: React.MouseEvent, task: Task) => {
        const assignee = team.find(m => m.id === task.assignedTo);
        const content = (
            <div className="text-sm">
                <p className="font-bold">{task.title}</p>
                <p>Asignado a: {assignee?.name || 'N/A'}</p>
                <p>Estado: {task.status}</p>
                <p>Duración: {new Date(task.startDate).toLocaleDateString()} - {new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
        );
        setTooltip({ content, x: e.clientX, y: e.clientY });
    };

    const todayIndex = dateHelpers.differenceInDays(new Date(), range.start) + 1;

    return (
      <div className="h-full flex flex-col">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
                <Button variant="secondary" size="sm" onClick={() => handleNav('today')}>Hoy</Button>
                <div className="flex items-center">
                    <Button variant="secondary" size="sm" className="!rounded-r-none" onClick={() => handleNav('prev')}><ChevronLeft size={16}/></Button>
                    <Button variant="secondary" size="sm" className="!rounded-l-none" onClick={() => handleNav('next')}><ChevronRight size={16}/></Button>
                </div>
                <h3 className="font-semibold">{referenceDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h3>
            </div>
            <div className="flex items-center bg-neutral-100 dark:bg-dark-bg p-0.5 rounded-btn">
                {(['week', 'month', 'quarter'] as ViewMode[]).map(v => (
                    <button key={v} onClick={() => setViewMode(v)} className={`px-3 py-1 text-sm font-semibold rounded-btn transition-colors ${viewMode === v ? 'bg-white dark:bg-dark-card shadow-sm' : 'text-neutral-500 hover:bg-white/50'}`}>
                        {v === 'week' ? 'Semana' : v === 'month' ? 'Mes' : 'Trimestre'}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-grow overflow-auto border dark:border-dark-border rounded-lg bg-light-card dark:bg-dark-card">
            <div className="grid" style={{ gridTemplateColumns: 'minmax(180px, 1fr) 4fr' }}>
                {/* Header */}
                <div className="sticky top-0 z-20 p-2 font-semibold text-sm border-b border-r dark:border-dark-border bg-neutral-50 dark:bg-dark-bg/50">Proyecto</div>
                <div className="sticky top-0 z-20 border-b dark:border-dark-border bg-neutral-50 dark:bg-dark-bg/50">
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(30px, 1fr))` }}>
                        {headers.primary.map((h, i) => (
                            <div key={i} className="text-center text-xs font-semibold py-1 border-r dark:border-dark-border" style={{ gridColumn: `span ${h.colSpan}` }}>{h.label}</div>
                        ))}
                    </div>
                     {headers.secondary.length > 0 && (
                         <div className="grid" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(30px, 1fr))` }}>
                             {headers.secondary.map((h, i) => <div key={i} className="text-center text-xs text-neutral-500 py-1 border-r dark:border-dark-border">{h.label}</div>)}
                         </div>
                     )}
                </div>

                {/* Body */}
                {projectsWithTasks.map((p, index) => (
                    <React.Fragment key={p.id}>
                        <div className={`sticky left-0 p-2 font-medium text-sm border-b border-r dark:border-dark-border ${index % 2 === 0 ? 'bg-neutral-50 dark:bg-dark-bg/50' : 'bg-light-card dark:bg-dark-card'}`}>{p.name}</div>
                        <div className="relative border-b dark:border-dark-border grid" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(30px, 1fr))`, minHeight: '40px' }}>
                            {/* Grid background */}
                            {Array.from({ length: totalDays }).map((_, i) => <div key={i} className="h-full border-r dark:border-dark-border"></div>)}
                            
                            {/* Today Marker */}
                            {todayIndex > 0 && todayIndex <= totalDays && <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `calc(${(100 / totalDays) * (todayIndex - 1)}% + ${(100 / totalDays / 2)}%)` }}></div>}

                            {/* Tasks */}
                            <div className="absolute inset-0 p-1 space-y-1">
                                {p.tasks.map(task => (
                                    <div
                                      key={task.id}
                                      className={`relative h-6 flex items-center rounded text-white text-xs px-2 truncate cursor-pointer ${statusColors[task.status].bg} border-l-2 ${statusColors[task.status].border} ${task.status === 'completada' ? 'opacity-70' : ''}`}
                                      style={getTaskStyle(task)}
                                      onClick={() => onTaskClick(task)}
                                      onMouseMove={(e) => handleMouseMove(e, task)}
                                      onMouseLeave={() => setTooltip(null)}
                                    >
                                       {team.find(m => m.id === task.assignedTo) && <img src={team.find(m => m.id === task.assignedTo)?.avatar} className="w-4 h-4 rounded-full mr-1.5" />}
                                       <span>{task.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
        {tooltip && <div className="fixed z-30 p-2 bg-neutral-800 text-white rounded-md shadow-lg pointer-events-none" style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}>{tooltip.content}</div>}
      </div>
    );
};


// --- MAIN PAGE COMPONENT ---
const TasksPage: React.FC = () => {
    const context = useContext(AppContext);
    const [view, setView] = useState<TaskView>('kanban');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [defaultStatusForModal, setDefaultStatusForModal] = useState<TaskStatus>('pendiente');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    const [projectFilter, setProjectFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

    if (!context || context.isLoading) return <LoadingPage />;
    const { tasks, projects, team, addTask, updateTask, deleteTask } = context;

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const searchTermMatch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
            const assigneeMatch = assigneeFilter === 'all' || task.assignedTo === assigneeFilter;
            const projectMatch = projectFilter === 'all' || task.projectId === projectFilter;
            const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
            return searchTermMatch && assigneeMatch && projectMatch && priorityMatch;
        });
    }, [tasks, searchTerm, assigneeFilter, projectFilter, priorityFilter]);

    const handleOpenModal = (task?: Task, status?: TaskStatus) => {
        setEditingTask(task || null);
        setDefaultStatusForModal(status || task?.status || 'pendiente');
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };
    const handleSaveTask = (taskData: Omit<Task, 'id'|'createdAt'> | Task) => {
        if ('id' in taskData) {
            updateTask(taskData);
        } else {
            addTask(taskData);
        }
        handleCloseModal();
    };

    const viewComponents: Record<TaskView, React.ReactNode> = {
        kanban: <KanbanView tasks={filteredTasks} onCardClick={handleOpenModal} onNewTask={(status) => handleOpenModal(undefined, status)} />,
        matrix: <MatrixView tasks={filteredTasks} onCardClick={handleOpenModal} />,
        focus: <FocusView tasks={filteredTasks} />,
        timeline: <TimelineView tasks={filteredTasks} projects={projects} onTaskClick={handleOpenModal} team={team}/>,
    };
    
    const viewIcons: Record<TaskView, React.ReactNode> = {
        kanban: <LayoutDashboard size={18}/>, focus: <Target size={18}/>,
        matrix: <Grid size={18}/>, timeline: <GanttChartSquare size={18}/>
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex items-center rounded-btn border border-light-border dark:border-dark-border p-0.5 bg-light-bg dark:bg-dark-bg">
                    {(Object.keys(viewComponents) as TaskView[]).map(v => (
                        <button 
                            key={v} onClick={() => setView(v)}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-btn text-sm font-semibold transition-colors ${view === v ? 'bg-primary-500 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-border'}`}
                        >
                            {viewIcons[v]} <span className="capitalize">{v}</span>
                        </button>
                    ))}
                </div>
                 <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-48 pl-9 pr-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-light-card dark:bg-dark-card focus:ring-2 focus:ring-primary-500 focus:outline-none"/>
                    </div>
                    <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className="appearance-none w-36 pl-3 pr-8 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-light-card dark:bg-dark-card focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        <option value="all">Responsable</option>
                        {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle size={18} />}>Añadir Tarea</Button>
                </div>
            </div>
            <div className="flex-grow">{viewComponents[view]}</div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}>
                <TaskForm task={editingTask} onSave={handleSaveTask} onCancel={handleCloseModal} defaultStatus={defaultStatusForModal}/>
            </Modal>
        </div>
    );
};

// --- TaskForm Component (inside TasksPage.tsx) ---
const TaskForm: React.FC<{ task?: Task | null; onSave: (task: any) => void; onCancel: () => void; defaultStatus?: TaskStatus }> = ({ task, onSave, onCancel, defaultStatus }) => {
    const context = useContext(AppContext);
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        projectId: task?.projectId || '',
        assignedTo: task?.assignedTo || '',
        status: task?.status || defaultStatus || 'pendiente',
        priority: task?.priority || 'media',
        startDate: task?.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
        dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        subtasks: task?.subtasks || [],
        tags: task?.tags || [],
        urgency: task?.urgency || 'baja',
        importance: task?.importance || 'baja',
    });
    const [newSubtask, setNewSubtask] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubtaskChange = (id: string, field: 'text' | 'completed', value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            subtasks: prev.subtasks.map(st => st.id === id ? { ...st, [field]: value } : st)
        }));
    };

    const handleAddSubtask = () => {
        if(newSubtask.trim()){
            const subtask: Subtask = { id: faker.string.uuid(), text: newSubtask, completed: false };
            setFormData(prev => ({ ...prev, subtasks: [...prev.subtasks, subtask]}));
            setNewSubtask('');
        }
    };
    
    const handleDeleteSubtask = (id: string) => {
        setFormData(prev => ({ ...prev, subtasks: prev.subtasks.filter(st => st.id !== id) }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...task, ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4 -mr-4">
            <input type="text" name="title" placeholder="Título de la tarea" value={formData.title} onChange={handleChange} required className={flatInput} />
            <textarea name="description" placeholder="Descripción..." value={formData.description} onChange={handleChange} rows={3} className={flatInput} />
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Proyecto</label>
                    <SearchableSelect
                        options={context?.projects || []}
                        value={formData.projectId}
                        onChange={(id) => handleChange({ target: { name: 'projectId', value: id } } as any)}
                        placeholder="Seleccionar..."
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Responsable</label>
                    <SearchableSelect
                        options={context?.team || []}
                        value={formData.assignedTo}
                        onChange={(id) => handleChange({ target: { name: 'assignedTo', value: id } } as any)}
                        placeholder="Seleccionar..."
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Prioridad</label>
                    <select name="priority" value={formData.priority} onChange={handleChange} className={flatInput}>
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <select name="status" value={formData.status} onChange={handleChange} className={flatInput}>
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En Progreso</option>
                        <option value="en_revision">En Revisión</option>
                        <option value="completada">Completada</option>
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className={flatInput} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Fecha Vencimiento</label>
                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required className={flatInput} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Urgencia</label>
                    <select name="urgency" value={formData.urgency} onChange={handleChange} className={flatInput}><option value="baja">Baja</option><option value="alta">Alta</option></select>
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Importancia</label>
                    <select name="importance" value={formData.importance} onChange={handleChange} className={flatInput}><option value="baja">Baja</option><option value="alta">Alta</option></select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Sub-tareas</label>
                <div className="space-y-2">
                    {formData.subtasks.map(st => (
                        <div key={st.id} className="flex items-center space-x-2">
                            <input type="checkbox" checked={st.completed} onChange={e => handleSubtaskChange(st.id, 'completed', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                            <input type="text" value={st.text} onChange={e => handleSubtaskChange(st.id, 'text', e.target.value)} className={`${flatInput} py-1`}/>
                            <Button type="button" variant="danger" size="sm" onClick={() => handleDeleteSubtask(st.id)} className="p-1.5 h-auto"><Trash2 size={14}/></Button>
                        </div>
                    ))}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                    <input type="text" placeholder="Añadir sub-tarea..." value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())} className={`${flatInput} py-1`} />
                    <Button type="button" size="sm" onClick={handleAddSubtask} leftIcon={<PlusCircle size={14}/>}>Añadir</Button>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t dark:border-dark-border">
                {task && <Button type="button" variant="danger" onClick={() => { context?.deleteTask(task.id); onCancel(); }}>Eliminar</Button>}
                <div className="flex-grow" />
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{task ? 'Guardar Cambios' : 'Crear Tarea'}</Button>
            </div>
        </form>
    );
};

export default TasksPage;
