'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

interface ProfileSummary {
  id: string;
  name: string;
  description: string;
}

export default function CreateProfile() {
  // Step 0: Select Base, Step 1: Config, Step 2: Builder
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const router = useRouter();

  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // General Settings (Step 1)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // Page Settings (Step 1)
  const [paperSize, setPaperSize] = useState('');
  const [orientation, setOrientation] = useState('');
  const [marginTop, setMarginTop] = useState('');
  const [marginBottom, setMarginBottom] = useState('');
  const [marginLeft, setMarginLeft] = useState('');
  const [marginRight, setMarginRight] = useState('');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');

  // Typography Settings (Step 1)
  const [fontFamily, setFontFamily] = useState('');
  const [fontSize, setFontSize] = useState('');
  const [lineHeight, setLineHeight] = useState('');
  const [alignment, setAlignment] = useState('');
  const [firstLineIndent, setFirstLineIndent] = useState('');

  // Builder State (Step 2)
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);
  const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);

  // Drag and Drop States
  const [draggedComponentIndex, setDraggedComponentIndex] = useState<number | null>(null);
  const [draggedElementIndex, setDraggedElementIndex] = useState<number | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

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
      setLoadingProfiles(false);
    }
  };

  const handleDropComponent = (targetIndex: number) => {
    if (draggedComponentIndex === null || draggedComponentIndex === targetIndex) return;
    const newComps = [...components];
    const [draggedItem] = newComps.splice(draggedComponentIndex, 1);
    newComps.splice(targetIndex, 0, draggedItem);
    setComponents(newComps);
    setDraggedComponentIndex(null);
    if (selectedComponentIndex === draggedComponentIndex) setSelectedComponentIndex(targetIndex);
    else if (selectedComponentIndex === targetIndex) setSelectedComponentIndex(draggedComponentIndex);
  };

  const handleDropElement = (targetIndex: number) => {
    if (selectedComponentIndex === null || draggedElementIndex === null || draggedElementIndex === targetIndex) return;
    const newComps = [...components];
    const elements = newComps[selectedComponentIndex].elements;
    const [draggedItem] = elements.splice(draggedElementIndex, 1);
    elements.splice(targetIndex, 0, draggedItem);
    setComponents(newComps);
    setDraggedElementIndex(null);
    if (selectedElementIndex === draggedElementIndex) setSelectedElementIndex(targetIndex);
    else if (selectedElementIndex === targetIndex) setSelectedElementIndex(draggedElementIndex);
  };


  const handleCreateFromScratch = () => {
    setName('');
    setDescription('');
    setPaperSize('');
    setOrientation('');
    setMarginTop('');
    setMarginBottom('');
    setMarginLeft('');
    setMarginRight('');
    setCustomWidth('');
    setCustomHeight('');
    setFontFamily('');
    setFontSize('');
    setLineHeight('');
    setAlignment('');
    setFirstLineIndent('');
    setComponents([]);
    setStep(1);
  };

  const handleForkProfile = async (id: string) => {
    try {
      const res = await fetchApi(`/api/v1/profiles/${id}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.name + ' (Cópia)');
        setDescription(data.description);
        setIsPublic(data.isPublic);
        
        let parsed = data.profileData;
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        
        if (parsed.generalSettings) {
          setPaperSize(parsed.generalSettings.paperSize || 'A4');
          setOrientation(parsed.generalSettings.orientation || 'portrait');
          setMarginTop(parsed.generalSettings.margins?.top || '3');
          setMarginBottom(parsed.generalSettings.margins?.bottom || '2');
          setMarginLeft(parsed.generalSettings.margins?.left || '3');
          setMarginRight(parsed.generalSettings.margins?.right || '2');
          
          
          if (parsed.generalSettings.paperSize === 'Personalizada') {
            setCustomWidth(parsed.generalSettings.customDimensions?.width || '21');
            setCustomHeight(parsed.generalSettings.customDimensions?.height || '29.7');
          }
          
          if (parsed.generalSettings.typography) {
            setFontFamily(parsed.generalSettings.typography.fontFamily || 'Arial');
            setFontSize(parsed.generalSettings.typography.fontSize || '12');
            setLineHeight(parsed.generalSettings.typography.lineHeight || '1.5');
            setAlignment(parsed.generalSettings.typography.alignment || 'justify');
            setFirstLineIndent(parsed.generalSettings.typography.firstLineIndent || '1.25');
          }
        }
        
        setComponents(parsed.components || []);
        setStep(1);
      } else {
        alert('Erro ao carregar dados do perfil base');
      }
    } catch (err) {
      alert('Erro de conexão ao carregar perfil base');
    }
  };

  const handleAddComponent = () => {
    const newComponent = { 
      name: 'Novo Componente', 
      layoutMode: 'continuous',
      pageBreakBefore: true,
      countPage: true,
      showPageNumber: true,
      elements: [] 
    };
    setComponents([...components, newComponent]);
  };

  const handleAddElement = () => {
    if (selectedComponentIndex === null) return;
    const newComponents = [...components];
    newComponents[selectedComponentIndex].elements.push({ 
      name: 'Novo Elemento', 
      type: 'text', 
      required: false,
      uppercase: false,
      bold: false,
      italic: false,
      alignment: 'inherit',
      fontSize: 'inherit',
      marginTop: '0',
      marginBottom: '1'
    });
    setComponents(newComponents);
  };

  const handleSaveProfile = async () => {
    const profileData: any = { 
      generalSettings: {
        paperSize,
        orientation,
        margins: { top: marginTop, bottom: marginBottom, left: marginLeft, right: marginRight },
        typography: { fontFamily, fontSize, lineHeight, alignment, firstLineIndent }
      },
      components 
    };
    
    if (paperSize === 'Personalizada') {
      profileData.generalSettings.customDimensions = { width: customWidth, height: customHeight };
    }
    
    const generatedId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
    
    const payload = {
      id: generatedId,
      name,
      description,
      isPublic,
      profileData: JSON.stringify(profileData),
    };

    try {
      const res = await fetchApi('/api/v1/profiles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erro ao salvar no backend');
      alert('Perfil criado com sucesso!');
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Erro ao criar perfil');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm border-b p-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
          &larr; Voltar
        </Link>
        <div className="h-6 w-px bg-gray-300"></div>
        <h1 className="text-xl font-bold text-blue-600">Criar Perfil de Formatação</h1>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {step === 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded shadow-sm border">
              <div>
                <h2 className="text-lg font-semibold mb-1">Começar do Zero</h2>
                <p className="text-sm text-gray-600">Crie um perfil completamente novo e defina seus componentes.</p>
              </div>
              <button 
                onClick={handleCreateFromScratch}
                className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition"
              >
                Criar do Zero
              </button>
            </div>

            <div className="bg-white p-6 rounded shadow-sm border">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">Ou use um existente como base (Fork)</h2>
              
              {loadingProfiles ? (
                <div className="text-center p-8 text-gray-500">Carregando perfis...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profiles.map(p => (
                    <div key={p.id} className="border p-4 rounded hover:shadow transition bg-gray-50 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-800 mb-1">{p.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">ID: {p.id}</p>
                        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{p.description}</p>
                      </div>
                      <button 
                        onClick={() => handleForkProfile(p.id)}
                        className="bg-gray-800 text-white w-full py-2 rounded text-sm hover:bg-gray-900 transition mt-4"
                      >
                        Usar como Base
                      </button>
                    </div>
                  ))}
                  {profiles.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 p-8 border border-dashed rounded">
                      Nenhum perfil encontrado no sistema.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white p-6 rounded shadow-sm border max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Passo 1: Configurações Gerais</h2>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800">Identificação</h3>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Nome do Perfil</label>
                  <input type="text" required className="w-full border p-2 rounded text-black" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: ABNT Padrão UNIP" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Descrição</label>
                  <textarea required className="w-full border p-2 rounded text-black" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                  <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">Perfil Público</label>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-medium text-gray-800">Layout da Página</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Formato da Folha</label>
                    <select required className="w-full border p-2 rounded text-black bg-white" value={paperSize} onChange={e => setPaperSize(e.target.value)}>
                      <option value="" disabled>Selecione...</option>
                      <option value="A4">A4</option>
                      <option value="A3">A3</option>
                      <option value="Ofício">Ofício</option>
                      <option value="Carta">Carta</option>
                      <option value="Personalizada">Personalizada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Orientação</label>
                    <select required className="w-full border p-2 rounded text-black bg-white" value={orientation} onChange={e => setOrientation(e.target.value)}>
                      <option value="" disabled>Selecione...</option>
                      <option value="portrait">Retrato</option>
                      <option value="landscape">Paisagem</option>
                    </select>
                  </div>
                </div>
                {paperSize === 'Personalizada' && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Largura (cm)</label>
                      <input type="number" step="0.1" required className="w-full border p-2 rounded text-black" value={customWidth} onChange={e => setCustomWidth(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Altura (cm)</label>
                      <input type="number" step="0.1" required className="w-full border p-2 rounded text-black" value={customHeight} onChange={e => setCustomHeight(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-medium text-gray-800">Margens (cm)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Superior</label>
                    <input type="number" step="0.1" required className="w-full border p-2 rounded text-black" value={marginTop} onChange={e => setMarginTop(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Inferior</label>
                    <input type="number" step="0.1" required className="w-full border p-2 rounded text-black" value={marginBottom} onChange={e => setMarginBottom(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Esquerda</label>
                    <input type="number" step="0.1" required className="w-full border p-2 rounded text-black" value={marginLeft} onChange={e => setMarginLeft(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Direita</label>
                    <input type="number" step="0.1" required className="w-full border p-2 rounded text-black" value={marginRight} onChange={e => setMarginRight(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-medium text-gray-800">Tipografia Padrão</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Fonte</label>
                    <select required className="w-full border p-2 rounded text-black bg-white" value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                      <option value="" disabled>Selecione...</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Calibri">Calibri</option>
                      <option value="Open Sans">Open Sans</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Tamanho (pt)</label>
                    <input type="number" step="0.5" required className="w-full border p-2 rounded text-black" value={fontSize} onChange={e => setFontSize(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Espaçamento de Linhas</label>
                    <select required className="w-full border p-2 rounded text-black bg-white" value={lineHeight} onChange={e => setLineHeight(e.target.value)}>
                      <option value="" disabled>Selecione...</option>
                      <option value="1.0">Simples (1.0)</option>
                      <option value="1.15">1.15</option>
                      <option value="1.5">1.5</option>
                      <option value="2.0">Duplo (2.0)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-medium text-gray-800">Alinhamento e Parágrafo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Alinhamento Base</label>
                    <select required className="w-full border p-2 rounded text-black bg-white" value={alignment} onChange={e => setAlignment(e.target.value)}>
                      <option value="" disabled>Selecione...</option>
                      <option value="justify">Justificado</option>
                      <option value="left">Alinhado à Esquerda</option>
                      <option value="center">Centralizado</option>
                      <option value="right">Alinhado à Direita</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Recuo Primeira Linha (cm)</label>
                    <input type="number" step="0.1" required className="w-full border p-2 rounded text-black" value={firstLineIndent} onChange={e => setFirstLineIndent(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button type="button" onClick={() => setStep(0)} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 w-1/3 font-medium text-black">Voltar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-2/3 font-medium">
                  Avançar para Construtor
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Passo 2: Construtor Visual</h2>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300 text-black">Voltar</button>
                <button onClick={handleSaveProfile} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 font-medium">Salvar Perfil</button>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-6 h-[600px]">
              {/* Coluna 1: Componentes */}
              <div className="bg-white border rounded shadow-sm flex flex-col">
                <div className="p-3 border-b bg-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-sm text-gray-800">Componentes</h3>
                  <button onClick={handleAddComponent} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">+ Add</button>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-2">
                  {components.map((comp, idx) => (
                    <div 
                      key={idx} 
                      draggable
                      onDragStart={() => setDraggedComponentIndex(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropComponent(idx)}
                      onClick={() => { setSelectedComponentIndex(idx); setSelectedElementIndex(null); }}
                      className={`p-3 border rounded cursor-grab active:cursor-grabbing text-sm text-black flex justify-between items-center ${selectedComponentIndex === idx ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'} ${draggedComponentIndex === idx ? 'opacity-50' : ''}`}
                    >
                      <span>{comp.name}</span>
                      <span className="text-gray-400 text-xs">≡</span>
                    </div>
                  ))}
                  {components.length === 0 && <div className="text-sm text-gray-500 p-4 text-center">Nenhum componente. Adicione um!</div>}
                </div>
              </div>

              {/* Coluna 2: Elementos */}
              <div className="bg-white border rounded shadow-sm flex flex-col">
                <div className="p-3 border-b bg-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-sm text-gray-800">Elementos</h3>
                  {selectedComponentIndex !== null && (
                    <button onClick={handleAddElement} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">+ Add</button>
                  )}
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-2">
                  {selectedComponentIndex === null ? (
                    <div className="text-sm text-gray-500 p-4 text-center">Selecione um componente primeiro.</div>
                  ) : (
                    components[selectedComponentIndex].elements.map((el: any, elIdx: number) => (
                      <div 
                        key={elIdx}
                        draggable
                        onDragStart={() => setDraggedElementIndex(elIdx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropElement(elIdx)}
                        onClick={() => setSelectedElementIndex(elIdx)}
                        className={`p-3 border rounded cursor-grab active:cursor-grabbing text-sm text-black flex justify-between items-center ${selectedElementIndex === elIdx ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'} ${draggedElementIndex === elIdx ? 'opacity-50' : ''}`}
                      >
                        <div className="flex flex-col">
                          <span>{el.name}</span>
                          <span className="text-xs text-gray-500">({el.type})</span>
                        </div>
                        <span className="text-gray-400 text-xs">≡</span>
                      </div>
                    ))
                  )}
                  {selectedComponentIndex !== null && components[selectedComponentIndex].elements.length === 0 && (
                    <div className="text-sm text-gray-500 p-4 text-center">Sem elementos. Adicione um!</div>
                  )}
                </div>
              </div>

              {/* Coluna 3: Inspetor */}
              <div className="bg-white border rounded shadow-sm flex flex-col">
                <div className="p-3 border-b bg-gray-100">
                  <h3 className="font-semibold text-sm text-gray-800">Inspetor de Propriedades</h3>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  {selectedComponentIndex !== null && selectedElementIndex === null && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2 border-b pb-1">Configuração do Componente</h4>
                      <div>
                        <label className="block text-xs mb-1 text-gray-600">Nome do Componente (Visível pro usuário)</label>
                        <input 
                          type="text" 
                          className="w-full border p-2 rounded text-sm text-black"
                          value={components[selectedComponentIndex].name || ''}
                          onChange={e => {
                            const newComps = [...components];
                            newComps[selectedComponentIndex].name = e.target.value;
                            setComponents(newComps);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-gray-600">Comportamento (Layout)</label>
                        <select 
                          className="w-full border p-2 rounded text-sm text-black"
                          value={components[selectedComponentIndex].layoutMode || 'continuous'}
                          onChange={e => {
                            const newComps = [...components];
                            newComps[selectedComponentIndex].layoutMode = e.target.value;
                            setComponents(newComps);
                          }}
                        >
                          <option value="continuous">Página Corrida (Texto Livre)</option>
                          <option value="single_page">Página Única (Ex: Capa)</option>
                          <option value="listing">Listagem Automática (Ex: Sumário)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2 pt-2 border-t">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={components[selectedComponentIndex].pageBreakBefore ?? true}
                            onChange={e => {
                              const newComps = [...components];
                              newComps[selectedComponentIndex].pageBreakBefore = e.target.checked;
                              setComponents(newComps);
                            }}
                          />
                          <span className="text-sm text-gray-700">Iniciar em nova página (Quebra de Página)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={components[selectedComponentIndex].countPage ?? true}
                            onChange={e => {
                              const newComps = [...components];
                              newComps[selectedComponentIndex].countPage = e.target.checked;
                              setComponents(newComps);
                            }}
                          />
                          <span className="text-sm text-gray-700">Contar esta página na numeração total</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={components[selectedComponentIndex].showPageNumber ?? true}
                            onChange={e => {
                              const newComps = [...components];
                              newComps[selectedComponentIndex].showPageNumber = e.target.checked;
                              setComponents(newComps);
                            }}
                          />
                          <span className="text-sm text-gray-700">Exibir numeração de página neste componente</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {selectedComponentIndex !== null && selectedElementIndex !== null && (
                    <div className="space-y-5">
                      <h4 className="font-medium text-sm text-gray-700 mb-2 border-b pb-1">Configuração do Elemento</h4>
                      
                      {/* Básico */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs mb-1 text-gray-600">Nome do Elemento (Rótulo pro usuário)</label>
                          <input 
                            type="text" 
                            className="w-full border p-2 rounded text-sm text-black"
                            value={components[selectedComponentIndex].elements[selectedElementIndex].name || ''}
                            onChange={e => {
                              const newComps = [...components];
                              newComps[selectedComponentIndex].elements[selectedElementIndex].name = e.target.value;
                              setComponents(newComps);
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs mb-1 text-gray-600">Tipo de Dado</label>
                            <select 
                              className="w-full border p-2 rounded text-sm text-black"
                              value={components[selectedComponentIndex].elements[selectedElementIndex].type || 'text'}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].elements[selectedElementIndex].type = e.target.value;
                                setComponents(newComps);
                              }}
                            >
                              <option value="text">Texto Curto</option>
                              <option value="multiline">Texto Longo (Parágrafos)</option>
                              <option value="list">Lista de Itens</option>
                              <option value="image">Imagem</option>
                            </select>
                          </div>
                          <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={components[selectedComponentIndex].elements[selectedElementIndex].required || false}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].required = e.target.checked;
                                  setComponents(newComps);
                                }}
                              />
                              <span className="text-sm text-gray-700">Preenchimento Obrigatório</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Estilo Visual */}
                      <div className="pt-3 border-t space-y-3">
                        <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Estilo Visual</h5>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs mb-1 text-gray-600">Alinhamento</label>
                            <select 
                              className="w-full border p-2 rounded text-sm text-black"
                              value={components[selectedComponentIndex].elements[selectedElementIndex].alignment || 'inherit'}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].elements[selectedElementIndex].alignment = e.target.value;
                                setComponents(newComps);
                              }}
                            >
                              <option value="inherit">Herdar Padrão</option>
                              <option value="left">Esquerda</option>
                              <option value="center">Centralizado</option>
                              <option value="right">Direita</option>
                              <option value="justify">Justificado</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs mb-1 text-gray-600">Tamanho da Fonte (pt)</label>
                            <select 
                              className="w-full border p-2 rounded text-sm text-black"
                              value={components[selectedComponentIndex].elements[selectedElementIndex].fontSize || 'inherit'}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].elements[selectedElementIndex].fontSize = e.target.value;
                                setComponents(newComps);
                              }}
                            >
                              <option value="inherit">Herdar Padrão</option>
                              <option value="10">10 pt</option>
                              <option value="12">12 pt</option>
                              <option value="14">14 pt</option>
                              <option value="16">16 pt</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-1">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={components[selectedComponentIndex].elements[selectedElementIndex].uppercase || false}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].elements[selectedElementIndex].uppercase = e.target.checked;
                                setComponents(newComps);
                              }}
                            />
                            <span className="text-sm font-medium text-gray-700 uppercase">Maiúsculas</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={components[selectedComponentIndex].elements[selectedElementIndex].bold || false}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].elements[selectedElementIndex].bold = e.target.checked;
                                setComponents(newComps);
                              }}
                            />
                            <span className="text-sm font-bold text-gray-700">Negrito</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={components[selectedComponentIndex].elements[selectedElementIndex].italic || false}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].elements[selectedElementIndex].italic = e.target.checked;
                                setComponents(newComps);
                              }}
                            />
                            <span className="text-sm italic text-gray-700">Itálico</span>
                          </label>
                        </div>
                      </div>

                      {/* Espaçamento */}
                      <div className="pt-3 border-t space-y-3">
                        <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Espaçamento (cm)</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs mb-1 text-gray-600">Espaço Antes</label>
                            <input 
                              type="number" step="0.1"
                              className="w-full border p-2 rounded text-sm text-black"
                              value={components[selectedComponentIndex].elements[selectedElementIndex].marginTop ?? '0'}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].elements[selectedElementIndex].marginTop = e.target.value;
                                setComponents(newComps);
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs mb-1 text-gray-600">Espaço Depois</label>
                            <input 
                              type="number" step="0.1"
                              className="w-full border p-2 rounded text-sm text-black"
                              value={components[selectedComponentIndex].elements[selectedElementIndex].marginBottom ?? '1'}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].elements[selectedElementIndex].marginBottom = e.target.value;
                                setComponents(newComps);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedComponentIndex === null && (
                    <div className="text-sm text-gray-500 text-center mt-4">
                      Selecione um componente ou elemento para inspecionar.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
