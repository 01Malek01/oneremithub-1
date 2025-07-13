import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  currency: string;
  fromCurrency?: string;
  toCurrency?: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
  recipient?: string;
  rate?: number;
}

const mockTransactions: Transaction[] = [
  {
    id: 'tx001',
    type: 'send',
    amount: 2500.00,
    currency: 'USD',
    toCurrency: 'EUR',
    status: 'completed',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    recipient: 'John Doe',
    rate: 0.92
  },
  {
    id: 'tx002',
    type: 'receive',
    amount: 1850.50,
    currency: 'GBP',
    fromCurrency: 'USD',
    status: 'pending',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    recipient: 'Sarah Wilson',
    rate: 0.78
  },
  {
    id: 'tx003',
    type: 'send',
    amount: 5000.00,
    currency: 'USDT',
    toCurrency: 'CAD',
    status: 'completed',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    recipient: 'Mike Johnson',
    rate: 1.35
  },
  {
    id: 'tx004',
    type: 'receive',
    amount: 750.25,
    currency: 'EUR',
    fromCurrency: 'USD',
    status: 'failed',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    recipient: 'Emma Davis',
    rate: 0.92
  }
];

export const TransactionFeed: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [stats, setStats] = useState({
    today: { count: 45, volume: 125487.50, successRate: 98.2 },
    thisWeek: { count: 287, volume: 847293.25, successRate: 97.8 }
  });

  useEffect(() => {
    // Simulate new transactions
    const interval = setInterval(() => {
      const newTransaction: Transaction = {
        id: `tx${Date.now()}`,
        type: Math.random() > 0.5 ? 'send' : 'receive',
        amount: Math.random() * 5000 + 100,
        currency: ['USD', 'EUR', 'GBP', 'CAD', 'USDT'][Math.floor(Math.random() * 5)],
        status: Math.random() > 0.1 ? 'completed' : 'pending',
        timestamp: new Date(),
        recipient: ['John Doe', 'Sarah Wilson', 'Mike Johnson', 'Emma Davis'][Math.floor(Math.random() * 4)],
        rate: Math.random() + 0.5
      };

      setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400';
      case 'failed':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="glass-card relative rounded-2xl p-4 animate-fade-in h-fit">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/5 opacity-50" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-base font-semibold">Live Transactions</h3>
          <button className="glass-button p-1.5 rounded-lg hover:scale-110 transition-all duration-300">
            <ExternalLink className="w-3 h-3 text-white" />
          </button>
        </div>


        {/* Transaction List */}
        <div className="space-y-2">
          {transactions.slice(0, 4).map((tx) => (
            <div 
              key={tx.id}
              className="glass-button group relative rounded-lg p-3 hover:scale-[1.01] transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tx.type === 'send' 
                      ? 'bg-red-500/10 text-red-400' 
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {tx.type === 'send' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium text-sm">
                        {tx.type === 'send' ? 'Sent' : 'Received'} {tx.currency}
                      </p>
                      <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)}
                        {tx.status}
                      </div>
                    </div>
                    <p className="text-white/60 text-xs">
                      {tx.recipient} • {formatTimeAgo(tx.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold ${
                    tx.type === 'send' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {tx.type === 'send' ? '-' : '+'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  {tx.rate && (
                    <p className="text-white/60 text-xs">
                      Rate: {tx.rate.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-3 glass-button rounded-lg p-2 text-white/80 hover:text-white transition-colors duration-300 text-sm">
          View All
        </button>
      </div>
    </div>
  );
};