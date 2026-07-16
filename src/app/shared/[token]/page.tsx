'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { MessageCircle, FileText, Send, User, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface WorkData {
  id: string;
  title: string;
  authors: string[];
  document: Record<string, any>;
  profileData: any;
  shareToken: string;
}

interface Comment {
  id: string;
  workId: string;
  sectionId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

const sectionLabels: Record<string, string> = {
  cover: 'Capa',
  titlePage: 'Folha de Rosto',
  resumo: 'Resumo',
  abstract: 'Abstract',
  dedication: 'Dedicatória',
  acknowledgments: 'Agradecimentos',
  epigraph: 'Epígrafe',
  listOfAbbreviations: 'Lista de Abreviaturas',
  listOfSymbols: 'Lista de Símbolos',
  listOfFigures: 'Lista de Figuras',
  listOfTables: 'Lista de Tabelas',
  summary: 'Sumário',
  bodyContent: 'Conteúdo do Trabalho',
  references: 'Referências Bibliográficas',
  appendix: 'Apêndices',
  annex: 'Anexos',
};

function formatSectionLabel(id: string): string {
  return sectionLabels[id] ?? id.replace(/([A-Z])/g, ' $1').replace(/^(.)/, s => s.toUpperCase()).trim();
}

export default function SharedWorkPage() {
  const params = useParams();
  const token = params?.token as string;

  const [work, setWork] = useState<WorkData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [commentingSection, setCommentingSection] = useState<string | null>(null);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!token) return;
    loadWork();
  }, [token]);

  const loadWork = async () => {
    setLoading(true);
    setError('');
    try {
      const [workRes, commentsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/works/shared/${token}`),
        fetch(`${API_URL}/api/v1/works/shared/${token}/comments`),
      ]);

      if (!workRes.ok) {
        setError('Link inválido ou expirado. Verifique o endereço e tente novamente.');
        return;
      }

      const workData = await workRes.json();
      setWork(workData);

      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData);
      }
    } catch (err) {
      setError('Não foi possível carregar o trabalho. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (sectionId: string) => {
    if (!newCommentName.trim() || !newCommentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/works/shared/${token}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId,
          authorName: newCommentName.trim(),
          text: newCommentText.trim(),
        }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => [...prev, newComment]);
        setNewCommentName('');
        setNewCommentText('');
        setCommentingSection(null);
        setExpandedSections(prev => new Set([...prev, sectionId]));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const sectionIds = work?.document ? Object.keys(work.document) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-[var(--color-neutral)]">
          <div className="w-10 h-10 border-4 border-[var(--color-cream)] border-t-[var(--color-green)] rounded-full animate-spin" />
          <p className="text-sm font-medium">Carregando trabalho compartilhado...</p>
        </div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-[var(--color-error-bg-soft)] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FileText className="w-8 h-8 text-[var(--color-error)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-espresso)] mb-2">Trabalho não encontrado</h1>
          <p className="text-[var(--color-neutral)] text-sm">{error || 'Este link pode estar expirado ou inválido.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[var(--color-border-soft)] sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-success-soft)] rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-[var(--color-green)]" />
            </div>
            <div>
              <h1 className="font-bold text-[var(--color-espresso)] text-sm leading-tight">{work.title || 'Trabalho Acadêmico'}</h1>
              {work.authors?.length > 0 && (
                <p className="text-[10px] text-[var(--color-neutral)]">{work.authors.join(', ')}</p>
              )}
            </div>
          </div>
          <span className="text-[10px] text-[var(--color-neutral)] bg-[var(--color-paper-soft)] px-3 py-1 rounded-full border border-[var(--color-border-soft)] uppercase tracking-wider font-medium">
            Visualização Compartilhada
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-4">
        <p className="text-sm text-[var(--color-neutral)] mb-6">
          Você está visualizando um trabalho compartilhado. Clique em uma seção para expandir e deixar comentários.
        </p>

        {sectionIds.length === 0 && (
          <div className="text-center py-16 text-[var(--color-neutral)]">
            <p>Este trabalho não possui seções preenchidas.</p>
          </div>
        )}

        {sectionIds.map(sectionId => {
          const sectionData = work.document[sectionId];
          const sectionComments = comments.filter(c => c.sectionId === sectionId);
          const isExpanded = expandedSections.has(sectionId);
          const isCommenting = commentingSection === sectionId;

          return (
            <div key={sectionId} className="bg-white border border-[var(--color-border-soft)] rounded-2xl overflow-hidden shadow-sm">
              {/* Section header */}
              <button
                type="button"
                onClick={() => toggleSection(sectionId)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--color-paper-soft)] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[var(--color-neutral)]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[var(--color-neutral)]" />
                  )}
                  <span className="font-semibold text-[var(--color-espresso)] text-sm">{formatSectionLabel(sectionId)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {sectionComments.length > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-[var(--color-green)] bg-[var(--color-success-bg)] px-2 py-0.5 rounded-full font-medium">
                      <MessageCircle size={10} />
                      {sectionComments.length}
                    </span>
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-[var(--color-border-soft)] px-5 py-4 space-y-4">
                  {/* Section data preview */}
                  {sectionData && typeof sectionData === 'object' && (
                    <div className="bg-[var(--color-paper-soft)] rounded-xl p-4 space-y-2">
                      {Object.entries(sectionData).map(([key, value]) => {
                        if (!value || (Array.isArray(value) && value.length === 0)) return null;
                        return (
                          <div key={key} className="text-xs">
                            <span className="font-medium text-[var(--color-coffee)] capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                            <span className="text-[var(--color-espresso)]">
                              {Array.isArray(value) ? value.join(', ') : String(value).substring(0, 200)}
                              {typeof value === 'string' && value.length > 200 ? '...' : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Comments */}
                  {sectionComments.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-[var(--color-neutral)] uppercase tracking-wider">Comentários</p>
                      {sectionComments.map(c => (
                        <div key={c.id} className="flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-[var(--color-cream)] border border-[var(--color-border-soft)] flex items-center justify-center flex-shrink-0">
                            <User size={12} className="text-[var(--color-coffee)]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-semibold text-[var(--color-espresso)]">{c.authorName}</span>
                              <span className="text-[10px] text-[var(--color-neutral)]">
                                {new Date(c.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--color-text)] mt-0.5 leading-relaxed">{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment form */}
                  {isCommenting ? (
                    <div className="border border-[var(--color-border-soft)] rounded-xl p-4 space-y-3 bg-[var(--color-paper-soft)]">
                      <p className="text-xs font-semibold text-[var(--color-espresso)]">Deixar um comentário</p>
                      <Input
                        label="Seu nome"
                        value={newCommentName}
                        onChange={e => setNewCommentName(e.target.value)}
                        placeholder="Como você gostaria de ser identificado"
                      />
                      <Textarea
                        label="Comentário"
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        placeholder="Escreva seu comentário sobre esta seção..."
                        maxLength={600}
                        counter
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => { setCommentingSection(null); setNewCommentName(''); setNewCommentText(''); }}
                          className="text-xs font-medium text-[var(--color-neutral)] hover:text-[var(--color-espresso)] px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                        <Button
                          size="sm"
                          icon={Send}
                          trailingIcon={false}
                          disabled={!newCommentName.trim() || !newCommentText.trim() || submitting}
                          onClick={() => submitComment(sectionId)}
                        >
                          {submitting ? 'Enviando...' : 'Enviar'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCommentingSection(sectionId)}
                      className="flex items-center gap-2 text-xs font-medium text-[var(--color-green)] hover:opacity-80 transition-opacity"
                    >
                      <MessageCircle size={14} />
                      Adicionar comentário
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
