'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { fetchApi } from '@/lib/api';

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
        const res = await fetchApi('/api/users/me', { method: 'GET' });
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

  return (
    <nav className="h-16 bg-white border-b border-slate-200 flex items-center px-6 sticky top-0 z-50">
      <Link href="/dashboard" className="text-2xl font-bold text-indigo-600 mr-8">Anverso</Link>
      <div className="flex gap-6 text-sm font-medium text-slate-600">
        <Link href="/dashboard" className={pathname === '/dashboard' ? 'text-indigo-600' : 'hover:text-indigo-600 transition-colors'}>Dashboard</Link>
        <Link href="/explore" className={pathname.startsWith('/explore') ? 'text-indigo-600' : 'hover:text-indigo-600 transition-colors'}>Comunidade</Link>
        {isAdmin && (
          <Link href="/admin" className={pathname.startsWith('/admin') ? 'text-indigo-600' : 'hover:text-indigo-600 transition-colors'}>Administrador</Link>
        )}
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Link href="/account" className="flex items-center gap-3 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors group">
          <span>Olá, {user?.firstName || 'Usuário'} {user?.lastName || ''}</span>
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-indigo-200 transition-all font-extrabold shadow-sm">
            {user?.profilePictureUrl ? (
              <img src={user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `http://localhost:8080${user.profilePictureUrl}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (user?.firstName || user?.email || 'U').charAt(0).toUpperCase()
            )}
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
