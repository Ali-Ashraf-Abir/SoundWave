import { Router } from "next/router"
import Cookies from "js-cookie";
interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  skipAuth?: boolean
}

function getToken(): any {
  if (Cookies.get('accessToken')) return Cookies.get('accessToken')

}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await api.post('/auth/refresh'); 
    if (response.accessToken) {
      Cookies.set("accessToken", response.accessToken);
      return response.accessToken;
    }
    throw new Error('Failed to refresh token');
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null; 
  }
}

export async function apiCall<T = any>(
  endpoint: string,
  options: ApiOptions = {},
  retry: boolean = true // Added retry flag
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    skipAuth = false
  } = options

  const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'
  const url = `${baseURL}${endpoint}`

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  }

  if (!skipAuth) {
    const token = getToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }


  const config: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
  }


  if (body && method !== 'GET') {
    if (body instanceof FormData) {
      config.body = body

      delete requestHeaders['Content-Type']
    } else {
      config.body = JSON.stringify(body)
    }
  }

  try {
    const response = await fetch(url, config)

    // Handle empty responses
    if (response.status === 204) {
      return {} as T
    }

    // Parse response
    const contentType = response.headers.get('content-type')
    let data: any

    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }


    // if (!response.ok) {

    //   if (response.status === 401 && retry) {
    //     


    //     const newToken = await refreshAccessToken();
    //     if (newToken) {
    //       requestHeaders['Authorization'] = `Bearer ${newToken}`;
    //       const retryResponse = await fetch(url, { ...config, headers: requestHeaders });

    //       const retryContentType = retryResponse.headers.get('content-type');
    //       let retryData: any;

    //       if (retryContentType && retryContentType.includes('application/json')) {
    //         retryData = await retryResponse.json();
    //       } else {
    //         retryData = await retryResponse.text();
    //       }


    //       if (!retryResponse.ok) {

    //         throw {
    //           status: retryResponse.status,
    //           message: retryData?.message || retryResponse.statusText,
    //           data: retryData,
    //         };
    //       }

    //       return retryData;
    //     } else {

    //       throw {
    //         status: 401,
    //         message: 'Failed to refresh access token',
    //       };
    //     }
    //   }

    //   throw {
    //     status: response.status,
    //     message: data?.message || response.statusText,
    //     data,
    //   }
    // }

    return data
  } catch (error: any) {
    // Re-throw fetch errors or custom errors
    throw error
  }
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    apiCall<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T = any>(endpoint: string,body?:any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, { ...options, method: 'DELETE',body }),

  upload: <T = any>(endpoint: string, file: File, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall<T>(endpoint, { ...options, method: 'POST', body: formData });
  }
};
