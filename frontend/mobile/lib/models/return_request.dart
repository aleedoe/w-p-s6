class ReturnRequest {
  final int id;
  final int resellerId;
  final int productId;
  final int orderId;
  final int quantity;
  final String reason;
  final String status;
  final DateTime? requestDate;
  final DateTime? processedDate;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  ReturnRequest({
    required this.id,
    required this.resellerId,
    required this.productId,
    required this.orderId,
    required this.quantity,
    required this.reason,
    required this.status,
    this.requestDate,
    this.processedDate,
    this.createdAt,
    this.updatedAt,
  });

  factory ReturnRequest.fromJson(Map<String, dynamic> json) {
    return ReturnRequest(
      id: json['id'] ?? 0,
      resellerId: json['reseller_id'] ?? 0,
      productId: json['product_id'] ?? 0,
      orderId: json['order_id'] ?? 0,
      quantity: json['quantity'] ?? 0,
      reason: json['reason'] ?? '',
      status: json['status'] ?? 'pending',
      requestDate: json['request_date'] != null 
          ? DateTime.tryParse(json['request_date']) 
          : null,
      processedDate: json['processed_date'] != null 
          ? DateTime.tryParse(json['processed_date']) 
          : null,
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
      updatedAt: json['updated_at'] != null 
          ? DateTime.tryParse(json['updated_at']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reseller_id': resellerId,
      'product_id': productId,
      'order_id': orderId,
      'quantity': quantity,
      'reason': reason,
      'status': status,
      'request_date': requestDate?.toIso8601String(),
      'processed_date': processedDate?.toIso8601String(),
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  // Getter untuk status color
  String get statusColor {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FF9800'; // Orange
      case 'approved':
        return '#4CAF50'; // Green
      case 'rejected':
        return '#F44336'; // Red
      case 'processed':
        return '#2196F3'; // Blue
      default:
        return '#9E9E9E'; // Gray
    }
  }

  // Getter untuk status display text
  String get statusDisplayText {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Menunggu';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      case 'processed':
        return 'Diproses';
      default:
        return status;
    }
  }
}

class ReturnRequestCreate {
  final int productId;
  final int orderId;
  final int quantity;
  final String reason;

  ReturnRequestCreate({
    required this.productId,
    required this.orderId,
    required this.quantity,
    required this.reason,
  });

  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'order_id': orderId,
      'quantity': quantity,
      'reason': reason,
    };
  }
}

class OrderOption {
  final int orderId;
  final DateTime orderDate;
  final String status;
  final List<ProductOption> products;

  OrderOption({
    required this.orderId,
    required this.orderDate,
    required this.status,
    required this.products,
  });

  factory OrderOption.fromJson(Map<String, dynamic> json) {
    return OrderOption(
      orderId: json['id'],
      orderDate: DateTime.parse(json['order_date']),
      status: json['status'],
      products: (json['order_details'] as List)
          .map((e) => ProductOption.fromJson(e))
          .toList(),
    );
  }
}

class ProductOption {
  final int productId;
  final String productName;
  final int orderedQuantity;
  final int availableQuantity; // dari reseller stock

  ProductOption({
    required this.productId,
    required this.productName,
    required this.orderedQuantity,
    required this.availableQuantity,
  });

  factory ProductOption.fromJson(Map<String, dynamic> json) {
    return ProductOption(
      productId: json['product_id'],
      productName: json['product_name'] ?? 'Product ${json['product_id']}',
      orderedQuantity: json['quantity'],
      availableQuantity: json['available_quantity'] ?? 0,
    );
  }
}