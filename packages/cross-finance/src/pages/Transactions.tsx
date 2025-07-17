import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import CreateTransactionForm from '@/components/transactions/CreateTransactionForm';
import { Transaction } from '@/types/transactions';
import TransactionsGrid from '@/components/transactions/TransactionsGrid';
import CounterpartyForm from '@/components/transactions/CounterpartyForm';
import { Counterparty } from '@/types/transactions';
import useGetCounterparties from '@/hooks/useGetCounterparties';
const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
     
  return (
<div className="transactions-container flex flex-col w-full h-full ">
<TransactionsGrid />
<div className="bg-white mt-20 p-4">

<CounterpartyForm />
</div>
</div>
  );
};

export default Transactions;