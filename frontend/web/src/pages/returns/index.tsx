import React from 'react';
import { Icon } from '@iconify/react';
import { getReturns } from '../../services/api';
import StatusBadge from '../../components/status-badge';
import ReturnDetailModal from './return-detail-modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Table, TableCell, TableColumn, TableHeader, TableRow, TableBody } from '@heroui/table';
import { Pagination } from '@heroui/pagination';
import { Spinner } from '@heroui/spinner';
import { useDisclosure } from '@heroui/modal';

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
}

const Returns: React.FC = () => {
  const [returns, setReturns] = React.useState<Return[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedReturn, setSelectedReturn] = React.useState<Return | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const rowsPerPage = 10;

  const fetchReturns = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: rowsPerPage,
        search: searchQuery || undefined,
      };
      const response = await getReturns(params);
      console.log(response);

      // Fix: Access the nested data structure
      setReturns(response.data.returns || []); // Fallback to empty array
      setTotalPages(response.data.total_pages || 1); // Fallback to 1
    } catch (err) {
      console.error('Error fetching returns:', err);
      setError('Failed to load returns. Please try again.');
      // Set fallback values on error
      setReturns([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  React.useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  };

  const handleReturnClick = (returnItem: Return) => {
    setSelectedReturn(returnItem);
    onOpen();
  };

  const handleStatusChange = () => {
    fetchReturns();
    onClose();
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Return Requests</h1>
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
          placeholder="Search returns..."
          value={searchQuery}
          onValueChange={handleSearchChange}
          startContent={<Icon icon="lucide:search" className="text-default-400" width={18} />}
          className="w-full sm:max-w-xs"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table
          aria-label="Returns table"
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
            const returnItem = returns.find(r => r.id.toString() === key);
            if (returnItem) handleReturnClick(returnItem);
          }}
        >
          <TableHeader>
            <TableColumn>RETURN ID</TableColumn>
            <TableColumn>ORDER ID</TableColumn>
            <TableColumn>PRODUCT ID</TableColumn>
            <TableColumn>DATE</TableColumn>
            <TableColumn>REASON</TableColumn>
            <TableColumn>QUANTITY</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={loading}
            loadingContent={<Spinner color="primary" />}
            emptyContent={error || "No returns found"}
          >
            {returns.map((returnItem) => (
              <TableRow key={returnItem.id}>
                <TableCell>
                  <div className="font-medium">{returnItem.id}</div>
                </TableCell>
                <TableCell>{returnItem.order_id}</TableCell>
                <TableCell>{returnItem.product_id}</TableCell>
                <TableCell>{formatDate(returnItem.request_date)}</TableCell>
                <TableCell>{truncateText(returnItem.reason, 30)}</TableCell>
                <TableCell>{returnItem.quantity}</TableCell>
                <TableCell>
                  <StatusBadge status={returnItem.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => handleReturnClick(returnItem)}
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

      {/* Return Detail Modal */}
      <ReturnDetailModal
        isOpen={isOpen}
        onClose={onClose}
        returnData={selectedReturn}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Returns;