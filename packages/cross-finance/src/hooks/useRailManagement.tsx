
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Rail, Transaction } from '@/data/railsData';

export function useRailManagement(
  railsData: Rail[], 
  setRailsData: React.Dispatch<React.SetStateAction<Rail[]>>,
  transactions: Transaction[]
) {
  const { toast } = useToast();
  const [newRailDialogOpen, setNewRailDialogOpen] = useState(false);
  const [deleteRailDialogOpen, setDeleteRailDialogOpen] = useState(false);
  const [railToDelete, setRailToDelete] = useState<Rail | null>(null);

  // Handle new rail submission
  const handleNewRail = (values: any) => {
    const newRail: Rail = {
      id: `${railsData.length + 1}`,
      name: values.name,
      specialization: [values.specialization || 'General'],
      pricingModel: 'bps',
      baseFee: parseFloat(values.fee) || 0,
      processingTime: values.processingTime,
      recommended: values.recommended || false,
      integrationStatus: 'manual',
      supportedMethods: ['SWIFT'],
      regions: ['Global'],
      status: 'online',
      lastStatusUpdate: new Date().toISOString()
    };

    setRailsData([...railsData, newRail]);
    setNewRailDialogOpen(false);
    
    toast({
      title: "Banking Partner Created",
      description: `Partner "${newRail.name}" has been added successfully.`,
    });
  };

  // Handle rail deletion
  const handleDeleteRail = () => {
    if (!railToDelete) return;
    
    // Check if rail is in use by any transaction
    const isRailInUse = transactions.some(tx => tx.railId === railToDelete.id);
    
    if (isRailInUse) {
      toast({
        title: "Cannot Delete Partner",
        description: "This banking partner is being used by one or more transactions and cannot be deleted.",
        variant: "destructive"
      });
    } else {
      setRailsData(railsData.filter(rail => rail.id !== railToDelete.id));
      toast({
        title: "Banking Partner Deleted",
        description: `Partner "${railToDelete.name}" has been deleted successfully.`,
      });
    }
    
    setRailToDelete(null);
    setDeleteRailDialogOpen(false);
  };

  // Dialog control functions
  const openNewRailDialog = () => setNewRailDialogOpen(true);
  const closeNewRailDialog = () => setNewRailDialogOpen(false);
  
  const initiateRailDeletion = (rail: Rail) => {
    setRailToDelete(rail);
    setDeleteRailDialogOpen(true);
  };
  
  const cancelRailDeletion = () => {
    setRailToDelete(null);
    setDeleteRailDialogOpen(false);
  };

  return {
    newRailDialogOpen,
    deleteRailDialogOpen,
    railToDelete,
    openNewRailDialog,
    closeNewRailDialog,
    handleNewRail,
    initiateRailDeletion,
    cancelRailDeletion,
    handleDeleteRail,
    setNewRailDialogOpen,
    setDeleteRailDialogOpen
  };
}
