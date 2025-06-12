import React from "react";
import { Icon } from "@iconify/react";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";

import { getProducts, deleteProduct } from "../../services/api";

import ProductFormModal from "./product-form-modal";

import ConfirmDialog from "@/components/confirm-dialog";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  image_url: string;
  stock: {
    quantity: number;
  };
  status: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isFormModalOpen, setIsFormModalOpen] = React.useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    React.useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = React.useState<boolean>(false);
  const rowsPerPage = 10;

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: rowsPerPage,
        search: searchQuery || undefined,
      };
      const response = await getProducts(params);

      // eslint-disable-next-line no-console
      console.log(response);

      setProducts(response.data.products);
      setTotalPages(Math.ceil(response.data.total / rowsPerPage));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      setDeleteLoading(true);
      await deleteProduct(selectedProduct.id);
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to delete product. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmitSuccess = () => {
    setIsFormModalOpen(false);
    fetchProducts();
  };

  const renderStockStatus = (stock: number) => {
    if (stock <= 0) {
      return (
        <Chip color="danger" size="sm" variant="flat">
          Out of Stock
        </Chip>
      );
    } else if (stock < 10) {
      return (
        <Chip color="warning" size="sm" variant="flat">
          Low Stock
        </Chip>
      );
    } else {
      return (
        <Chip color="success" size="sm" variant="flat">
          In Stock
        </Chip>
      );
    }
  };

  // Mock data for development
  const mockProducts = [
    {
      id: "1",
      name: "Smartphone X",
      description: "Latest model",
      category: "Phones",
      brand: "Apple",
      model: "iPhone 13",
      price: 899.99,
      image_url: "https://example.com/image1.jpg",
      stock: { quantity: 25 },
      status: "active",
    },
    {
      id: "2",
      name: "Laptop Pro",
      description: "High-performance",
      category: "Computers",
      brand: "Dell",
      model: "XPS 15",
      price: 1299.99,
      image_url: "https://example.com/image2.jpg",
      stock: { quantity: 12 },
      status: "active",
    },
    {
      id: "3",
      name: "Wireless Earbuds",
      description: "Noise-cancelling",
      category: "Audio",
      brand: "Sony",
      model: "WH-1000XM4",
      price: 129.99,
      image_url: "https://example.com/image3.jpg",
      stock: { quantity: 8 },
      status: "active",
    },
    {
      id: "4",
      name: 'Smart TV 55"',
      description: "4K resolution",
      category: "TVs",
      brand: "Samsung",
      model: "QLED 55",
      price: 699.99,
      image_url: "https://example.com/image4.jpg",
      stock: { quantity: 5 },
      status: "active",
    },
    {
      id: "5",
      name: "Gaming Console",
      description: "Next-gen",
      category: "Gaming",
      brand: "Xbox",
      model: "Series S",
      price: 499.99,
      image_url: "https://example.com/image5.jpg",
      stock: { quantity: 0 },
      status: "inactive",
    },
  ];

  const displayProducts = products.length > 0 ? products : mockProducts;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button
          color="primary"
          startContent={<Icon icon="lucide:plus" width={18} />}
          onPress={handleAddProduct}
        >
          Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Input
          className="w-full sm:max-w-xs"
          placeholder="Search products..."
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

      <div className="border rounded-lg overflow-hidden">
        <Table
          removeWrapper
          aria-label="Products table"
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
        >
          <TableHeader>
            <TableColumn>PRODUCT</TableColumn>
            <TableColumn>BRAND</TableColumn>
            <TableColumn>MODEL</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>PRICE</TableColumn>
            <TableColumn>STOCK</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={error || "No products found"}
            isLoading={loading}
            loadingContent={<Spinner color="primary" />}
          >
            {displayProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.image_url && (
                      <div className="w-10 h-10 rounded-md overflow-hidden">
                        <img
                          alt={product.name}
                          className="w-full h-full object-cover"
                          // eslint-disable-next-line prettier/prettier
                          src={"https://media.istockphoto.com/id/627795510/photo/example.jpg?s=612x612&w=0&k=20&c=lpUf5rjPVd6Kl_M6heqC8sUncR4FLmtsRzeYdTr5X_I="}
                        />
                      </div>
                    )}
                    <div className="font-medium">{product.name}</div>
                  </div>
                </TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell>{product.model}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{product.stock?.quantity || 0}</span>
                    {renderStockStatus(product.stock?.quantity || 0)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleEditProduct(product)}
                    >
                      <Icon icon="lucide:edit" width={18} />
                    </Button>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:more-vertical" width={18} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Product actions">
                        <DropdownItem key="view">View Details</DropdownItem>
                        <DropdownItem
                          key="duplicate"
                          startContent={<Icon icon="lucide:copy" width={18} />}
                        >
                          Duplicate
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Icon icon="lucide:trash" width={18} />}
                          onPress={() => handleDeleteClick(product)}
                        >
                          Delete
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

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        product={selectedProduct}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSubmitSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        confirmColor="danger"
        confirmText="Delete"
        isLoading={deleteLoading}
        isOpen={isDeleteDialogOpen}
        message={`Are you sure you want to delete ${selectedProduct?.name}? This action cannot be undone.`}
        title="Delete Product"
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Products;
