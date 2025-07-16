import React, { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import CreateTransactionForm from '@/components/transactions/CreateTransactionForm';
import { Transaction } from '@/types/transactions';

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [counterparties , setCounterparties] = useState<string[]>([]);
  return (
<div className="transactions-container flex flex-col w-full h-full ">
<CreateTransactionForm transactions={transactions} setTransactions={setTransactions} counterparties={counterparties} setCounterparties={setCounterparties} />

</div>
  );
};

export default Transactions;