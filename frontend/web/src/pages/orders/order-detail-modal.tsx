import React from "react";
import { Icon } from "@iconify/react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Divider } from "@heroui/divider";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";

import { useSocket } from "../../contexts/socket-context";
import StatusBadge from "../../components/status-badge";
import { getOrder, updateOrderStatus } from "../../services/api";

// types.ts
export interface OrderDetail {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface Shipping {
  id: number;
  carrier: string;
  tracking_number: string;
  status: string;
  shipping_method: string;
  shipping_date: string;
  estimated_delivery: string;
  actual_delivery: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  reseller_id: number;
  order_date: string;
  total_amount: number;
  status: string;
  notes?: string;
  order_details: OrderDetail[];
  shipping?: Shipping;
  created_at: string;
  updated_at: string;
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusChange: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onStatusChange,
}) => {
  const [orderDetails, setOrderDetails] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<string>("");
  const [statusLoading, setStatusLoading] = React.useState<boolean>(false);
  const { socket } = useSocket();

  React.useEffect(() => {
    if (isOpen && order) {
      fetchOrderDetails(order.id.toString());
    } else {
      setOrderDetails(null);
      setNotes("");
    }
  }, [isOpen, order]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      const response = await getOrder(orderId);

      setOrderDetails(response.data.order);
      setNotes(response.data.order.notes || "");
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to load order details. Please try again.");
      setOrderDetails(order); // Fallback to basic order info
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!orderDetails) return;
    try {
      setStatusLoading(true);
      await updateOrderStatus(orderDetails.id.toString(), status, notes);
      // Emit WebSocket event
      if (socket && socket.connected) {
        socket.emit("order_updated", {
          order_id: orderDetails.id,
          status,
          reseller_id: orderDetails.reseller_id,
        });
      }
      onStatusChange();
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status. Please try again.");
    } finally {
      setStatusLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Invalid date"
        : new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };

  const displayOrder = orderDetails || order;

  if (!displayOrder) return null;

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="3xl"
      onOpenChange={onClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-around">
                <span>Order Details</span>
                <StatusBadge status={displayOrder.status} />
              </div>
            </ModalHeader>

            <ModalBody>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner color="primary" />
                </div>
              ) : error ? (
                <div className="text-danger text-center py-8">{error}</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-default-500">
                        Order Information
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-default-500">Order ID:</span>
                          <span className="font-medium">{displayOrder.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">Date:</span>
                          <span>{formatDate(displayOrder.order_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">Status:</span>
                          <StatusBadge status={displayOrder.status} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">
                            Total Amount:
                          </span>
                          <span className="font-medium">
                            Rp{displayOrder.total_amount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-default-500">
                        Reseller Information
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-default-500">Reseller ID:</span>
                          <span>{displayOrder.reseller_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Divider className="my-4" />

                  <h3 className="text-sm font-semibold text-default-500">
                    Order Items
                  </h3>
                  <Table
                    removeWrapper
                    aria-label="Order items"
                    className="mt-2"
                  >
                    <TableHeader>
                      <TableColumn>PRODUCT ID</TableColumn>
                      <TableColumn>QTY</TableColumn>
                      <TableColumn>UNIT PRICE</TableColumn>
                      <TableColumn>SUBTOTAL</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {displayOrder.order_details.map((item) => (
                        <TableRow key={`${item.id}-${item.product_id}`}>
                          <TableCell>{item.product_id}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>Rp{item.unit_price.toLocaleString('id-ID')}</TableCell>
                          <TableCell>
                            Rp{item.subtotal.toLocaleString('id-ID')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {displayOrder.shipping && (
                    <>
                      <Divider className="my-4" />

                      <h3 className="text-sm font-semibold text-default-500">
                        Shipping Information
                      </h3>
                      <div className="mt-2 space-y-2 p-3 bg-default-50 rounded-md">
                        <div className="flex justify-between">
                          <span className="text-default-500">Status:</span>
                          <StatusBadge status={displayOrder.shipping.status} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">Carrier:</span>
                          <span>{displayOrder.shipping.carrier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">Method:</span>
                          <span>{displayOrder.shipping.shipping_method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">Tracking Number:</span>
                          <span className="font-mono">
                            {displayOrder.shipping.tracking_number}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">Shipping Date:</span>
                          <span>{formatDate(displayOrder.shipping.shipping_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">Estimated Delivery:</span>
                          <span>{formatDate(displayOrder.shipping.estimated_delivery)}</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end mt-4">
                    <div className="w-48">
                      <div className="flex justify-between py-1">
                        <span className="text-default-500">Subtotal:</span>
                        <span>Rp{displayOrder.total_amount.toLocaleString('id-ID')}</span>
                      </div>
                      <Divider className="my-2" />
                      <div className="flex justify-between py-1">
                        <span className="font-semibold">Total:</span>
                        <span className="font-semibold">
                          Rp{displayOrder.total_amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Divider className="my-4" />

                  <Textarea
                    disabled={displayOrder.status !== "pending"}
                    label="Notes"
                    placeholder="Add notes about this order"
                    value={notes}
                    onValueChange={setNotes}
                  />
                </>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Close
              </Button>

              {displayOrder.status === "pending" && (
                <>
                  <Button
                    color="danger"
                    isLoading={statusLoading}
                    startContent={
                      !statusLoading && <Icon icon="lucide:x" width={18} />
                    }
                    variant="flat"
                    onPress={() => handleStatusUpdate("rejected")}
                  >
                    Reject
                  </Button>
                  <Button
                    color="success"
                    isLoading={statusLoading}
                    startContent={
                      !statusLoading && <Icon icon="lucide:check" width={18} />
                    }
                    onPress={() => handleStatusUpdate("approved")}
                  >
                    Approve
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default OrderDetailModal;