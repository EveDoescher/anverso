'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [works, setWorks] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetchApi('/api/users/me', { method: 'GET' });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error('Falha ao carregar perfil.');
      }
      const data = await res.json();
      setUser(data);

      loadWorks();

      if (data.roles?.includes('ROLE_ADMIN') || data.role === 'ADMIN') {
        loadAllUsers();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadWorks = async () => {
    try {
      const res = await fetchApi('/api/v1/works', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setWorks(data);
      }
    } catch (err: any) {
      console.log('Falha ao carregar trabalhos (backend possivelmente offline ou desatualizado):', err.message);
    }
  };

  const loadAllUsers = async () => {
    try {
      const res = await fetchApi('/api/users', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Falha ao carregar lista de usuários', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Deseja realmente desativar (soft delete) este usuário?')) return;
    
    try {
      const res = await fetchApi(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert('Falha ao deletar usuário.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao deletar usuário.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Olá, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto space-y-8">
        {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}

        <section className="bg-white p-6 rounded shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Meu Perfil</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-semibold">ID:</span> {user?.id}</div>
            <div><span className="font-semibold">Nome:</span> {user?.name}</div>
            <div><span className="font-semibold">E-mail:</span> {user?.email}</div>
            <div><span className="font-semibold">Papel:</span> {user?.role || (user as any)?.roles?.join(', ')}</div>
          </div>
        </section>

        <section className="flex justify-between items-center bg-white p-4 rounded shadow-sm border">
          <h2 className="text-lg font-semibold">Meus Trabalhos</h2>
          <div className="flex gap-4">
            <a href="/create-profile" className="bg-green-600 text-white py-2 px-4 rounded font-medium hover:bg-green-700 transition text-sm text-center">
              Criar Novo Perfil
            </a>
            <a href="/submit-work" className="bg-indigo-600 text-white py-2 px-4 rounded font-medium hover:bg-indigo-700 transition text-sm text-center">
              Criar Novo Trabalho
            </a>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {works.map((work) => (
            <div key={work.id} className="bg-white border rounded shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">{work.title || work.fileName || 'Trabalho sem título'}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  Status: <span className="font-medium">{work.status}</span>
                </p>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Criado em: {new Date(work.createdAt).toLocaleDateString()}</span>
                {work.status === 'COMPLETED' && (
                  <button className="text-blue-600 hover:underline">Baixar PDF</button>
                )}
              </div>
            </div>
          ))}
          {works.length === 0 && (
            <div className="col-span-3 text-center p-8 bg-white border rounded shadow-sm text-gray-500">
              Você ainda não tem nenhum trabalho submetido. Clique em "Criar Novo Trabalho" para começar.
            </div>
          )}
        </section>

        {/* ADMIN SECTION */}
        {users.length > 0 && (
          <section className="bg-white p-6 rounded shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Administração de Usuários</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">Nome</th>
                    <th className="p-2 border">E-mail</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 border">{u.id}</td>
                      <td className="p-2 border">{u.name}</td>
                      <td className="p-2 border">{u.email}</td>
                      <td className="p-2 border">
                        {u.active !== false ? (
                          <span className="text-green-600 font-semibold">Ativo</span>
                        ) : (
                          <span className="text-red-600 font-semibold">Inativo</span>
                        )}
                      </td>
                      <td className="p-2 border text-center">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition"
                          disabled={u.id === user?.id}
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
