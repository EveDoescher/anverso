'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { User, Mail, Shield, KeyRound, Save, Edit3, ArrowLeft, CheckCircle2, GraduationCap, Camera, X } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import Cropper from 'react-easy-crop';
import { AlertModal, AlertModalType } from '@/components/ui/AlertModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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
      
      const data = await res.text(); 
      setUser({ ...user, profilePictureUrl: data });
      setAvatarSrc(null);
      showAlert('Sucesso', 'Sua foto de perfil foi atualizada!', 'success');
    } catch (e: any) {
      showAlert('Erro', e.message || 'Erro ao atualizar foto de perfil.', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-[var(--color-cream)] border-t-[var(--color-green)] rounded-full animate-spin mb-4" />
        <p className="text-[var(--color-neutral)] font-medium text-sm uppercase tracking-widest">Carregando...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-text)] font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="p-2.5 bg-white rounded-2xl border border-[var(--color-border-soft)] text-[var(--color-neutral)] hover:text-[var(--color-espresso)] shadow-sm transition-all hover:-translate-x-1">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-serif text-[var(--color-espresso)]">Minha Conta</h1>
            <p className="text-[var(--color-neutral)] mt-1">Gerencie suas informações e configurações</p>
          </div>
        </div>

        {error && <Alert tone="error" title={error} className="mb-6" />}

        <div className="bg-white rounded-[32px] border border-[var(--color-border-soft)] shadow-sm overflow-hidden mb-12">
          <div className="bg-[var(--color-forest)] h-32 relative">
            <div className="absolute inset-0 bg-[url('/icons/leaves.png')] opacity-10 mix-blend-color-burn" />
            <div className="absolute -bottom-10 left-8 group">
              <label 
                htmlFor={isEditing ? "avatar-upload" : undefined}
                className={`w-24 h-24 bg-[var(--color-cream)] rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-3xl font-serif text-[var(--color-coffee)] overflow-hidden relative ${isEditing ? 'cursor-pointer hover:border-[var(--color-green)] transition-colors' : ''}`}
              >
                {user?.profilePictureUrl ? (
                  <img src={user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `http://localhost:8080${user.profilePictureUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (user?.firstName || user?.email || 'U').charAt(0).toUpperCase()
                )}
                
                {isEditing && (
                  <div className="absolute inset-0 bg-[var(--color-espresso)]/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
          
          <div className="pt-16 px-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center mb-10 pb-8 border-b border-[var(--color-border-soft)]">
              <div>
                <h2 className="text-2xl font-serif text-[var(--color-espresso)]">{user?.firstName} {user?.lastName}</h2>
                <div className="text-[var(--color-neutral)] text-sm flex items-center gap-2 mt-1">
                  <Mail size={14} />
                  {user?.email}
                  <span className="bg-[var(--color-success-bg)] text-[var(--color-green)] text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1 border border-[var(--color-success-soft)]">
                    <CheckCircle2 size={10} /> Verificado
                  </span>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                {!isEditing ? (
                  <Button variant="ghost" onClick={() => setIsEditing(true)} icon={Edit3} className="w-full md:w-auto justify-center">
                    Atualizar Informações
                  </Button>
                ) : (
                  <>
                    <Button variant="quiet" onClick={() => setIsEditing(false)} className="w-full md:w-auto justify-center" trailingIcon={false}>
                      Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSave} loading={saving} icon={Save} className="w-full md:w-auto justify-center" trailingIcon={false}>
                      Salvar
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Info Column */}
              <div className="space-y-6">
                <h3 className="font-serif text-[var(--color-espresso)] text-lg flex items-center gap-2 border-b border-[var(--color-border-soft)] pb-3">
                  <User size={18} className="text-[var(--color-green)]" />
                  Dados Pessoais
                </h3>
                
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      {isEditing ? (
                        <Input 
                          label="Nome"
                          type="text" 
                          value={editFirstName}
                          onChange={e => setEditFirstName(e.target.value)}
                        />
                      ) : (
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-[var(--color-neutral)] mb-1">Nome</label>
                          <div className="text-[14px] text-[var(--color-espresso)] font-medium bg-[var(--color-paper-soft)] px-4 py-3 rounded-xl border border-[var(--color-border-soft)]">
                            {user?.firstName}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <Input 
                          label="Sobrenome"
                          type="text" 
                          value={editLastName}
                          onChange={e => setEditLastName(e.target.value)}
                        />
                      ) : (
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-[var(--color-neutral)] mb-1">Sobrenome</label>
                          <div className="text-[14px] text-[var(--color-espresso)] font-medium bg-[var(--color-paper-soft)] px-4 py-3 rounded-xl border border-[var(--color-border-soft)]">
                            {user?.lastName}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {isEditing ? (
                      <Input 
                        label="E-mail"
                        type="email" 
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        disabled
                        helper="Não é possível alterar o e-mail no momento."
                      />
                    ) : (
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-[var(--color-neutral)] mb-1">E-mail</label>
                        <div className="text-[14px] text-[var(--color-espresso)] font-medium bg-[var(--color-paper-soft)] px-4 py-3 rounded-xl border border-[var(--color-border-soft)]">
                          {user?.email}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Column */}
              <div className="space-y-6">
                <h3 className="font-serif text-[var(--color-espresso)] text-lg flex items-center gap-2 border-b border-[var(--color-border-soft)] pb-3">
                  <Shield size={18} className="text-[var(--color-gold)]" />
                  Segurança & Status
                </h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[var(--color-neutral)] mb-1.5">Nível de Acesso</label>
                      <span className="inline-flex px-3 py-1 bg-[var(--color-paper-soft)] border border-[var(--color-border-soft)] text-[var(--color-coffee)] rounded-md text-xs font-bold uppercase tracking-wider">
                        {user?.role === 'ADMIN' ? 'Administrador' : 'Padrão'}
                      </span>
                    </div>

                    <div className="flex-1">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[var(--color-neutral)] mb-1.5">Status</label>
                      {user?.active !== false ? (
                        <span className="inline-flex px-3 py-1 bg-[var(--color-success-bg)] border border-[var(--color-success-soft)] text-[var(--color-green)] rounded-md text-xs font-bold uppercase tracking-wider">
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 bg-[var(--color-error-bg-soft)] border border-[var(--color-error-bg)] text-[var(--color-error)] rounded-md text-xs font-bold uppercase tracking-wider">
                          Inativo
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[var(--color-neutral)] mb-2">Ações Rápidas</label>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        align="left"
                        icon={GraduationCap}
                        className="w-full text-[13px]"
                        onClick={() => showAlert('Em Breve', 'O fluxo de verificação de professor será implementado nas próximas atualizações.', 'info')}
                      >
                        Solicitar Verificação de Docente
                      </Button>
                      <Link href="/recover-password" tabIndex={-1}>
                        <Button
                          variant="ghost"
                          align="left"
                          icon={KeyRound}
                          className="w-full text-[13px] mt-2"
                        >
                          Redefinir Senha Segura
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cropper Modal */}
      {avatarSrc && (
        <div className="fixed inset-0 bg-[var(--color-espresso)]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-[var(--shadow-elevated)] flex flex-col border border-[var(--color-border-soft)]">
            <div className="p-5 border-b border-[var(--color-border-soft)] flex items-center justify-between">
              <h3 className="font-serif text-lg text-[var(--color-espresso)]">Ajustar Foto</h3>
              <button onClick={() => setAvatarSrc(null)} className="text-[var(--color-neutral)] hover:text-[var(--color-error)] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative w-full h-72 bg-[#1A1A1A]">
              <Cropper
                image={avatarSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-5 bg-white border-t border-[var(--color-border-soft)] flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-[var(--color-neutral)] uppercase tracking-wider">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full accent-[var(--color-green)]"
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="quiet" className="flex-1 justify-center" onClick={() => setAvatarSrc(null)} trailingIcon={false}>
                  Cancelar
                </Button>
                <Button variant="primary" className="flex-1 justify-center" onClick={handleUploadAvatar} trailingIcon={false}>
                  Cortar e Salvar
                </Button>
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
