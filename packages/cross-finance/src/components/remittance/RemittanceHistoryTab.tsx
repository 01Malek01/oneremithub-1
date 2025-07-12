
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/data/railsData';

interface RemittanceHistoryItem {
  id: number;
  transactionId: string;
  beneficiary: string;
  date: string;
  amount: number;
  currency: string;
}

interface RemittanceHistoryTabProps {
  remittanceHistory: RemittanceHistoryItem[];
  onViewRemittance: (transaction: Transaction) => void;
  transactions: Transaction[];
}

export function RemittanceHistoryTab({
  remittanceHistory,
  onViewRemittance,
  transactions
}: RemittanceHistoryTabProps) {
  const { toast } = useToast();
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Remittance Advice History</CardTitle>
        <CardDescription>
          View all previously generated remittance advices
        </CardDescription>
      </CardHeader>
      <CardContent>
        {remittanceHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Transaction ID</th>
                  <th className="px-4 py-2 text-left">Date Generated</th>
                  <th className="px-4 py-2 text-left">Beneficiary</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {remittanceHistory.map(item => (
                  <tr key={item.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2">{item.transactionId}</td>
                    <td className="px-4 py-2">{formatDate(item.date)}</td>
                    <td className="px-4 py-2">{item.beneficiary}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatCurrency(item.amount, item.currency)}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // Find original transaction
                            const tx = transactions.find(t => t.id === item.transactionId);
                            if (tx) {
                              onViewRemittance(tx);
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            toast({
                              title: "Download Started",
                              description: `Downloading remittance advice for ${item.transactionId}`
                            });
                          }}
                        >
                          <FileDown className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No remittance history found</p>
            <p className="text-sm">Generate remittance advices from the transactions tab</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
