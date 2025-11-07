import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Cargando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      <p className="mt-4 text-neutral-500 dark:text-neutral-400">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
