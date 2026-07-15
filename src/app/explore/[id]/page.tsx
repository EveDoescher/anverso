'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Heart, Share2, FileCheck, CheckCircle2, User, MessageSquare, AlertCircle, LayoutTemplate } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { AlertModal, AlertModalType } from '@/components/ui/AlertModal';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { TabNavigation, TabNavigationItem } from '@/components/ui/TabNavigation';
import { Badge } from '@/components/ui/Badge';

export default function ProfileDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isFavorite, setIsFavorite] = useState(false);
  const [rating, setRating] = useState('0.0');
  const [reviewsCount, setReviewsCount] = useState(0);
  const [usageCount, setUsageCount] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [authorPhoto, setAuthorPhoto] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [loggedUserName, setLoggedUserName] = useState('');
  const [loggedUserId, setLoggedUserId] = useState('');

  const [activeTab, setActiveTab] = useState('details');
  const [versions, setVersions] = useState<any[]>([]);

  const [modalConfig, setModalConfig] = useState<{show: boolean, title: string, message: string, type: AlertModalType, redirectUrl?: string, onConfirm?: () => void}>({
    show: false, title: '', message: '', type: 'info'
  });

  const showAlert = (title: string, message: string, type: AlertModalType, redirectUrl?: string, onConfirm?: () => void) => {
    setModalConfig({ show: true, title, message, type, redirectUrl, onConfirm });
  };

  const closeModal = () => {
    const url = modalConfig.redirectUrl;
    const confirmFn = modalConfig.onConfirm;
    const type = modalConfig.type;
    setModalConfig(prev => ({ ...prev, show: false }));
    if (url) { router.push(url); }
    else if (confirmFn && type === 'success') { confirmFn(); }
  };

  const requireAuth = (callback: () => void) => {
    const token = localStorage.getItem('token');
    if (!token) { showAlert('Acesso Negado', 'Você precisa estar logado para realizar esta ação.', 'error', '/login'); return; }
    callback();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchApi(`/api/v1/profiles/${id}`, { skipAuthRedirect: true });
        const data = await response.json();

        if (data) {
          setProfile(data);
          setRating(data.rating ? data.rating.toFixed(1) : '0.0');
          setReviewsCount(data.reviewsCount || 0);
          setUsageCount(data.usageCount || 0);
          setIsFavorite(data.isFavoritedByUser || false);

          if (data.ownerId) {
            try {
              const userRes = await fetchApi(`/api/users/${data.ownerId}/public`, { skipAuthRedirect: true });
              const userData = await userRes.json();
              const fullName = [userData.firstName, userData.lastName].filter(Boolean).join(' ');
              setAuthorName(fullName);
              setAuthorPhoto(userData.profilePictureUrl || null);
            } catch { /* fallback */ }
          }
        } else {
          setProfile({ id, name: 'Perfil não encontrado', description: 'Este perfil pode ter sido removido.' });
        }

        try {
          const revResponse = await fetchApi(`/api/v1/profiles/${id}/reviews`, { skipAuthRedirect: true });
          const revData = await revResponse.json();
          const enriched = await Promise.all(revData.map(async (rev: any) => {
            if (!rev.userId) return rev;
            try {
              const uRes = await fetchApi(`/api/users/${rev.userId}/public`, { skipAuthRedirect: true });
              const u = await uRes.json();
              return { ...rev, userName: [u.firstName, u.lastName].filter(Boolean).join(' ') || rev.userName, userPhoto: u.profilePictureUrl || null };
            } catch { return rev; }
          }));
          setComments(enriched);
        } catch (e) { console.warn('Failed to fetch reviews:', e); }

        try {
          const verResponse = await fetchApi(`/api/v1/profiles/${id}/versions`, { skipAuthRedirect: true });
          const verData = await verResponse.json();
          setVersions(verData);
        } catch (e) { console.warn('Failed to fetch versions:', e); }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

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
    } catch (e) { showAlert('Erro', 'Erro ao atualizar favorito.', 'error'); }
  };

  const handleRestoreVersion = async (version: any) => {
    try {
      const res = await fetchApi(`/api/v1/profiles/${id}/versions/${version.id}/restore`, { method: 'POST' });
      if (!res.ok) throw new Error('Falha ao restaurar versão');
      showAlert('Sucesso', 'Versão restaurada com sucesso!', 'success', undefined, () => window.location.reload());
    } catch (e) { showAlert('Erro', 'Erro ao restaurar versão.', 'error'); }
  };

  const handleSubmitReview = async () => {
    if (!newReviewText.trim()) return;
    try {
      await fetchApi(`/api/v1/profiles/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating: newReviewRating, comment: newReviewText, userName: loggedUserName || 'Anônimo' })
      });
      setShowReviewForm(false);
      setNewReviewText('');
      const revResponse = await fetchApi(`/api/v1/profiles/${id}/reviews`);
      if (revResponse.ok) {
        const revData = await revResponse.json();
        const enriched = await Promise.all(revData.map(async (rev: any) => {
          if (!rev.userId) return rev;
          try {
            const uRes = await fetchApi(`/api/users/${rev.userId}/public`);
            if (!uRes.ok) return rev;
            const u = await uRes.json();
            return { ...rev, userName: [u.firstName, u.lastName].filter(Boolean).join(' ') || rev.userName, userPhoto: u.profilePictureUrl || null };
          } catch { return rev; }
        }));
        setComments(enriched);
      }
    } catch (e) { showAlert('Erro', 'Erro ao enviar avaliação.', 'error'); }
  };

  const tabs: TabNavigationItem[] = [
    { id: 'details', label: 'Detalhes do Perfil' },
    { id: 'reviews', label: 'Avaliações', count: reviewsCount },
    { id: 'versions', label: 'Versões Anteriores', count: versions.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[var(--color-success-soft)] border-t-[var(--color-green)] rounded-full animate-spin mb-4" />
          <p className="text-[var(--color-neutral)] font-medium">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] pb-24 font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
        <Link href="/explore" className="inline-flex items-center gap-2 text-[var(--color-neutral)] hover:text-[var(--color-green)] transition-colors mb-8 font-medium">
          <ArrowLeft size={18} />
          Voltar para Comunidade
        </Link>

        <div className="bg-white rounded-3xl border border-[var(--color-border-soft)] overflow-hidden shadow-sm">
          {/* Banner */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-[var(--color-forest)] via-[#2A3B31] to-[var(--color-coffee)] relative">
            <div className="absolute inset-0 bg-grid-white/[0.1] bg-[bottom_1px_center]" />
            <div className="absolute bottom-6 left-6 md:left-10 flex gap-4">
              <div className="w-24 h-32 bg-white rounded-lg shadow-xl p-2 flex flex-col transform rotate-[-5deg]">
                <div className="w-full h-2 bg-[var(--color-border-soft)] rounded-full mb-2" />
                <div className="w-3/4 h-2 bg-[var(--color-border-soft)] rounded-full mb-2" />
                <div className="w-full h-1/2 bg-[var(--color-paper-soft)] rounded mt-auto" />
              </div>
              <div className="w-24 h-32 bg-white rounded-lg shadow-xl p-2 flex flex-col transform rotate-[5deg] translate-y-4">
                <div className="w-full h-1/2 bg-[var(--color-paper-soft)] rounded mb-auto" />
                <div className="w-full h-2 bg-[var(--color-border-soft)] rounded-full mt-2" />
                <div className="w-2/4 h-2 bg-[var(--color-border-soft)] rounded-full mt-2" />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10 pt-16 md:pt-10 flex flex-col md:flex-row gap-10">
            {/* Left: Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge tone="success">Template ABNT</Badge>
                <div className="flex items-center gap-1 text-[var(--color-gold)] font-bold text-sm bg-[var(--color-cream)] px-2 py-1 rounded-lg">
                  <Star size={14} className="fill-[var(--color-gold)]" />
                  {rating}
                </div>
                <span className="text-[var(--color-neutral)]/70 text-sm">({reviewsCount} avaliações)</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-espresso)] mb-4 leading-tight">
                {profile?.name}
              </h1>

              <div className="flex items-center gap-4 text-sm text-[var(--color-neutral)] mb-8 pb-8 border-b border-[var(--color-border-soft)]">
                <div className="flex items-center gap-2">
                  {authorPhoto ? (
                    <img src={authorPhoto} alt={authorName} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-border-soft)] flex items-center justify-center font-bold text-[var(--color-neutral)]">
                      {authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[var(--color-neutral)]/70">Criado por</p>
                    <p className="font-semibold text-[var(--color-espresso)]">{authorName}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-[var(--color-border-soft)]" />
                <div>
                  <p className="text-xs text-[var(--color-neutral)]/70">Usos</p>
                  <p className="font-semibold text-[var(--color-espresso)] flex items-center gap-1">
                    <FileCheck size={14} /> {usageCount}
                  </p>
                </div>
                <div className="w-px h-8 bg-[var(--color-border-soft)]" />
                <div>
                  <p className="text-xs text-[var(--color-neutral)]/70">ID do Perfil</p>
                  <p className="font-semibold text-[var(--color-espresso)] font-mono text-xs mt-0.5">{profile?.id}</p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-bold text-[var(--color-espresso)] mb-3">Sobre este Perfil</h3>
                <p className="text-[var(--color-neutral)] leading-relaxed mb-6">
                  {profile?.description || 'Nenhuma descrição detalhada foi fornecida para este perfil de formatação.'}
                </p>

                <h3 className="text-lg font-bold text-[var(--color-espresso)] mb-4">O que está incluído?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {['Capa e Folha de Rosto Automáticas', 'Sumário Gerado Dinamicamente', 'Espaçamento ABNT (1.5)', 'Margens 3cm/2cm', 'Paginação no Canto Superior Direito', 'Referências Bibliográficas'].map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={18} className="text-[var(--color-green)] shrink-0 mt-0.5" />
                      <span className="text-[var(--color-neutral)] text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="w-full md:w-80 shrink-0">
              <div className="bg-[var(--color-paper)] rounded-2xl p-6 border border-[var(--color-border-soft)] sticky top-24 space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  icon={LayoutTemplate}
                  trailingIcon={false}
                  onClick={() => requireAuth(() => router.push(`/submit-work?profileId=${profile?.id}`))}
                >
                  Usar este Perfil
                </Button>

                {loggedUserId && profile?.ownerId === loggedUserId && (
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full justify-center"
                    trailingIcon={false}
                    onClick={() => router.push(`/create-profile/${profile.id}`)}
                  >
                    Editar Perfil
                  </Button>
                )}

                <div className="flex gap-3">
                  <Button
                    variant={isFavorite ? 'danger' : 'ghost'}
                    size="md"
                    className="flex-1 justify-center"
                    icon={Heart}
                    trailingIcon={false}
                    onClick={() => requireAuth(handleToggleFavorite)}
                  >
                    Favoritar
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    className="flex-1 justify-center"
                    icon={Share2}
                    trailingIcon={false}
                  >
                    Compartilhar
                  </Button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[var(--color-border-soft)] flex items-start gap-3">
                  <AlertCircle size={20} className="text-[var(--color-gold)] shrink-0" />
                  <p className="text-xs text-[var(--color-neutral)] leading-relaxed">
                    Este perfil é mantido pela comunidade. Verifique as margens e regras específicas da sua instituição antes da entrega final.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 mb-8">
          <TabNavigation items={tabs} activeId={activeTab} onChange={setActiveTab} />
        </div>

        <div className="mb-24 max-w-4xl">
          {activeTab === 'details' && (
            <div className="bg-white p-8 rounded-2xl border border-[var(--color-border-soft)]">
              <h3 className="text-xl font-bold text-[var(--color-espresso)] mb-6">Detalhes Técnicos</h3>
              <p className="text-[var(--color-neutral)]">Este perfil utiliza JSON como base para estruturar configurações de formatação ABNT, APA ou personalizadas.</p>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-4">
              {versions.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-[var(--color-border-soft)]">
                  <p className="text-[var(--color-neutral)]">Nenhuma versão anterior encontrada para este perfil.</p>
                </div>
              ) : (
                versions.map((v, idx) => (
                  <div key={v.id} className="bg-white p-6 rounded-2xl border border-[var(--color-border-soft)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-[var(--color-espresso)] flex items-center gap-2">
                        {v.versionName || `Versão ${versions.length - idx}`}
                        {v.isTemporary && <Badge tone="warning">Backup Temporário (30 dias)</Badge>}
                      </h4>
                      <p className="text-sm text-[var(--color-neutral)] mt-1">Salva em: {new Date(v.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="flex gap-2">
                      {!v.isTemporary && (
                        <Button
                          variant="secondary"
                          size="sm"
                          trailingIcon={false}
                          onClick={() => requireAuth(() => router.push(`/submit-work?profileId=${profile?.id}&versionId=${v.id}`))}
                        >
                          Usar esta versão
                        </Button>
                      )}
                      {v.isTemporary && profile?.ownerId === loggedUserId && (
                        <Button
                          variant="gold"
                          size="sm"
                          trailingIcon={false}
                          onClick={() => handleRestoreVersion(v)}
                        >
                          Restaurar versão
                        </Button>
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
                <h2 className="text-2xl font-bold text-[var(--color-espresso)] flex items-center gap-2">
                  <MessageSquare size={24} className="text-[var(--color-green)]" />
                  Avaliações da Comunidade
                </h2>
                {!showReviewForm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    trailingIcon={false}
                    onClick={() => requireAuth(() => setShowReviewForm(true))}
                  >
                    Escrever avaliação
                  </Button>
                )}
              </div>

              {showReviewForm && (
                <div className="bg-white p-6 rounded-2xl border border-[var(--color-success-soft)] shadow-sm mb-6">
                  <h3 className="font-bold text-lg text-[var(--color-espresso)] mb-4">Sua Avaliação</h3>
                  <div className="flex items-center gap-1 mb-4">
                    {[1,2,3,4,5].map(star => {
                      const halfVal = star - 0.5;
                      const fullVal = star;
                      const isHalfFilled = newReviewRating >= halfVal && newReviewRating < fullVal;
                      const isFullFilled = newReviewRating >= fullVal;
                      return (
                        <div key={star} className="relative w-7 h-7 cursor-pointer">
                          <div className="absolute inset-0 w-1/2 overflow-hidden z-10" onClick={() => setNewReviewRating(halfVal)}>
                            <Star size={28} className={`${isHalfFilled || isFullFilled ? 'fill-[var(--color-gold)] text-[var(--color-gold)]' : 'text-[var(--color-border-strong)]'}`} />
                          </div>
                          <div className="absolute inset-0 z-0" onClick={() => setNewReviewRating(fullVal)}>
                            <Star size={28} className={`${isFullFilled ? 'fill-[var(--color-gold)] text-[var(--color-gold)]' : 'text-[var(--color-border-strong)]'}`} />
                          </div>
                        </div>
                      );
                    })}
                    <span className="ml-3 text-lg font-bold text-[var(--color-espresso)]">{newReviewRating.toFixed(1)}</span>
                  </div>
                  <textarea
                    value={newReviewText}
                    onChange={e => setNewReviewText(e.target.value)}
                    placeholder="Como este template te ajudou?"
                    className="w-full border-2 border-[var(--color-border-soft)] rounded-xl p-3 focus:border-[var(--color-green)] focus:outline-none focus:ring-4 focus:ring-[var(--color-green)]/10 mb-4 resize-none h-24"
                    aria-label="Texto da avaliação"
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="quiet" size="sm" trailingIcon={false} onClick={() => setShowReviewForm(false)}>
                      Cancelar
                    </Button>
                    <Button variant="primary" size="sm" trailingIcon={false} onClick={handleSubmitReview}>
                      Enviar Avaliação
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-[var(--color-border-soft)] text-center">
                    <p className="text-[var(--color-neutral)]">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
                  </div>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="bg-white p-6 rounded-2xl border border-[var(--color-border-soft)] shadow-sm flex gap-4">
                      {comment.userPhoto ? (
                        <img src={comment.userPhoto} alt={comment.userName} className="w-12 h-12 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[var(--color-success-soft)] text-[var(--color-green)] flex items-center justify-center font-bold text-lg shrink-0">
                          {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-[var(--color-espresso)]">{comment.userName || 'Usuário Anônimo'}</h4>
                            <p className="text-xs text-[var(--color-neutral)]/70">
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
                                  <Star size={14} className="text-[var(--color-border-strong)] absolute inset-0" />
                                  {isHalf && (
                                    <div className="absolute inset-0 w-1/2 overflow-hidden">
                                      <Star size={14} className="fill-[var(--color-gold)] text-[var(--color-gold)]" />
                                    </div>
                                  )}
                                  {isFull && <Star size={14} className="fill-[var(--color-gold)] text-[var(--color-gold)] absolute inset-0" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-[var(--color-espresso)] leading-relaxed text-sm">"{comment.comment}"</p>
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
