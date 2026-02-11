import { useGetOrders } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface OrderDetailDialogProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

export default function OrderDetailDialog({ orderId, open, onClose }: OrderDetailDialogProps) {
  const { data: orders = [], isLoading } = useGetOrders();
  const order = orders.find((o) => o.id === orderId);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'shipped':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>Complete information about your order</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !order ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Order not found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono text-sm break-all">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize mt-1">
                  {order.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Product ID</p>
                <p className="font-mono text-sm break-all">{order.productId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendor ID</p>
                <p className="font-mono text-sm break-all">{order.vendorId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="text-lg font-bold">{Number(order.quantity)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-lg font-bold text-primary">{Number(order.totalAmount)} ICP</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Buyer Principal</p>
              <p className="font-mono text-xs break-all">{order.buyerPrincipal.toString()}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="text-sm">{Number(order.createdAt) === 0 ? 'N/A' : new Date(Number(order.createdAt) / 1000000).toLocaleString()}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
