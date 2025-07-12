
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatCard } from '@/components/dashboard/StatCard';
import { Banknote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for loans
const loanData = {
  totalBalance: 125000,
  interestRate: 4.5,
  monthlyPayment: 7625,
  nextPaymentDate: '2025-05-05',
  remainingPayments: 18
};

// Mock data for payment history
const paymentHistory = [
  {
    id: '1',
    date: '2025-04-05',
    amount: 7625,
    principal: 6187.50,
    interest: 1437.50,
    remainingBalance: 125000,
    status: 'Paid'
  },
  {
    id: '2',
    date: '2025-03-05',
    amount: 7625,
    principal: 6116.45,
    interest: 1508.55,
    remainingBalance: 131187.50,
    status: 'Paid'
  },
  {
    id: '3',
    date: '2025-02-05',
    amount: 7625,
    principal: 6046.36,
    interest: 1578.64,
    remainingBalance: 137303.95,
    status: 'Paid'
  }
];

const Loans = () => {
  // Calculate the percentage of loan repaid
  const totalLoanAmount = loanData.totalBalance / (1 - (loanData.remainingPayments / (loanData.remainingPayments + paymentHistory.length)));
  const percentagePaid = 100 - (loanData.totalBalance / totalLoanAmount) * 100;
  
  // Format as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loans & Credit</h1>
        <p className="text-muted-foreground">Manage business loans, track repayments, and optimize financing costs.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Loan Balance"
          value={formatCurrency(loanData.totalBalance)}
          icon={<Banknote className="h-5 w-5 text-primary" />}
        />
        
        <StatCard
          title="Monthly Payment"
          value={formatCurrency(loanData.monthlyPayment)}
          description={`Next payment due: ${new Date(loanData.nextPaymentDate).toLocaleDateString()}`}
        />
        
        <StatCard
          title="Interest Rate"
          value={`${loanData.interestRate}%`}
          description={`Fixed rate for ${loanData.remainingPayments + paymentHistory.length} months`}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loan Repayment Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Repayment Progress</span>
                  <span className="text-sm font-medium">{percentagePaid.toFixed(1)}% Complete</span>
                </div>
                <Progress value={percentagePaid} className="h-2" />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Remaining Payments</p>
                  <p className="font-medium">{loanData.remainingPayments} months</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Remaining</p>
                  <p className="font-medium">{formatCurrency(loanData.monthlyPayment * loanData.remainingPayments)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="payments">
              <TabsList className="w-full max-w-sm mb-6">
                <TabsTrigger value="payments">Payment History</TabsTrigger>
                <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
              </TabsList>
              
              <TabsContent value="payments">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Principal</TableHead>
                      <TableHead className="text-right">Interest</TableHead>
                      <TableHead className="text-right">Remaining Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(payment.principal)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(payment.interest)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(payment.remainingBalance)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-success/20 text-success">
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="schedule">
                <div className="flex items-center justify-center p-8">
                  <p className="text-muted-foreground">Future payment schedule will be displayed here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Loans;
