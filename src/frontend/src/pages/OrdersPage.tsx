import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListMyOrders } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Eye } from 'lucide-react';
import OrderDetailDialog from '../components/OrderDetailDialog';

export default function OrdersPage() {
  const { identity } = useInternetIdentity();
  const { data: orders = [], isLoading } = useListMyOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);

  const isAuthenticated = !!identity;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'declined':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Orders Access Required</CardTitle>
            <CardDescription>Please log in to view your order history</CardDescription>
          </CardHeader>
          <CardContent>
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Track your orders and view purchase history.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Package className="h-10 w-10 text-primary" />
          My Orders
        </h1>
        <p className="text-muted-foreground">View and track your order history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>All your orders in one place</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start shopping to see your orders here!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 12)}...</TableCell>
                    <TableCell className="font-mono text-xs">{order.productId.slice(0, 12)}...</TableCell>
                    <TableCell>{Number(order.quantity)}</TableCell>
                    <TableCell className="font-bold">{Number(order.totalAmount)} ICP</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrderId(order.id)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedOrderId && (
        <OrderDetailDialog
          orderId={selectedOrderId}
          open={!!selectedOrderId}
          onClose={() => setSelectedOrderId(undefined)}
        />
      )}
    </div>
  );
}
