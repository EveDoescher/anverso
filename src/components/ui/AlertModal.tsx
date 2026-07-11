import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export type AlertModalType = 'success' | 'error' | 'info' | 'confirm';

export interface AlertModalProps {
  show: boolean;
  title: string;
  message: string;
  type: AlertModalType;
  onClose: () => void;
  onConfirm?: () => void;
}

export function AlertModal({ show, title, message, type, onClose, onConfirm }: AlertModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className={`h-2 w-full ${
          type === 'success' ? 'bg-emerald-500' :
          type === 'error' ? 'bg-red-500' : 
          type === 'confirm' ? 'bg-amber-500' : 'bg-indigo-500'
        }`} />
        
        <div className="p-8 pb-6 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-inner ${
            type === 'success' ? 'bg-emerald-100 text-emerald-600' :
            type === 'error' ? 'bg-red-100 text-red-600' : 
            type === 'confirm' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
          }`}>
            {type === 'success' && <CheckCircle2 size={32} strokeWidth={2.5} />}
            {(type === 'error' || type === 'confirm') && <AlertTriangle size={32} strokeWidth={2.5} />}
            {type === 'info' && <Info size={32} strokeWidth={2.5} />}
          </div>
          
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 font-medium leading-relaxed">{message}</p>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          {type === 'confirm' ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                Confirmar
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-95"
            >
              Entendi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
