import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans text-gray-900 p-8">
      <main className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-6">Bem-vindo ao Anverso</h1>
        <p className="text-lg text-gray-600 mb-8">
          Frontend para testar os microserviços do backend (IAM, Profile, Work).
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
          >
            Fazer Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded font-medium hover:bg-gray-50 transition"
          >
            Criar Conta
          </Link>
          <Link
            href="/explore"
            className="px-6 py-3 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            Explorar Comunidade
          </Link>
        </div>
      </main>
    </div>
  );
}
