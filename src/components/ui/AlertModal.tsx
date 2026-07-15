import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Button } from './Button';

export type AlertModalType = 'success' | 'error' | 'info' | 'confirm';

export interface AlertModalProps {
  show: boolean;
  title: string;
  message: string;
  type: AlertModalType;
  onClose: () => void;
  onConfirm?: () => void;
}

const typeConfig = {
  success: {
    bar: 'bg-[var(--color-green)]',
    icon: 'bg-[var(--color-success-bg)] text-[var(--color-green)]',
    Icon: CheckCircle2,
  },
  error: {
    bar: 'bg-[var(--color-error)]',
    icon: 'bg-[var(--color-error-bg-soft)] text-[var(--color-error)]',
    Icon: AlertTriangle,
  },
  confirm: {
    bar: 'bg-[var(--color-gold)]',
    icon: 'bg-[var(--color-cream)] text-[var(--color-gold)]',
    Icon: AlertTriangle,
  },
  info: {
    bar: 'bg-[var(--color-fern)]',
    icon: 'bg-[var(--color-success-bg)] text-[var(--color-green)]',
    Icon: Info,
  },
};

export function AlertModal({ show, title, message, type, onClose, onConfirm }: AlertModalProps) {
  if (!show) return null;

  const cfg = typeConfig[type];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[var(--color-espresso)]/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-[var(--color-border-soft)] animate-in zoom-in-95 duration-200">
        <div className={`h-2 w-full ${cfg.bar}`} />

        <div className="p-8 pb-6 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-inner ${cfg.icon}`}>
            <cfg.Icon size={32} strokeWidth={2.5} />
          </div>

          <h3 id="alert-modal-title" className="text-xl font-extrabold text-[var(--color-espresso)] mb-2">{title}</h3>
          <p className="text-[var(--color-neutral)] font-medium leading-relaxed">{message}</p>
        </div>

        <div className="p-4 bg-[var(--color-paper)] border-t border-[var(--color-border-soft)] flex gap-3">
          {type === 'confirm' ? (
            <>
              <Button variant="quiet" size="md" className="flex-1 justify-center" onClick={onClose} trailingIcon={false}>
                Cancelar
              </Button>
              <Button variant="gold" size="md" className="flex-1 justify-center" onClick={onConfirm} trailingIcon={false}>
                Confirmar
              </Button>
            </>
          ) : (
            <Button variant="primary" size="md" className="w-full justify-center" onClick={onClose} trailingIcon={false}>
              Entendi
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
