import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Transaction } from '@/types/transactions';

const fetchTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }
  return data || [];
};

const useGetTransactions = () => {
  return useQuery<Transaction[], Error>({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    onError: (error: Error) => {
      console.error('Error fetching transactions:', error);
    },
  });
};

export default useGetTransactions;
