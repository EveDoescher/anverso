'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { AlertModal, AlertModalType } from '@/components/ui/AlertModal';
import { Users, BarChart, LayoutTemplate, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
}

interface ProfileData {
  id: string;
  name: string;
  description: string;
  authorId: string;
  isPublic?: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'profiles' | 'verifications'>('stats');
  
  const [stats, setStats] = useState({ loggedInUsers: 0, totalWorks: 0 });
  const router = useRouter();

  const [modalConfig, setModalConfig] = useState<{show: boolean, title: string, message: string, type: AlertModalType, onConfirm?: () => void}>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: AlertModalType) => {
    setModalConfig({ show: true, title, message, type });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({ show: true, title, message, type: 'confirm', onConfirm });
  };

  const closeModal = () => setModalConfig(prev => ({ ...prev, show: false }));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
      
      const isAdmin = data.roles?.includes('ROLE_ADMIN') || data.role === 'ADMIN';
      if (!isAdmin) {
        router.push('/dashboard');
        return;
      }
      
      setCurrentUser(data);
      await Promise.all([
        loadAllUsers(),
        loadAllProfiles(),
        loadStats()
      ]);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const res = await fetchApi('/api/users', { method: 'GET' });
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error('Falha ao carregar lista de usuários', err);
    }
  };

  const loadAllProfiles = async () => {
    try {
      const res = await fetchApi('/api/v1/profiles/all', { method: 'GET' });
      if (res.ok) setProfiles(await res.json());
    } catch (err) {
      console.error('Falha ao carregar lista de perfis', err);
    }
  };

  const loadStats = async () => {
    try {
      let loggedIn = 0;
      let totalWorks = 0;
      
      try {
        const resUser = await fetchApi('/api/users/stats', { method: 'GET' });
        if (resUser.ok) {
          const userStats = await resUser.json();
          loggedIn = userStats.loggedInUsers || 0;
        }
      } catch (e) { console.error(e); }
      
      try {
        const resWork = await fetchApi('/api/v1/works/stats', { method: 'GET' });
        if (resWork.ok) {
          const workStats = await resWork.json();
          totalWorks = workStats.totalWorks || 0;
        }
      } catch (e) { console.error(e); }
      
      setStats({ loggedInUsers: loggedIn, totalWorks });
    } catch (err) {
      console.error('Falha ao carregar estatísticas', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    showConfirm('Desativar Usuário', 'Deseja realmente desativar (soft delete) este usuário?', async () => {
      try {
        const res = await fetchApi(`/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) setUsers(users.map(u => u.id === id ? { ...u, active: false } : u));
        else showAlert('Erro', 'Falha ao desativar usuário.', 'error');
      } catch (err) {
        console.error(err);
        showAlert('Erro', 'Erro de conexão ao deletar usuário.', 'error');
      }
      closeModal();
    });
  };

  const handleRestoreUser = async (id: string) => {
    showConfirm('Ativar Usuário', 'Deseja realmente reativar este usuário?', async () => {
      try {
        const res = await fetchApi(`/api/users/${id}/restore`, { method: 'POST' });
        if (res.ok) setUsers(users.map(u => u.id === id ? { ...u, active: true } : u));
        else showAlert('Erro', 'Falha ao reativar usuário.', 'error');
      } catch (err) {
        console.error(err);
        showAlert('Erro', 'Erro de conexão ao reativar usuário.', 'error');
      }
      closeModal();
    });
  };

  const handleDeleteProfile = async (id: string) => {
    showConfirm('Deletar Perfil', 'Deseja realmente deletar este perfil do sistema?', async () => {
      try {
        const res = await fetchApi(`/api/v1/profiles/${id}`, { method: 'DELETE' });
        if (res.ok) setProfiles(profiles.filter(p => p.id !== id));
        else showAlert('Erro', 'Falha ao deletar perfil.', 'error');
      } catch (err) {
        console.error(err);
        showAlert('Erro', 'Erro de conexão ao deletar perfil.', 'error');
      }
      closeModal();
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Carregando...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6">{error}</div>}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Administração</h1>
            <p className="text-slate-500 mt-1">Visão geral e controle do sistema</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-200 p-1 rounded-xl mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'stats' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart className="w-4 h-4" />
            Estatísticas
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'users' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Controle de Usuários
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'profiles' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            Controle de Perfis
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'verifications' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Verificações em Análise
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Usuários Cadastrados</p>
              <h3 className="text-4xl font-extrabold text-slate-900 mt-2">{users.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Usuários Ativos</p>
              <h3 className="text-4xl font-extrabold text-emerald-600 mt-2">{users.filter(u => u.active !== false).length}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Usuários Logados</p>
              <h3 className="text-4xl font-extrabold text-indigo-600 mt-2">{stats.loggedInUsers}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Perfis Criados</p>
              <h3 className="text-4xl font-extrabold text-slate-900 mt-2">{profiles.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Trabalhos Criados</p>
              <h3 className="text-4xl font-extrabold text-slate-900 mt-2">{stats.totalWorks}</h3>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Controle de Usuários</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 text-xs uppercase tracking-wider text-slate-400 font-bold">ID</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-slate-400 font-bold">Nome</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-slate-400 font-bold">E-mail</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-slate-400 font-bold">Status</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-slate-400 font-bold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-slate-600 font-mono text-xs">{u.id}</td>
                      <td className="p-3 font-semibold text-slate-800">{u.name || `${u.firstName || ''} ${u.lastName || ''}`}</td>
                      <td className="p-3 text-slate-600">{u.email}</td>
                      <td className="p-3">
                        {u.active !== false ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold">
                            <XCircle className="w-3 h-3" /> Inativo
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {u.active !== false ? (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            disabled={u.id === currentUser?.id}
                          >
                            Desativar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestoreUser(u.id)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            disabled={u.id === currentUser?.id}
                          >
                            Ativar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">Nenhum usuário encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'profiles' && (
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Controle de Perfis</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 text-xs uppercase tracking-wider text-slate-400 font-bold">ID do Perfil</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-slate-400 font-bold">Nome / Descrição</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-slate-400 font-bold">Autor ID</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-slate-400 font-bold">Status</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-slate-400 font-bold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-slate-600 font-mono text-xs">{p.id}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-xs">{p.description}</div>
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-xs">{p.authorId}</td>
                      <td className="p-3">
                        {p.isPublic ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Público
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                            <XCircle className="w-3 h-3" /> Privado
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteProfile(p.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {profiles.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500">Nenhum perfil encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'verifications' && (
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-16">
            <ShieldAlert className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Verificações em Análise</h2>
            <p className="text-slate-500 max-w-md text-center">
              Esta aba exibirá os usuários e perfis que solicitaram selo de verificação de autenticidade (Blue Tick). 
              Ainda não há dados no momento. O sistema de verificação será integrado em breve!
            </p>
          </section>
        )}
      </main>

      <AlertModal 
        show={modalConfig.show} 
        title={modalConfig.title} 
        message={modalConfig.message} 
        type={modalConfig.type} 
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}
