'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, KeyRound } from 'lucide-react';

export default function RecoverPassword() {
  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetchApi('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error('Falha ao solicitar recuperação.');
      }

      setSuccess('Se o e-mail existir, um código foi enviado.');
      setStep('RESET');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetchApi('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otpCode, newPassword }),
      });

      if (!res.ok) {
        throw new Error('Falha ao redefinir a senha.');
      }

      setSuccess('Senha redefinida com sucesso! Redirecionando...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorações */}
      <Image src="/icons/leaves.png" alt="" width={400} height={400} className="pointer-events-none absolute -left-[50px] -top-[50px] z-0 opacity-10 mix-blend-color-burn" unoptimized />
      <Image src="/icons/leaves.png" alt="" width={300} height={300} className="pointer-events-none absolute -right-[50px] -bottom-[50px] z-0 rotate-[135deg] opacity-10 mix-blend-color-burn" unoptimized />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center bg-white p-3 rounded-2xl shadow-sm mb-6 hover:scale-105 transition-transform">
            <Image src="/icons/xicara.png" alt="Anverso" width={32} height={32} unoptimized />
          </Link>
          <h1 className="text-3xl font-serif text-[var(--color-espresso)] mb-2">
            {step === 'REQUEST' ? 'Recuperar Senha' : 'Redefinir Senha'}
          </h1>
          <p className="text-[var(--color-neutral)] text-sm">
            {step === 'REQUEST' ? 'Enviaremos um código para o seu e-mail.' : 'Crie uma nova senha segura.'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-[var(--shadow-soft)] border border-[var(--color-border-soft)]">
          {error && <div className="bg-[var(--color-error-bg-soft)] text-[var(--color-error)] border border-[var(--color-error-bg)] p-3 rounded-xl mb-6 text-sm">{error}</div>}
          {success && <div className="bg-[var(--color-success-bg)] text-[var(--color-green)] border border-[var(--color-success-soft)] p-3 rounded-xl mb-6 text-sm">{success}</div>}

          {step === 'REQUEST' ? (
            <form onSubmit={handleRequest} className="space-y-5">
              <Input
                label="E-mail"
                type="email"
                required
                leftIcon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
              
              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full justify-center" loading={loading}>
                  Enviar Código
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <Input
                label="E-mail"
                type="email"
                required
                disabled
                leftIcon={Mail}
                value={email}
              />
              <Input
                label="Código OTP"
                type="text"
                required
                leftIcon={KeyRound}
                className="tracking-widest uppercase"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="000000"
              />
              <Input
                label="Nova Senha"
                type="password"
                required
                leftIcon={Lock}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              
              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full justify-center" loading={loading}>
                  Redefinir Senha
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 text-sm text-center">
            <span className="text-[var(--color-neutral)]">
              Lembrou a senha? <Link href="/login" className="text-[var(--color-forest)] font-bold hover:underline">Voltar para o Login</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
