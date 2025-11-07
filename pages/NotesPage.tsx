

import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import type { Note, NoteColor } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import LoadingPage from '../components/ui/LoadingPage';

const noteColors: Record<NoteColor, string> = {
  yellow: 'border-yellow-400 dark:border-yellow-300',
  blue: 'border-blue-400 dark:border-blue-300',
  green: 'border-green-400 dark:border-green-300',
  pink: 'border-pink-400 dark:border-pink-300',
  purple: 'border-purple-400 dark:border-purple-300',
};

const noteRadioColors: Record<NoteColor, string> = {
  yellow: 'bg-yellow-400',
  blue: 'bg-blue-400',
  green: 'bg-green-400',
  pink: 'bg-pink-400',
  purple: 'bg-purple-400',
};

const flatInput = "block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-card focus:ring-primary-500 sm:text-sm";


const NoteForm: React.FC<{ note?: Note | null; onSave: (note: any) => void; onCancel: () => void; }> = ({ note, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    color: note?.color || 'yellow',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...note, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Título</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required className={flatInput} />
      </div>
      <div>
        <label className="block text-sm font-medium">Contenido</label>
        <textarea name="content" value={formData.content} onChange={handleChange} rows={8} required className={flatInput} />
      </div>
      <div>
        <label className="block text-sm font-medium">Color</label>
        <div className="mt-2 flex space-x-3">
          {Object.keys(noteRadioColors).map(color => (
            <label key={color} className="flex items-center">
              <input 
                type="radio" 
                name="color" 
                value={color}
                checked={formData.color === color}
                onChange={handleChange}
                className="sr-only"
              />
              <span className={`h-8 w-8 rounded-full cursor-pointer border-2 border-transparent ${formData.color === color ? `ring-2 ring-offset-2 dark:ring-offset-dark-card ring-primary-500` : ''} ${noteRadioColors[color as keyof typeof noteRadioColors]}`}></span>
            </label>
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{note ? 'Guardar Cambios' : 'Crear Nota'}</Button>
      </div>
    </form>
  );
};

const NotesPage: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  if (!context || context.isLoading) return <LoadingPage />;

  const { notes, addNote, updateNote, deleteNote } = context;

  const handleOpenModal = (note?: Note) => {
    setEditingNote(note || null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleSaveNote = (noteData: Note) => {
    if (editingNote) {
      updateNote(noteData);
    } else {
      addNote(noteData);
    }
    handleCloseModal();
  };
  
  return (
    <div>
      <div className="flex justify-end items-center mb-6">
        <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle size={18} />}>
          Crear Nota
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {notes.map(note => (
          <Card key={note.id} className={`flex flex-col group border-t-4 ${noteColors[note.color]}`}>
            <div className="p-5 flex-grow">
              <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 mb-2">{note.title}</h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{note.content}</p>
            </div>
            <div className="mt-4 p-5 pt-2 border-t border-black/10 dark:border-dark-border flex justify-between items-center">
              <span className="text-xs text-neutral-600 dark:text-neutral-400">{new Date(note.createdAt).toLocaleDateString()}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(note)} className="p-1 text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400"><Edit size={16}/></button>
                <button onClick={() => deleteNote(note.id)} className="p-1 text-neutral-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400"><Trash2 size={16}/></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingNote ? 'Editar Nota' : 'Añadir Nueva Nota'}>
        <NoteForm note={editingNote} onSave={handleSaveNote} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default NotesPage;
