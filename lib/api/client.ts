// lib/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Tipos base para respostas da API
export interface ApiResponse<T = unknown> {
    length: number
    data: T
    message?: string
    success: boolean
    errors?: string[]
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

// Configuração base do Axios
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/',
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    // Response Interceptor - Trata respostas e erros globalmente
    client.interceptors.response.use(
        (response: AxiosResponse) => {
            // Log em desenvolvimento
            if (process.env.NODE_ENV === 'development') {
                console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
            }

            return response
        },
        (error) => {
            // Tratamento global de erros
            // if (error.response?.status === 401) {
            //     // Token expirado - redireciona para login
            //     handleUnauthorized()
            // }

            if (error.response?.status === 403) {
                // Sem permissão
                console.error('❌ Forbidden: Insufficient permissions')
            }

            if (error.response?.status >= 500) {
                // Erro interno do servidor
                console.error('❌ Server Error:', error.response.data)
            }

            // Log do erro
            console.error('❌ API Error:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                data: error.response?.data
            })

            return Promise.reject(error)
        }
    )

    return client
}

// Instância global do cliente
export const apiClient = createApiClient()

// Método genérico para requests
export const apiRequest = {
    get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        apiClient.get(url, config).then(response => response.data),

    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        apiClient.post(url, data, config).then(response => response.data),

    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        apiClient.put(url, data, config).then(response => response.data),

    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        apiClient.patch(url, data, config).then(response => response.data),

    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        apiClient.delete(url, config).then(response => response.data),
}