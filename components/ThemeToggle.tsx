
import React, { useContext } from 'react';
import { Sun, Moon } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const ThemeToggle: React.FC = () => {
  const context = useContext(AppContext);
  
  if (!context) return null;

  const { theme, toggleTheme } = context;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-border transition-colors duration-150"
    >
      {theme === 'light' ? 
        <Moon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" /> : 
        <Sun className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
      }
    </button>
  );
};

export default ThemeToggle;