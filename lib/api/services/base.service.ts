// lib/api/services/base.service.ts
import { formatDateTime } from '@/utils/dateFormatter'
import { apiRequest, ApiResponse } from '../client'
import { Task } from './task.service'

export abstract class BaseService {
    protected abstract endpoint: string

    // CRUD básico
    async findAll<T extends Task>(params?: Record<string, string>): Promise<ApiResponse<T[]>> {
        const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''

        const request: ApiResponse<T[]> = await apiRequest.get(`${this.endpoint}${queryString}`)
        const output = request.data.map((task) => ({
            ...task,
            created_at: formatDateTime(task.created_at),
            updated_at: formatDateTime(task.updated_at)
        }))
        return {
            data: output,
            success: request.success,
            length: output.length,
        }
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

