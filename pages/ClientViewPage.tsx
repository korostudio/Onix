
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Brief, Contract, Quote, Invoice, BriefQuestion } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { CheckCircle, FileText, FileSignature, Hexagon, FileBarChart, Receipt } from 'lucide-react';
import LoadingPage from '../components/ui/LoadingPage';

const ClientViewPage: React.FC = () => {
  const { type, id } = useParams<{ type: 'brief' | 'contract' | 'quote' | 'invoice', id: string }>();
  const context = useContext(AppContext);
  const [actionTaken, setActionTaken] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (!context || context.isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <LoadingPage />
        </div>
    );
  }

  const { briefs, contracts, quotes, invoices, projects, clients, processClientAction } = context;

  let document: Brief | Contract | Quote | Invoice | undefined;
  let documentTitle: string = '';
  let project_name: string | undefined;
  let client_name: string | undefined;

  const briefDoc = useMemo(() => {
    if (type === 'brief' && id) {
        return briefs.find(b => b.id === id);
    }
    return null;
  }, [type, id, briefs]);

  useEffect(() => {
    if (briefDoc) {
        const initialAnswers = briefDoc.questions.reduce((acc, q) => {
            acc[q.id] = q.answer || '';
            return acc;
        }, {} as Record<string, string>);
        setAnswers(initialAnswers);
    }
  }, [briefDoc]);


  if (type === 'brief') {
    document = briefDoc;
    if (document) {
      // FIX: Cast `document` to `Brief` to resolve TypeScript error on `title` property access.
      documentTitle = `Brief: ${(document as Brief).title}`;
      const project = projects.find(p => p.id === (document as Brief).projectId);
      project_name = project?.name;
      if (project) {
        client_name = clients.find(c => c.id === project.clientId)?.name;
      }
    }
  } else if (type === 'contract') {
    document = contracts.find(c => c.id === id);
    if (document) {
      documentTitle = 'Revisión de Contrato';
      client_name = clients.find(c => c.id === (document as Contract).clientId)?.name;
      if ((document as Contract).projectId) {
        project_name = projects.find(p => p.id === (document as Contract).projectId)?.name;
      }
    }
  } else if (type === 'quote') {
    document = quotes.find(q => q.id === id);
    if (document) {
      documentTitle = 'Revisión de Cotización';
      client_name = clients.find(c => c.id === (document as Quote).clientId)?.name;
      if ((document as Quote).projectId) {
        project_name = projects.find(p => p.id === (document as Quote).projectId)?.name;
      }
    }
  } else if (type === 'invoice') {
    document = invoices.find(i => i.id === id);
    if (document) {
        documentTitle = `Factura #${(document as Invoice).invoiceNumber}`;
        client_name = clients.find(c => c.id === (document as Invoice).clientId)?.name;
        if ((document as Invoice).projectId) {
            project_name = projects.find(p => p.id === (document as Invoice).projectId)?.name;
        }
    }
  }

  if (!document) {
    return <div className="flex justify-center items-center h-screen">Documento no encontrado.</div>;
  }

  const isActionable = (type === 'brief' && document.status === 'enviado') 
    || (type === 'contract' && document.status === 'enviado')
    || (type === 'quote' && document.status === 'enviado')
    || (type === 'invoice' && document.status === 'enviado');

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({...prev, [questionId]: value}));
  };

  const handleAction = () => {
    if (type && id && isActionable) {
      const payload = type === 'brief' ? answers : undefined;
      processClientAction(type, id, payload);
      setActionTaken(true);
    }
  };

  const getActionText = () => {
    if (type === 'brief') return 'Enviar y Aprobar Brief';
    if (type === 'contract') return 'Firmar Contrato';
    if (type === 'quote') return 'Aceptar Cotización';
    if (type === 'invoice') return 'Pagar Factura';
    return '';
  };
  
  const getSuccessMessage = () => {
    if (type === 'brief') return 'El brief ha sido enviado y aprobado exitosamente. ¡Gracias!';
    if (type === 'contract') return 'El contrato ha sido firmado digitalmente. ¡Gracias!';
    if (type === 'quote') return 'La cotización ha sido aceptada. ¡Gracias!';
    if (type === 'invoice') return 'La factura ha sido pagada. ¡Gracias!';
    return '';
  }

  const getIcon = () => {
      switch(type) {
          case 'brief': return <FileText size={24} />;
          case 'contract': return <FileSignature size={24} />;
          case 'quote': return <FileBarChart size={24} />;
          case 'invoice': return <Receipt size={24} />;
          default: return null;
      }
  }
  
  const quoteDoc = type === 'quote' ? (document as Quote) : null;

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-neutral-800 dark:text-neutral-200 p-4 sm:p-6 lg:p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center space-x-3">
          <Hexagon className="w-10 h-10 text-primary-500" />
          <h1 className="text-3xl font-bold tracking-wider">ONIX</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-3 text-primary-500">
              {getIcon()}
              <h2 className="text-2xl font-bold">{documentTitle}</h2>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">
              Para: {client_name} {project_name ? `- Proyecto: ${project_name}` : ''}
            </p>
          </div>
          <div className="p-6">
            {quoteDoc && quoteDoc.items && quoteDoc.items.length > 0 ? (
              <div className="space-y-4">
                <table className="w-full text-sm text-left">
                  <thead className="text-neutral-500 dark:text-neutral-400">
                    <tr>
                      <th className="font-semibold p-2">Ítem</th>
                      <th className="font-semibold p-2 text-center">Cant.</th>
                      <th className="font-semibold p-2 text-right">Precio Unitario</th>
                      <th className="font-semibold p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quoteDoc.items.map(item => (
                      <tr key={item.id}>
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* FIX: Use `quoteDoc.content` as `document.content` is not available on `Brief` type. */}
                {quoteDoc.content && (
                    <div className="pt-4 mt-4">
                        <h4 className="font-semibold mb-2">Notas:</h4>
                        {/* FIX: Use `quoteDoc.content` as `document.content` is not available on `Brief` type. */}
                        <p className="whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-300">{quoteDoc.content}</p>
                    </div>
                )}
              </div>
            ) : briefDoc ? (
                 <div className="space-y-6">
                    {briefDoc.questions.map((q, index) => (
                        <div key={q.id}>
                            <label className="block text-sm font-semibold mb-2 text-neutral-800 dark:text-neutral-100">
                                {index + 1}. {q.question}
                            </label>
                            <textarea 
                                value={answers[q.id] || ''}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                rows={4}
                                placeholder="Tu respuesta aquí..."
                                disabled={document.status !== 'enviado' || actionTaken}
                                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm disabled:opacity-60"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                // FIX: Cast `document` to types that have `content` to resolve TypeScript error.
                <p className="whitespace-pre-wrap font-sans">{(document as Contract | Quote | Invoice).content}</p>
            )}
          </div>
          
           {(type === 'quote' || type === 'contract' || type === 'invoice') && (document as (Quote | Contract | Invoice)).amount != null &&
             <div className="p-6">
                {quoteDoc && quoteDoc.items && quoteDoc.items.length > 0 ? (
                     <div className="max-w-xs ml-auto space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-600 dark:text-neutral-400">Subtotal:</span>
                            <span className="font-medium">{formatCurrency(quoteDoc.subtotal || 0)}</span>
                        </div>
                        {quoteDoc.discount != null && quoteDoc.discount > 0 && (
                             <div className="flex justify-between items-center">
                                <span className="text-neutral-600 dark:text-neutral-400">Descuento ({quoteDoc.discount}%):</span>
                                <span className="font-medium text-red-500">- {formatCurrency((quoteDoc.subtotal || 0) * (quoteDoc.discount / 100))}</span>
                            </div>
                        )}
                         <div className="flex justify-between items-center text-lg font-bold pt-2 mt-2">
                            <span>Total:</span>
                            <span className="text-primary-500">{formatCurrency(quoteDoc.amount)}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-right">
                        <span className="text-lg font-semibold">Total: </span>
                        <span className="text-2xl font-bold text-primary-500">
                            {formatCurrency((document as (Quote | Contract | Invoice)).amount)}
                        </span>
                    </div>
                )}
             </div>
           }


          <div className="p-6">
            {actionTaken ? (
              <div className="text-center text-green-600 dark:text-green-400 flex items-center justify-center space-x-2">
                <CheckCircle size={20}/>
                <span>{getSuccessMessage()}</span>
              </div>
            ) : isActionable ? (
              <div className="text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Por favor, revise el documento detenidamente. Si está de acuerdo, proceda a {type === 'brief' ? 'completarlo y aprobarlo' : type === 'contract' ? 'firmarlo' : type === 'quote' ? 'aceptarlo' : 'pagarlo'}.
                </p>
                <Button onClick={handleAction} size="lg" leftIcon={<CheckCircle size={18} />}>
                  {getActionText()}
                </Button>
              </div>
            ) : (
               <div className="text-center text-neutral-600 dark:text-neutral-400">
                 <p>Este documento ya ha sido procesado (Estado: <span className="font-semibold capitalize">{document.status}</span>).</p>
               </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ClientViewPage;