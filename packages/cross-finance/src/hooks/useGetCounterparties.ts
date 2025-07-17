import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Counterparty } from '@/types/counterparty';

export const useGetCounterparties = () => {
  return useQuery<Counterparty[], Error>({
    queryKey: ['counterparties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('counterparties')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export default useGetCounterparties;
