import React from 'react';
import { Icon } from '@iconify/react';
import { updateShippingStatus } from '../../services/api';
import StatusBadge from '../../components/status-badge';
import { useSocket } from '../../contexts/socket-context';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';
import { Divider } from '@heroui/divider';
import { Select, SelectItem } from '@heroui/select';
import { Input, Textarea } from '@heroui/input';
import { Button } from '@heroui/button';

interface Shipping {
  id: number;
  order_id: number;
  reseller_id: number;
  reseller_name: string;
  shipping_date: string;
  estimated_delivery: string;
  actual_delivery: string | null;
  status: string;
  tracking_number: string;
  carrier: string;
  shipping_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order?: {
    id: number;
    status: string;
    total_amount: number;
    order_details?: Array<{
      product_id: number;
      product_name: string;
      quantity: number;
    }>;
  };
}

interface ShippingUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipping: Shipping | null;
  onStatusUpdate: () => void;
}

const ShippingUpdateModal: React.FC<ShippingUpdateModalProps> = ({
  isOpen,
  onClose,
  shipping,
  onStatusUpdate
}) => {
  const [status, setStatus] = React.useState<string>('');
  const [trackingNumber, setTrackingNumber] = React.useState<string>('');
  const [carrier, setCarrier] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const { socket } = useSocket();

  React.useEffect(() => {
    if (shipping) {
      setStatus(shipping.status);
      setTrackingNumber(shipping.tracking_number);
      setCarrier(shipping.carrier);
      setNotes(shipping.notes || '');
    }
  }, [shipping]);

  const handleStatusUpdate = async () => {
    if (!shipping) return;

    try {
      setLoading(true);

      const payload = {
        shipping_id: shipping.id,
        status,
        tracking_number: trackingNumber,
        carrier,
        notes,
      };

      await updateShippingStatus(payload);

      if (socket && socket.connected) {
        socket.emit('shipping_update', {
          shipping_id: shipping.id,
          order_id: shipping.order_id,
          status,
          reseller_id: shipping.reseller_id
        });
      }

      onStatusUpdate();
    } catch (err) {
      console.error('Error updating shipping status:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!shipping) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      size="2xl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span>Update Shipping Status</span>
                <StatusBadge status={shipping.status} />
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-default-500">Shipping Information</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-default-500">Shipping ID:</span>
                      <span className="font-medium">SHP-{shipping.id.toString().padStart(3, '0')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Order ID:</span>
                      <span>ORD-{shipping.order_id.toString().padStart(3, '0')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Shipping Date:</span>
                      <span>{formatDate(shipping.shipping_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Estimated Delivery:</span>
                      <span>{formatDate(shipping.estimated_delivery)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Actual Delivery:</span>
                      <span>{formatDate(shipping.actual_delivery)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-default-500">Shipping Details</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-default-500">Carrier:</span>
                      <span>{shipping.carrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Method:</span>
                      <span>{shipping.shipping_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Tracking Number:</span>
                      <span>{shipping.tracking_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Reseller ID:</span>
                      <span>{shipping.reseller_id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {shipping.order && (
                <>
                  <Divider className="my-4" />

                  <h3 className="text-sm font-semibold text-default-500">Order Information</h3>
                  <div className="mt-2 space-y-2 p-3 bg-default-50 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-default-500">Order ID:</span>
                      <span className="font-medium">ORD-{shipping.order.id.toString().padStart(3, '0')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Order Status:</span>
                      <StatusBadge status={shipping.order.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Total Amount:</span>
                      <span>${shipping.order.total_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>

                  {shipping.order.order_details && shipping.order.order_details.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium">Items in this order:</h4>
                      <ul className="mt-2 space-y-1">
                        {shipping.order.order_details.map((item, index) => (
                          <li key={index} className="text-sm">
                            {item.quantity}x {item.product_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              <Divider className="my-4" />

              <div className="space-y-4">
                <Select
                  label="Update Status"
                  placeholder="Select status"
                  selectedKeys={[status]}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <SelectItem key="processing" textValue="processing">Processing</SelectItem>
                  <SelectItem key="shipped" textValue="shipped">Shipped</SelectItem>
                  <SelectItem key="in_transit" textValue="in_transit">In Transit</SelectItem>
                  <SelectItem key="out_for_delivery" textValue="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem key="delivered" textValue="delivered">Delivered</SelectItem>
                  <SelectItem key="failed_delivery" textValue="failed_delivery">Failed Delivery</SelectItem>
                </Select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Tracking Number"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onValueChange={setTrackingNumber}
                  />

                  <Select
                    label="Carrier"
                    placeholder="Select carrier"
                    selectedKeys={[carrier]}
                    onChange={(e) => setCarrier(e.target.value)}
                  >
                    <SelectItem key="JNE" textValue="JNE">
                      JNE
                    </SelectItem>
                    <SelectItem key="J&T" textValue="J&T">
                      J&T
                    </SelectItem>
                    <SelectItem key="SiCepat" textValue="SiCepat">
                      SiCepat
                    </SelectItem>
                    <SelectItem key="Ninja Express" textValue="Ninja Express">
                      Ninja Express
                    </SelectItem>
                  </Select>
                </div>

                <Textarea
                  label="Additional Notes"
                  placeholder="Add notes about this shipment"
                  value={notes}
                  onValueChange={setNotes}
                />
              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleStatusUpdate}
                isLoading={loading}
                startContent={!loading && <Icon icon="lucide:save" width={18} />}
              >
                Update Status
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ShippingUpdateModal;