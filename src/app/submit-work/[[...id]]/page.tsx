'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import BodyEditor from '@/components/body-editor/BodyEditor';
import SectionedEditor from '@/components/body-editor/SectionedEditor';
import { ChevronRight, ChevronLeft, Save, CheckCircle, FileText, ArrowLeft, Loader2, FileCheck2, Share2, Bookmark, X } from 'lucide-react';
import { AlertModal, AlertModalType } from '@/components/ui/AlertModal';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';

const componentLabels: Record<string, string> = {
  cover: 'Capa',
  titlePage: 'Folha de Rosto',
  resumo: 'Resumo em Português',
  abstract: 'Abstract (Inglês)',
  foreignAbstract: 'Abstract (Inglês)',
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

const slotLabels: Record<string, string> = {
  institutionalLines: 'Linhas da Instituição',
  authors: 'Autor(es)',
  author: 'Autor',
  title: 'Título',
  subtitle: 'Subtítulo',
  nature: 'Natureza do Trabalho',
  objective: 'Objetivo',
  purpose: 'Finalidade',
  advisor: 'Orientador(a)',
  coadvisor: 'Coorientador(a)',
  city: 'Cidade',
  local: 'Local',
  year: 'Ano',
  date: 'Data',
  institution: 'Instituição',
  department: 'Departamento',
  course: 'Curso',
  text: 'Texto',
  keywords: 'Palavras-chave',
  items: 'Itens',
  entries: 'Entradas',
  label: 'Rótulo',
  terms: 'Termos',
  definitions: 'Definições',
  rows: 'Linhas',
};

const slotHints: Record<string, string> = {
  keywords: 'Ex: Aprendizado de Máquina, Redes Neurais, Visão Computacional',
  institutionalLines: 'Ex: Universidade Federal de Brasília · Faculdade de Tecnologia',
  nature: 'Ex: Trabalho de Conclusão de Curso apresentado como requisito parcial para obtenção do título de Bacharel...',
  authors: 'Um autor por linha ou separados por vírgula',
  advisor: 'Ex: Prof. Dr. João da Silva',
  coadvisor: 'Ex: Prof.ª Dr.ª Maria Souza',
};

function formatLabel(name: string): string {
  return slotLabels[name] ?? name.replace(/([A-Z])/g, ' $1').replace(/^(.)/, s => s.toUpperCase()).trim();
}

function formatComponentLabel(id: string): string {
  return componentLabels[id] ?? id.replace(/([A-Z])/g, ' $1').replace(/^(.)/, s => s.toUpperCase()).trim();
}

const REQUIRED_COMPONENTS = new Set(['cover', 'titlePage', 'summary', 'bodyContent', 'references', 'resumo', 'abstract']);

const componentAutoDescriptions: Record<string, string> = {
  summary: 'O Sumário será gerado automaticamente a partir dos títulos e seções do seu Conteúdo do Trabalho.',
  listOfFigures: 'A Lista de Figuras será preenchida automaticamente com as figuras inseridas no Conteúdo do Trabalho.',
  listOfTables: 'A Lista de Tabelas será preenchida automaticamente com as tabelas inseridas no Conteúdo do Trabalho.',
  listOfAbbreviations: 'Esta lista será montada automaticamente com as abreviaturas definidas ao longo do documento.',
  listOfSymbols: 'Esta lista será montada automaticamente com os símbolos definidos ao longo do documento.',
};

export default function SubmitWork() {
  const params = useParams();
  const searchParams = useSearchParams();
  const workId = params?.id?.[0] || null;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profileId, setProfileId] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [autoFill, setAutoFill] = useState(true);
  const [workName, setWorkName] = useState('');
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [enabledComponents, setEnabledComponents] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // Custom Modal state
  const [modalConfig, setModalConfig] = useState<{show: boolean, title: string, message: string, type: AlertModalType, redirectUrl?: string, onConfirm?: () => void}>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: AlertModalType, redirectUrl?: string) => {
    setModalConfig({ show: true, title, message, type, redirectUrl });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({ show: true, title, message, type: 'confirm', onConfirm });
  };

  const closeModal = () => {
    const url = modalConfig.redirectUrl;
    setModalConfig(prev => ({ ...prev, show: false }));
    if (url) {
      router.push(url);
    }
  };

  const handleBackNavigation = () => {
    if (hasUnsavedChanges) {
      showConfirm('Progresso não salvo', 'Você tem alterações não salvas. Se sair desta página agora, perderá o progresso não salvo. Deseja realmente sair?', () => {
        closeModal();
        router.push('/dashboard');
      });
    } else {
      router.push('/dashboard');
    }
  };

  const handleSwitchProfile = () => {
    if (hasUnsavedChanges) {
      showConfirm('Progresso não salvo', 'Se trocar de perfil, as edições não salvas do perfil atual serão perdidas. Deseja continuar?', () => {
        closeModal();
        setProfile(null);
        setProfileId('');
      });
    } else {
      setProfile(null);
      setProfileId('');
    }
  };

  useEffect(() => {
    loadProfiles();
    if (workId) {
      loadWork(workId);
    } else {
      const urlProfileId = searchParams.get('profileId');
      const urlVersionId = searchParams.get('versionId');
      if (urlProfileId) {
        setProfileId(urlProfileId);
        selectProfile(urlProfileId, null, urlVersionId, true);
      }
    }
  }, [workId, searchParams]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadWork = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetchApi(`/api/v1/works/${id}`);
      if (res.ok) {
        const workData = await res.json();
        setWorkName(workData.fileName || '');
        if (workData.options) {
           setFontFamily(workData.options.fontFamily || 'Times New Roman');
        }
        await selectProfile(workData.profileId, workData);
      } else {
        router.push('/submit-work');
      }
    } catch (err) {
      router.push('/submit-work');
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const res = await fetchApi('/api/v1/profiles');
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error('Erro ao carregar perfis', err);
    } finally {
      setLoading(false);
    }
  };

  const selectProfile = async (id: string, savedWorkData?: any, overrideVersionId?: string | null, autoSkipStep0?: boolean) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchApi(`/api/v1/profiles/${id}`);
      if (!res.ok) throw new Error('Falha ao carregar o perfil completo');
      const data = await res.json();
      
      let parsedProfileData = data.profileData || data;

      if (overrideVersionId) {
        try {
          const verRes = await fetchApi(`/api/v1/profiles/${id}/versions`);
          if (verRes.ok) {
            const versions = await verRes.json();
            const ver = versions.find((v: any) => v.id === overrideVersionId);
            if (ver) {
              parsedProfileData = ver.profileData;
            }
          }
        } catch (e) {}
      }
      
      if (typeof parsedProfileData === 'string') {
        parsedProfileData = JSON.parse(parsedProfileData);
      }
      
      const selectedProfileInfo = profiles.find(p => p.id === id);
      const profileName = selectedProfileInfo ? selectedProfileInfo.name : `Perfil ${id}`;
      
      const initialData: any = {};
      const componentFields: Record<string, any[]> = {};

      parsedProfileData?.componentOrder?.forEach((compId: string) => {
        const comp = parsedProfileData.componentRules?.[compId] || parsedProfileData[compId];
        if (!comp) return;
        
        initialData[compId] = {};
        const fields: any[] = [];

        // Parsing logic here... (same as before)
        if (comp && comp.slots) {
          Object.keys(comp.slots).forEach(slotName => {
            const slot = comp.slots[slotName];
            if (slot.type === 'COMPOSED_TEXT') {
              initialData[compId][slotName] = {};
              fields.push({ name: slotName, type: 'composed', required: slot.required, fields: slot.fieldNames || [] });
            } else if (slot.type === 'SIGNATURE_BLOCK_LIST') {
              initialData[compId][slotName] = [];
              fields.push({ name: slotName, type: 'signature', required: slot.required, fields: slot.knownFieldNames || [] });
            } else {
              const isArray = slot.type === 'TEXT_LIST';
              initialData[compId][slotName] = '';
              fields.push({ name: slotName, isArray, required: slot.required, type: isArray ? 'array' : 'text' });
            }
          });
        } else if (comp.items && Array.isArray(comp.items)) {
          comp.items.forEach((item: any) => {
              switch (item.type) {
                  case 'PLAIN_TEXT':
                      initialData[compId][item.slotName] = '';
                      fields.push({ name: item.slotName, type: 'text', required: false });
                      break;
                  case 'TEMPLATED_TEXT':
                      item.fieldNames?.forEach((fn: string) => {
                          initialData[compId][fn] = '';
                          fields.push({ name: fn, type: 'text', required: false, hint: `Template: ${item.template}` });
                      });
                      break;
                  case 'BOLD_LABELED_KEYWORDS':
                      initialData[compId][item.labelSlotName] = '';
                      initialData[compId][item.keywordsSlotName] = '';
                      fields.push(
                          { name: item.labelSlotName, type: 'text', required: false, hint: 'Ex: Palavras-chave:' },
                          { name: item.keywordsSlotName, type: 'array', required: false }
                      );
                      break;
                  case 'PAIR_LIST':
                      initialData[compId][item.termsSlotName] = '';
                      initialData[compId][item.definitionsSlotName] = '';
                      fields.push(
                          { name: item.termsSlotName, type: 'array', required: false },
                          { name: item.definitionsSlotName, type: 'array', required: false }
                      );
                      break;
                  case 'TABLE_BLOCK':
                      initialData[compId][item.rowsSlotName] = '';
                      fields.push({ name: item.rowsSlotName, type: 'array', required: false, desc: 'Itens por linha (vírgulas)' });
                      break;
                  case 'REPEAT_GROUP':
                      initialData[compId][item.entriesSlotName] = [{}];
                      fields.push({ name: item.entriesSlotName, type: 'repeat', required: false, group: item.group || [] });
                      break;
              }
          });
        } else if (comp.ruleType === 'BODY_CONTENT' || compId === 'bodyContent' || comp.componentId === 'bodyContent') {
          initialData[compId] = { sections: [] };
          fields.push({ name: 'sections', type: 'body_content', required: true });
        } else if (comp.ruleType === 'SECTIONED') {
          initialData[compId] = { items: [] };
          fields.push({ name: 'items', type: 'sectioned', required: true });
        } else if (['abstract', 'resumo', 'foreignAbstract'].includes(compId) || ['abstract', 'resumo', 'foreignAbstract'].includes(comp.componentId)) {
          initialData[compId] = { text: '', keywords: [] };
          fields.push(
            { name: 'text', type: 'text', required: true, desc: 'Texto do resumo' },
            { name: 'keywords', type: 'array', required: true, desc: 'Palavras-chave (separadas por vírgula)' }
          );
        } else if (['dedication', 'acknowledgments'].includes(compId) || ['dedication', 'acknowledgments'].includes(comp.componentId)) {
          initialData[compId] = { text: '' };
          fields.push({ name: 'text', type: 'text', required: true, desc: 'Texto principal' });
        } else if (compId === 'epigraph' || comp.componentId === 'epigraph') {
          initialData[compId] = { text: '', author: '' };
          fields.push(
            { name: 'text', type: 'text', required: true, desc: 'Texto da epígrafe' },
            { name: 'author', type: 'text', required: true, desc: 'Autor' }
          );
        } else if (compId === 'references' || comp.componentId === 'references') {
          initialData[compId] = { items: [] };
          fields.push({ name: 'items', type: 'array', required: true, desc: 'Lista de referências bibliográficas' });
        }
        
        if (fields.length > 0) {
          // Sort fields logically for better UX
          const preferredOrder: Record<string, number> = {
            'institution': 1, 'author': 2, 'authors': 2, 'title': 3, 'subtitle': 4,
            'nature': 5, 'objective': 5, 'purpose': 5, 'advisor': 6, 'coadvisor': 7,
            'city': 8, 'local': 8, 'year': 9, 'date': 9
          };
          
          fields.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            const aWeight = preferredOrder[aName] || 50;
            const bWeight = preferredOrder[bName] || 50;
            return aWeight - bWeight;
          });

          componentFields[compId] = fields;
        }
      });
      
      const initialEnabled: Record<string, boolean> = {};
      parsedProfileData?.componentOrder?.forEach((compId: string) => {
        initialEnabled[compId] = true;
      });
      
      if (savedWorkData && savedWorkData.document) {
         Object.keys(savedWorkData.document).forEach(compId => {
             if (initialData[compId]) {
                 initialData[compId] = { ...initialData[compId], ...savedWorkData.document[compId] };
             }
         });
         if (savedWorkData.options?.selectedComponents) {
             Object.keys(initialEnabled).forEach(c => initialEnabled[c] = false);
             savedWorkData.options.selectedComponents.forEach((c: string) => initialEnabled[c] = true);
         }
      }

      setFormData(initialData);
      setEnabledComponents(initialEnabled);
      setProfile({ id, name: profileName, profileData: parsedProfileData, componentFields });
      setActiveTab(autoSkipStep0 ? 1 : 0);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (componentName: string, elementName: string, value: any) => {
    setHasUnsavedChanges(true);
    setFormData((prev: any) => {
      const newState = { ...prev };
      
      newState[componentName] = {
        ...newState[componentName],
        [elementName]: value
      };
      
      if (autoFill) {
         const sourceField = profile?.componentFields?.[componentName]?.find((f: any) => f.name === elementName);
         
         if (sourceField) {
           Object.keys(newState).forEach(compId => {
             if (compId !== componentName && profile?.componentFields?.[compId]) {
               const targetField = profile.componentFields[compId].find((f: any) => f.name === elementName);
               
               // Only auto-fill if both fields exist and have the exact same type (prevents array vs sectioned corruption)
               if (targetField && targetField.type === sourceField.type) {
                 newState[compId] = {
                   ...newState[compId],
                   [elementName]: value
                 };
               }
             }
           });
         }
      }
      
      return newState;
    });
  };

  const handleNext = () => {
    const componentOrder = profile?.profileData?.componentOrder?.filter((c: string) => profile.componentFields[c]) || [];
    if (activeTab < componentOrder.length - 1) setActiveTab(prev => prev + 1);
  };

  const handlePrev = () => {
    if (activeTab > 0) setActiveTab(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const document: any = {};
    const selectedComponents: string[] = [];

    profile?.profileData?.componentOrder?.forEach((compId: string) => {
      if (!profile.componentFields[compId]) return;
      if (!enabledComponents[compId]) return;

      const compData: any = {};
      profile.componentFields[compId].forEach((field: any) => {
        const val = formData[compId]?.[field.name];
        if (field.isArray) {
          compData[field.name] = val ? val.split(',').map((s: string) => s.trim()) : [];
        } else {
          compData[field.name] = val;
        }
      });

      // Não enviar no document componentes SinglePage totalmente vazios (apenas manter em selectedComponents)
      const hasAnyValue = Object.values(compData).some((v: any) => {
        if (v === null || v === undefined || v === '') return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'object') return Object.values(v).some((vv: any) => vv && String(vv).trim() !== '');
        return String(v).trim() !== '';
      });

      selectedComponents.push(compId);
      if (hasAnyValue) {
        document[compId] = compData;
      }
    });

    const sanitizedName = (workName || 'meu_trabalho')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_\-]/g, "_")
      .toLowerCase();

    const payload = {
      fileName: sanitizedName,
      profileId: profile.id,
      options: {
        selectedComponents,
        fonts: { default: fontFamily }
      },
      document
    };

    try {
      const res = await fetchApi('/api/v1/works/submit', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.text();
        throw new Error(errData || 'Erro ao enviar o trabalho.');
      }
      showAlert('Sucesso', 'Trabalho submetido com sucesso! O processamento foi iniciado.', 'success', '/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao submeter o trabalho.');
      showAlert('Erro', err.message || 'Erro ao submeter o trabalho.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgress = async () => {
    try {
      setLoading(true);
      const document: any = {};
      const selectedComponents: string[] = [];
      profile?.profileData?.componentOrder?.forEach((compId: string) => {
        if (!profile.componentFields[compId]) return;
        if (!enabledComponents[compId]) return;
        selectedComponents.push(compId);
        document[compId] = {};
        profile.componentFields[compId].forEach((field: any) => {
          const val = formData[compId][field.name];
          if (field.isArray && typeof val === 'string') {
            document[compId][field.name] = val ? val.split(',').map((s: string) => s.trim()) : [];
          } else {
            document[compId][field.name] = val;
          }
        });
      });

      const payload = {
        id: workId,
        profileId: profile.id,
        fileName: workName || 'meu_trabalho',
        options: { selectedComponents, fonts: { default: fontFamily } },
        document
      };

      const res = await fetchApi('/api/v1/works/draft', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Falha ao salvar rascunho');
      
      const savedData = await res.json();
      setHasUnsavedChanges(false);
      showAlert('Progresso Salvo', 'O rascunho do seu trabalho foi salvo no servidor com sucesso.', 'success');
      
      if (!workId && savedData.id) {
         router.replace(`/submit-work/${savedData.id}`);
      }
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      showAlert('Erro', 'Não foi possível salvar o rascunho no servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShareWork = async () => {
    try {
      // Como não há backend de rascunhos, copia a URL atual para a área de transferência,
      // ou aciona o compartilhamento nativo do dispositivo.
      const shareData = {
        title: 'Formatação de Trabalho - Anverso',
        text: 'Estou formatando meu trabalho acadêmico utilizando o Anverso.',
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showAlert('Link Copiado', 'O link da página foi copiado para sua área de transferência!', 'success');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') { // Ignora se o usuário cancelou a tela de compartilhamento
        console.error('Erro ao compartilhar:', error);
        showAlert('Erro', 'Não foi possível compartilhar no momento.', 'error');
      }
    }
  };

  const getSectionStatus = (compId: string): 'empty' | 'partial' | 'complete' => {
    const fields = profile?.componentFields?.[compId] || [];
    if (fields.length === 0) return 'complete';
    const data = formData[compId] || {};
    const hasValue = (f: any) => {
      const val = data[f.name];
      if (val === null || val === undefined) return false;
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === 'object') return Object.values(val).some((v: any) => v && String(v).trim() !== '');
      return String(val).trim() !== '';
    };
    const requiredFields = fields.filter((f: any) => f.required);
    const fieldsToCheck = requiredFields.length > 0 ? requiredFields : fields;
    const allFilled = fieldsToCheck.every(hasValue);
    const anyFilled = fields.some(hasValue);
    if (allFilled) return 'complete';
    if (anyFilled) return 'partial';
    return 'empty';
  };

  const componentOrder = profile?.profileData?.componentOrder?.filter((c: string) => profile.componentFields[c]) || [];
  const activeComponentId = componentOrder[activeTab];
  const activeFields = activeComponentId ? profile.componentFields[activeComponentId] : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-[var(--color-success-soft)] selection:text-[var(--color-forest)]">
      <header className="bg-white/80 backdrop-blur-md border-b border-[var(--color-border-soft)] sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <IconButton variant="ghost" icon={ArrowLeft} label="Voltar" onClick={handleBackNavigation} />
            <div className="h-5 w-px bg-[var(--color-border-soft)]"></div>
            <h1 className="text-xl font-bold text-[var(--color-forest)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--color-green)]" />
              Novo Trabalho Acadêmico
            </h1>
          </div>
          {profile && (
            <div className="flex items-center gap-3">
               <button 
                 type="button" 
                 onClick={handleSaveProgress}
                 className="text-xs font-medium bg-[var(--color-success-bg)] hover:bg-[var(--color-success-soft)] text-[var(--color-green)] px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                 title="Salvar Progresso"
               >
                 <Bookmark className="w-3.5 h-3.5" />
                 <span className="hidden md:inline">Salvar Progresso</span>
               </button>
               <button 
                 type="button" 
                 onClick={handleShareWork}
                 className="text-xs font-medium bg-[var(--color-success-bg)] hover:bg-[var(--color-success-soft)] text-[var(--color-green)] px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                 title="Compartilhar Trabalho"
               >
                 <Share2 className="w-3.5 h-3.5" />
                 <span className="hidden md:inline">Compartilhar</span>
               </button>
               <div className="w-px h-4 bg-[var(--color-border-soft)] mx-1 hidden lg:block"></div>
               <span className="text-sm text-[var(--color-neutral)] hidden lg:inline-block">
                 Perfil: <span className="font-semibold text-[var(--color-espresso)]">{profile.name}</span>
               </span>
               <button 
                  type="button" 
                  onClick={handleSwitchProfile} 
                  className="text-xs font-medium bg-[var(--color-paper-soft)] hover:bg-[var(--color-border-soft)] text-[var(--color-espresso)] px-3 py-1.5 rounded-full transition-colors"
                >
                  Trocar Perfil
                </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col">
        
        {/* Step 1: Profile Selection */}
        {!profile && (
          <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[var(--color-success-soft)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[var(--color-success-soft)]">
                 <FileCheck2 className="w-8 h-8 text-[var(--color-green)]" />
              </div>
              <h2 className="text-3xl font-extrabold text-[var(--color-espresso)] mb-3 tracking-tight">Escolha o Padrão de Formatação</h2>
              <p className="text-[var(--color-neutral)] text-lg max-w-2xl mx-auto">
                Selecione a norma acadêmica ou modelo institucional que o seu trabalho deve seguir. O Anverso cuidará de toda a formatação para você.
              </p>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--color-neutral)]/70">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-[var(--color-green)]" />
                <p className="font-medium">Carregando modelos disponíveis...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {profiles.map(p => (
                  <div key={p.id} onClick={() => selectProfile(p.id)} role="button" tabIndex={0}
                    className="group text-left bg-white border border-[var(--color-border-soft)] rounded-2xl p-6 hover:border-[var(--color-green)] hover:shadow-[var(--shadow-soft)] transition-all duration-300 flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] focus:ring-offset-2"
                  >
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="font-bold text-[var(--color-espresso)] text-lg group-hover:text-[var(--color-green)] transition-colors">{p.name}</h3>
                       <div className="w-10 h-10 rounded-full bg-[var(--color-paper)] group-hover:bg-[var(--color-success-bg)] flex items-center justify-center transition-colors shadow-sm">
                         <ChevronRight className="w-4 h-4 text-[var(--color-neutral)]/70 group-hover:text-[var(--color-green)]" />
                       </div>
                    </div>
                    <p className="text-sm text-[var(--color-neutral)] leading-relaxed mt-auto">{p.description || 'Modelo de formatação padrão estruturado.'}</p>
                  </div>
                ))}
                {profiles.length === 0 && (
                  <div className="col-span-2 text-center bg-white border border-dashed border-[var(--color-border-soft)] rounded-2xl p-12">
                    <p className="text-[var(--color-neutral)] font-medium">Nenhum perfil de formatação disponível no momento.</p>
                  </div>
                )}
              </div>
            )}
            {error && <div className="mt-6 bg-[var(--color-error-bg-soft)] text-[var(--color-error)] p-4 rounded-xl border border-[var(--color-error-bg)] text-sm font-medium">{error}</div>}
          </div>
        )}

        {/* Step 2: Wizard Form */}
        {profile && componentOrder.length === 0 && !loading && (
          <div className="max-w-xl mx-auto w-full pt-16 text-center animate-in fade-in duration-500">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-cream)] border border-amber-100 flex items-center justify-center mx-auto mb-5">
              <FileText className="w-7 h-7 text-[var(--color-gold)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-espresso)] mb-2">Perfil sem seções configuradas</h2>
            <p className="text-[var(--color-neutral)] text-sm mb-6">
              O perfil <strong>{profile.name}</strong> não possui seções de preenchimento reconhecidas. Tente escolher outro perfil.
            </p>
            <button
              type="button"
              onClick={handleSwitchProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-green)] text-white hover:bg-[#2A3B31] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Escolher outro perfil
            </button>
          </div>
        )}

        {profile && componentOrder.length > 0 && (
          <div className="flex flex-col md:flex-row gap-8 flex-1 animate-in fade-in duration-500 h-full">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-24 self-start bg-white rounded-2xl shadow-sm border border-[var(--color-border-soft)] overflow-hidden">
              <div className="p-4 bg-[var(--color-paper)] border-b border-[var(--color-border-soft)] flex flex-col gap-4">
                
                <div>
                  <h3 className="text-xs font-bold text-[var(--color-neutral)] uppercase tracking-wider mb-2">Identificação</h3>
                  <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Nome do Trabalho</label>
                  <input
                    type="text"
                    value={workName}
                    onChange={(e) => { setWorkName(e.target.value); setHasUnsavedChanges(true); }}
                    placeholder="ex: meu_tcc_2025"
                    className="w-full text-sm p-2 bg-white border border-[var(--color-border-soft)] rounded-lg focus:border-[var(--color-green)] focus:ring-1 focus:ring-[var(--color-green)] outline-none transition-shadow"
                  />
                  <p className="text-[11px] text-[var(--color-neutral)]/70 mt-1">Use apenas letras, números e underline.</p>
                </div>

                <div className="h-px bg-[var(--color-border-soft)] w-full" />

                <div>
                  <h3 className="text-xs font-bold text-[var(--color-neutral)] uppercase tracking-wider mb-2">Documento</h3>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Fonte Principal</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => { setFontFamily(e.target.value); setHasUnsavedChanges(true); }}
                      className="w-full text-sm p-2 bg-white border border-[var(--color-border-soft)] rounded-lg focus:border-[var(--color-green)] focus:ring-1 focus:ring-[var(--color-green)] outline-none transition-shadow cursor-pointer"
                    >
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Arial">Arial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[var(--color-neutral)] uppercase tracking-wider mb-2">Comportamento</h3>
                  <label
                    className="flex items-center gap-2 p-2 bg-[var(--color-success-bg)]/50 rounded-lg cursor-pointer hover:bg-[var(--color-success-bg)] transition-colors border border-[var(--color-success-soft)]"
                    title="Campos com o mesmo nome em seções diferentes (ex: Autor) serão preenchidos ao mesmo tempo."
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[var(--color-green)] rounded border-[var(--color-border-soft)] focus:ring-[var(--color-green)]"
                      checked={autoFill}
                      onChange={(e) => { setAutoFill(e.target.checked); setHasUnsavedChanges(true); }}
                    />
                    <span className="text-xs font-semibold text-[var(--color-forest)] leading-tight">Sincronizar campos repetidos</span>
                  </label>
                </div>
              </div>
              {/* Barra de progresso geral */}
              {(() => {
                const enabledOrder = componentOrder.filter((c: string) => enabledComponents[c] !== false);
                const doneCount = enabledOrder.filter((c: string) => getSectionStatus(c) === 'complete').length;
                const pct = enabledOrder.length > 0 ? Math.round((doneCount / enabledOrder.length) * 100) : 0;
                return (
                  <div className="px-4 py-3 border-b border-[var(--color-border-soft)]">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-semibold text-[var(--color-neutral)]">Progresso</span>
                      <span className="text-[11px] font-bold text-[var(--color-green)]">{doneCount}/{enabledOrder.length} seções</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--color-paper-soft)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r bg-[var(--color-green)] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="py-2 max-h-[calc(100vh-380px)] overflow-y-auto custom-scrollbar">
                {componentOrder.map((compId: string, idx: number) => {
                  const isActive = idx === activeTab;
                  const isDisabled = enabledComponents[compId] === false;
                  const status = isDisabled ? 'disabled' : getSectionStatus(compId);

                  return (
                    <button
                      key={compId}
                      onClick={() => setActiveTab(idx)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-all relative
                        ${isActive ? 'bg-[var(--color-success-bg)]/50 text-[var(--color-green)] font-semibold' : 'text-[var(--color-neutral)] hover:bg-[var(--color-paper)] hover:text-[var(--color-espresso)] font-medium'}
                      `}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-green)] rounded-r-full" />}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                        ${isActive ? 'bg-[var(--color-green)] text-white' :
                          status === 'complete' ? 'bg-[var(--color-success-bg)] text-[var(--color-green)]' :
                          status === 'partial'  ? 'bg-amber-100 text-amber-600' :
                          'bg-[var(--color-paper-soft)] text-[var(--color-neutral)]/70'}
                      `}>
                        {status === 'complete' && !isActive ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : status === 'partial' && !isActive ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /></svg>
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>
                      <span className={`truncate ${isDisabled ? 'line-through text-[var(--color-neutral)]/70 opacity-70' : ''}`}>
                        {formatComponentLabel(compId)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Form Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-[var(--color-border-soft)]">
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                
                {/* Active Section Header */}
                <div className="p-6 md:p-8 border-b border-[var(--color-border-soft)] bg-white rounded-t-2xl">
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[var(--color-success-bg)] text-[var(--color-green)] text-xs font-bold uppercase tracking-wider mb-3">
                    Seção {activeTab + 1} de {componentOrder.length}
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-[var(--color-espresso)]">
                        {formatComponentLabel(activeComponentId)}
                      </h2>
                      {REQUIRED_COMPONENTS.has(activeComponentId) ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                          Obrigatório
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-paper-soft)] text-[var(--color-neutral)] border border-[var(--color-border-soft)]">
                          Opcional
                        </span>
                      )}
                    </div>

                    {!REQUIRED_COMPONENTS.has(activeComponentId) && (
                      <label className="flex items-center gap-2 cursor-pointer bg-[var(--color-paper)] hover:bg-[var(--color-paper-soft)] px-3 py-1.5 rounded-lg border border-[var(--color-border-soft)] transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[var(--color-green)] rounded border-[var(--color-border-soft)] focus:ring-[var(--color-green)]"
                          checked={enabledComponents[activeComponentId] ?? true}
                          onChange={(e) => { setEnabledComponents({...enabledComponents, [activeComponentId]: e.target.checked}); setHasUnsavedChanges(true); }}
                        />
                        <span className="text-sm font-semibold text-[var(--color-espresso)] select-none">Incluir esta seção no documento</span>
                      </label>
                    )}
                  </div>

                  <p className="text-[var(--color-neutral)] text-sm">
                    {REQUIRED_COMPONENTS.has(activeComponentId)
                      ? 'Esta seção é parte obrigatória da estrutura do documento.'
                      : 'Esta seção é opcional. Desative o toggle acima se não quiser incluí-la.'}
                  </p>
                </div>
                
                {/* Active Section Fields */}
                <div className={`p-6 md:p-8 flex-1 overflow-y-auto bg-[var(--color-paper)]/30 transition-opacity duration-300 ${!enabledComponents[activeComponentId] ? 'opacity-40 pointer-events-none grayscale-[0.5]' : ''}`}>
                  <div className="max-w-3xl space-y-6">
                    {activeFields?.map((el: any, elIdx: number) => {
                      
                      // COMPOSED TYPE
                      if (el.type === 'composed') {
                        return (
                          <div key={elIdx} className="bg-white p-5 rounded-xl border border-[var(--color-border-soft)] shadow-sm">
                            <label className="flex items-center gap-2 text-sm font-bold mb-4 text-[var(--color-espresso)]">
                              {formatLabel(el.name)} {el.required && <span className="text-red-500">*</span>}
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {el.fields.map((fName: string) => (
                                <div key={fName}>
                                  <label className="block text-xs font-semibold mb-1.5 text-[var(--color-neutral)]">{formatLabel(fName)}</label>
                                  <input 
                                    type="text"
                                    required={el.required}
                                    className="w-full border border-[var(--color-border-soft)] focus:border-[var(--color-green)] focus:ring-1 focus:ring-[var(--color-green)] p-2.5 rounded-lg text-sm text-[var(--color-espresso)] transition-shadow outline-none"
                                    value={formData[activeComponentId]?.[el.name]?.[fName] || ''}
                                    onChange={(e) => {
                                      const currentObj = formData[activeComponentId]?.[el.name] || {};
                                      handleInputChange(activeComponentId, el.name, { ...currentObj, [fName]: e.target.value });
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      // SIGNATURE TYPE
                      if (el.type === 'signature') {
                        const items = formData[activeComponentId]?.[el.name] || [];
                        return (
                          <div key={elIdx} className="bg-white p-5 rounded-xl border border-[var(--color-border-soft)] shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                              <label className="text-sm font-bold text-[var(--color-espresso)]">
                                {formatLabel(el.name)} {el.required && <span className="text-red-500">*</span>}
                              </label>
                              <button type="button" onClick={() => {
                                handleInputChange(activeComponentId, el.name, [...items, {}]);
                              }} className="text-xs font-medium bg-[var(--color-paper-soft)] hover:bg-[var(--color-border-soft)] text-[var(--color-espresso)] px-3 py-1.5 rounded-lg transition-colors">
                                + Adicionar Membro
                              </button>
                            </div>
                            <div className="space-y-3">
                              {items.map((item: any, itemIdx: number) => (
                                <div key={itemIdx} className="p-4 border border-[var(--color-border-soft)] rounded-lg bg-[var(--color-paper)]/50 relative group">
                                  <button
                                    type="button"
                                    aria-label="Remover"
                                    onClick={() => {
                                      const newItems = [...items];
                                      newItems.splice(itemIdx, 1);
                                      handleInputChange(activeComponentId, el.name, newItems);
                                    }}
                                    className="absolute top-3 right-3 text-[var(--color-neutral)]/70 hover:text-red-500 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                    {el.fields.map((fName: string) => (
                                      <div key={fName}>
                                        <label className="block text-xs font-semibold mb-1.5 text-[var(--color-neutral)]">{formatLabel(fName)}</label>
                                        <input 
                                          type="text"
                                          className="w-full border border-[var(--color-border-soft)] focus:border-[var(--color-green)] focus:ring-1 focus:ring-[var(--color-green)] p-2 rounded-md text-sm text-[var(--color-espresso)] transition-shadow outline-none"
                                          value={item[fName] || ''}
                                          onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[itemIdx] = { ...newItems[itemIdx], [fName]: e.target.value };
                                            handleInputChange(activeComponentId, el.name, newItems);
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              {items.length === 0 && <div className="text-sm text-[var(--color-neutral)]/70 italic text-center py-4 border border-dashed border-[var(--color-border-soft)] rounded-lg">Nenhum membro adicionado.</div>}
                            </div>
                          </div>
                        );
                      }

                      // BODY CONTENT TYPE
                      if (el.type === 'body_content') {
                        return (
                          <div key={elIdx} className="space-y-3">
                            <label className="block text-sm font-bold text-[var(--color-espresso)] capitalize">
                              Conteúdo Textual
                            </label>
                            <div className="border border-[var(--color-border-soft)] rounded-xl overflow-hidden shadow-sm">
                                <BodyEditor
                                  value={formData[activeComponentId]?.sections || []}
                                  onChange={(sections: any) => handleInputChange(activeComponentId, 'sections', sections)}
                                  maxDepth={profile.profileData.componentRules?.[activeComponentId]?.styleMapping?.sectionTitleStyleIdsByLevel?.length || 4}
                                />
                            </div>
                          </div>
                        );
                      }

                      // SECTIONED TYPE
                      if (el.type === 'sectioned') {
                        return (
                          <div key={elIdx} className="space-y-3">
                            <label className="block text-sm font-bold text-[var(--color-espresso)] capitalize">
                              Itens da Seção
                            </label>
                            <div className="border border-[var(--color-border-soft)] rounded-xl overflow-hidden shadow-sm bg-white">
                                <SectionedEditor
                                  value={formData[activeComponentId]?.items || []}
                                  onChange={(items: any) => handleInputChange(activeComponentId, 'items', items)}
                                />
                            </div>
                          </div>
                        );
                      }
                      
                      // REPEAT TYPE
                      if (el.type === 'repeat') {
                        const items = formData[activeComponentId]?.[el.name] || [];
                        return (
                          <div key={elIdx} className="bg-white p-5 rounded-xl border border-[var(--color-border-soft)] shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                              <label className="text-sm font-bold text-[var(--color-espresso)]">
                                {formatLabel(el.name)} {el.required && <span className="text-red-500">*</span>}
                              </label>
                              <button type="button" onClick={() => {
                                handleInputChange(activeComponentId, el.name, [...items, {}]);
                              }} className="text-xs font-medium bg-[var(--color-paper-soft)] hover:bg-[var(--color-border-soft)] text-[var(--color-espresso)] px-3 py-1.5 rounded-lg transition-colors">
                                + Adicionar Item
                              </button>
                            </div>
                            <div className="space-y-3">
                              {items.map((item: any, itemIdx: number) => (
                                <div key={itemIdx} className="p-4 border border-[var(--color-border-soft)] rounded-lg bg-[var(--color-paper)]/50 relative">
                                  <button
                                    type="button"
                                    aria-label="Remover"
                                    onClick={() => {
                                      const newItems = [...items];
                                      newItems.splice(itemIdx, 1);
                                      handleInputChange(activeComponentId, el.name, newItems);
                                    }}
                                    className="absolute top-3 right-3 text-[var(--color-neutral)]/70 hover:text-red-500 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>

                                  {el.group && el.group.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3 pr-8">
                                      {el.group.map((gItem: any, gIdx: number) => {
                                        if (gItem.type === 'HEADING' || gItem.type === 'BLANK_LINES') return null;

                                        if (gItem.type === 'TEMPLATED_TEXT') {
                                            return gItem.fieldNames?.map((fn: string) => (
                                              <div key={fn}>
                                                <label className="block text-xs font-semibold mb-1.5 text-[var(--color-neutral)]">{formatLabel(fn)}</label>
                                                <input 
                                                  type="text"
                                                  className="w-full border border-[var(--color-border-soft)] focus:border-[var(--color-green)] focus:ring-1 focus:ring-[var(--color-green)] p-2 rounded-md text-sm text-[var(--color-espresso)] outline-none"
                                                  value={item[fn] || ''}
                                                  onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[itemIdx] = { ...newItems[itemIdx], [fn]: e.target.value };
                                                    handleInputChange(activeComponentId, el.name, newItems);
                                                  }}
                                                />
                                              </div>
                                            ));
                                        }
                                        
                                        const sName = gItem.slotName || gItem.termsSlotName || gItem.keywordsSlotName || gItem.rowsSlotName;
                                        if (!sName) return null;
                                        
                                        return (
                                          <div key={sName}>
                                            <label className="block text-xs font-semibold mb-1.5 text-[var(--color-neutral)]">{formatLabel(sName)}</label>
                                            <input 
                                              type="text"
                                              className="w-full border border-[var(--color-border-soft)] focus:border-[var(--color-green)] focus:ring-1 focus:ring-[var(--color-green)] p-2 rounded-md text-sm text-[var(--color-espresso)] outline-none"
                                              value={item[sName] || ''}
                                              onChange={(e) => {
                                                const newItems = [...items];
                                                newItems[itemIdx] = { ...newItems[itemIdx], [sName]: e.target.value };
                                                handleInputChange(activeComponentId, el.name, newItems);
                                              }}
                                            />
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <textarea
                                      className="w-full border border-[var(--color-border-soft)] focus:border-[var(--color-green)] p-3 rounded-md text-sm font-mono outline-none"
                                      rows={3}
                                      placeholder="Dados em formato texto ou JSON..."
                                      value={typeof item === 'object' ? JSON.stringify(item) : item}
                                      onChange={(e) => {
                                        const newItems = [...items];
                                        try { newItems[itemIdx] = JSON.parse(e.target.value); } catch { newItems[itemIdx] = e.target.value; }
                                        handleInputChange(activeComponentId, el.name, newItems);
                                      }}
                                    />
                                  )}
                                </div>
                              ))}
                              {items.length === 0 && <div className="text-sm text-[var(--color-neutral)]/70 italic text-center py-4 border border-dashed border-[var(--color-border-soft)] rounded-lg">Nenhum item adicionado.</div>}
                            </div>
                          </div>
                        );
                      }

                      // DEFAULT TEXT/ARRAY TYPE
                      const isTextarea = el.name.toLowerCase().includes('text') || el.name.toLowerCase().includes('resumo') || el.name.toLowerCase().includes('abstract');
                      const hint = slotHints[el.name];
                      return (
                        <div key={elIdx} className="bg-white p-5 rounded-xl border border-[var(--color-border-soft)] shadow-sm">
                          <label className="block text-sm font-bold mb-1.5 text-[var(--color-espresso)]">
                            {formatLabel(el.name)} {el.required && <span className="text-red-500">*</span>}
                          </label>
                          {(el.isArray || el.desc || hint) && (
                            <p className="text-xs text-[var(--color-neutral)]/70 mb-3">
                              {hint || el.desc || ''}{el.isArray && !hint ? (el.desc ? ' · ' : '') + 'Separe múltiplos itens por vírgula' : ''}
                            </p>
                          )}

                          {isTextarea && !el.isArray ? (
                            <textarea
                              required={el.required}
                              className="w-full border border-[var(--color-border-soft)] focus:border-[var(--color-green)] focus:ring-1 focus:ring-[var(--color-green)] p-3 rounded-lg text-sm text-[var(--color-espresso)] transition-shadow outline-none resize-y min-h-[120px]"
                              value={formData[activeComponentId]?.[el.name] || ''}
                              placeholder={`Digite o ${formatLabel(el.name).toLowerCase()}...`}
                              onChange={(e) => handleInputChange(activeComponentId, el.name, e.target.value)}
                            />
                          ) : (
                            <input
                              type="text"
                              required={el.required}
                              className="w-full border border-[var(--color-border-soft)] focus:border-[var(--color-green)] focus:ring-1 focus:ring-[var(--color-green)] p-2.5 rounded-lg text-sm text-[var(--color-espresso)] transition-shadow outline-none"
                              value={formData[activeComponentId]?.[el.name] || ''}
                              placeholder={hint ? '' : `Ex: ${el.isArray ? 'Item 1, Item 2' : 'Preencha aqui...'}`}
                              onChange={(e) => handleInputChange(activeComponentId, el.name, e.target.value)}
                            />
                          )}
                        </div>
                      );
                    })}
                    
                    {activeFields?.length === 0 && (
                      <div className="bg-white p-8 rounded-xl border border-dashed border-[var(--color-success-soft)] flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mb-3">
                          <CheckCircle className="w-6 h-6 text-[var(--color-green)]" />
                        </div>
                        <h3 className="text-[var(--color-espresso)] font-semibold mb-2">Gerada automaticamente</h3>
                        <p className="text-[var(--color-neutral)] text-sm max-w-sm">
                          {componentAutoDescriptions[activeComponentId] || 'Esta seção não requer preenchimento. O Anverso cuidará de toda a formatação e estrutura automaticamente.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Navigation Footer */}
                <div className="p-4 md:px-8 md:py-5 border-t border-[var(--color-border-soft)] bg-white rounded-b-2xl flex items-center justify-between mt-auto">
                  <button 
                    type="button" 
                    onClick={handlePrev}
                    disabled={activeTab === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[var(--color-neutral)] hover:bg-[var(--color-paper-soft)]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  
                  {activeTab < componentOrder.length - 1 ? (
                    <button 
                      type="button" 
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors bg-[var(--color-success-bg)] text-[var(--color-green)] hover:bg-[var(--color-success-soft)]"
                    >
                      Próxima Seção
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow text-white bg-[var(--color-green)] hover:brightness-110 disabled:opacity-70"
                    >
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submetendo...</>
                      ) : (
                        <><FileCheck2 className="w-4 h-4" /> Finalizar e Formatar</>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      
      {/* Global CSS overrides for the custom scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}} />

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
