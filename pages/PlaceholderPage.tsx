
import React from 'react';
import Card from '../components/ui/Card';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <Card className="p-10 flex flex-col items-center justify-center text-center">
        <Construction className="w-16 h-16 text-primary-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Módulo en Construcción</h2>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
          Esta sección está actualmente en desarrollo. Vuelve pronto para ver las nuevas funcionalidades que estamos preparando para ti.
        </p>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
