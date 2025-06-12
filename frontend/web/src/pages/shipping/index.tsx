import React from 'react';
import { Icon } from '@iconify/react';
import { getShippings } from '../../services/api';
import StatusBadge from '../../components/status-badge';
import ShippingUpdateModal from './shipping-update-modal';
import { useDisclosure } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table';
import { Pagination } from '@heroui/pagination';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/dropdown';
import { Spinner } from '@heroui/spinner';

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

const Shipping: React.FC = () => {
  const [shippings, setShippings] = React.useState<Shipping[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedShipping, setSelectedShipping] = React.useState<Shipping | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const rowsPerPage = 10;

  const fetchShippings = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: rowsPerPage,
        search: searchQuery || undefined
      };
      const response = await getShippings(params);
      setShippings(response.data.shipments);
      setTotalPages(Math.ceil(response.data.total / rowsPerPage));
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError('Failed to load shipments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  React.useEffect(() => {
    fetchShippings();
  }, [fetchShippings]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleShippingClick = (shipping: Shipping) => {
    setSelectedShipping(shipping);
    onOpen();
  };

  const handleStatusUpdate = () => {
    fetchShippings();
    onClose();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Shipping Management</h1>
        <div className="flex gap-2">
          <Button
            variant="flat"
            startContent={<Icon icon="lucide:filter" width={18} />}
          >
            Filter
          </Button>
          <Button
            variant="flat"
            startContent={<Icon icon="lucide:download" width={18} />}
          >
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Input
          placeholder="Search by order ID, tracking number..."
          value={searchQuery}
          onValueChange={handleSearchChange}
          startContent={<Icon icon="lucide:search" className="text-default-400" width={18} />}
          className="w-full sm:max-w-xs"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table
          aria-label="Shipping table"
          removeWrapper
          selectionMode="single"
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
          onRowAction={(key) => {
            const shipping = shippings.find(s => s.id.toString() === key);
            if (shipping) handleShippingClick(shipping);
          }}
        >
          <TableHeader>
            <TableColumn>SHIPPING ID</TableColumn>
            <TableColumn>ORDER ID</TableColumn>
            <TableColumn>CARRIER</TableColumn>
            <TableColumn>SHIPPING DATE</TableColumn>
            <TableColumn>EST. DELIVERY</TableColumn>
            <TableColumn>TRACKING #</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={loading}
            loadingContent={<Spinner color="primary" />}
            emptyContent={error || "No shipments found"}
          >
            {shippings.map((shipping) => (
              <TableRow key={shipping.id}>
                <TableCell>
                  <div className="font-medium">SHP-{shipping.id.toString().padStart(3, '0')}</div>
                </TableCell>
                <TableCell>ORD-{shipping.order_id.toString().padStart(3, '0')}</TableCell>
                <TableCell>{shipping.carrier}</TableCell>
                <TableCell>{formatDate(shipping.shipping_date)}</TableCell>
                <TableCell>{formatDate(shipping.estimated_delivery)}</TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{shipping.tracking_number}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={shipping.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => handleShippingClick(shipping)}
                    >
                      Update
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ShippingUpdateModal
        isOpen={isOpen}
        onClose={onClose}
        shipping={selectedShipping}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default Shipping;