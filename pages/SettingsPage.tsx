



import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ThemeToggle';
import { Upload, Palette, Slice, CaseSensitive } from 'lucide-react';

const flatInput = "mt-1 block w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-btn py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm";

const colorOptions = [
    { id: 'sky', name: 'Azul Cielo', class: 'bg-sky-500' },
    { id: 'emerald', name: 'Esmeralda', class: 'bg-emerald-500' },
    { id: 'rose', name: 'Rosa', class: 'bg-rose-500' },
    { id: 'amber', name: 'Ámbar', class: 'bg-amber-500' },
    { id: 'slate', name: 'Pizarra', class: 'bg-slate-500' },
];

const radiusOptions = [
    { id: 'sharp', name: 'Nítido', className: 'rounded-none' },
    { id: 'soft', name: 'Suave', className: 'rounded-md' },
    { id: 'rounded', name: 'Redondeado', className: 'rounded-full' },
]

const fontOptions = [
    { id: 'sans', name: 'Sans Serif (Moderno)' },
    { id: 'montserrat', name: 'Montserrat' },
    { id: 'poppins', name: 'Poppins' },
]

const SettingsPage: React.FC = () => {
  const context = useContext(AppContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
      companyDetails, updateCompanyDetails, 
      primaryColor, setPrimaryColor,
      borderRadius, setBorderRadius,
      fontFamily, setFontFamily
    } = context!;
    
  const [localCompanyDetails, setLocalCompanyDetails] = useState(companyDetails);

  useEffect(() => {
    setLocalCompanyDetails(companyDetails);
  }, [companyDetails]);


  const handleCompanyDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalCompanyDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const logoUrl = event.target?.result as string;
            setLocalCompanyDetails(prev => ({...prev, logo: logoUrl}));
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <div className="p-5"><h2 className="text-xl font-semibold">Datos de la Empresa</h2></div>
            <div className="p-5 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Logo para Documentos</label>
                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                    <div className="w-full h-28 rounded-card flex items-center justify-center p-2 border border-dashed border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg">
                        {localCompanyDetails.logo ? (
                            <img src={localCompanyDetails.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                        ) : (
                           <div className="text-center text-neutral-500">Sin logo</div>
                        )}
                    </div>
                    <Button type="button" variant="secondary" size="sm" className="w-full mt-2" onClick={() => fileInputRef.current?.click()} leftIcon={<Upload size={16}/>}>
                        {localCompanyDetails.logo ? 'Cambiar Logo' : 'Subir Logo'}
                    </Button>
                </div>
                <div>
                    <label className="block text-sm font-medium">Nombre de la Empresa</label>
                    <input type="text" name="name" value={localCompanyDetails.name} onChange={handleCompanyDetailsChange} className={flatInput} />
                </div>
                <div>
                    <label className="block text-sm font-medium">Dirección</label>
                    <textarea name="address" value={localCompanyDetails.address} onChange={handleCompanyDetailsChange} rows={2} className={flatInput} />
                </div>
                <div>
                    <label className="block text-sm font-medium">CIF/NIF</label>
                    <input type="text" name="taxId" value={localCompanyDetails.taxId} onChange={handleCompanyDetailsChange} className={flatInput} />
                </div>
                <Button className="w-full" onClick={() => updateCompanyDetails(localCompanyDetails)}>Guardar Cambios</Button>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
           <Card>
            <div className="p-5"><h2 className="text-xl font-semibold">Apariencia</h2></div>
            <div className="p-5 flex justify-between items-center">
                <p>Cambiar tema (Claro/Oscuro)</p>
                <ThemeToggle />
            </div>
             <div className="p-5 border-t dark:border-dark-border">
                <h3 className="text-lg font-semibold flex items-center mb-4"><Palette size={20} className="mr-2 text-primary-500" />Color de Acento</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Selecciona el color principal para la aplicación.</p>
                <div className="flex flex-wrap gap-4">
                    {colorOptions.map(color => (
                        <button
                            key={color.id}
                            type="button"
                            onClick={() => setPrimaryColor(color.id)}
                            className={`w-10 h-10 rounded-full cursor-pointer transition ${color.class} ${primaryColor === color.id ? 'ring-2 ring-offset-2 dark:ring-offset-dark-card ring-primary-500' : ''}`}
                            aria-label={`Seleccionar color ${color.name}`}
                        />
                    ))}
                </div>
            </div>
          </Card>

           <Card>
            <div className="p-5"><h2 className="text-xl font-semibold">Personalización Avanzada</h2></div>
             <div className="p-5 border-t dark:border-dark-border">
                <h3 className="text-lg font-semibold flex items-center mb-4"><Slice size={20} className="mr-2 text-primary-500" />Radio de los Bordes</h3>
                <div className="flex items-center justify-around bg-light-bg dark:bg-dark-bg p-2 rounded-btn">
                    {radiusOptions.map(option => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => setBorderRadius(option.id as any)}
                            className={`w-1/3 py-2 text-sm font-semibold transition ${borderRadius === option.id ? 'bg-primary-500 text-white shadow rounded-md' : 'text-neutral-600 dark:text-neutral-300'}`}
                        >
                            {option.name}
                        </button>
                    ))}
                </div>
             </div>
             <div className="p-5 border-t dark:border-dark-border">
                <h3 className="text-lg font-semibold flex items-center mb-4"><CaseSensitive size={20} className="mr-2 text-primary-500" />Tipografía</h3>
                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value as any)} className={flatInput}>
                    {fontOptions.map(font => (
                        <option key={font.id} value={font.id}>{font.name}</option>
                    ))}
                </select>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;