'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { FileText, LayoutTemplate, Heart, Plus, Download, Trash2, Star, User, Clock } from 'lucide-react';
import { AlertModal, AlertModalType } from '@/components/ui/AlertModal';

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

  // Custom Modal state
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
        // Filtra apenas os perfis criados pelo usuário logado
        setProfiles(all.filter((p: any) => p.ownerId === userId));
      }
    } catch (err: any) {
      console.log('Falha ao carregar perfis:', err.message);
    }
  };

  const loadFavorites = async () => {
    try {
      // Por enquanto, vamos pegar todos os perfis e marcar os favoritados
      // Quando tivermos um endpoint dedicado, podemos trocar
      const res = await fetchApi('/api/v1/profiles');
      if (res.ok) {
        const all = await res.json();
        // Filtra os que o usuário favoritou (favoritesCount > 0 como placeholder até ter endpoint)
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
      console.error(err);
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Carregando...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6">{error}</div>}

        {/* Header com ações */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Gerencie seus trabalhos, perfis e favoritos</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/create-profile"
              className="bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-700 py-2.5 px-5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm"
            >
              <Plus size={18} />
              Novo Perfil
            </Link>
            <Link
              href="/submit-work"
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-5 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 text-sm"
            >
              <Plus size={18} />
              Novo Trabalho
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 mb-8 w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
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
              <div key={work.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1">
                    {work.title || work.fileName || 'Trabalho sem título'}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      work.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : work.status === 'PROCESSING'
                        ? 'bg-amber-50 text-amber-700'
                        : work.status === 'DRAFT'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {work.status === 'DRAFT' ? 'RASCUNHO' : work.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-auto mb-4">
                    <Clock size={14} />
                    <span>Criado em {new Date(work.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="h-px bg-slate-100 mb-4" />
                  <div className="flex items-center justify-between">
                    {work.status === 'COMPLETED' && (
                      <button
                        onClick={() => handleDownloadJSON(work)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        <Download size={16} />
                        Baixar JSON
                      </button>
                    )}
                    {work.status === 'DRAFT' && (
                      <Link
                        href={`/submit-work/${work.id}`}
                        className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        Retomar Edição
                      </Link>
                    )}
                    <button
                      onClick={() => confirmDeleteWork(work)}
                      className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors ml-auto"
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {works.length === 0 && (
              <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-slate-200">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum trabalho ainda</h3>
                <p className="text-slate-500 mb-6">Crie seu primeiro trabalho para começar a usar o Anverso.</p>
                <Link
                  href="/submit-work"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white py-2.5 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={18} />
                  Criar Trabalho
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
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col"
              >
                <div className={`h-24 bg-gradient-to-br ${
                  ['from-indigo-500 to-purple-600', 'from-blue-500 to-cyan-500', 'from-emerald-400 to-teal-500', 'from-orange-400 to-rose-500', 'from-violet-500 to-fuchsia-500'][idx % 5]
                } p-4 flex items-end`}>
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-sm line-clamp-2">
                    {profile.name}
                  </h3>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">
                    {profile.description || 'Sem descrição.'}
                  </p>
                  <div className="flex items-center justify-between text-slate-400 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-600">
                        {profile.rating ? profile.rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart size={14} />
                      <span>{profile.favoritesCount || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {profiles.length === 0 && (
              <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-slate-200">
                <LayoutTemplate size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum perfil criado</h3>
                <p className="text-slate-500 mb-6">Crie um perfil de formatação para compartilhar com a comunidade.</p>
                <Link
                  href="/create-profile"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white py-2.5 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={18} />
                  Criar Perfil
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
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-rose-200 transition-all duration-300 flex flex-col"
              >
                <div className={`h-24 bg-gradient-to-br ${
                  ['from-rose-400 to-pink-500', 'from-fuchsia-400 to-purple-500', 'from-amber-400 to-orange-500', 'from-teal-400 to-cyan-500', 'from-indigo-400 to-blue-500'][idx % 5]
                } p-4 flex items-end relative`}>
                  <Heart size={20} className="absolute top-4 right-4 fill-white text-white" />
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-sm line-clamp-2">
                    {profile.name}
                  </h3>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">
                    {profile.description || 'Sem descrição.'}
                  </p>
                  <div className="flex items-center justify-between text-slate-400 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-600">
                        {profile.rating ? profile.rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                    <span className="text-xs text-rose-500 font-semibold">Favoritado</span>
                  </div>
                </div>
              </Link>
            ))}
            {favorites.length === 0 && (
              <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-slate-200">
                <Heart size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum favorito</h3>
                <p className="text-slate-500 mb-6">Explore a comunidade e favorite os perfis que mais gostar.</p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white py-2.5 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Explorar Comunidade
                </Link>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 mb-2">Excluir Trabalho?</h3>
              <p className="text-center text-sm text-slate-500">
                Tem certeza que deseja excluir o trabalho <strong className="text-slate-700">{workToDelete?.title || workToDelete?.fileName}</strong>?<br/>
                Esta ação é permanente e os dados não poderão ser recuperados.
              </p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 justify-end border-t border-slate-100">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 font-medium text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={executeDeleteWork}
                className="px-4 py-2 font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                Sim, excluir
              </button>
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
