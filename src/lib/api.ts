export const API_URL = process.env.NEXT_PUBLIC_IAM_URL || 'http://localhost:8080';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set application/json if it's not a FormData upload
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Ocorreu um erro inesperado.';
    let rawText = '';
    try {
      rawText = await response.text();
      const errorData = JSON.parse(rawText);
      if (errorData && errorData.detail) {
        errorDetail = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      } else if (errorData && errorData.title) {
        errorDetail = typeof errorData.title === 'string' ? errorData.title : JSON.stringify(errorData.title);
      } else if (errorData && errorData.message) {
        errorDetail = typeof errorData.message === 'string' ? errorData.message : JSON.stringify(errorData.message);
      } else if (errorData && errorData.error) {
        errorDetail = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
      } else {
        errorDetail = `Erro HTTP ${response.status}: ${rawText.substring(0, 100)}`;
      }
    } catch (e) {
      errorDetail = `Erro HTTP ${response.status}: ${rawText.substring(0, 100)}`;
    }
    
    // Clear token if unauthorized to prevent loop
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Redirect to login page
        window.location.href = '/login?expired=true';
        // Return a pending promise so the redirect happens without throwing an unhandled error to the overlay
        return new Promise(() => {}) as any;
      }
    }
    
    throw new Error(errorDetail);
  }

  return response;
}
