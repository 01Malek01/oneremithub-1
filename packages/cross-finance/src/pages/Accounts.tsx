
import { useState } from 'react';
import { AccountCard } from '@/components/dashboard/AccountCard';
import { BalanceChart } from '@/components/charts/BalanceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Mock data for transactions
const transactions = [
  {
    id: '1',
    date: '2025-04-27 14:32',
    description: 'Incoming SWIFT Transfer',
    reference: 'REF123456',
    amount: 50000,
    balance: 720000,
    type: 'credit'
  },
  {
    id: '2',
    date: '2025-04-26 09:15',
    description: 'USDT Purchase',
    reference: 'EX789012',
    amount: 25000,
    balance: 670000,
    type: 'debit'
  },
  {
    id: '3',
    date: '2025-04-24 16:45',
    description: 'Outgoing SWIFT Transfer',
    reference: 'PAY345678',
    amount: 35000,
    balance: 695000,
    type: 'debit'
  },
  {
    id: '4',
    date: '2025-04-23 11:20',
    description: 'Incoming SWIFT Transfer',
    reference: 'REF901234',
    amount: 40000,
    balance: 730000,
    type: 'credit'
  },
];

const accounts = [
  {
    id: '1',
    name: 'Main USD Account',
    number: '0123456789',
    balance: 720000,
    currency: 'USD',
    limit: 1000000
  },
  {
    id: '2',
    name: 'NGN Settlement Account',
    number: '9876543210',
    balance: 82500000,
    currency: 'NGN',
    limit: 100000000
  },
  {
    id: '3',
    name: 'EUR Account',
    number: '1357924680',
    balance: 78500,
    currency: 'EUR',
    limit: null
  }
];

// Mock function to simulate current user role
const useUserRole = () => {
  // In a real app, this would come from an auth context or API
  return { isAdmin: true };
};

const Accounts = () => {
  // User role simulation
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  
  // State for NGN accounts data
  const [ngnAccountsData, setNgnAccountsData] = useState([
    {
      id: "ngn1",
      name: "Providus Bank",
      balance: 21000000,
      limit: 30000000,
      currency: "NGN"
    },
    {
      id: "ngn2",
      name: "Kuda Bank",
      balance: 12300000,
      limit: 20000000,
      currency: "NGN"
    },
    {
      id: "ngn3",
      name: "VFD Bank",
      balance: 8900000,
      limit: 15000000,
      currency: "NGN"
    }
  ]);

  // State for balance update dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<null | {
    id: string;
    name: string;
    balance: number;
    limit?: number;
    currency: string;
  }>(null);
  const [newBalance, setNewBalance] = useState("");
  
  // State for access denied dialog
  const [accessDeniedOpen, setAccessDeniedOpen] = useState(false);

  // Handle opening the update dialog
  const handleOpenUpdateDialog = (account: typeof currentAccount) => {
    if (!isAdmin) {
      setAccessDeniedOpen(true);
      return;
    }
    
    setCurrentAccount(account);
    setNewBalance(account ? account.balance.toString() : "");
    setUpdateDialogOpen(true);
  };

  // Format number with commas
  const formatNumberWithCommas = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle input change with formatting
  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric characters
    const value = e.target.value.replace(/[^0-9]/g, '');
    setNewBalance(value);
  };

  // Handle balance update
  const handleUpdateBalance = () => {
    if (!currentAccount || !newBalance) return;
    
    const updatedBalance = parseInt(newBalance, 10);
    
    // Update the account balance in state
    setNgnAccountsData(prevAccounts => 
      prevAccounts.map(account => 
        account.id === currentAccount.id 
          ? { ...account, balance: updatedBalance } 
          : account
      )
    );
    
    // Show success toast
    toast({
      title: "Success",
      description: `Balance updated successfully for ${currentAccount.name}`,
    });
    
    // Close the dialog
    setUpdateDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bank Accounts</h1>
        <p className="text-muted-foreground">Manage and monitor your bank accounts, track balances, and view transaction history.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map(account => (
          <AccountCard
            key={account.id}
            name={account.name}
            balance={account.balance}
            currency={account.currency}
            limit={account.limit || undefined}
          />
        ))}
      </div>
      
      {/* NGN Bank Accounts */}
      <div>
        <h2 className="text-xl font-semibold mb-3">NGN Bank Accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ngnAccountsData.map((account) => (
            <div key={account.id} className="space-y-2">
              <AccountCard
                name={`${account.name} Account`}
                balance={account.balance}
                currency={account.currency}
                limit={account.limit}
              />
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => handleOpenUpdateDialog(account)}
                >
                  Update Balance
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <BalanceChart />
        
        <Card>
          <CardHeader>
            <CardTitle>Account Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="main-usd">
              <TabsList className="w-full max-w-md mb-6">
                <TabsTrigger value="main-usd">Main USD Account</TabsTrigger>
                <TabsTrigger value="ngn">NGN Settlement</TabsTrigger>
                <TabsTrigger value="eur">EUR Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="main-usd">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono">{new Date(tx.date).toLocaleString()}</TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell className="font-mono">{tx.reference}</TableCell>
                        <TableCell className="text-right">
                          <span className={tx.type === 'credit' ? 'text-success' : 'text-destructive'}>
                            {tx.type === 'credit' ? '+' : '-'}
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD'
                            }).format(tx.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(tx.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="ngn">
                <div className="flex items-center justify-center p-8">
                  <p className="text-muted-foreground">Select transactions from the dropdown to view details.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="eur">
                <div className="flex items-center justify-center p-8">
                  <p className="text-muted-foreground">Select transactions from the dropdown to view details.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Balance Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Account Balance</DialogTitle>
            <DialogDescription>
              Enter the new balance for this account. This will be recorded in the transaction history.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input
                id="bank-name"
                value={currentAccount?.name || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-balance">New Balance ({currentAccount?.currency})</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  {currentAccount?.currency === "NGN" ? "₦" : "$"}
                </span>
                <Input
                  id="new-balance"
                  value={formatNumberWithCommas(newBalance)}
                  onChange={handleBalanceChange}
                  className="pl-8"
                  placeholder="Enter new balance"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBalance}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Access Denied Dialog */}
      <AlertDialog open={accessDeniedOpen} onOpenChange={setAccessDeniedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Access Denied</AlertDialogTitle>
            <AlertDialogDescription>
              You need administrator privileges to update account balances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAccessDeniedOpen(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Accounts;
