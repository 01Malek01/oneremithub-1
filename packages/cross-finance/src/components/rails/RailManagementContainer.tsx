
import { useState } from 'react';
import { Rail, Transaction } from '@/data/railsData';
import { RailManagementCard } from '@/components/rails/RailManagementCard';
import { NewRailDialog } from '@/components/rails/NewRailDialog';
import { DeleteRailDialog } from '@/components/rails/DeleteRailDialog';
import { useRailManagement } from '@/hooks/useRailManagement';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface RailManagementContainerProps {
  railsData: Rail[];
  setRailsData: React.Dispatch<React.SetStateAction<Rail[]>>;
  transactions: Transaction[];
}

export function RailManagementContainer({
  railsData,
  setRailsData,
  transactions
}: RailManagementContainerProps) {
  const {
    newRailDialogOpen,
    deleteRailDialogOpen,
    railToDelete,
    handleNewRail,
    initiateRailDeletion,
    handleDeleteRail,
    setNewRailDialogOpen,
    setDeleteRailDialogOpen
  } = useRailManagement(railsData, setRailsData, transactions);

  const [editingRail, setEditingRail] = useState<Rail | null>(null);

  // Handle opening the rail editing form
  const handleEditRail = (rail: Rail) => {
    setEditingRail({...rail});
  };

  // Handle saving rail changes
  const handleSaveRailChanges = () => {
    if (!editingRail) return;
    
    setRailsData(railsData.map(rail => 
      rail.id === editingRail.id ? editingRail : rail
    ));
    
    toast.success(`${editingRail.name} settings updated successfully`);
    setEditingRail(null);
  };

  // Handle cancel editing
  const handleCancelEditing = () => {
    setEditingRail(null);
  };

  // Handle field change for the editing rail
  const handleFieldChange = (field: keyof Rail, value: any) => {
    if (!editingRail) return;
    
    setEditingRail({
      ...editingRail,
      [field]: value
    });
  };

  return (
    <>
      {/* Rail Management Card */}
      <RailManagementCard 
        rails={railsData}
        onAddRail={() => setNewRailDialogOpen(true)}
        onDeleteRail={initiateRailDeletion}
        onEditRail={handleEditRail}
      />
      
      {/* Rail Editing Form */}
      {editingRail && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Edit {editingRail.name}</CardTitle>
            <CardDescription>Update banking partner settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Fee (bps)</label>
                <Input 
                  type="number"
                  value={editingRail.baseFee}
                  onChange={(e) => handleFieldChange('baseFee', parseFloat(e.target.value))}
                  step="0.1"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected TAT</label>
                <Select 
                  value={editingRail.expectedTAT || '24hr'}
                  onValueChange={(value) => handleFieldChange('expectedTAT', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select TAT" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30min">30 minutes</SelectItem>
                    <SelectItem value="1hr">1 hour</SelectItem>
                    <SelectItem value="2hr">2 hours</SelectItem>
                    <SelectItem value="12hr">12 hours</SelectItem>
                    <SelectItem value="24hr">24 hours</SelectItem>
                    <SelectItem value="48hr">48 hours</SelectItem>
                    <SelectItem value="72hr">72 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Transaction Cap</label>
                <Input 
                  type="number"
                  value={editingRail.maxTransactionCap || ''}
                  onChange={(e) => handleFieldChange('maxTransactionCap', parseFloat(e.target.value))}
                  placeholder="Leave empty for no limit"
                />
              </div>
              
              <div className="space-y-2 md:col-span-3">
                <label className="text-sm font-medium">Notes</label>
                <Input 
                  value={editingRail.notes || ''}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder="Additional information about this banking partner"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={handleCancelEditing} className="mr-2">
                Cancel
              </Button>
              <Button onClick={handleSaveRailChanges}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* New Rail Dialog */}
      <NewRailDialog 
        open={newRailDialogOpen}
        onOpenChange={setNewRailDialogOpen}
        onSubmit={handleNewRail}
      />
      
      {/* Delete Rail Dialog */}
      <DeleteRailDialog 
        open={deleteRailDialogOpen}
        onOpenChange={setDeleteRailDialogOpen}
        onDelete={handleDeleteRail}
        rail={railToDelete}
      />
    </>
  );
}
