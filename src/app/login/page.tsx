'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Mail, Lock, KeyRound } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'LOGIN' | 'VERIFY'>('LOGIN');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

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
          router.push(redirectTo);
        }
      } else {
        throw new Error('Falha na autenticação com o Google.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao logar com Google');
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
      if (!res.ok) throw new Error('Código inválido ou expirado.');
      
      setSuccess('Conta ativada! Entrando...');
      // Auto login
      const loginRes = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        if (loginData.accessToken) {
          localStorage.setItem('token', loginData.accessToken);
          router.push(redirectTo);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro na verificação');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        router.push(redirectTo);
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('disabled') || msg.toLowerCase().includes('inativo') || msg.toLowerCase().includes('verif')) {
        setError('Sua conta ainda não foi verificada. Por favor, insira o código OTP enviado para o seu e-mail.');
        setStep('VERIFY');
      } else {
        setError(msg || 'Ocorreu um erro');
      }
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
            <h1 className="text-3xl font-serif text-[var(--color-espresso)] mb-2">Bem-vindo de volta</h1>
            <p className="text-[var(--color-neutral)] text-sm">Acesse sua conta para continuar.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-[var(--shadow-soft)] border border-[var(--color-border-soft)]">
            {error && <Alert tone="error" title={error} className="mb-6" />}
            {success && <Alert tone="success" title={success} className="mb-6" />}

            {step === 'LOGIN' ? (
              <div className="space-y-5">
                <form onSubmit={handleLogin} className="space-y-4">
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
                      Entrar
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
                    Verificar e Entrar
                  </Button>
                  <Button type="button" variant="ghost" size="md" className="w-full justify-center" onClick={() => setStep('LOGIN')} disabled={loading} trailingIcon={false}>
                    Voltar
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-8 text-sm text-center flex flex-col gap-3">
              <Link href="/recover-password" className="text-[var(--color-forest)] font-medium hover:underline">
                Esqueceu a senha?
              </Link>
              <span className="text-[var(--color-neutral)]">
                Não tem uma conta? <Link href="/register" className="text-[var(--color-gold)] font-bold hover:underline">Cadastre-se</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
