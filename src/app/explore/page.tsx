'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Star, Heart, User, Clock, ChevronDown, FileCheck, LayoutTemplate, MessageSquare, CheckCircle2, Plus } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('popular'); // popular, recents, top-rated
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetchApi('/api/v1/profiles');
        const data = await response.json();
        
        // Resolver nomes reais dos autores
        const ownerIds = [...new Set(data.map((p: any) => p.ownerId).filter(Boolean))] as string[];
        const authorCache: Record<string, string> = {};
        
        await Promise.all(ownerIds.map(async (ownerId: string) => {
          try {
            const userRes = await fetchApi(`/api/users/${ownerId}/public`);
            const userData = await userRes.json();
            authorCache[ownerId] = userData.name || 'Usuário';
          } catch { /* silently ignore */ }
        }));

        const enrichedProfiles = data.map((p: any, idx: number) => {
          const name = p.name.toLowerCase();
          const tags = [];
          if (name.includes('abnt')) tags.push('ABNT');
          if (name.includes('apa')) tags.push('APA');
          if (name.includes('vancouver')) tags.push('Vancouver');
          if (name.includes('universidade') || name.includes('tcc') || name.includes('tese')) tags.push('Universidade');
          if (name.includes('revista') || name.includes('artigo')) tags.push('Revistas');
          if (tags.length === 0) tags.push('Universidade');
          
          return {
            ...p,
            rating: p.rating ? p.rating.toFixed(1) : '0.0',
            reviewsCount: p.reviewsCount || 0,
            favoritesCount: p.favoritesCount || 0,
            usageCount: p.usageCount || 0,
            authorName: p.ownerId ? (authorCache[p.ownerId] || 'Anverso Official') : 'Anverso Official',
            tags,
            coverGradient: [
              'from-indigo-500 to-purple-600',
              'from-blue-500 to-cyan-500',
              'from-emerald-400 to-teal-500',
              'from-orange-400 to-rose-500',
              'from-violet-500 to-fuchsia-500',
            ][idx % 5]
          };
        });
        setProfiles(enrichedProfiles);
      } catch (error) {
        console.error('Failed to fetch profiles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredProfiles = profiles.filter((p) => {
    const term = search.toLowerCase();
    const matchesSearch = (
      p.name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.authorName?.toLowerCase().includes(term) ||
      p.id?.toLowerCase().includes(term)
    );
    
    const matchesCategory = selectedCategories.length === 0 || 
      p.tags.some((tag: string) => selectedCategories.includes(tag));
      
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (filterMode === 'popular') return b.usageCount - a.usageCount;
    if (filterMode === 'top-rated') return parseFloat(b.rating) - parseFloat(a.rating);
    // recents: not having created_at easily accessible on frontend right now so we fallback to favorites
    return b.favoritesCount - a.favoritesCount; 
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center]" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Descubra Perfis de Formatação Incríveis
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
              Explore nossa biblioteca de perfis criados pela comunidade. Encontre o template perfeito para o seu TCC, tese, artigo ou relatório e poupe horas de formatação.
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar por nome, ID ou autor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm text-lg"
                />
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={20} className="text-slate-700" />
                <h3 className="text-lg font-bold text-slate-900">Filtros</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ordenar por</h4>
                  <div className="space-y-2">
                    {['popular', 'recents', 'top-rated'].map((mode) => (
                      <label key={mode} className="flex items-center gap-3 cursor-pointer group" onClick={() => setFilterMode(mode)}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${filterMode === mode ? 'border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                          {filterMode === mode && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                        </div>
                        <span className={`text-sm font-medium ${filterMode === mode ? 'text-slate-900' : 'text-slate-600'}`}>
                          {mode === 'popular' && 'Mais Populares'}
                          {mode === 'recents' && 'Adicionados Recentemente'}
                          {mode === 'top-rated' && 'Melhor Avaliados'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categorias</h4>
                  <div className="space-y-2">
                    {['Universidade', 'Revistas', 'ABNT', 'APA', 'Vancouver'].map((cat) => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleCategory(cat)}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${selectedCategories.includes(cat) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                          {selectedCategories.includes(cat) && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${selectedCategories.includes(cat) ? 'text-slate-900' : 'text-slate-600'}`}>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {filteredProfiles.length} Perfis encontrados
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-3xl border border-slate-200 h-80 animate-pulse">
                    <div className="h-32 bg-slate-100 rounded-t-3xl" />
                    <div className="p-5 space-y-4">
                      <div className="h-6 bg-slate-100 rounded w-3/4" />
                      <div className="h-4 bg-slate-100 rounded w-1/2" />
                      <div className="h-16 bg-slate-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfiles.map((profile) => (
                  <Link 
                    href={`/explore/${profile.id}`} 
                    key={profile.id}
                    className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 flex flex-col"
                  >
                    <div className={`h-32 bg-gradient-to-br ${profile.coverGradient} p-5 relative overflow-hidden flex items-end`}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-white text-xs font-bold flex items-center gap-1">
                        <Star size={12} className="fill-white" />
                        {profile.rating}
                      </div>
                      <h3 className="text-white font-bold text-xl relative z-10 leading-tight drop-shadow-sm line-clamp-2">
                        {profile.name}
                      </h3>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                        <User size={14} />
                        <span className="font-medium truncate">{profile.authorName}</span>
                      </div>
                      
                      <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                        {profile.description || 'Sem descrição fornecida pelo autor.'}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-5">
                        {profile.tags.map((tag: string) => (
                          <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="h-px bg-slate-100 mb-4 w-full" />
                      
                      <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 group-hover:text-rose-500 transition-colors">
                            <Heart size={16} />
                            <span>{profile.favoritesCount}</span>
                          </div>
                          <div className="flex items-center gap-1.5" title="Utilizações">
                            <FileCheck size={16} />
                            <span>{profile.usageCount}</span>
                          </div>
                        </div>
                        <div className="font-mono text-xs text-slate-300 hover:text-slate-500 transition-colors" title="ID do Perfil">
                          #{profile.id}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && filteredProfiles.length === 0 && (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200">
                <LayoutTemplate size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum perfil encontrado</h3>
                <p className="text-slate-500 mb-6">Tente buscar por termos diferentes ou remover os filtros.</p>
                <Link 
                  href="/create-profile" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  <Plus size={20} />
                  Criar novo perfil
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
