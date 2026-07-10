'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

export default function SubmitWork() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profileId, setProfileId] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

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
      setLoading(false);
    }
  };

  const selectProfile = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchApi(`/api/v1/profiles/${id}`);
      if (!res.ok) throw new Error('Falha ao carregar o perfil completo');
      const data = await res.json();
      
      let parsedProfileData = data;
      if (typeof data === 'string') {
        parsedProfileData = JSON.parse(data);
      }
      
      const selectedProfileInfo = profiles.find(p => p.id === id);
      const profileName = selectedProfileInfo ? selectedProfileInfo.name : `Perfil ${id}`;
      
      // Since the API only returns profileData, we simulate the profile object for UI purposes
      setProfile({ id, name: profileName, profileData: parsedProfileData });
      
      // Initialize form data based on standard properties or slots
      const initialData: any = {};
      const componentFields: Record<string, any[]> = {};

      parsedProfileData?.componentOrder?.forEach((compId: string) => {
        const comp = parsedProfileData.componentRules?.[compId] || parsedProfileData[compId];
        if (!comp) return;
        
        initialData[compId] = {};
        const fields: any[] = [];

        // SINGLE_PAGE has explicit slots
        if (comp && comp.slots) {
          Object.keys(comp.slots).forEach(slotName => {
            const slot = comp.slots[slotName];
            
            if (slot.type === 'COMPOSED_TEXT') {
              initialData[compId][slotName] = {};
              fields.push({ 
                name: slotName, 
                type: 'composed', 
                required: slot.required, 
                fields: slot.fieldNames || [] 
              });
            } else if (slot.type === 'SIGNATURE_BLOCK_LIST') {
              initialData[compId][slotName] = [];
              fields.push({ 
                name: slotName, 
                type: 'signature', 
                required: slot.required, 
                fields: slot.knownFieldNames || [] 
              });
            } else {
              const isArray = slot.type === 'TEXT_LIST';
              initialData[compId][slotName] = '';
              fields.push({ 
                name: slotName, 
                isArray, 
                required: slot.required,
                type: isArray ? 'array' : 'text'
              });
            }
          });
        } else {
          // Hardcoded fallbacks for well-known FLOW_TEXTUAL and others
          if (compId === 'resumo') {
            initialData[compId] = { text: '', keywords: '' };
            fields.push({ name: 'text', isArray: false, required: true }, { name: 'keywords', isArray: true, required: true });
          } else if (compId === 'abstract') {
            // Simplified for MVP
            initialData[compId] = { text: '', keywords: '' };
            fields.push({ name: 'text', isArray: false, required: true }, { name: 'keywords', isArray: true, required: true });
          } else if (compId === 'errata') {
            initialData[compId] = { rows: '' };
            fields.push({ name: 'rows', isArray: true, required: true, desc: "formato: folha,linha,onde,leia" });
          } else if (compId === 'epigraph') {
            initialData[compId] = { text: '', author: '', source: '' };
            fields.push({ name: 'text', isArray: false, required: true }, { name: 'author', isArray: false, required: true }, { name: 'source', isArray: false, required: true });
          } else if (compId === 'dedication' || compId === 'acknowledgments') {
            initialData[compId] = { text: '' };
            fields.push({ name: 'text', isArray: false, required: true });
          } else if (compId === 'bodyContent') {
            initialData[compId] = { text: '' };
            fields.push({ name: 'text', isArray: false, required: true });
          } else if (compId === 'references') {
            initialData[compId] = { entries: '' };
            fields.push({ name: 'entries', isArray: true, required: true });
          } else if (compId === 'glossary' || compId === 'listOfSymbols' || compId === 'listOfAbbreviations') {
            initialData[compId] = { terms: '', definitions: '' };
            fields.push({ name: 'terms', isArray: true, required: true }, { name: 'definitions', isArray: true, required: true });
          }
        }
        
        if (fields.length > 0) {
          componentFields[compId] = fields;
        }
      });
      
      setFormData(initialData);
      setProfile({ id, name: profileName, profileData: parsedProfileData, componentFields });

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (componentName: string, elementName: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [componentName]: {
        ...prev[componentName],
        [elementName]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const document: any = {};
    const selectedComponents: string[] = [];

    profile?.profileData?.componentOrder?.forEach((compId: string) => {
      if (!profile.componentFields[compId]) return;
      
      selectedComponents.push(compId);
      document[compId] = {};
      
      profile.componentFields[compId].forEach((field: any) => {
        const val = formData[compId][field.name];
        if (field.isArray) {
          // split by comma for array simplicity in MVP
          document[compId][field.name] = val ? val.split(',').map((s: string) => s.trim()) : [];
        } else {
          document[compId][field.name] = val;
        }
      });
      
      // Patch abstract structure to match engine requirement
      if (compId === 'abstract') {
         const t = document[compId].text;
         const k = document[compId].keywords;
         document[compId] = {
           entries: [{ headingText: "ABSTRACT", text: t, keywords: k, keywordsLabel: "Keywords:" }]
         };
      }
      
      // Patch errata structure
      if (compId === 'errata' && document[compId].rows) {
         document[compId].rows = document[compId].rows.map((row: string) => row.split('-').map(s=>s.trim()));
      }
    });

    const payload = {
      fileName: 'meu-trabalho',
      profileId: profile.id,
      options: {
        selectedComponents
      },
      document
    };

    try {
      await fetchApi('/api/v1/works/submit', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      alert('Trabalho submetido com sucesso!');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao submeter trabalho.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm border-b p-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
          &larr; Voltar
        </Link>
        <div className="h-6 w-px bg-gray-300"></div>
        <h1 className="text-xl font-bold text-blue-600">Criar Novo Trabalho</h1>
      </header>

      <main className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8">
        
        {/* Step 1: Seleção de Perfil */}
        {!profile && (
          <section className="bg-white p-6 rounded shadow-sm border space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Passo 1: Selecione o Modelo (Perfil)</h2>
            <p className="text-sm text-gray-600 mb-4">Escolha a norma acadêmica ou modelo de formatação para basear o seu trabalho.</p>
            
            {loading ? (
              <div className="text-center py-8">Carregando modelos...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => selectProfile(p.id)}
                    className="border rounded p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition flex flex-col justify-between h-full"
                  >
                    <div>
                      <h3 className="font-bold text-gray-800 text-base mb-1">{p.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
                    </div>
                  </div>
                ))}
                {profiles.length === 0 && (
                  <div className="col-span-2 text-center text-sm text-gray-500 py-4">Nenhum perfil disponível. Crie um perfil primeiro.</div>
                )}
              </div>
            )}
            {error && <div className="mt-4 bg-red-100 text-red-700 p-3 rounded text-sm">{error}</div>}
          </section>
        )}

        {/* Step 2: Formulário Dinâmico */}
        {profile && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-sm border space-y-8">
            <div>
              <div className="flex justify-between items-center mb-2 border-b pb-2">
                <h2 className="text-lg font-semibold">Passo 2: Preencher Dados</h2>
                <button 
                  type="button" 
                  onClick={() => { setProfile(null); setProfileId(''); }} 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Trocar Modelo
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-6">Preencha os campos abaixo de acordo com o perfil "{profile.name}".</p>
              
              <div className="space-y-8">
                {profile?.profileData?.componentOrder?.map((compId: string, idx: number) => {
                  const fields = profile.componentFields[compId];
                  if (!fields) return null;
                  
                  return (
                    <div key={idx} className="border p-4 rounded bg-gray-50">
                      <h3 className="font-semibold text-md mb-4 text-blue-700">{compId}</h3>
                      <div className="space-y-4">
                        {fields.map((el: any, elIdx: number) => {
                          if (el.type === 'composed') {
                            return (
                              <div key={elIdx} className="border-l-4 border-indigo-400 pl-4 py-2">
                                <label className="block text-sm font-semibold mb-2 text-indigo-700 capitalize">
                                  {el.name} {el.required && <span className="text-red-500">*</span>}
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                  {el.fields.map((fName: string) => (
                                    <div key={fName}>
                                      <label className="block text-xs font-medium mb-1 text-gray-600">{fName}</label>
                                      <input 
                                        type="text"
                                        required={el.required}
                                        className="w-full border p-2 rounded text-sm text-black"
                                        value={formData[compId]?.[el.name]?.[fName] || ''}
                                        onChange={(e) => {
                                          const currentObj = formData[compId]?.[el.name] || {};
                                          handleInputChange(compId, el.name, { ...currentObj, [fName]: e.target.value });
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          if (el.type === 'signature') {
                            const items = formData[compId]?.[el.name] || [];
                            return (
                              <div key={elIdx} className="border-l-4 border-emerald-400 pl-4 py-2">
                                <div className="flex justify-between items-center mb-2">
                                  <label className="block text-sm font-semibold text-emerald-700 capitalize">
                                    {el.name} (Assinaturas) {el.required && <span className="text-red-500">*</span>}
                                  </label>
                                  <button type="button" onClick={() => {
                                    handleInputChange(compId, el.name, [...items, {}]);
                                  }} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">+ Adicionar Pessoa</button>
                                </div>
                                <div className="space-y-4">
                                  {items.map((item: any, itemIdx: number) => (
                                    <div key={itemIdx} className="p-3 border rounded bg-white relative">
                                      <button type="button" onClick={() => {
                                        const newItems = [...items];
                                        newItems.splice(itemIdx, 1);
                                        handleInputChange(compId, el.name, newItems);
                                      }} className="absolute top-2 right-2 text-red-500 text-xs font-bold">X</button>
                                      <div className="grid grid-cols-2 gap-2 pr-6">
                                        {el.fields.map((fName: string) => (
                                          <div key={fName}>
                                            <label className="block text-[10px] font-medium mb-1 text-gray-500 uppercase">{fName}</label>
                                            <input 
                                              type="text"
                                              className="w-full border p-1.5 rounded text-xs text-black"
                                              value={item[fName] || ''}
                                              onChange={(e) => {
                                                const newItems = [...items];
                                                newItems[itemIdx] = { ...newItems[itemIdx], [fName]: e.target.value };
                                                handleInputChange(compId, el.name, newItems);
                                              }}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                  {items.length === 0 && <div className="text-xs text-gray-400">Nenhuma assinatura adicionada.</div>}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={elIdx}>
                              <label className="block text-sm font-medium mb-1 text-gray-700 capitalize">
                                {el.name} {el.required && <span className="text-red-500">*</span>}
                                {el.isArray && <span className="text-xs text-gray-400 font-normal ml-2">(Separe por vírgulas)</span>}
                                {el.desc && <span className="text-xs text-gray-400 font-normal ml-2">({el.desc})</span>}
                              </label>
                              <input 
                                type="text"
                                required={el.required}
                                className="w-full border p-2 rounded text-sm text-black"
                                value={formData[compId]?.[el.name] || ''}
                                onChange={(e) => handleInputChange(compId, el.name, e.target.value)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t flex gap-4">
                <button 
                  type="button" 
                  onClick={() => { setProfile(null); setProfileId(''); }} 
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded font-medium hover:bg-gray-300 transition w-1/3"
                >
                  Voltar
                </button>
                <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50 w-2/3">
                  {loading ? 'Submetendo...' : 'Salvar e Submeter'}
                </button>
              </div>
          </form>
        )}

      </main>
    </div>
  );
}
