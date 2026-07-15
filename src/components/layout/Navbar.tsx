'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roles?: string[];
  active: boolean;
  profilePictureUrl?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchApi('/api/users/me', { method: 'GET', skipAuthRedirect: true });
        if (res.ok) {
          setUser(await res.json());
        }
      } catch (err) {
        console.error('Failed to load user', err);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.role === 'ADMIN';

  const linkClass = (active: boolean) =>
    active
      ? 'text-[var(--color-forest)] font-bold'
      : 'text-[var(--color-neutral)] hover:text-[var(--color-forest)] transition-colors font-medium';

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-16 bg-[var(--color-paper-soft)]/80 backdrop-blur-md border-b border-[var(--color-border-soft)] flex items-center px-6 sticky top-0 z-50"
    >
      <Link href="/dashboard" className="flex items-center gap-2.5 mr-8 shrink-0">
        <Image src="/icons/xicara.png" alt="Anverso" width={24} height={24} unoptimized />
        <span className="font-serif text-lg font-bold text-[var(--color-espresso)] tracking-tight">Anverso</span>
      </Link>

      <div className="flex gap-6 text-sm">
        <Link href="/dashboard" className={linkClass(pathname === '/dashboard')}>Dashboard</Link>
        <Link href="/explore" className={linkClass(pathname.startsWith('/explore'))}>Comunidade</Link>
        {isAdmin && (
          <Link href="/admin" className={linkClass(pathname.startsWith('/admin'))}>Administrador</Link>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/account"
          className="flex items-center gap-2.5 group"
          aria-label="Minha conta"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--color-success-soft)] text-[var(--color-green)] flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-[var(--color-green)] transition-all font-extrabold text-sm shadow-sm shrink-0">
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `http://localhost:8080${user.profilePictureUrl}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              (user?.firstName || user?.email || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-sm font-semibold text-[var(--color-espresso)] group-hover:text-[var(--color-forest)] transition-colors hidden md:block">
            {user?.firstName || 'Usuário'}
          </span>
        </Link>

        <Button variant="quiet" size="sm" onClick={handleLogout} trailingIcon={false} className="text-xs">
          Sair
        </Button>
      </div>
    </motion.nav>
  );
}
