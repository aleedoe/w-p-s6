import React, { ChangeEvent } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Button } from "@heroui/button";

import { createProduct, updateProduct } from "../../services/api";

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

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const isEditing = !!product;
  const [formData, setFormData] = React.useState<Partial<Product>>({
    name: "",
    description: "",
    category: "",
    brand: "",
    model: "",
    price: 0,
    image_url: "",
    stock: { quantity: 0 },
    status: "active",
  });
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        category: product.category,
        brand: product.brand || "",
        model: product.model || "",
        price: product.price,
        image_url: product.image_url || "",
        stock: { quantity: product.stock?.quantity || 0 },
        status: product.status,
      });
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        description: "",
        category: "",
        brand: "",
        model: "",
        price: 0,
        image_url: "",
        stock: { quantity: 0 },
        status: "active",
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const handleInputChange = (
    field: string,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleStockChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      stock: {
        ...prev.stock,
        quantity: parseInt(value) || 0,
      },
    }));

    if (errors.stock) {
      setErrors((prev) => ({
        ...prev,
        stock: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.category?.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.brand?.trim()) {
      newErrors.brand = "Brand is required";
    }

    if (!formData.model?.trim()) {
      newErrors.model = "Model is required";
    }

    if (formData.price === undefined || formData.price < 0) {
      newErrors.price = "Price must be a positive number";
    }

    if (formData.stock?.quantity === undefined || formData.stock.quantity < 0) {
      newErrors.stock = "Stock must be a non-negative number";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditing && product) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }

      onSuccess();
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Error saving product:", err);

      // Handle validation errors from server
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "Phones", label: "Phones" },
    { value: "Computers", label: "Computers" },
    { value: "TVs", label: "TVs" },
    { value: "Audio", label: "Audio" },
    { value: "Gaming", label: "Gaming" },
    { value: "Accessories", label: "Accessories" },
    { value: "Cameras", label: "Cameras" },
    { value: "Wearables", label: "Wearables" },
  ];

  return (
    <Modal isOpen={isOpen} size="2xl" onOpenChange={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {isEditing ? "Edit Product" : "Add New Product"}
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  isRequired
                  errorMessage={errors.name}
                  isInvalid={!!errors.name}
                  label="Product Name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onValueChange={(value) => handleInputChange("name", value)}
                />

                <Input
                  isRequired
                  errorMessage={errors.brand}
                  isInvalid={!!errors.brand}
                  label="Brand"
                  placeholder="Enter brand name"
                  value={formData.brand}
                  onValueChange={(value) => handleInputChange("brand", value)}
                />

                <Input
                  isRequired
                  errorMessage={errors.model}
                  isInvalid={!!errors.model}
                  label="Model"
                  placeholder="Enter model number"
                  value={formData.model}
                  onValueChange={(value) => handleInputChange("model", value)}
                />

                <Select
                  isRequired
                  errorMessage={errors.category}
                  isInvalid={!!errors.category}
                  label="Category"
                  placeholder="Select category"
                  selectedKeys={formData.category ? [formData.category] : []}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    handleInputChange("category", event.target.value)
                  }
                >
                  {categories.map((category) => (
                    <SelectItem key={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  isRequired
                  errorMessage={errors.price}
                  isInvalid={!!errors.price}
                  label="Price ($)"
                  placeholder="0.00"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">$</span>
                    </div>
                  }
                  type="number"
                  value={formData.price?.toString()}
                  onValueChange={(value) =>
                    handleInputChange("price", parseFloat(value) || 0)
                  }
                />

                <Input
                  isRequired
                  errorMessage={errors.stock}
                  isInvalid={!!errors.stock}
                  label="Stock Quantity"
                  placeholder="0"
                  type="number"
                  value={formData.stock?.quantity?.toString() || "0"}
                  onValueChange={handleStockChange}
                />

                <Input
                  label="Image URL"
                  placeholder="Enter image URL"
                  value={formData.image_url}
                  onValueChange={(value) =>
                    handleInputChange("image_url", value)
                  }
                />

                <div className="flex items-center h-full">
                  <Switch
                    isSelected={formData.status === "active"}
                    onValueChange={(value) =>
                      handleInputChange("status", value ? "active" : "inactive")
                    }
                  >
                    {formData.status === "active" ? "Active" : "Inactive"}
                  </Switch>
                </div>
              </div>

              <Textarea
                className="mt-2"
                label="Description"
                placeholder="Enter product description"
                value={formData.description}
                onValueChange={(value) =>
                  handleInputChange("description", value)
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button disabled={loading} variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={loading}
                onPress={handleSubmit}
              >
                {isEditing ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ProductFormModal;
