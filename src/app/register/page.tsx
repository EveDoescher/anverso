'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const [step, setStep] = useState<'REGISTER' | 'VERIFY'>('REGISTER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

    try {
      const res = await fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        throw new Error('Falha no registro.');
      }

      setSuccess('Usuário registrado! Verifique seu e-mail para o código OTP.');
      setStep('VERIFY');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetchApi('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code: otpCode }),
      });

      if (!res.ok) {
        throw new Error('Falha na verificação. Código inválido ou expirado.');
      }

      setSuccess('Conta ativada com sucesso! Entrando...');
      
      // Auto-login after verification
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
      
      // Fallback
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
            {step === 'REGISTER' ? 'Criar Conta' : 'Verificar E-mail'}
          </h1>
          
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{success}</div>}

          {step === 'REGISTER' ? (
            <div className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    className="w-full border p-2 rounded text-black"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    className="w-full border p-2 rounded text-black"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    className="w-full border p-2 rounded text-black"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition"
                >
                  Cadastrar
                </button>
              </form>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou continue com</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Ocorreu um erro ao conectar com o Google')}
                  useOneTap
                  theme="filled_blue"
                  shape="rectangular"
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4 text-center">
                Um código foi enviado para <strong>{email}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código OTP</label>
                <input
                  type="text"
                  required
                  className="w-full border p-2 rounded text-black text-center text-lg tracking-widest uppercase"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition"
              >
                Verificar
              </button>
              <button
                type="button"
                onClick={() => setStep('REGISTER')}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded font-medium hover:bg-gray-200 transition"
              >
                Voltar ao Registro
              </button>
            </form>
          )}

          <div className="mt-4 text-sm text-center">
            <Link href="/login" className="text-gray-600 hover:underline">
              Já tem uma conta? Faça login
            </Link>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
