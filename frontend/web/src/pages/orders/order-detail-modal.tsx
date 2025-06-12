import React from "react";
import { Icon } from "@iconify/react";

import { getOrder, updateOrderStatus } from "../../services/api";
import StatusBadge from "../../components/status-badge";
import { useSocket } from "../../contexts/socket-context";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderDetail {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  reseller_id: string;
  reseller_name: string;
  order_date: string;
  total_amount: number;
  status: string;
  reseller_email?: string;
  shipping_address?: string;
  notes?: string;
  order_details: OrderDetail[];
  shipping?: {
    id: string;
    status: string;
    tracking_number?: string;
    carrier?: string;
  };
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
  onStatusChange 
}) => {
  const [orderDetails, setOrderDetails] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<string>('');
  const [statusLoading, setStatusLoading] = React.useState<boolean>(false);
  const { socket } = useSocket();

  React.useEffect(() => {
    if (isOpen && order) {
      fetchOrderDetails(order.id);
    } else {
      setOrderDetails(null);
      setNotes('');
    }
  }, [isOpen, order]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      const response = await getOrder(orderId);
      setOrderDetails(response.data);
      setNotes(response.data.notes || '');
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
      setOrderDetails(order); // Fallback to basic order info
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!orderDetails) return;
    
    try {
      setStatusLoading(true);
      await updateOrderStatus(orderDetails.id, status, notes);
      
      // Emit WebSocket event
      if (socket && socket.connected) {
        socket.emit('order_updated', {
          order_id: orderDetails.id,
          status,
          reseller_id: orderDetails.reseller_id
        });
      }
      
      onStatusChange();
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Mock data for development
  const mockOrderItems = [
    { id: '1', product_name: 'Smartphone X', quantity: 2, unit_price: 899.99, total_price: 1799.98 },
    { id: '2', product_name: 'Wireless Earbuds', quantity: 3, unit_price: 129.99, total_price: 389.97 },
    { id: '3', product_name: 'Charging Cable', quantity: 5, unit_price: 19.99, total_price: 99.95 },
  ];

  const displayOrder = orderDetails || order;
  const displayItems = orderDetails?.items || mockOrderItems;

  if (!displayOrder) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
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
                <div className="text-danger text-center py-8">
                  {error}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-default-500">Order Information</h3>
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
                          <span className="text-default-500">Total Amount:</span>
                          <span className="font-medium">${displayOrder.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-default-500">Reseller Information</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-default-500">Name:</span>
                          <span>{displayOrder.reseller_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">Email:</span>
                          <span>{displayOrder.reseller_email || 'info@example.com'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">Address:</span>
                          <span className="text-right">{displayOrder.shipping_address || '123 Main St, City, Country'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Divider className="my-4" />
                  
                  <h3 className="text-sm font-semibold text-default-500">Order Items</h3>
                  <Table 
                    aria-label="Order items"
                    removeWrapper
                    className="mt-2"
                  >
                    <TableHeader>
                      <TableColumn>PRODUCT</TableColumn>
                      <TableColumn>QTY</TableColumn>
                      <TableColumn>UNIT PRICE</TableColumn>
                      <TableColumn>SUBTOTAL</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {(displayOrder.order_details || displayItems).map((item) => (
                        <TableRow key={item.product_id || item.id}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                          <TableCell>${item.subtotal ? item.subtotal.toFixed(2) : (item.unit_price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {displayOrder.shipping && (
                    <>
                      <Divider className="my-4" />
                      
                      <h3 className="text-sm font-semibold text-default-500">Shipping Information</h3>
                      <div className="mt-2 space-y-2 p-3 bg-default-50 rounded-md">
                        <div className="flex justify-between">
                          <span className="text-default-500">Status:</span>
                          <StatusBadge status={displayOrder.shipping.status} />
                        </div>
                        {displayOrder.shipping.tracking_number && (
                          <div className="flex justify-between">
                            <span className="text-default-500">Tracking Number:</span>
                            <span className="font-mono">{displayOrder.shipping.tracking_number}</span>
                          </div>
                        )}
                        {displayOrder.shipping.carrier && (
                          <div className="flex justify-between">
                            <span className="text-default-500">Carrier:</span>
                            <span>{displayOrder.shipping.carrier}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-end mt-4">
                    <div className="w-48">
                      <div className="flex justify-between py-1">
                        <span className="text-default-500">Subtotal:</span>
                        <span>${displayOrder.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-default-500">Tax:</span>
                        <span>$0.00</span>
                      </div>
                      <Divider className="my-2" />
                      <div className="flex justify-between py-1">
                        <span className="font-semibold">Total:</span>
                        <span className="font-semibold">${displayOrder.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Divider className="my-4" />
                  
                  <Textarea
                    label="Notes"
                    placeholder="Add notes about this order"
                    value={notes}
                    onValueChange={setNotes}
                    disabled={displayOrder.status !== 'pending'}
                  />
                </>
              )}
            </ModalBody>
            
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Close
              </Button>
              
              {displayOrder.status === 'pending' && (
                <>
                  <Button 
                    color="danger" 
                    variant="flat"
                    onPress={() => handleStatusUpdate('rejected')}
                    isLoading={statusLoading}
                    startContent={!statusLoading && <Icon icon="lucide:x" width={18} />}
                  >
                    Reject
                  </Button>
                  <Button 
                    color="success"
                    onPress={() => handleStatusUpdate('approved')}
                    isLoading={statusLoading}
                    startContent={!statusLoading && <Icon icon="lucide:check" width={18} />}
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