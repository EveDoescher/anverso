'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, KeyRound, User } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState<'REGISTER' | 'VERIFY'>('REGISTER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetchApi('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          router.push('/dashboard');
        }
      } else {
        throw new Error('Falha na autenticação com o Google.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao logar com Google');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!res.ok) {
        throw new Error('Falha no registro.');
      }

      setSuccess('Conta criada! Verifique seu e-mail para o código OTP.');
      setStep('VERIFY');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetchApi('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code: otpCode }),
      });

      if (!res.ok) {
        throw new Error('Código inválido ou expirado.');
      }

      setSuccess('Conta ativada com sucesso! Entrando...');
      
      try {
        const loginRes = await fetchApi('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          if (loginData.accessToken) {
            localStorage.setItem('token', loginData.accessToken);
            router.push('/dashboard');
            return;
          }
        }
      } catch (loginErr) {
        console.error("Auto-login failed", loginErr);
      }
      
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
      <div className="min-h-screen bg-[var(--color-paper)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Decorações */}
        <Image src="/icons/leaves.png" alt="" width={400} height={400} className="pointer-events-none absolute -left-[50px] -top-[50px] z-0 opacity-10 mix-blend-color-burn" unoptimized />
        <Image src="/icons/leaves.png" alt="" width={300} height={300} className="pointer-events-none absolute -right-[50px] -bottom-[50px] z-0 rotate-[135deg] opacity-10 mix-blend-color-burn" unoptimized />

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center bg-white p-3 rounded-2xl shadow-sm mb-6 hover:scale-105 transition-transform">
              <Image src="/icons/xicara.png" alt="Anverso" width={32} height={32} unoptimized />
            </Link>
            <h1 className="text-3xl font-serif text-[var(--color-espresso)] mb-2">Criar Conta</h1>
            <p className="text-[var(--color-neutral)] text-sm">Junte-se à plataforma definitiva de formatação.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-[var(--shadow-soft)] border border-[var(--color-border-soft)]">
            {error && <div className="bg-[var(--color-error-bg-soft)] text-[var(--color-error)] border border-[var(--color-error-bg)] p-3 rounded-xl mb-6 text-sm">{error}</div>}
            {success && <div className="bg-[var(--color-success-bg)] text-[var(--color-green)] border border-[var(--color-success-soft)] p-3 rounded-xl mb-6 text-sm">{success}</div>}

            {step === 'REGISTER' ? (
              <div className="space-y-5">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        label="Nome"
                        type="text"
                        required
                        leftIcon={User}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="João"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="Sobrenome"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Silva"
                      />
                    </div>
                  </div>
                  <Input
                    label="E-mail"
                    type="email"
                    required
                    leftIcon={Mail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                  <Input
                    label="Senha"
                    type="password"
                    required
                    leftIcon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  
                  <div className="pt-2">
                    <Button type="submit" variant="primary" size="lg" className="w-full justify-center" loading={loading}>
                      Cadastrar
                    </Button>
                  </div>
                </form>
                
                <div className="relative py-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--color-border-soft)]"></div></div>
                  <span className="relative bg-white px-4 text-xs font-medium text-[var(--color-neutral)] uppercase tracking-widest">ou continue com</span>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Ocorreu um erro ao conectar com o Google')}
                    useOneTap
                    theme="outline"
                    shape="pill"
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5">
                <p className="text-sm text-[var(--color-neutral)] mb-4 text-center">
                  Um código foi enviado para <strong className="text-[var(--color-espresso)]">{email}</strong>
                </p>
                <Input
                  label="Código OTP"
                  type="text"
                  required
                  leftIcon={KeyRound}
                  className="text-center tracking-widest uppercase font-bold"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="000000"
                />
                
                <div className="pt-2 space-y-3">
                  <Button type="submit" variant="primary" size="lg" className="w-full justify-center" loading={loading}>
                    Verificar
                  </Button>
                  <Button type="button" variant="ghost" size="md" className="w-full justify-center" onClick={() => setStep('REGISTER')} disabled={loading} trailingIcon={false}>
                    Voltar
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-8 text-sm text-center">
              <span className="text-[var(--color-neutral)]">
                Já tem uma conta? <Link href="/login" className="text-[var(--color-forest)] font-bold hover:underline">Faça login</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
