import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Counterparty, AddCounterpartyData } from '@/types/counterparty';
import { toast } from 'sonner';

export const useAddCounterparty = () => {
  const queryClient = useQueryClient();

  return useMutation<Counterparty, Error, AddCounterpartyData>({
    mutationFn: async (counterpartyData) => {
      const { data, error } = await supabase
        .from('counterparties')
        .insert([counterpartyData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the counterparties list
      queryClient.invalidateQueries({ queryKey: ['counterparties'] });
      toast.success('Counterparty added successfully');
    },
    onError: (error) => {
      console.error('Error adding counterparty:', error);
      toast.error(`Failed to add counterparty: ${error.message}`);
    },
  });
};

export default useAddCounterparty;
