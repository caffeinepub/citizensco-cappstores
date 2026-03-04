import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import React from "react";

export interface OrderConfirmationData {
  orderId: string;
  productName: string;
  vendorName: string;
  quantity: number;
  totalAmount: bigint;
  status: string;
}

interface OrderConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  data: OrderConfirmationData | null;
}

export default function OrderConfirmationDialog({
  open,
  onClose,
  data,
}: OrderConfirmationDialogProps) {
  const navigate = useNavigate();

  if (!data) return null;

  const totalICP = (Number(data.totalAmount) / 1e8).toFixed(4);

  const handleViewOrders = () => {
    onClose();
    navigate({ to: "/orders" });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-lg">Order Confirmed!</DialogTitle>
          </div>
          <DialogDescription>
            Your order has been placed successfully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package className="h-4 w-4" />
              Order Details
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-xs font-medium truncate max-w-[160px]">
                  {data.orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium text-right max-w-[160px] truncate">
                  {data.productName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vendor</span>
                <span className="font-medium">{data.vendorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{data.quantity}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Total</span>
                <span className="text-primary font-bold text-base">
                  {totalICP} ICP
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="capitalize text-xs">
                  {data.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Continue Shopping
          </Button>
          <Button onClick={handleViewOrders} className="flex-1">
            <ShoppingBag className="h-4 w-4 mr-2" />
            View My Orders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
