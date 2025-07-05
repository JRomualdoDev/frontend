export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString)

    if (isNaN(date.getTime())) {
        return dateString
    }

    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
