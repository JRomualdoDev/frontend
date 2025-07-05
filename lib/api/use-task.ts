import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService, Task, CreateTaskDto, UpdateTaskDto } from '@/lib/api/services/task.service'
import { toast } from 'sonner'

// Query Keys (centralizados para facilitar invalidação)
export const taskKeys = {
    all: ['tasks'] as const,
    lists: () => [...taskKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...taskKeys.lists(), filters] as const,
    details: () => [...taskKeys.all, 'detail'] as const,
    detail: (id: string) => [...taskKeys.details(), id] as const,
    stats: () => [...taskKeys.all, 'stats'] as const,
}

// Hook para listar tasks
export function useTasks(filters?: Record<string, unknown>) {
    // Converte filters para Record<string, string>
    const stringFilters: Record<string, string> | undefined = filters
        ? Object.fromEntries(
            Object.entries(filters)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, v]) => typeof v === 'string')
                .map(([k, v]) => [k, v as string])
        )
        : undefined;

    return useQuery({
        queryKey: taskKeys.list(stringFilters || {}),
        queryFn: () => taskService.findAll<Task>(stringFilters),
        staleTime: 5 * 60 * 1000, // 5 minutos
        select: (data) => data,
    })
}

// Hook para buscar task por ID
export function useTask(id: string) {
    return useQuery({
        queryKey: taskKeys.detail(id),
        queryFn: () => taskService.findById<Task>(id),
        select: (data) => data.data,
        enabled: !!id, // Só executa se ID existir
    })
}

// Hook para tasks por status
export function useTasksByStatus(status: Task['status']) {
    return useQuery({
        queryKey: taskKeys.list({ status }),
        queryFn: () => taskService.getTasksByStatus(status),
        select: (data) => data.data,
    })
}

// Hook para estatísticas
export function useTaskStats() {
    return useQuery({
        queryKey: taskKeys.stats(),
        queryFn: () => taskService.getTaskStats(),
        select: (data) => data.data,
        staleTime: 2 * 60 * 1000, // 2 minutos
    })
}

// Hook para criar task
export function useCreateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTaskDto) => taskService.create<Task>(data),
        onSuccess: () => {
            // Invalida queries relacionadas
            queryClient.invalidateQueries({ queryKey: taskKeys.all })
            toast.success('Task criada com sucesso!')
        },
        onError: (error: unknown) => {
            let message = 'Erro ao criar task'
            if (error && typeof error === 'object' && 'response' in error) {
                const err = error as { response?: { data?: { message?: string } } }
                message = err.response?.data?.message || message
            }
            toast.error(message)
        },
    })
}

// Hook para atualizar task
export function useUpdateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
            taskService.update<Task>(id, data),
        onSuccess: (response, variables) => {
            // Atualiza o cache da task específica
            queryClient.setQueryData(
                taskKeys.detail(variables.id),
                { data: response.data, success: true }
            )

            // Invalida listas para refletir mudanças
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
            queryClient.invalidateQueries({ queryKey: taskKeys.stats() })

            toast.success('Task atualizada com sucesso!')
        },
        onError: (error: unknown) => {
            let message = 'Erro ao atualizar task'
            if (error && typeof error === 'object' && 'response' in error) {
                const err = error as { response?: { data?: { message?: string } } }
                message = err.response?.data?.message || message
            }
            toast.error(message)
        },
    })
}

// Hook para deletar task
export function useDeleteTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => taskService.delete(id),
        onSuccess: (_, deletedId) => {
            // Remove do cache
            queryClient.removeQueries({ queryKey: taskKeys.detail(deletedId) })

            // Invalida listas
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
            queryClient.invalidateQueries({ queryKey: taskKeys.stats() })

            toast.success('Task deletada com sucesso!')
        },
        onError: (error: unknown) => {
            let message = 'Erro ao deletar task'
            if (error && typeof error === 'object' && 'response' in error) {
                const err = error as { response?: { data?: { message?: string } } }
                message = err.response?.data?.message || message
            }
            toast.error(message)
        },
    })
}

// Hook para toggle status
export function useToggleTaskStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => taskService.toggleTaskStatus(id),
        onMutate: async (id) => {
            // Cancela queries em andamento
            await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) })

            // Snapshot do valor atual
            const previousTask = queryClient.getQueryData(taskKeys.detail(id))

            // Optimistic update
            queryClient.setQueryData(taskKeys.detail(id), (old: { data?: Task } | undefined) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: {
                        ...old.data,
                        status: old.data.status === 'doing' ? 'todo' : 'done'
                    }
                }
            })

            return { previousTask }
        },
        onError: (error, id, context) => {
            // Reverte o optimistic update
            if (context?.previousTask) {
                queryClient.setQueryData(taskKeys.detail(id), context.previousTask)
            }

            let message = 'Erro ao alterar status'
            if (error && typeof error === 'object' && 'response' in error) {
                const err = error as { response?: { data?: { message?: string } } }
                message = err.response?.data?.message || message
            }
            toast.error(message)
        },
        onSettled: (data, error, id) => {
            // Sempre invalida as queries relacionadas
            queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
            queryClient.invalidateQueries({ queryKey: taskKeys.stats() })
        },
    })
}

// Hook para operações em lote
export function useBulkDeleteTasks() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (ids: string[]) => taskService.bulkDelete(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.all })
            toast.success('Tasks deletadas com sucesso!')
        },
        onError: (error: unknown) => {
            let message = 'Erro ao deletar tasks'
            if (error && typeof error === 'object' && 'response' in error) {
                const err = error as { response?: { data?: { message?: string } } }
                message = err.response?.data?.message || message
            }
            toast.error(message)
        },
    })
}

