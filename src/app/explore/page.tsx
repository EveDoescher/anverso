'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Star, Heart, User, FileCheck, Plus } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';

type FilterMode = 'popular' | 'recents' | 'top-rated';

const SORT_OPTIONS: { label: string; value: FilterMode }[] = [
  { label: 'Populares', value: 'popular' },
  { label: 'Recentes', value: 'recents' },
  { label: 'Avaliados', value: 'top-rated' },
];

const CATEGORIES = ['Universidade', 'Revistas', 'ABNT', 'APA', 'Vancouver'];

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>('popular');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetchApi('/api/v1/profiles', { skipAuthRedirect: true });
        const data = await response.json();

        const ownerIds = [...new Set(data.map((p: any) => p.ownerId).filter(Boolean))] as string[];
        const authorCache: Record<string, string> = {};

        await Promise.all(ownerIds.map(async (ownerId: string) => {
          try {
            const userRes = await fetchApi(`/api/users/${ownerId}/public`, { skipAuthRedirect: true });
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
            coverClass: [
              'bg-[var(--color-forest)]',
              'bg-[var(--color-coffee)]',
              'bg-[var(--color-gold)]',
              'bg-[#2A3B31]',
              'bg-[#8C7A6B]',
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
    return b.favoritesCount - a.favoritesCount;
  });

  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex flex-col font-sans">
      <Navbar />

      {/* Hero */}
      <div className="bg-[var(--color-cream)] border-b border-[var(--color-border-soft)] relative">
        <div className="absolute inset-0 bg-[url('/icons/leaves.png')] opacity-[0.03] mix-blend-color-burn bg-repeat" style={{ backgroundSize: '200px' }} />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-espresso)] mb-6">
              Descubra Perfis de Formatação Incríveis
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-neutral)] mb-10 font-light">
              Explore nossa biblioteca de perfis criados pela comunidade. Encontre o template perfeito para o seu TCC, tese, artigo ou relatório.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="w-full sm:flex-1">
                <SearchInput
                  placeholder="Pesquisar por nome, ID ou autor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="primary" size="lg" className="w-full sm:w-auto rounded-2xl" trailingIcon={false}>
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-3xl border border-[var(--color-border-soft)] p-6 sticky top-24 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-[var(--color-coffee)]" />
                <h3 className="text-lg font-serif text-[var(--color-espresso)]">Filtros</h3>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-[var(--color-neutral)] uppercase tracking-[0.2em] mb-3">Ordenar por</h4>
                <SegmentedControl
                  value={filterMode}
                  options={SORT_OPTIONS}
                  onChange={setFilterMode}
                />
              </div>

              <div className="h-[1px] bg-[var(--color-border-soft)]" />

              <div>
                <h4 className="text-[10px] font-bold text-[var(--color-neutral)] uppercase tracking-[0.2em] mb-4">Categorias</h4>
                <div className="space-y-3">
                  {CATEGORIES.map((cat) => (
                    <Checkbox
                      key={cat}
                      label={cat}
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-[var(--color-espresso)]">
                {filteredProfiles.length} Perfis encontrados
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-3xl border border-[var(--color-border-soft)] h-80 animate-pulse">
                    <div className="h-28 bg-[var(--color-paper-soft)] rounded-t-3xl border-b border-[var(--color-border-soft)]" />
                    <div className="p-5 space-y-4">
                      <div className="h-6 bg-[var(--color-paper-soft)] rounded w-3/4" />
                      <div className="h-4 bg-[var(--color-paper-soft)] rounded w-1/2" />
                      <div className="h-16 bg-[var(--color-paper-soft)] rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProfiles.map((profile) => (
                  <Link
                    href={`/explore/${profile.id}`}
                    key={profile.id}
                    className="group bg-white rounded-3xl border border-[var(--color-border-soft)] overflow-hidden hover:shadow-[var(--shadow-soft)] hover:border-[var(--color-border)] transition-all duration-300 flex flex-col"
                  >
                    <div className={`h-28 ${profile.coverClass} p-5 relative overflow-hidden flex items-end`}>
                      <div className="absolute inset-0 bg-[url('/icons/leaves.png')] opacity-10 mix-blend-color-burn bg-repeat" style={{ backgroundSize: '100px' }} />
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-2.5 py-1 text-white text-[11px] font-bold flex items-center gap-1">
                        <Star size={10} className="fill-white" />
                        {profile.rating}
                      </div>
                      <h3 className="text-[var(--color-paper)] font-serif text-xl relative z-10 leading-tight line-clamp-2">
                        {profile.name}
                      </h3>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-[var(--color-coffee)] text-xs mb-3 font-medium">
                        <User size={12} />
                        <span className="truncate">{profile.authorName}</span>
                      </div>

                      <p className="text-[var(--color-neutral)] text-sm line-clamp-3 mb-4 flex-1">
                        {profile.description || 'Sem descrição fornecida pelo autor.'}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-5">
                        {profile.tags.map((tag: string) => (
                          <Badge key={tag} tone="neutral">{tag}</Badge>
                        ))}
                      </div>

                      <div className="h-[1px] bg-[var(--color-border-soft)] mb-4 w-full" />

                      <div className="flex items-center justify-between text-[var(--color-neutral)] text-xs">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Heart size={14} />
                            <span>{profile.favoritesCount}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileCheck size={14} />
                            <span>{profile.usageCount}</span>
                          </div>
                        </div>
                        <div className="font-mono text-[10px] opacity-50">
                          #{profile.id}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && filteredProfiles.length === 0 && (
              <div className="text-center py-24 bg-white rounded-3xl border border-[var(--color-border-soft)] shadow-sm">
                <Search size={40} className="mx-auto text-[var(--color-border-strong)] mb-4" />
                <h3 className="text-xl font-serif text-[var(--color-espresso)] mb-2">Nenhum perfil encontrado</h3>
                <p className="text-[var(--color-neutral)] mb-6 text-sm">Tente buscar por termos diferentes ou remover os filtros.</p>
                <Link href="/create-profile">
                  <Button variant="primary" icon={Plus}>Criar novo perfil</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
