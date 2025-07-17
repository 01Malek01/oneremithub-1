import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export const useDeleteCounterparty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('counterparties')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch the counterparties list
      queryClient.invalidateQueries({ queryKey: ['counterparties'] });
      toast.success('Counterparty deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Error deleting counterparty:', error);
      toast.error(`Failed to delete counterparty: ${error.message}`);
    },
  });
};

export default useDeleteCounterparty;
