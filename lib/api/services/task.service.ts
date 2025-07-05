import { apiRequest, ApiResponse } from "../client"
import { BaseService } from "./base.service"

export interface Task {
    id: string
    title: string
    description?: string
    status: 'todo' | 'doing' | 'done'
    priority: 'low' | 'medium' | 'high'
    dueDate?: string
    createdAt: string
    updatedAt: string
}

export interface CreateTaskDto {
    title: string
    description?: string
    priority?: Task['priority']
    dueDate?: string
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
    status?: Task['status']
}

class TaskService extends BaseService {
    protected endpoint = '/tasks'

    // Métodos específicos para tasks
    async getTasksByStatus(status: Task['status']): Promise<ApiResponse<Task[]>> {
        return this.findAll<Task>({ status })
    }

    async toggleTaskStatus(id: string): Promise<ApiResponse<Task>> {
        return apiRequest.patch(`${this.endpoint}/${id}/toggle-status`)
    }

    async getTaskStats(): Promise<ApiResponse<{
        total: number
        completed: number
        pending: number
        overdue: number
    }>> {
        return apiRequest.get(`${this.endpoint}/stats`)
    }

    // Bulk operations
    async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
        return apiRequest.delete(`${this.endpoint}/bulk`, { data: { ids } })
    }

    async bulkUpdateStatus(ids: string[], status: Task['status']): Promise<ApiResponse<Task[]>> {
        return apiRequest.patch(`${this.endpoint}/bulk/status`, { ids, status })
    }
}

export const taskService = new TaskService()