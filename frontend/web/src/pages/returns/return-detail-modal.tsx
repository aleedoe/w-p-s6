import React from 'react';
import { Icon } from '@iconify/react';
import { updateReturnStatus } from '../../services/api';
import StatusBadge from '../../components/status-badge';
import { useSocket } from '../../contexts/socket-context';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';
import { Textarea } from '@heroui/input';
import { Button } from '@heroui/button';

interface Return {
  id: number;
  order_id: number;
  reseller_id: number;
  request_date: string;
  status: string;
  reason: string;
  quantity: number;
  product_id: number;
  processed_date?: string | null;
  created_at: string;
  updated_at: string;
  action?: 'approve' | 'reject';
}

interface ReturnDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnData: Return | null;
  onStatusChange: () => void;
}

const ReturnDetailModal: React.FC<ReturnDetailModalProps> = ({
  isOpen,
  onClose,
  returnData,
  onStatusChange
}) => {
  const [notes, setNotes] = React.useState<string>('');
  const [statusLoading, setStatusLoading] = React.useState<boolean>(false);
  const { socket } = useSocket();

  React.useEffect(() => {
    if (isOpen && returnData) {
      setNotes('');
    }
  }, [isOpen, returnData]);

  const handleStatusUpdate = async () => {
    if (!returnData || !returnData.action) return;

    const status = returnData.action === 'approve' ? 'approved' : 'rejected';

    try {
      setStatusLoading(true);
      
      // Call the API to update return status
      await updateReturnStatus(returnData.id.toString(), status, notes);

      // Emit WebSocket event if connected
      if (socket && socket.connected) {
        socket.emit('return_status', {
          return_id: returnData.id,
          status,
          reseller_id: returnData.reseller_id
        });
      }

      onStatusChange();
    } catch (err) {
      console.error('Error updating return status:', err);
      // You might want to show a toast notification here
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

  if (!returnData) return null;

  const isApproval = returnData.action === 'approve';
  const actionColor = isApproval ? 'success' : 'danger';
  const actionText = isApproval ? 'Approve' : 'Reject';
  const actionIcon = isApproval ? 'lucide:check' : 'lucide:x';

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
                <span>{actionText} Return Request</span>
                <StatusBadge status={returnData.status} />
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="space-y-6">
                {/* Return Information */}
                <div className="bg-default-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Return Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-default-500">Return ID:</span>
                        <span className="font-medium">{returnData.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Order ID:</span>
                        <span>{returnData.order_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Product ID:</span>
                        <span>{returnData.product_id}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-default-500">Request Date:</span>
                        <span>{formatDate(returnData.request_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Quantity:</span>
                        <span className="font-medium">{returnData.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Reseller ID:</span>
                        <span>{returnData.reseller_id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="text-default-500">Return Reason:</span>
                    <p className="mt-1 p-2 bg-default-100 rounded text-sm">{returnData.reason}</p>
                  </div>
                </div>

                {/* Confirmation Message */}
                <div className={`p-4 rounded-lg ${
                  isApproval 
                    ? 'bg-success-50 border border-success-200' 
                    : 'bg-danger-50 border border-danger-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon 
                      icon={actionIcon} 
                      className={isApproval ? 'text-success' : 'text-danger'} 
                      width={20} 
                    />
                    <span className={`font-medium ${
                      isApproval ? 'text-success' : 'text-danger'
                    }`}>
                      {isApproval ? 'Approve Return Request' : 'Reject Return Request'}
                    </span>
                  </div>
                  <p className="text-sm text-default-600">
                    {isApproval 
                      ? 'By approving this return, the product will be added back to warehouse stock and deducted from reseller stock.'
                      : 'By rejecting this return, the request will be declined and no stock changes will be made.'
                    }
                  </p>
                </div>

                {/* Notes Section */}
                <Textarea
                  label="Admin Notes"
                  placeholder={`Add notes for this ${actionText.toLowerCase()} action...`}
                  value={notes}
                  onValueChange={setNotes}
                  description="Optional notes that will be saved with this action"
                  rows={3}
                />
              </div>
            </ModalBody>

            <ModalFooter>
              <Button 
                variant="flat" 
                onPress={onClose}
                disabled={statusLoading}
              >
                Cancel
              </Button>
              <Button
                color={actionColor}
                onPress={handleStatusUpdate}
                isLoading={statusLoading}
                startContent={!statusLoading && <Icon icon={actionIcon} width={18} />}
              >
                {statusLoading ? 'Processing...' : `${actionText} Return`}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ReturnDetailModal;