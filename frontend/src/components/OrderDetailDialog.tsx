import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetOrders } from '../hooks/useQueries';
import { OrderStatus } from '../backend';

interface OrderDetailDialogProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
}

function statusVariant(status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case OrderStatus.delivered:
      return 'default';
    case OrderStatus.shipped:
      return 'secondary';
    case OrderStatus.cancelled:
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function OrderDetailDialog({ orderId, open, onClose }: OrderDetailDialogProps) {
  const { data: orders = [], isLoading } = useGetOrders();

  const order = orderId ? orders.find((o) => o.id === orderId) ?? null : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            {orderId ? `Order ID: ${orderId}` : 'No order selected'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : !order ? (
          <p className="text-muted-foreground py-4 text-sm">Order not found.</p>
        ) : (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Order ID</p>
                <p className="font-mono text-xs break-all">{order.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Status</p>
                <Badge variant={statusVariant(order.status)} className="capitalize text-xs">
                  {order.status}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Product ID</p>
                <p className="font-mono text-xs break-all">{order.productId}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Quantity</p>
                <p className="font-medium">{order.quantity.toString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Total Amount</p>
                <p className="font-medium text-primary">
                  {(Number(order.totalAmount) / 1e8).toFixed(4)} ICP
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Date</p>
                <p className="text-xs">
                  {new Date(Number(order.createdAt) / 1_000_000).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-muted-foreground text-xs mb-1">Vendor ID</p>
              <p className="font-mono text-sm break-all">{order.vendorId.toString()}</p>
            </div>

            <div>
              <p className="text-muted-foreground text-xs mb-1">Customer ID</p>
              <p className="font-mono text-xs break-all">{order.customerId.toString()}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
