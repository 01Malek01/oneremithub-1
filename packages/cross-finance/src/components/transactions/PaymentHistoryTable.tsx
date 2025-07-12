import React, { memo, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  PaymentHistory, 
  PaymentInstallment 
} from '@/types/transactions';
import { formatNaira, formatDate } from '@/utils/formatters';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  DollarSign,
  CreditCard,
  Receipt
} from 'lucide-react';

interface PaymentHistoryTableProps {
  payments: PaymentHistory[];
  installments?: PaymentInstallment[];
  className?: string;
}

type SortField = 'date' | 'amount' | 'method' | 'reference';
type SortDirection = 'asc' | 'desc';

export const PaymentHistoryTable = memo(({
  payments,
  installments = [],
  className
}: PaymentHistoryTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter and sort payments
  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments.filter(payment => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());

      // Payment method filter
      const matchesMethod = paymentMethodFilter === 'all' || 
        payment.paymentMethod === paymentMethodFilter;

      // Date range filter
      const paymentDate = new Date(payment.paymentDate);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let matchesDateRange = true;
      switch (dateRangeFilter) {
        case 'today':
          matchesDateRange = paymentDate >= today;
          break;
        case 'week':
          matchesDateRange = paymentDate >= sevenDaysAgo;
          break;
        case 'month':
          matchesDateRange = paymentDate >= thirtyDaysAgo;
          break;
        case 'all':
        default:
          matchesDateRange = true;
          break;
      }

      return matchesSearch && matchesMethod && matchesDateRange;
    });

    // Sort payments
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.paymentDate).getTime();
          bValue = new Date(b.paymentDate).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'method':
          aValue = a.paymentMethod.toLowerCase();
          bValue = b.paymentMethod.toLowerCase();
          break;
        case 'reference':
          aValue = a.reference.toLowerCase();
          bValue = b.reference.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [payments, searchTerm, paymentMethodFilter, dateRangeFilter, sortField, sortDirection]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPayments = payments.length;
    const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;
    
    const methodBreakdown = payments.reduce((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return paymentDate >= sevenDaysAgo;
    }).length;

    return {
      totalAmount,
      totalPayments,
      averageAmount,
      methodBreakdown,
      recentPayments
    };
  }, [payments]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bank_transfer':
        return <CreditCard className="h-4 w-4" />;
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'mobile_money':
        return <CreditCard className="h-4 w-4" />;
      case 'pos':
        return <CreditCard className="h-4 w-4" />;
      case 'crypto':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bank_transfer':
        return 'bg-blue-100 text-blue-800';
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'card':
        return 'bg-purple-100 text-purple-800';
      case 'mobile_money':
        return 'bg-orange-100 text-orange-800';
      case 'pos':
        return 'bg-indigo-100 text-indigo-800';
      case 'crypto':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInstallmentInfo = (payment: PaymentHistory) => {
    if (!payment.installmentId) return null;
    
    const installment = installments.find(inst => inst.id === payment.installmentId);
    return installment ? `Installment #${installment.installmentNumber}` : null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Payments</p>
            <p className="text-2xl font-bold">{summaryStats.totalPayments}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">{formatNaira(summaryStats.totalAmount)}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Average Payment</p>
            <p className="text-2xl font-bold">{formatNaira(summaryStats.averageAmount)}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold">{summaryStats.recentPayments}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="mobile_money">Mobile Money</SelectItem>
              <SelectItem value="pos">POS</SelectItem>
              <SelectItem value="crypto">Cryptocurrency</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment History Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortField === 'date' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center gap-1">
                    Amount (₦)
                    {sortField === 'amount' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('method')}
                >
                  <div className="flex items-center gap-1">
                    Method
                    {sortField === 'method' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('reference')}
                >
                  <div className="flex items-center gap-1">
                    Reference
                    {sortField === 'reference' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead>Installment</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatDate(payment.paymentDate, { format: 'short' })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(payment.paymentDate, { format: 'time' })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">
                        {formatNaira(payment.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <Badge className={getPaymentMethodColor(payment.paymentMethod)}>
                          {payment.paymentMethod.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{payment.reference}</span>
                        {payment.processedBy && (
                          <span className="text-xs text-muted-foreground">
                            by {payment.processedBy}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getInstallmentInfo(payment) && (
                        <Badge variant="outline" className="text-xs">
                          {getInstallmentInfo(payment)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.notes && (
                        <span className="text-sm text-muted-foreground">
                          {payment.notes}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Payment Method Breakdown */}
        {Object.keys(summaryStats.methodBreakdown).length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Payment Methods Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(summaryStats.methodBreakdown).map(([method, count]) => (
                <div key={method} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {getPaymentMethodIcon(method)}
                    <span className="text-sm font-medium">
                      {method.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">
                    {((count / summaryStats.totalPayments) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

PaymentHistoryTable.displayName = 'PaymentHistoryTable'; 