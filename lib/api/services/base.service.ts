// lib/api/services/base.service.ts
import { apiRequest, ApiResponse } from '../client'

export abstract class BaseService {
    protected abstract endpoint: string

    // CRUD básico
    async findAll<T>(params?: Record<string, string>): Promise<ApiResponse<T[]>> {
        const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
        return apiRequest.get(`${this.endpoint}${queryString}`)
    }

    async findById<T>(id: string | number): Promise<ApiResponse<T>> {
        return apiRequest.get(`${this.endpoint}/${id}`)
    }

    async create<T>(data: Partial<T>): Promise<ApiResponse<T>> {
        return apiRequest.post(`${this.endpoint}`, data)
    }

    async update<T>(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
        return apiRequest.put(`${this.endpoint}/${id}`, data)
    }

    async delete(id: string | number): Promise<ApiResponse<void>> {
        return apiRequest.delete(`${this.endpoint}/${id}`)
    }

    // Paginação
    // async findPaginated<T>(
    //     page: number = 1,
    //     limit: number = 10,
    //     filters?: Record<string, string>
    // ): Promise<PaginatedResponse<T>> {
    //     const params: Record<string, string> = {
    //         page: page.toString(),
    //         limit: limit.toString(),
    //         ...(filters || {})
    //     }
    //     return apiRequest.get(`${this.endpoint}/paginated?${new URLSearchParams(params).toString()}`)
    // }
}

