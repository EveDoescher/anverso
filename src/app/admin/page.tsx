'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { AlertModal, AlertModalType } from '@/components/ui/AlertModal';
import { Button } from '@/components/ui/Button';
import { Users, BarChart, LayoutTemplate, ShieldAlert, CheckCircle2, XCircle, Trash2, ShieldCheck, User } from 'lucide-react';

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
    <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-[var(--color-cream)] border-t-[var(--color-gold)] rounded-full animate-spin mb-4" />
        <p className="text-[var(--color-neutral)] font-medium text-sm uppercase tracking-widest">Acessando sistema...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-text)] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {error && <div className="bg-[var(--color-error-bg-soft)] text-[var(--color-error)] p-4 rounded-xl border border-[var(--color-error-bg)] mb-6 text-sm">{error}</div>}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-serif text-[var(--color-espresso)] flex items-center gap-3">
              <ShieldCheck className="text-[var(--color-gold)]" size={32} />
              Centro de Comando
            </h1>
            <p className="text-[var(--color-neutral)] mt-2">Visão geral e controle de usuários do sistema</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white border border-[var(--color-border-soft)] p-2 rounded-2xl mb-10 overflow-x-auto shadow-sm w-fit">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'stats' ? 'bg-[var(--color-gold)] text-white shadow-md' : 'text-[var(--color-neutral)] hover:bg-[var(--color-paper-soft)] hover:text-[var(--color-espresso)]'
            }`}
          >
            <BarChart size={16} />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'users' ? 'bg-[var(--color-gold)] text-white shadow-md' : 'text-[var(--color-neutral)] hover:bg-[var(--color-paper-soft)] hover:text-[var(--color-espresso)]'
            }`}
          >
            <Users size={16} />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'profiles' ? 'bg-[var(--color-gold)] text-white shadow-md' : 'text-[var(--color-neutral)] hover:bg-[var(--color-paper-soft)] hover:text-[var(--color-espresso)]'
            }`}
          >
            <LayoutTemplate size={16} />
            Perfis Globais
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'verifications' ? 'bg-[var(--color-gold)] text-white shadow-md' : 'text-[var(--color-neutral)] hover:bg-[var(--color-paper-soft)] hover:text-[var(--color-espresso)]'
            }`}
          >
            <ShieldAlert size={16} />
            Verificações
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[var(--color-border-soft)] shadow-[var(--shadow-soft)]">
              <p className="text-[10px] font-bold text-[var(--color-neutral)] uppercase tracking-widest mb-2">Total de Usuários</p>
              <h3 className="text-4xl font-serif text-[var(--color-espresso)]">{users.length}</h3>
            </div>
            <div className="bg-[var(--color-success-bg)] p-6 rounded-3xl border border-[var(--color-success-soft)]">
              <p className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-2">Contas Ativas</p>
              <h3 className="text-4xl font-serif text-[var(--color-green)]">{users.filter(u => u.active !== false).length}</h3>
            </div>
            <div className="bg-[#FEF9C3] p-6 rounded-3xl border border-[#FEF08A]">
              <p className="text-[10px] font-bold text-[#A16207] uppercase tracking-widest mb-2">Logados Hoje</p>
              <h3 className="text-4xl font-serif text-[#A16207]">{stats.loggedInUsers}</h3>
            </div>
            <div className="bg-[var(--color-cream)] p-6 rounded-3xl border border-[var(--color-border-soft)]">
              <p className="text-[10px] font-bold text-[var(--color-coffee)] uppercase tracking-widest mb-2">Perfis Criados</p>
              <h3 className="text-4xl font-serif text-[var(--color-coffee)]">{profiles.length}</h3>
            </div>
            <div className="bg-[var(--color-paper-soft)] p-6 rounded-3xl border border-[var(--color-border-soft)]">
              <p className="text-[10px] font-bold text-[var(--color-neutral)] uppercase tracking-widest mb-2">Trabalhos Processados</p>
              <h3 className="text-4xl font-serif text-[var(--color-espresso)]">{stats.totalWorks}</h3>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <section className="bg-white p-2 sm:p-6 rounded-3xl border border-[var(--color-border-soft)] shadow-[var(--shadow-soft)]">
            <h2 className="text-xl font-serif text-[var(--color-espresso)] mb-6 px-4 sm:px-0">Gerenciar Usuários</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-[var(--color-border-soft)]">
                    <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold">ID / UUID</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold">Nome</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold">E-mail</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold">Status</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-[var(--color-border-soft)] hover:bg-[var(--color-paper-soft)] transition-colors">
                      <td className="p-4 text-[var(--color-neutral)] font-mono text-[10px]">{u.id}</td>
                      <td className="p-4 font-medium text-[var(--color-espresso)] flex items-center gap-2">
                        <User size={14} className="text-[var(--color-gold)]" />
                        {u.name || `${u.firstName || ''} ${u.lastName || ''}`}
                      </td>
                      <td className="p-4 text-[var(--color-coffee)]">{u.email}</td>
                      <td className="p-4">
                        {u.active !== false ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-success-bg)] text-[var(--color-green)] rounded-md text-[10px] uppercase font-bold border border-[var(--color-success-soft)]">
                            <CheckCircle2 size={12} /> Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-error-bg-soft)] text-[var(--color-error)] rounded-md text-[10px] uppercase font-bold border border-[var(--color-error-bg)]">
                            <XCircle size={12} /> Inativo
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {u.active !== false ? (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.id === currentUser?.id}
                            className="mx-auto"
                            trailingIcon={false}
                          >
                            Desativar
                          </Button>
                        ) : (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => handleRestoreUser(u.id)}
                            disabled={u.id === currentUser?.id}
                            className="mx-auto bg-[var(--color-green)]"
                            trailingIcon={false}
                          >
                            Reativar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[var(--color-neutral)] text-sm">Nenhum usuário encontrado no sistema.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'profiles' && (
          <section className="bg-white p-2 sm:p-6 rounded-3xl border border-[var(--color-border-soft)] shadow-[var(--shadow-soft)]">
            <h2 className="text-xl font-serif text-[var(--color-espresso)] mb-6 px-4 sm:px-0">Controle de Perfis de Formatação</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-[var(--color-border-soft)]">
                    <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold">ID do Perfil</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold">Informações</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold">Autor ID</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold">Visibilidade</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id} className="border-b border-[var(--color-border-soft)] hover:bg-[var(--color-paper-soft)] transition-colors">
                      <td className="p-4 text-[var(--color-neutral)] font-mono text-[10px]">{p.id}</td>
                      <td className="p-4">
                        <div className="font-medium text-[var(--color-espresso)]">{p.name}</div>
                        <div className="text-xs text-[var(--color-neutral)] truncate max-w-[200px] mt-1">{p.description}</div>
                      </td>
                      <td className="p-4 text-[var(--color-coffee)] font-mono text-[10px]">{p.authorId}</td>
                      <td className="p-4">
                        {p.isPublic ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[var(--color-paper-soft)] border border-[var(--color-border-soft)] text-[var(--color-espresso)] rounded text-[10px] font-bold uppercase">
                            <CheckCircle2 size={12} /> Público
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[var(--color-cream)] border border-[var(--color-border-soft)] text-[var(--color-coffee)] rounded text-[10px] font-bold uppercase">
                            <XCircle size={12} /> Privado
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeleteProfile(p.id)}
                          icon={Trash2}
                          className="mx-auto"
                          trailingIcon={false}
                        >
                          Deletar
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {profiles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[var(--color-neutral)] text-sm">Nenhum perfil encontrado no banco de dados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'verifications' && (
          <section className="bg-white p-12 rounded-3xl border border-[var(--color-border-soft)] shadow-[var(--shadow-soft)] flex flex-col items-center justify-center text-center">
            <ShieldAlert size={60} className="text-[var(--color-border-strong)] mb-6" />
            <h2 className="text-2xl font-serif text-[var(--color-espresso)] mb-3">Verificações em Análise</h2>
            <p className="text-[var(--color-neutral)] max-w-md">
              Esta aba exibirá os usuários que solicitaram o selo de verificação de autenticidade (Docente/Instituição). 
              O sistema de KYC será integrado em breve.
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
