import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Package } from "lucide-react";
import { useState } from "react";
import OrderDetailDialog from "../components/OrderDetailDialog";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetOrders, useProductMap } from "../hooks/useQueries";

type StatusFilter =
  | "all"
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

function getStatusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "delivered":
    case "paid":
      return "default";
    case "pending":
      return "secondary";
    case "shipped":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

function emptyStateMessage(filter: StatusFilter): string {
  if (filter === "all") return "No orders yet";
  return `No ${filter} orders`;
}

export default function OrdersPage() {
  const { identity } = useInternetIdentity();
  const { data: orders = [], isLoading: ordersLoading } = useGetOrders();
  const { productMap, isLoading: productsLoading } = useProductMap();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const isAuthenticated = !!identity;
  const isLoading = ordersLoading || productsLoading;

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => {
          const s = typeof o.status === "string" ? o.status : String(o.status);
          return s === statusFilter;
        });

  const resolveProductName = (productId: string): string => {
    return productMap.get(productId) ?? `${productId.slice(0, 8)}…`;
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Orders Access Required</CardTitle>
            <CardDescription>Please log in to view your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              View and track your order history.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="container py-16 text-center"
        data-ocid="orders.loading_state"
      >
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your orders...</p>
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
        <p className="text-muted-foreground">
          View and track your order history
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="mb-4" data-ocid="orders.filter.tab">
        <Tabs
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val as StatusFilter)}
        >
          <TabsList className="flex-wrap h-auto gap-1">
            {STATUS_FILTERS.map(({ label, value }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="text-xs sm:text-sm"
              >
                {label}
                {value !== "all" &&
                  orders.filter((o) => {
                    const s =
                      typeof o.status === "string"
                        ? o.status
                        : String(o.status);
                    return s === value;
                  }).length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 text-xs px-1.5 py-0 h-4"
                    >
                      {
                        orders.filter((o) => {
                          const s =
                            typeof o.status === "string"
                              ? o.status
                              : String(o.status);
                          return s === value;
                        }).length
                      }
                    </Badge>
                  )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            {statusFilter === "all"
              ? "All your orders in one place"
              : `Showing ${statusFilter} orders`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12" data-ocid="orders.empty_state">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">
                {emptyStateMessage(statusFilter)}
              </p>
              {statusFilter !== "all" && (
                <p className="text-muted-foreground text-sm mt-1">
                  Try switching to "All" to see all orders.
                </p>
              )}
            </div>
          ) : (
            <Table data-ocid="orders.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order, idx) => (
                  <TableRow
                    key={order.id}
                    data-ocid={`orders.row.${idx + 1}`}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8)}…
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate">
                      {resolveProductName(order.productId)}
                    </TableCell>
                    <TableCell>{Number(order.quantity)}</TableCell>
                    <TableCell>
                      {(Number(order.totalAmount) / 100000000).toFixed(2)} ICP
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(
                          typeof order.status === "string"
                            ? order.status
                            : String(order.status),
                        )}
                        className="capitalize"
                      >
                        {typeof order.status === "string"
                          ? order.status
                          : String(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(
                        Number(order.createdAt) / 1000000,
                      ).toLocaleDateString()}
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
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}
