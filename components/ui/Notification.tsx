import React from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  onClose: () => void;
}

const icons = {
  success: <CheckCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  error: <AlertTriangle className="w-5 h-5" />, // Using AlertTriangle for error too for simplicity
};

const colors = {
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
  error: 'bg-red-500 text-white',
};

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg ${colors[type]}`}>
      <div className="mr-3">{icons[type]}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button onClick={onClose} className="ml-4 -mr-1 p-1 rounded-full hover:bg-white/20 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Notification;
