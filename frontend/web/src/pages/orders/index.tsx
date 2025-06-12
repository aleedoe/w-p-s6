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
import { Dropdown, DropdownItem, DropdownTrigger } from "@heroui/dropdown";

import { getOrders } from "../../services/api";

import OrderDetailModal from "./order-detail-modal";

import StatusBadge from "@/components/status-badge";

interface Order {
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

      setOrders(response.data.orders);
      setTotalPages(Math.ceil(response.data.total / rowsPerPage));
    } catch (err) {
      // eslint-disable-next-line no-console
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

  // Mock data for development
  const mockOrders = [
    {
      id: "ORD-001",
      reseller_id: "RS001",
      reseller_name: "Tech Solutions Inc.",
      order_date: "2023-06-15T10:30:00Z",
      total_amount: 2499.97,
      status: "pending",
      order_details: [
        {
          product_id: "P001",
          quantity: 3,
          unit_price: 899.99,
          subtotal: 2699.97,
        },
      ],
      shipping: { status: "pending" },
    },
    {
      id: "ORD-002",
      reseller_id: "RS002",
      reseller_name: "Gadget World",
      order_date: "2023-06-14T14:20:00Z",
      total_amount: 1899.5,
      status: "approved",
      order_details: [
        {
          product_id: "P002",
          quantity: 5,
          unit_price: 379.99,
          subtotal: 1899.95,
        },
      ],
      shipping: { status: "approved" },
    },
    {
      id: "ORD-003",
      reseller_id: "RS003",
      reseller_name: "Digital Mart",
      order_date: "2023-06-14T09:15:00Z",
      total_amount: 3299.99,
      status: "rejected",
      order_details: [
        {
          product_id: "P003",
          quantity: 2,
          unit_price: 1649.99,
          subtotal: 3299.98,
        },
      ],
      shipping: { status: "rejected" },
    },
    {
      id: "ORD-004",
      reseller_id: "RS004",
      reseller_name: "ElectroHub",
      order_date: "2023-06-13T16:45:00Z",
      total_amount: 899.95,
      status: "pending",
      order_details: [
        {
          product_id: "P004",
          quantity: 4,
          unit_price: 224.99,
          subtotal: 999.96,
        },
      ],
      shipping: { status: "pending" },
    },
    {
      id: "ORD-005",
      reseller_id: "RS005",
      reseller_name: "Tech Solutions Inc.",
      order_date: "2023-06-12T11:10:00Z",
      total_amount: 5499.98,
      status: "approved",
      order_details: [
        {
          product_id: "P005",
          quantity: 6,
          unit_price: 924.99,
          subtotal: 5549.98,
        },
      ],
      shipping: { status: "approved" },
    },
  ];

  const displayOrders = orders.length > 0 ? orders : mockOrders;

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
            Pending: 12
          </Chip>
          <Chip color="success" variant="flat">
            Approved: 24
          </Chip>
          <Chip color="danger" variant="flat">
            Rejected: 5
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
            const order = displayOrders.find((o) => o.id === key);

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
            {displayOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="font-medium">{order.id}</div>
                </TableCell>
                <TableCell>{order.reseller_name}</TableCell>
                <TableCell>{formatDate(order.order_date)}</TableCell>
                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  {order.order_details?.length || order.items_count || 0} items
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
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:more-vertical" width={18} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Order actions">
                        {order.status === "pending" && (
                          <>
                            <DropdownItem
                              key="approve"
                              description="Process this order"
                              startContent={
                                <Icon
                                  className="text-success"
                                  icon="lucide:check"
                                  width={18}
                                />
                              }
                              onPress={() => handleOrderClick(order)}
                            >
                              Approve Order
                            </DropdownItem>
                            <DropdownItem
                              key="reject"
                              className="text-danger"
                              description="Decline this order"
                              startContent={
                                <Icon
                                  className="text-danger"
                                  icon="lucide:x"
                                  width={18}
                                />
                              }
                              onPress={() => handleOrderClick(order)}
                            >
                              Reject Order
                            </DropdownItem>
                          </>
                        )}
                        <DropdownItem
                          key="print"
                          startContent={
                            <Icon icon="lucide:printer" width={18} />
                          }
                        >
                          Print Details
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order Detail Modal */}
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
