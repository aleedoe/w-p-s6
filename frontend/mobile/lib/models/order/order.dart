// order.dart
class Order {
  final String id;
  final DateTime date;
  final String status;
  final double total;
  final List<OrderDetail> details;

  Order({
    required this.id,
    required this.date,
    required this.status,
    required this.total,
    required this.details,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      date: DateTime.parse(json['date']),
      status: json['status'],
      total: json['total'].toDouble(),
      details: (json['details'] as List)
          .map((e) => OrderDetail.fromJson(e))
          .toList(),
    );
  }
}

// order_detail.dart
class OrderDetail {
  final String productId;
  final String productName;
  final int quantity;
  final double unitPrice;

  OrderDetail({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unitPrice,
  });

  factory OrderDetail.fromJson(Map<String, dynamic> json) {
    return OrderDetail(
      productId: json['product_id'],
      productName: json['product_name'],
      quantity: json['quantity'],
      unitPrice: json['unit_price'].toDouble(),
    );
  }
}

// order_request.dart
class OrderRequest {
  final List<OrderItem> items;

  OrderRequest({required this.items});

  Map<String, dynamic> toJson() => {
        'items': items.map((e) => e.toJson()).toList(),
      };
}

class OrderItem {
  final String productId;
  final int quantity;

  OrderItem({required this.productId, required this.quantity});

  Map<String, dynamic> toJson() => {
        'product_id': productId,
        'quantity': quantity,
      };
}
