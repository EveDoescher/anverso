export const API_URL = process.env.NEXT_PUBLIC_IAM_URL || 'http://localhost:8080';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Ocorreu um erro inesperado.';
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorDetail = errorData.detail;
      } else if (errorData && errorData.title) {
        errorDetail = errorData.title;
      } else if (errorData && errorData.message) {
        errorDetail = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse error
    }
    throw new Error(errorDetail);
  }

  return response;
}
