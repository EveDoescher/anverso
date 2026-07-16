import { Brain, Leaf } from 'lucide-react';

type BadgeVariant = 'teacher' | 'admin';

interface UserBadgeProps {
  variant: BadgeVariant;
  compact?: boolean;
  className?: string;
}

const config = {
  teacher: {
    Icon: Brain,
    label: 'Professor',
    colorClass: 'text-[var(--color-gold)] bg-amber-50 border-amber-200',
    iconColorClass: 'text-[var(--color-gold)]',
    title: 'Docente verificado',
  },
  admin: {
    Icon: Leaf,
    label: 'Admin',
    colorClass: 'text-[var(--color-green)] bg-[var(--color-success-bg)] border-[var(--color-success-soft)]',
    iconColorClass: 'text-[var(--color-green)]',
    title: 'Administrador do sistema',
  },
};

export function UserBadge({ variant, compact = false, className = '' }: UserBadgeProps) {
  const { Icon, label, colorClass, iconColorClass, title } = config[variant];

  if (compact) {
    return (
      <span
        title={title}
        className={`inline-flex items-center justify-center w-4 h-4 shrink-0 ${className}`}
        aria-label={title}
      >
        <Icon size={13} className={iconColorClass} strokeWidth={2.2} />
      </span>
    );
  }

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide shrink-0 ${colorClass} ${className}`}
    >
      <Icon size={10} strokeWidth={2.4} />
      {label}
    </span>
  );
}

export function userBadgeVariant(role?: string, isTeacherVerified?: boolean): BadgeVariant | null {
  if (role === 'ADMIN') return 'admin';
  if (isTeacherVerified) return 'teacher';
  return null;
}
