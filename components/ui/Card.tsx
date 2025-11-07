
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-light-card dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border ${className}`}>
      {children}
    </div>
  );
};

export default Card;