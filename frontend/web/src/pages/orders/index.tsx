import React from "react";
import { Icon } from "@iconify/react";
import { useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";

import { getOrders } from "../../services/api";
import OrderDetailModal from "./order-detail-modal";
import StatusBadge from "@/components/status-badge";

interface Order {
  items_count?: number;
  id: string;
  reseller_id: string;
  reseller_name: string;
  order_date: string;
  total_amount: number;
  status: string;
  order_details: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  shipping?: {
    status: string;
  };
}

const Orders: React.FC = () => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const rowsPerPage = 10;

  const fetchOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: rowsPerPage,
        search: searchQuery || undefined,
      };
      const response = await getOrders(params);

      // Perhatikan perubahan di sini - mengakses response.data.data
      const apiData = response.data.data; // Array orders sebenarnya
      const metaData = response.data.meta; // Metadata pagination

      // Transform the API data
      const transformedOrders = apiData.map((order: any) => ({
        id: order.id.toString(),
        reseller_id: order.reseller_id.toString(),
        reseller_name: `Reseller ${order.reseller_id}`,
        order_date: order.order_date,
        total_amount: order.total_amount,
        status: order.status,
        items_count: order.order_details.reduce((sum: number, item: any) => sum + item.quantity, 0),
        order_details: order.order_details.map((detail: any) => ({
          product_id: detail.product_id.toString(),
          quantity: detail.quantity,
          unit_price: detail.unit_price,
          subtotal: detail.subtotal
        })),
        shipping: order.shipping ? {
          status: order.shipping.status
        } : undefined
      }));

      setOrders(transformedOrders);
      setTotalPages(Math.ceil(metaData.total / rowsPerPage));
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    onOpen();
  };

  const handleStatusChange = () => {
    fetchOrders();
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Order Requests</h1>
        <div className="flex gap-2">
          <Button
            startContent={<Icon icon="lucide:filter" width={18} />}
            variant="flat"
          >
            Filter
          </Button>
          <Button
            startContent={<Icon icon="lucide:download" width={18} />}
            variant="flat"
          >
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Input
          className="w-full sm:max-w-xs"
          placeholder="Search orders..."
          startContent={
            <Icon
              className="text-default-400"
              icon="lucide:search"
              width={18}
            />
          }
          value={searchQuery}
          onValueChange={handleSearchChange}
        />

        <div className="flex gap-2">
          <Chip color="warning" variant="flat">
            Pending: {orders.filter(o => o.status === 'pending').length}
          </Chip>
          <Chip color="success" variant="flat">
            Approved: {orders.filter(o => o.status === 'approved').length}
          </Chip>
          <Chip color="danger" variant="flat">
            Rejected: {orders.filter(o => o.status === 'rejected').length}
          </Chip>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table
          removeWrapper
          aria-label="Orders table"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          }
          selectionMode="single"
          onRowAction={(key) => {
            const order = orders.find((o) => o.id === key);
            if (order) handleOrderClick(order);
          }}
        >
          <TableHeader>
            <TableColumn>ORDER ID</TableColumn>
            <TableColumn>RESELLER</TableColumn>
            <TableColumn>DATE</TableColumn>
            <TableColumn>AMOUNT</TableColumn>
            <TableColumn>ITEMS</TableColumn>
            <TableColumn>ORDER STATUS</TableColumn>
            <TableColumn>SHIPPING STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={error || "No orders found"}
            isLoading={loading}
            loadingContent={<Spinner color="primary" />}
          >
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="font-medium">{order.id}</div>
                </TableCell>
                <TableCell>{order.reseller_name}</TableCell>
                <TableCell>{formatDate(order.order_date)}</TableCell>
                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  {order.items_count ?? 0} items
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  {order.shipping?.status ? (
                    <StatusBadge status={order.shipping.status} />
                  ) : (
                    <span className="text-default-400 text-xs">
                      Not shipped
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => handleOrderClick(order)}
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <OrderDetailModal
        isOpen={isOpen}
        order={selectedOrder}
        onClose={onClose}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Orders;