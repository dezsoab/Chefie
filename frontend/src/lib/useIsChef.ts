import { useQuery } from '@tanstack/react-query'
import { fetchMe } from '../api/auth'

export function useIsChef() {
    const { data } = useQuery({ queryKey: ['me'], queryFn: fetchMe, staleTime: 60_000 })
    return !!data
}
