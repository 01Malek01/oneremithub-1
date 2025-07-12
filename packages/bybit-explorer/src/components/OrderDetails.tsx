import { Order } from "@/lib/types/bybit-api-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Format number with commas and 2 decimal places
const formatNumberWithCommas = (value: string | number) => {
  if (value === undefined || value === null || value === '') return 'N/A';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return value;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

interface OrderDetailsDialogProps {
    order: Order;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
    const formatDate = (timestamp: string | number) => {
        try {
            const date = new Date(Number(timestamp));
            return format(date, 'PPpp');
        } catch (e) {
            return 'Invalid date';
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, string> = {
            '50': 'Completed',
            '40': 'Cancelled',
            '80': 'Cancelled',
            '5': 'In Progress',
            '10': 'In Progress',
            '20': 'In Progress',
            '30': 'Disputed',
            '60': 'In Progress',
            '70': 'Disputed',
            '90': 'In Progress',
            '100': 'Disputed',
            '110': 'In Progress'
        };
        
        return statusMap[status] || status;
    };

    const InfoRow = ({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) => (
        <dl className={cn("flex items-start py-2 px-1 hover:bg-muted/50 rounded", className)}>
            <dt className="w-1/3 font-medium text-muted-foreground">{label}</dt>
            <dd className="w-2/3">{value}</dd>
        </dl>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
                    <div className="flex items-center gap-2 pt-2">
                        <Badge variant={order.side === 'BUY' ? 'default' : 'secondary'} className="text-xs">
                            {order.side}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {getStatusBadge(order.filter)}
                        </Badge>
                    </div>
                </DialogHeader>
                
                <div className="grid grid-cols-1 divide-y divide-border/50">
                    <div className="space-y-1 py-2">
                        <h3 className="font-medium text-foreground/90 px-1 pb-1">Order Information</h3>
                        <InfoRow label="Order Number" value={order.orderNumber} />
                        <InfoRow label="Order ID" value={order.id} />
                        <InfoRow label="Token" value={order.tokenId} />
                        <InfoRow 
                          label="Price" 
                          value={formatNumberWithCommas(order.price)} 
                        />
                        <InfoRow 
                          label="Amount" 
                          value={formatNumberWithCommas(order.amount)} 
                        />
                        <InfoRow 
                          label="Quantity" 
                          value={formatNumberWithCommas(order.notifyTokenQuantity)} 
                        />
                    </div>

                    <div className="space-y-1 py-2">
                        <h3 className="font-medium text-foreground/90 px-1 pt-3 pb-1">Dates</h3>
                        <InfoRow 
                            label="Created" 
                            value={order.createDate ? formatDate(order.createDate) : 'N/A'} 
                        />
                    </div>

                    <div className="space-y-1 py-2">
                        <h3 className="font-medium text-foreground/90 px-1 pt-3 pb-1">Counterparties</h3>
                        <InfoRow 
                            label={order.side === 'BUY' ? 'Seller' : 'Buyer'} 
                            value={order.targetNickName || 'N/A'} 
                        />
                        {order.sellerRealName && (
                            <InfoRow label="Seller Name" value={order.sellerRealName} />
                        )}
                        {order.buyerRealName && (
                            <InfoRow label="Buyer Name" value={order.buyerRealName} />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}