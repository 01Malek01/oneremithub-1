
import { useState, useEffect } from 'react';
import { 
  actualRailsData, 
  enhancedTransactions, 
  Rail,
  Transaction 
} from '@/data/railsData';
import { RemittanceFormData } from '@/components/remittance/RemittanceAdviceForm';
import { RemittanceAdviceForm } from '@/components/remittance/RemittanceAdviceForm';
import { RemittanceAdvicePreview } from '@/components/remittance/RemittanceAdvicePreview';
import { TransactionTrackerContainer } from '@/components/rails/TransactionTrackerContainer';
import { RemittanceHistoryTab } from '@/components/remittance/RemittanceHistoryTab';
import { BankingPartnerCommandCenter } from '@/components/rails/BankingPartnerCommandCenter';
import { SmartRouteOptimizer } from '@/components/rails/SmartRouteOptimizer';
import { RemittanceHistoryItem } from '@/types/rails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Rails = () => {
  const [railsData, setRailsData] = useState(actualRailsData);
  const [transactions, setTransactions] = useState(enhancedTransactions);
  const [remittanceFormOpen, setRemittanceFormOpen] = useState(false);
  const [remittancePreviewOpen, setRemittancePreviewOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [remittanceFormData, setRemittanceFormData] = useState<RemittanceFormData | null>(null);
  const [remittanceHistory, setRemittanceHistory] = useState<RemittanceHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState('command-center');
  const [selectedRail, setSelectedRail] = useState<Rail | null>(null);

  // Load remittance history from localStorage on component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('remittanceHistory');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        setRemittanceHistory(parsedHistory);
      } catch (error) {
        console.error("Error parsing remittance history:", error);
      }
    }
  }, []);

  // Handle opening the remittance form
  const handleOpenRemittanceForm = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setRemittanceFormOpen(true);
  };

  // Handle remittance form submission
  const handleRemittanceSubmit = (data: RemittanceFormData) => {
    setRemittanceFormData(data);
    setRemittanceFormOpen(false);
    setRemittancePreviewOpen(true);
  };

  // Handle rail selection
  const handleSelectRail = (rail: Rail) => {
    setSelectedRail(rail);
    toast.success(`${rail.name} selected as the preferred banking partner`);
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="command-center" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="command-center">Command Center</TabsTrigger>
          <TabsTrigger value="route-optimizer">Smart Router</TabsTrigger>
          <TabsTrigger value="swift-tracker">Transaction Tracker</TabsTrigger>
          <TabsTrigger value="remittance">Remittance History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="command-center" className="space-y-6">
          <BankingPartnerCommandCenter 
            rails={railsData}
            transactions={transactions}
          />
        </TabsContent>

        <TabsContent value="route-optimizer" className="space-y-6">
          <SmartRouteOptimizer 
            rails={railsData} 
            onSelectRail={handleSelectRail} 
          />
        </TabsContent>

        <TabsContent value="swift-tracker" className="space-y-6">
          <TransactionTrackerContainer 
            transactions={transactions}
            setTransactions={setTransactions}
            railsData={railsData}
            onViewRemittance={handleOpenRemittanceForm}
            selectedRail={selectedRail}
          />
        </TabsContent>
        
        <TabsContent value="remittance">
          <RemittanceHistoryTab
            remittanceHistory={remittanceHistory}
            onViewRemittance={handleOpenRemittanceForm}
            transactions={transactions}
          />
        </TabsContent>
      </Tabs>

      {/* Remittance Advice Form */}
      {selectedTransaction && (
        <RemittanceAdviceForm
          open={remittanceFormOpen}
          onOpenChange={setRemittanceFormOpen}
          transaction={selectedTransaction}
          onSubmit={handleRemittanceSubmit}
        />
      )}

      {/* Remittance Advice Preview */}
      {selectedTransaction && remittanceFormData && (
        <RemittanceAdvicePreview
          open={remittancePreviewOpen}
          onOpenChange={setRemittancePreviewOpen}
          formData={remittanceFormData}
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
};

export default Rails;
