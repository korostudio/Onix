import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const inputFieldClasses = "block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-card focus:ring-primary-500 sm:text-sm";

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => options.find(opt => opt.id === value), [options, value]);

  useEffect(() => {
    setSearchTerm(selectedOption ? selectedOption.name : '');
  }, [selectedOption]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(selectedOption ? selectedOption.name : '');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, selectedOption]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm || (selectedOption && searchTerm === selectedOption.name)) {
        return options;
    }
    return options.filter(option =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, selectedOption]);

  const handleSelect = (option: Option) => {
    onChange(option.id);
    setSearchTerm(option.name);
    setIsOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      if (!isOpen) {
          setIsOpen(true);
      }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={!value && required}
          className={`${inputFieldClasses} pr-8 disabled:bg-neutral-100 dark:disabled:bg-neutral-800/50`}
          autoComplete="off"
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-light-card dark:bg-dark-card rounded-md shadow-lg border dark:border-dark-border max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div
                key={option.id}
                onMouseDown={() => handleSelect(option)}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/50 ${value === option.id ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}
              >
                {option.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-neutral-500">No se encontraron resultados</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
