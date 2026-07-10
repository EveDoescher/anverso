'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

export default function RecoverPassword() {
  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
          {step === 'REQUEST' ? 'Recuperar Senha' : 'Redefinir Senha'}
        </h1>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{success}</div>}

        {step === 'REQUEST' ? (
          <form onSubmit={handleRequest} className="space-y-4">
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
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition"
            >
              Enviar Código
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                disabled
                className="w-full border p-2 rounded bg-gray-100 text-gray-500"
                value={email}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código OTP</label>
              <input
                type="text"
                required
                className="w-full border p-2 rounded"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
              <input
                type="password"
                required
                className="w-full border p-2 rounded"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition"
            >
              Redefinir Senha
            </button>
          </form>
        )}

        <div className="mt-4 text-sm text-center">
          <Link href="/login" className="text-gray-600 hover:underline">
            Lembrou a senha? Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}
