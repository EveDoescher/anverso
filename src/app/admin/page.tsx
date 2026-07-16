'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { AlertModal, AlertModalType } from '@/components/ui/AlertModal';
import { Button } from '@/components/ui/Button';
import { TabNavigation, TabNavigationItem } from '@/components/ui/TabNavigation';
import { Users, BarChart, LayoutTemplate, ShieldAlert, CheckCircle2, XCircle, Trash2, ShieldCheck, User, GraduationCap, Clock, Check, X } from 'lucide-react';
import { UserBadge, userBadgeVariant } from '@/components/ui/UserBadge';

interface UserData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
  isTeacherVerified?: boolean;
}

interface ProfileData {
  id: string;
  name: string;
  description: string;
  authorId: string;
  isPublic?: boolean;
}

interface VerificationRequest {
  id: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  institution: string;
  documentUrl?: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'profiles' | 'verifications'>('stats');
  
  const [stats, setStats] = useState<{
    loggedInUsers: number;
    totalWorks: number;
    byStatus: Record<string, number>;
    topProfiles: Array<{ profileId: string; name?: string; count: number }>;
  }>({ loggedInUsers: 0, totalWorks: 0, byStatus: {}, topProfiles: [] });
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
        loadStats(),
        loadVerifications()
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
      let byStatus: Record<string, number> = {};
      let topProfiles: Array<{ profileId: string; name?: string; count: number }> = [];

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
          byStatus = workStats.byStatus || {};
          // Enrich topProfiles with names from loaded profiles list
          const rawTop: Array<{ profileId: string; count: number }> = workStats.topProfiles || [];
          topProfiles = rawTop;
        }
      } catch (e) { console.error(e); }

      try {
        const resProfileStats = await fetchApi('/api/v1/profiles/stats', { method: 'GET' });
        if (resProfileStats.ok) {
          const profileStats = await resProfileStats.json();
          // Merge names from profile stats topByUsage if available
          const topByUsage: Array<{ id: string; name: string; usageCount: number }> = profileStats.topByUsage || [];
          if (topByUsage.length > 0 && topProfiles.length === 0) {
            topProfiles = topByUsage.map(p => ({ profileId: p.id, name: p.name, count: p.usageCount }));
          } else if (topByUsage.length > 0) {
            topProfiles = topProfiles.map(tp => {
              const match = topByUsage.find(p => p.id === tp.profileId);
              return { ...tp, name: match?.name };
            });
          }
        }
      } catch (e) { console.error(e); }

      setStats({ loggedInUsers: loggedIn, totalWorks, byStatus, topProfiles });
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

  const loadVerifications = async () => {
    try {
      const res = await fetchApi('/api/teacher-verifications', { method: 'GET' });
      if (res.ok) setVerifications(await res.json());
    } catch (err) {
      console.error('Falha ao carregar verificações', err);
    }
  };

  const handleReviewVerification = async (id: string, action: 'approve' | 'reject') => {
    const label = action === 'approve' ? 'aprovar' : 'rejeitar';
    showConfirm(
      `${action === 'approve' ? 'Aprovar' : 'Rejeitar'} Verificação`,
      `Deseja realmente ${label} esta solicitação de verificação docente?`,
      async () => {
        try {
          const res = await fetchApi(`/api/teacher-verifications/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ action })
          });
          if (res.ok) {
            const updated = await res.json();
            setVerifications(prev => prev.map(v => v.id === id ? updated : v));
            showAlert(
              action === 'approve' ? 'Aprovado' : 'Rejeitado',
              `Solicitação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso.`,
              'success'
            );
          } else {
            showAlert('Erro', 'Falha ao revisar a solicitação.', 'error');
          }
        } catch (err) {
          console.error(err);
          showAlert('Erro', 'Erro de conexão ao revisar a solicitação.', 'error');
        }
        closeModal();
      }
    );
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
        <TabNavigation
          items={[
            { id: 'stats', label: 'Visão Geral', icon: BarChart },
            { id: 'users', label: 'Usuários', icon: Users },
            { id: 'profiles', label: 'Perfis Globais', icon: LayoutTemplate },
            { id: 'verifications', label: 'Verificações', icon: ShieldAlert },
          ] as TabNavigationItem[]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as typeof activeTab)}
          className="mb-10 w-fit"
        />

        {/* Tab Content */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            {/* Cards principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[var(--color-border-soft)] shadow-[var(--shadow-soft)]">
                <p className="text-[10px] font-bold text-[var(--color-neutral)] uppercase tracking-widest mb-2">Total de Usuários</p>
                <h3 className="text-4xl font-serif text-[var(--color-espresso)]">{users.length}</h3>
              </div>
              <div className="bg-[var(--color-success-bg)] p-6 rounded-3xl border border-[var(--color-success-soft)]">
                <p className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-2">Contas Ativas</p>
                <h3 className="text-4xl font-serif text-[var(--color-green)]">{users.filter(u => u.active !== false).length}</h3>
              </div>
              <div className="bg-[var(--color-cream)] p-6 rounded-3xl border border-[rgba(181,137,42,0.28)]">
                <p className="text-[10px] font-bold text-[var(--color-gold)] uppercase tracking-widest mb-2">Sessões Ativas</p>
                <h3 className="text-4xl font-serif text-[var(--color-gold)]">{stats.loggedInUsers}</h3>
              </div>
              <div className="bg-[var(--color-cream)] p-6 rounded-3xl border border-[var(--color-border-soft)]">
                <p className="text-[10px] font-bold text-[var(--color-coffee)] uppercase tracking-widest mb-2">Perfis Criados</p>
                <h3 className="text-4xl font-serif text-[var(--color-coffee)]">{profiles.length}</h3>
              </div>
              <div className="bg-[var(--color-paper-soft)] p-6 rounded-3xl border border-[var(--color-border-soft)]">
                <p className="text-[10px] font-bold text-[var(--color-neutral)] uppercase tracking-widest mb-2">Total de Trabalhos</p>
                <h3 className="text-4xl font-serif text-[var(--color-espresso)]">{stats.totalWorks}</h3>
              </div>
            </div>

            {/* Trabalhos por status + Top perfis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trabalhos por status */}
              {Object.keys(stats.byStatus).length > 0 && (
                <div className="bg-white p-6 rounded-3xl border border-[var(--color-border-soft)] shadow-[var(--shadow-soft)]">
                  <h3 className="text-sm font-bold text-[var(--color-espresso)] uppercase tracking-widest mb-5">Trabalhos por Status</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byStatus).map(([status, count]) => {
                      const statusLabels: Record<string, string> = {
                        DRAFT: 'Rascunho', PENDING: 'Aguardando', PROCESSING: 'Processando',
                        COMPLETED: 'Concluído', FAILED: 'Falhou'
                      };
                      const statusColors: Record<string, string> = {
                        DRAFT: 'bg-[var(--color-border-soft)] text-[var(--color-neutral)]',
                        PENDING: 'bg-amber-100 text-amber-700',
                        PROCESSING: 'bg-blue-100 text-blue-700',
                        COMPLETED: 'bg-[var(--color-success-bg)] text-[var(--color-green)]',
                        FAILED: 'bg-red-50 text-red-600',
                      };
                      const total = stats.totalWorks || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={status} className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${statusColors[status] || 'bg-[var(--color-paper-soft)] text-[var(--color-neutral)]'}`}>
                            {statusLabels[status] || status}
                          </span>
                          <div className="flex-1 h-2 bg-[var(--color-paper-soft)] rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--color-green)] rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-sm font-bold text-[var(--color-espresso)] w-8 text-right shrink-0">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top 5 perfis mais usados */}
              {stats.topProfiles.length > 0 && (
                <div className="bg-white p-6 rounded-3xl border border-[var(--color-border-soft)] shadow-[var(--shadow-soft)]">
                  <h3 className="text-sm font-bold text-[var(--color-espresso)] uppercase tracking-widest mb-5">Top 5 Perfis Mais Usados</h3>
                  <div className="space-y-3">
                    {stats.topProfiles.map((p, idx) => (
                      <div key={p.profileId} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[var(--color-success-bg)] text-[var(--color-green)] flex items-center justify-center text-[11px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="flex-1 text-sm text-[var(--color-espresso)] font-medium truncate">
                          {p.name || p.profileId}
                        </span>
                        <span className="text-sm font-bold text-[var(--color-green)] shrink-0">{p.count} uso{p.count !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                      <td className="p-4 font-medium text-[var(--color-espresso)]">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-[var(--color-gold)] shrink-0" />
                          <span>{u.name || `${u.firstName || ''} ${u.lastName || ''}`}</span>
                          {userBadgeVariant(u.role, u.isTeacherVerified) && (
                            <UserBadge variant={userBadgeVariant(u.role, u.isTeacherVerified)!} compact />
                          )}
                        </div>
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
          <section className="bg-white p-2 sm:p-6 rounded-3xl border border-[var(--color-border-soft)] shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
              <h2 className="text-xl font-serif text-[var(--color-espresso)] flex items-center gap-2">
                <GraduationCap size={20} className="text-[var(--color-gold)]" />
                Verificações Docentes
              </h2>
              <span className="text-xs text-[var(--color-neutral)] bg-[var(--color-paper-soft)] px-3 py-1 rounded-full border border-[var(--color-border-soft)]">
                {verifications.filter(v => v.status === 'PENDING').length} pendente(s)
              </span>
            </div>
            {verifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ShieldAlert size={48} className="text-[var(--color-border-soft)] mb-4" />
                <p className="text-[var(--color-neutral)] text-sm">Nenhuma solicitação de verificação docente ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-[var(--color-border-soft)]">
                      <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold">Solicitante</th>
                      <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold">Instituição</th>
                      <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold">Documento</th>
                      <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold">Status</th>
                      <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold">Data</th>
                      <th className="p-4 text-[10px] uppercase tracking-widest text-[var(--color-neutral)] font-bold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map(v => (
                      <tr key={v.id} className="border-b border-[var(--color-border-soft)] hover:bg-[var(--color-paper-soft)] transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-[var(--color-espresso)]">{v.userFirstName} {v.userLastName}</div>
                          <div className="text-xs text-[var(--color-neutral)] mt-0.5">{v.userEmail}</div>
                        </td>
                        <td className="p-4 text-[var(--color-espresso)] text-sm max-w-[180px] truncate">{v.institution}</td>
                        <td className="p-4">
                          {v.documentUrl ? (
                            <a href={v.documentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-green)] underline hover:opacity-80">
                              Ver documento
                            </a>
                          ) : (
                            <span className="text-xs text-[var(--color-neutral)]">Não enviado</span>
                          )}
                        </td>
                        <td className="p-4">
                          {v.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-[10px] font-bold uppercase">
                              <Clock size={10} /> Pendente
                            </span>
                          )}
                          {v.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--color-success-bg)] border border-[var(--color-success-soft)] text-[var(--color-green)] rounded text-[10px] font-bold uppercase">
                              <CheckCircle2 size={10} /> Aprovado
                            </span>
                          )}
                          {v.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--color-error-bg-soft)] border border-[var(--color-error-bg)] text-[var(--color-error)] rounded text-[10px] font-bold uppercase">
                              <XCircle size={10} /> Rejeitado
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-xs text-[var(--color-neutral)]">
                          {new Date(v.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4">
                          {v.status === 'PENDING' && (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                icon={Check}
                                trailingIcon={false}
                                onClick={() => handleReviewVerification(v.id, 'approve')}
                                className="bg-[var(--color-green)] mx-auto"
                              >
                                Aprovar
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                icon={X}
                                trailingIcon={false}
                                onClick={() => handleReviewVerification(v.id, 'reject')}
                                className="mx-auto"
                              >
                                Rejeitar
                              </Button>
                            </div>
                          )}
                          {v.status !== 'PENDING' && (
                            <span className="text-xs text-[var(--color-neutral)] text-center block">
                              {v.reviewedAt ? new Date(v.reviewedAt).toLocaleDateString('pt-BR') : '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
