'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { FileText, LayoutTemplate, Heart, Plus, Download, Trash2, Star, Clock } from 'lucide-react';
import { AlertModal, AlertModalType } from '@/components/ui/AlertModal';
import { Button } from '@/components/ui/Button';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
  profilePictureUrl?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [works, setWorks] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'works' | 'profiles' | 'favorites'>('works');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<any>(null);
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

  const closeModal = () => setModalConfig(prev => ({ ...prev, show: false }));

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
      loadProfiles(data.id);
      loadFavorites();
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadWorks = async () => {
    try {
      const res = await fetchApi('/api/v1/works', { method: 'GET' });
      if (res.ok) setWorks(await res.json());
    } catch (err: any) {
      console.log('Falha ao carregar trabalhos:', err.message);
    }
  };

  const loadProfiles = async (userId: string) => {
    try {
      const res = await fetchApi('/api/v1/profiles');
      if (res.ok) {
        const all = await res.json();
        setProfiles(all.filter((p: any) => p.ownerId === userId));
      }
    } catch (err: any) {
      console.log('Falha ao carregar perfis:', err.message);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await fetchApi('/api/v1/profiles');
      if (res.ok) {
        const all = await res.json();
        setFavorites(all.filter((p: any) => p.favoritesCount > 0));
      }
    } catch { /* ignore */ }
  };

  const handleDownloadJSON = (work: any) => {
    try {
      const payload = {
        userId: work.userId,
        fileName: work.fileName,
        profileId: work.profileId,
        options: work.options,
        document: work.document
      };
      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${work.fileName || 'trabalho'}-payload.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      showAlert('Erro', 'Erro ao tentar gerar o JSON.', 'error');
    }
  };

  const confirmDeleteWork = (work: any) => {
    setWorkToDelete(work);
    setDeleteModalOpen(true);
  };

  const executeDeleteWork = async () => {
    if (!workToDelete) return;
    try {
      const res = await fetchApi(`/api/v1/works/${workToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setWorks(works.filter(w => w.id !== workToDelete.id));
        setDeleteModalOpen(false);
        setWorkToDelete(null);
      } else {
        showAlert('Erro', 'Falha ao excluir o trabalho.', 'error');
      }
    } catch (err) {
      showAlert('Erro', 'Erro de conexão ao excluir trabalho.', 'error');
    }
  };

  const tabs = [
    { key: 'works' as const, label: 'Meus Trabalhos', icon: FileText, count: works.length },
    { key: 'profiles' as const, label: 'Meus Perfis', icon: LayoutTemplate, count: profiles.length },
    { key: 'favorites' as const, label: 'Favoritos', icon: Heart, count: favorites.length },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-[var(--color-cream)] border-t-[var(--color-green)] rounded-full animate-spin mb-4" />
        <p className="text-[var(--color-neutral)] font-medium text-sm uppercase tracking-widest">Carregando...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-text)] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {error && <div className="bg-[var(--color-error-bg-soft)] text-[var(--color-error)] p-4 rounded-xl border border-[var(--color-error-bg)] mb-6 text-sm font-medium">{error}</div>}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-serif text-[var(--color-espresso)]">Dashboard</h1>
            <p className="text-[var(--color-neutral)] mt-1">Gerencie seus trabalhos, perfis e favoritos</p>
          </div>
          <div className="flex gap-3">
            <Link href="/create-profile" tabIndex={-1}>
              <Button variant="ghost" icon={Plus}>
                Novo Perfil
              </Button>
            </Link>
            <Link href="/submit-work" tabIndex={-1}>
              <Button variant="primary" icon={Plus}>
                Novo Trabalho
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white border border-[var(--color-border-soft)] rounded-2xl p-2 mb-10 w-fit shadow-[var(--shadow-soft)]">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--color-green)] text-white shadow-md'
                    : 'text-[var(--color-neutral)] hover:text-[var(--color-espresso)] hover:bg-[var(--color-paper-soft)]'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[var(--color-border-soft)] text-[var(--color-neutral)]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content: Meus Trabalhos */}
        {activeTab === 'works' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map((work) => (
              <div key={work.id} className="bg-white rounded-3xl border border-[var(--color-border-soft)] overflow-hidden hover:shadow-[var(--shadow-soft)] hover:border-[var(--color-border)] transition-all duration-300 flex flex-col">
                <div className="h-1.5 bg-[var(--color-gold)]" />
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-serif text-[var(--color-espresso)] text-xl mb-3 line-clamp-1">
                    {work.title || work.fileName || 'Trabalho sem título'}
                  </h3>
                  <div className="flex items-center gap-2 mb-5">
                    <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${
                      work.status === 'COMPLETED'
                        ? 'bg-[var(--color-success-bg)] text-[var(--color-green)] border-[var(--color-success-soft)]'
                        : work.status === 'PROCESSING'
                        ? 'bg-[#FEF9C3] text-[#A16207] border-[#FEF08A]'
                        : work.status === 'DRAFT'
                        ? 'bg-[var(--color-paper-soft)] text-[var(--color-espresso)] border-[var(--color-border-soft)]'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {work.status === 'DRAFT' ? 'RASCUNHO' : work.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-neutral)] mt-auto mb-5">
                    <Clock size={12} />
                    <span>Criado em {new Date(work.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="h-[1px] bg-[var(--color-border-soft)] mb-4 w-full" />
                  <div className="flex items-center justify-between">
                    {work.status === 'COMPLETED' && (
                      <button
                        onClick={() => handleDownloadJSON(work)}
                        className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-forest)] hover:opacity-70 transition-opacity"
                      >
                        <Download size={14} />
                        Baixar JSON
                      </button>
                    )}
                    {work.status === 'DRAFT' && (
                      <Link
                        href={`/submit-work/${work.id}`}
                        className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-gold)] hover:opacity-70 transition-opacity"
                      >
                        Retomar Edição
                      </Link>
                    )}
                    <button
                      onClick={() => confirmDeleteWork(work)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-error)] hover:opacity-70 transition-opacity ml-auto"
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {works.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-white rounded-3xl border border-[var(--color-border-soft)] shadow-sm">
                <FileText size={40} className="mx-auto text-[var(--color-border-strong)] mb-4" />
                <h3 className="text-xl font-serif text-[var(--color-espresso)] mb-2">Nenhum trabalho ainda</h3>
                <p className="text-[var(--color-neutral)] mb-6 text-sm">Crie seu primeiro trabalho para começar a usar o Anverso.</p>
                <Link href="/submit-work">
                  <Button variant="primary" icon={Plus}>Criar Trabalho</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Meus Perfis */}
        {activeTab === 'profiles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile, idx) => (
              <Link
                href={`/explore/${profile.id}`}
                key={profile.id}
                className="group bg-white rounded-3xl border border-[var(--color-border-soft)] overflow-hidden hover:shadow-[var(--shadow-soft)] hover:border-[var(--color-border)] transition-all duration-300 flex flex-col"
              >
                <div className={`h-28 p-5 flex items-end ${['bg-[var(--color-forest)]', 'bg-[var(--color-coffee)]', 'bg-[var(--color-gold)]', 'bg-[#2A3B31]', 'bg-[#8C7A6B]'][idx % 5]}`}>
                  <h3 className="text-white font-serif text-xl leading-tight line-clamp-2">
                    {profile.name}
                  </h3>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-[var(--color-neutral)] text-sm line-clamp-2 mb-5 flex-1">
                    {profile.description || 'Sem descrição.'}
                  </p>
                  <div className="flex items-center justify-between text-[var(--color-neutral)] text-xs font-medium border-t border-[var(--color-border-soft)] pt-4 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Star size={12} className="fill-[var(--color-gold)] text-[var(--color-gold)]" />
                      <span className="text-[var(--color-espresso)]">
                        {profile.rating ? profile.rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart size={12} />
                      <span>{profile.favoritesCount || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {profiles.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-white rounded-3xl border border-[var(--color-border-soft)] shadow-sm">
                <LayoutTemplate size={40} className="mx-auto text-[var(--color-border-strong)] mb-4" />
                <h3 className="text-xl font-serif text-[var(--color-espresso)] mb-2">Nenhum perfil criado</h3>
                <p className="text-[var(--color-neutral)] mb-6 text-sm">Crie um perfil de formatação para compartilhar com a comunidade.</p>
                <Link href="/create-profile">
                  <Button variant="primary" icon={Plus}>Criar Perfil</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Favoritos */}
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((profile, idx) => (
              <Link
                href={`/explore/${profile.id}`}
                key={profile.id}
                className="group bg-white rounded-3xl border border-[var(--color-border-soft)] overflow-hidden hover:shadow-[var(--shadow-soft)] hover:border-[var(--color-border)] transition-all duration-300 flex flex-col"
              >
                <div className={`h-28 p-5 flex items-end relative ${['bg-[#8C7A6B]', 'bg-[var(--color-gold)]', 'bg-[var(--color-forest)]', 'bg-[#2A3B31]', 'bg-[var(--color-coffee)]'][idx % 5]}`}>
                  <Heart size={16} className="absolute top-4 right-4 fill-white text-white opacity-80" />
                  <h3 className="text-white font-serif text-xl leading-tight line-clamp-2">
                    {profile.name}
                  </h3>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-[var(--color-neutral)] text-sm line-clamp-2 mb-5 flex-1">
                    {profile.description || 'Sem descrição.'}
                  </p>
                  <div className="flex items-center justify-between text-[var(--color-neutral)] text-xs font-medium border-t border-[var(--color-border-soft)] pt-4 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Star size={12} className="fill-[var(--color-gold)] text-[var(--color-gold)]" />
                      <span className="text-[var(--color-espresso)]">
                        {profile.rating ? profile.rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Favoritado</span>
                  </div>
                </div>
              </Link>
            ))}
            {favorites.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-white rounded-3xl border border-[var(--color-border-soft)] shadow-sm">
                <Heart size={40} className="mx-auto text-[var(--color-border-strong)] mb-4" />
                <h3 className="text-xl font-serif text-[var(--color-espresso)] mb-2">Nenhum favorito</h3>
                <p className="text-[var(--color-neutral)] mb-6 text-sm">Explore a comunidade e favorite os perfis que mais gostar.</p>
                <Link href="/explore">
                  <Button variant="ghost">Explorar Comunidade</Button>
                </Link>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-[var(--color-espresso)]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-[var(--shadow-elevated)] w-full max-w-sm overflow-hidden p-6 border border-[var(--color-border-soft)]">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--color-error-bg-soft)] mx-auto mb-5 border border-[var(--color-error-bg)]">
              <Trash2 className="w-5 h-5 text-[var(--color-error)]" />
            </div>
            <h3 className="text-xl font-serif text-center text-[var(--color-espresso)] mb-2">Excluir Trabalho?</h3>
            <p className="text-center text-sm text-[var(--color-neutral)] mb-6">
              Tem certeza que deseja excluir o trabalho <strong>{workToDelete?.title || workToDelete?.fileName}</strong>?
              Esta ação é permanente.
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="danger" size="md" className="w-full justify-center" onClick={executeDeleteWork}>
                Excluir Permanentemente
              </Button>
              <Button variant="quiet" size="md" className="w-full justify-center" onClick={() => setDeleteModalOpen(false)} trailingIcon={false}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Alert Modal */}
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
