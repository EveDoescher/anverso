'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Heart, Share2, FileCheck, CheckCircle2, User, Clock, MessageSquare, AlertCircle, LayoutTemplate } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { AlertModal, AlertModalType } from '@/components/ui/AlertModal';

export default function ProfileDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Real data for community aspects
  const [isFavorite, setIsFavorite] = useState(false);
  const [rating, setRating] = useState('0.0');
  const [reviewsCount, setReviewsCount] = useState(0);
  const [usageCount, setUsageCount] = useState(0);
  const [authorName, setAuthorName] = useState('Anverso Official');
  const [comments, setComments] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [loggedUserName, setLoggedUserName] = useState('');
  const [loggedUserId, setLoggedUserId] = useState('');
  
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'versions'>('details');
  const [versions, setVersions] = useState<any[]>([]);

  const [modalConfig, setModalConfig] = useState<{show: boolean, title: string, message: string, type: AlertModalType, redirectUrl?: string, onConfirm?: () => void}>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: AlertModalType, redirectUrl?: string, onConfirm?: () => void) => {
    setModalConfig({ show: true, title, message, type, redirectUrl, onConfirm });
  };

  const closeModal = () => {
    const url = modalConfig.redirectUrl;
    const confirmFn = modalConfig.onConfirm;
    const type = modalConfig.type;
    setModalConfig(prev => ({ ...prev, show: false }));
    if (url) {
      router.push(url);
    } else if (confirmFn && type === 'success') {
      confirmFn();
    }
  };

  const requireAuth = (callback: () => void) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert('Acesso Negado', 'Você precisa estar logado para realizar esta ação.', 'error', '/login');
      return;
    }
    callback();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchApi(`/api/v1/profiles/${id}`);
        const data = await response.json();
        
        if (data) {
          setProfile(data);
          setRating(data.rating ? data.rating.toFixed(1) : '0.0');
          setReviewsCount(data.reviewsCount || 0);
          setUsageCount(data.usageCount || 0);
          setIsFavorite(data.isFavoritedByUser || false);
          
          // Buscar nome real do autor
          if (data.ownerId) {
            try {
              const userRes = await fetchApi(`/api/users/${data.ownerId}/public`);
              const userData = await userRes.json();
              setAuthorName(userData.name || 'Anverso Official');
            } catch { /* fallback to default */ }
          }
        } else {
          setProfile({
            id,
            name: 'Perfil não encontrado',
            description: 'Este perfil pode ter sido removido.',
          });
        }
        
        // Fetch comments
        const revResponse = await fetchApi(`/api/v1/profiles/${id}/reviews`);
        if (revResponse.ok) {
          const revData = await revResponse.json();
          setComments(revData);
        }
        
        // Fetch versions
        const verResponse = await fetchApi(`/api/v1/profiles/${id}/versions`);
        if (verResponse.ok) {
          const verData = await verResponse.json();
          setVersions(verData);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  // Buscar dados do usuário logado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchApi('/api/users/me').then(async res => {
        if (res.ok) {
          const data = await res.json();
          setLoggedUserName(data.name || '');
          setLoggedUserId(data.id || '');
        }
      }).catch(() => {});
    }
  }, []);

  const handleToggleFavorite = async () => {
    try {
      await fetchApi(`/api/v1/profiles/${id}/favorite`, { method: 'POST' });
      setIsFavorite(!isFavorite);
    } catch (e) {
      showAlert('Erro', 'Erro ao atualizar favorito.', 'error');
    }
  };

  const handleRestoreVersion = async (version: any) => {
    try {
      const res = await fetchApi(`/api/v1/profiles/${id}/versions/${version.id}/restore`, {
        method: 'POST'
      });
      
      if (!res.ok) throw new Error('Falha ao restaurar versão');
      showAlert('Sucesso', 'Versão restaurada com sucesso!', 'success', undefined, () => window.location.reload());
    } catch (e) {
      showAlert('Erro', 'Erro ao restaurar versão.', 'error');
    }
  };

  const handleSubmitReview = async () => {
    if (!newReviewText.trim()) return;
    try {
      await fetchApi(`/api/v1/profiles/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: newReviewRating,
          comment: newReviewText,
          userName: loggedUserName || 'Anônimo',
        })
      });
      setShowReviewForm(false);
      setNewReviewText('');
      // Recarregar avaliações
      const revResponse = await fetchApi(`/api/v1/profiles/${id}/reviews`);
      if (revResponse.ok) {
        setComments(await revResponse.json());
      }
    } catch (e) {
      showAlert('Erro', 'Erro ao enviar avaliação.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
        <Link href="/explore" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 font-medium">
          <ArrowLeft size={18} />
          Voltar para Comunidade
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Header Banner */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 relative">
            <div className="absolute inset-0 bg-grid-white/[0.1] bg-[bottom_1px_center]" />
            <div className="absolute bottom-6 left-6 md:left-10 flex gap-4">
              <div className="w-24 h-32 bg-white rounded-lg shadow-xl p-2 flex flex-col transform rotate-[-5deg]">
                <div className="w-full h-2 bg-slate-200 rounded-full mb-2" />
                <div className="w-3/4 h-2 bg-slate-200 rounded-full mb-2" />
                <div className="w-full h-1/2 bg-slate-100 rounded mt-auto" />
              </div>
              <div className="w-24 h-32 bg-white rounded-lg shadow-xl p-2 flex flex-col transform rotate-[5deg] translate-y-4">
                <div className="w-full h-1/2 bg-slate-100 rounded mb-auto" />
                <div className="w-full h-2 bg-slate-200 rounded-full mt-2" />
                <div className="w-2/4 h-2 bg-slate-200 rounded-full mt-2" />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10 pt-16 md:pt-10 flex flex-col md:flex-row gap-10">
            {/* Left Column: Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full">
                  Template ABNT
                </span>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-2 py-1 rounded-lg">
                  <Star size={14} className="fill-amber-500" />
                  {rating}
                </div>
                <span className="text-slate-400 text-sm">({reviewsCount} avaliações)</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                {profile?.name}
              </h1>

              <div className="flex items-center gap-4 text-sm text-slate-600 mb-8 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                    {authorName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Criado por</p>
                    <p className="font-semibold text-slate-700">{authorName}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="text-xs text-slate-400">Usos</p>
                  <p className="font-semibold text-slate-700 flex items-center gap-1">
                    <FileCheck size={14} /> {usageCount}
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="text-xs text-slate-400">ID do Perfil</p>
                  <p className="font-semibold text-slate-700 font-mono text-xs mt-0.5">
                    {profile?.id}
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Sobre este Perfil</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {profile?.description || 'Nenhuma descrição detalhada foi fornecida para este perfil de formatação. Este perfil contém um conjunto de regras, margens, fontes e espaçamentos pré-configurados.'}
                </p>

                <h3 className="text-lg font-bold text-slate-900 mb-4">O que está incluído?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {['Capa e Folha de Rosto Automáticas', 'Sumário Gerado Dinamicamente', 'Espaçamento ABNT (1.5)', 'Margens 3cm/2cm', 'Paginação no Canto Superior Direito', 'Referências Bibliográficas'].map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Actions Sidebar */}
            <div className="w-full md:w-80 shrink-0">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 sticky top-24">


                <button 
                  onClick={() => requireAuth(() => router.push('/submit-work'))}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] mb-3 flex items-center justify-center gap-2"
                >
                  <LayoutTemplate size={20} />
                  Usar este Perfil
                </button>
                
                {loggedUserId && profile?.ownerId === loggedUserId && (
                  <button 
                    onClick={() => router.push(`/create-profile/${profile.id}`)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] mb-3 flex items-center justify-center gap-2"
                  >
                    Editar Perfil
                  </button>
                )}

                <div className="flex gap-3 mb-6">
                  <button 
                    onClick={() => requireAuth(handleToggleFavorite)}
                    className={`flex-1 py-3 rounded-xl font-semibold border-2 transition-colors flex items-center justify-center gap-2 ${isFavorite ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    <Heart size={18} className={isFavorite ? 'fill-rose-500' : ''} />
                    Favoritar
                  </button>
                  <button className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                    <Share2 size={18} />
                    Compartilhar
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-500 shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Este perfil é mantido pela comunidade. Verifique as margens e regras específicas da sua instituição antes da entrega final.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-12 border-b border-slate-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 font-semibold text-sm transition-colors relative ${activeTab === 'details' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Detalhes do Perfil
              {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 font-semibold text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'reviews' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Avaliações
              <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{reviewsCount}</span>
              {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`pb-4 font-semibold text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'versions' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Versões Anteriores
              <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{versions.length}</span>
              {activeTab === 'versions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
            </button>
          </nav>
        </div>

        <div className="mt-8 mb-24 max-w-4xl">
          {activeTab === 'details' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200">
               <h3 className="text-xl font-bold text-slate-900 mb-6">Detalhes Técnicos</h3>
               <p className="text-slate-600">Este perfil utiliza JSON como base para estruturar configurações de formatação ABNT, APA ou personalizadas.</p>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-4">
              {versions.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200">
                  <p className="text-slate-500">Nenhuma versão anterior encontrada para este perfil.</p>
                </div>
              ) : (
                versions.map((v, idx) => (
                  <div key={v.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        {v.versionName || `Versão ${versions.length - idx}`}
                        {v.isTemporary && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Backup Temporário (30 dias)</span>}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">Salva em: {new Date(v.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                    {/* Ação para usar a versão (ex: redirecionar para submissão com query string da versão, ou apenas visualização) */}
                    <div className="flex gap-2">
                      {!v.isTemporary && (
                        <button 
                          onClick={() => requireAuth(() => router.push(`/submit-work?profileId=${profile?.id}&versionId=${v.id}`))}
                          className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition-colors bg-indigo-50 px-4 py-2 rounded-lg">
                          Usar esta versão
                        </button>
                      )}
                      {v.isTemporary && profile?.ownerId === loggedUserId && (
                        <button 
                          onClick={() => handleRestoreVersion(v)}
                          className="text-amber-700 font-semibold text-sm hover:text-amber-900 transition-colors bg-amber-50 px-4 py-2 rounded-lg">
                          Restaurar versão
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare size={24} className="text-indigo-600" />
                  Avaliações da Comunidade

            </h2>
            {!showReviewForm && (
              <button 
                onClick={() => requireAuth(() => setShowReviewForm(true))}
                className="text-indigo-600 font-semibold text-sm hover:underline"
              >
                Escrever avaliação
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-sm mb-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Sua Avaliação</h3>
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(star => {
                  const halfVal = star - 0.5;
                  const fullVal = star;
                  const isHalfFilled = newReviewRating >= halfVal && newReviewRating < fullVal;
                  const isFullFilled = newReviewRating >= fullVal;
                  return (
                    <div key={star} className="relative w-7 h-7 cursor-pointer">
                      {/* Left half = half star */}
                      <div 
                        className="absolute inset-0 w-1/2 overflow-hidden z-10"
                        onClick={() => setNewReviewRating(halfVal)}
                      >
                        <Star size={28} className={`${isHalfFilled || isFullFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      </div>
                      {/* Right half = full star */}
                      <div 
                        className="absolute inset-0 z-0"
                        onClick={() => setNewReviewRating(fullVal)}
                      >
                        <Star size={28} className={`${isFullFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      </div>
                    </div>
                  );
                })}
                <span className="ml-3 text-lg font-bold text-slate-700">{newReviewRating.toFixed(1)}</span>
              </div>
              <textarea
                value={newReviewText}
                onChange={e => setNewReviewText(e.target.value)}
                placeholder="Como este template te ajudou?"
                className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 mb-4 resize-none h-24"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowReviewForm(false)} className="px-4 py-2 text-slate-500 font-semibold hover:bg-slate-50 rounded-lg">
                  Cancelar
                </button>
                <button onClick={handleSubmitReview} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">
                  Enviar Avaliação
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <p className="text-slate-500">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
              </div>
            ) : (
              comments.map((comment: any) => (
                <div key={comment.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900">{comment.userName || 'Usuário Anônimo'}</h4>
                        <p className="text-xs text-slate-400">
                          {comment.date ? new Date(comment.date).toLocaleDateString('pt-BR') : 'Recentemente'}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(star => {
                          const r = comment.rating || 0;
                          const isFull = r >= star;
                          const isHalf = r >= star - 0.5 && r < star;
                          return (
                            <div key={star} className="relative w-4 h-4">
                              <Star size={14} className="text-slate-200 absolute inset-0" />
                              {isHalf && (
                                <div className="absolute inset-0 w-1/2 overflow-hidden">
                                  <Star size={14} className="fill-amber-400 text-amber-400" />
                                </div>
                              )}
                              {isFull && (
                                <Star size={14} className="fill-amber-400 text-amber-400 absolute inset-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                        <p className="text-slate-700 leading-relaxed text-sm">
                          "{comment.comment}"
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
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
