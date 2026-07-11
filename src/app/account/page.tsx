'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { User, Mail, Shield, KeyRound, Save, Edit3, ArrowLeft, CheckCircle2, GraduationCap, Camera, X } from 'lucide-react';
import Cropper from 'react-easy-crop';
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

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);

  // Avatar crop state
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Custom Modal state
  const [modalConfig, setModalConfig] = useState<{show: boolean, title: string, message: string, type: AlertModalType}>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: AlertModalType) => {
    setModalConfig({ show: true, title, message, type });
  };

  const closeAlert = () => setModalConfig(prev => ({ ...prev, show: false }));

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      const res = await fetchApi('/api/users/me', { method: 'GET' });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error('Falha ao carregar dados da conta.');
      }
      const data = await res.json();
      setUser(data);
      setEditFirstName(data.firstName || '');
      setEditLastName(data.lastName || '');
      setEditEmail(data.email || '');
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // ...

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (!editFirstName.trim() || !editLastName.trim()) {
        showAlert('Atenção', 'O nome e sobrenome não podem ficar vazios.', 'error');
        setSaving(false);
        return;
      }

      const res = await fetchApi(`/api/users/me`, {
        method: 'PUT',
        body: JSON.stringify({
          firstName: editFirstName.trim(),
          lastName: editLastName.trim()
        })
      });
      
      if (!res.ok) throw new Error('Não foi possível atualizar a conta.');
      
      setUser({ ...user, firstName: editFirstName, lastName: editLastName, email: editEmail });
      setIsEditing(false);
      showAlert('Sucesso', 'Sua conta foi atualizada com sucesso!', 'success');
    } catch (e: any) {
      showAlert('Erro', e.message || 'Erro ao atualizar informações.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Avatar Handlers
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setAvatarSrc(reader.result?.toString() || null));
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleUploadAvatar = async () => {
    if (!avatarSrc || !croppedAreaPixels || !user) return;
    try {
      const croppedBlob = await getCroppedImg(avatarSrc, croppedAreaPixels);
      if (!croppedBlob) return;

      const formData = new FormData();
      formData.append('file', croppedBlob, 'avatar.jpg');

      const res = await fetchApi(`/api/users/${user.id}/avatar`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Erro ao enviar foto.');
      
      const data = await res.text(); // Backend returns URL string usually, or adjust based on your response format
      setUser({ ...user, profilePictureUrl: data });
      setAvatarSrc(null);
      showAlert('Sucesso', 'Sua foto de perfil foi atualizada!', 'success');
    } catch (e: any) {
      showAlert('Erro', e.message || 'Erro ao atualizar foto de perfil.', 'error');
    }
  };

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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Minha Conta</h1>
            <p className="text-slate-500 mt-1">Gerencie suas informações e configurações de conta</p>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6">{error}</div>}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 relative">
            <div className="absolute -bottom-12 left-8 group">
              <label 
                htmlFor={isEditing ? "avatar-upload" : undefined}
                className={`w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-4xl font-bold text-indigo-600 overflow-hidden relative ${isEditing ? 'cursor-pointer' : ''}`}
              >
                {user?.profilePictureUrl ? (
                  // Usando URL local da API caso seja retornado do IAM-service
                  <img src={user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `http://localhost:8080${user.profilePictureUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (user?.firstName || user?.email || 'U').charAt(0).toUpperCase()
                )}
                
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                )}
              </label>
              {isEditing && (
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={onFileChange} 
                />
              )}
            </div>
          </div>
          
          <div className="pt-16 px-8 pb-8">
            <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center mb-8 pb-8 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{user?.firstName} {user?.lastName}</h2>
                <div className="text-slate-500 flex items-center gap-2 mt-1">
                  <Mail size={14} />
                  {user?.email}
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={10} /> Verificado
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-xl font-semibold transition-colors"
                  >
                    <Edit3 size={18} />
                    Atualizar Informações
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-70"
                    >
                      <Save size={18} />
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Info Column */}
              <div className="space-y-6">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <User size={20} className="text-indigo-500" />
                  Dados Pessoais
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Nome</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editFirstName}
                          onChange={e => setEditFirstName(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-900 transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-slate-800 font-medium">
                          {user?.firstName}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Sobrenome</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editLastName}
                          onChange={e => setEditLastName(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-900 transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-slate-800 font-medium">
                          {user?.lastName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">E-mail</label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-900 transition-all"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-slate-800 font-medium">
                        {user?.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Column */}
              <div className="space-y-6">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Shield size={20} className="text-indigo-500" />
                  Segurança & Status
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Nível de Acesso</label>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-sm font-bold tracking-wide">
                        {user?.role === 'ADMIN' ? 'Administrador' : 'Usuário Padrão'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Status da Conta</label>
                    <div className="flex items-center gap-2">
                      {user?.active !== false ? (
                        <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-sm font-bold tracking-wide">
                          Ativa
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm font-bold tracking-wide">
                          Inativa
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-3">Verificação Acadêmica</label>
                    <button
                      className="inline-flex items-center justify-center w-full gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-3 rounded-xl font-semibold transition-colors"
                      onClick={() => showAlert('Em Breve', 'O fluxo de verificação de professor será implementado nas próximas atualizações.', 'info')}
                    >
                      <GraduationCap size={18} />
                      Solicitar verificação de Professor
                    </button>
                    <p className="text-xs text-slate-400 mt-2 text-center">
                      Professores verificados recebem um selo especial.
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-3">Senha</label>
                    <Link
                      href="/recover-password"
                      className="inline-flex items-center justify-center w-full gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-semibold transition-colors"
                    >
                      <KeyRound size={18} />
                      Redefinir Senha
                    </Link>
                    <p className="text-xs text-slate-400 mt-2 text-center">
                      Você será redirecionado para o fluxo seguro.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cropper Modal */}
      {avatarSrc && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Ajustar Foto</h3>
              <button onClick={() => setAvatarSrc(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="relative w-full h-80 bg-slate-900">
              <Cropper
                image={avatarSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // Quadrado
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-500">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  className="w-full accent-indigo-600"
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setAvatarSrc(null)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUploadAvatar}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  Cortar e Salvar
                </button>
              </div>
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
        onClose={closeAlert} 
      />
    </div>
  );
}
