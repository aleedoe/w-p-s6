import { Badge } from "@heroui/badge";
import React from "react";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusProps = () => {
    switch (status.toLowerCase()) {
      case "pending":
        return { color: "warning", content: "Pending" };
      case "approved":
        return { color: "success", content: "Approved" };
      case "rejected":
        return { color: "danger", content: "Rejected" };
      case "shipped":
        return { color: "primary", content: "Shipped" };
      case "delivered":
        return { color: "success", content: "Delivered" };
      case "processing":
        return { color: "secondary", content: "Processing" };
      case "preparing":
        return { color: "secondary", content: "Preparing" };
      case "in_transit":
        return { color: "primary", content: "In Transit" };
      case "out_for_delivery":
        return { color: "primary", content: "Out for Delivery" };
      case "returned":
        return { color: "danger", content: "Returned" };
      case "completed":
        return { color: "success", content: "Completed" };
      case "failed_delivery":
        return { color: "danger", content: "Failed Delivery" };
      default:
        return { color: "default", content: status };
    }
  };

  const { color, content } = getStatusProps();

  return (
    <Badge color={color as any} variant="flat">
      {content}
    </Badge>
  );
};

export default StatusBadge;
