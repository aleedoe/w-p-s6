class ReturnRequest {
  final String id;
  final String orderId;
  final DateTime requestDate;
  final String status;
  final String reason;
  final List<ReturnItem> items;

  ReturnRequest({
    required this.id,
    required this.orderId,
    required this.requestDate,
    required this.status,
    required this.reason,
    required this.items,
  });

  factory ReturnRequest.fromJson(Map<String, dynamic> json) {
    return ReturnRequest(
      id: json['id'],
      orderId: json['order_id'],
      requestDate: DateTime.parse(json['request_date']),
      status: json['status'],
      reason: json['reason'],
      items:
          (json['items'] as List).map((e) => ReturnItem.fromJson(e)).toList(),
    );
  }
}

class ReturnItem {
  final String productId;
  final String productName;
  final int quantity;
  final String reason;

  ReturnItem({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.reason,
  });

  factory ReturnItem.fromJson(Map<String, dynamic> json) {
    return ReturnItem(
      productId: json['product_id'],
      productName: json['product_name'],
      quantity: json['quantity'],
      reason: json['reason'],
    );
  }
}

class ReturnRequestCreate {
  final String orderId;
  final String reason;
  final List<ReturnItemCreate> items;

  ReturnRequestCreate({
    required this.orderId,
    required this.reason,
    required this.items,
  });

  Map<String, dynamic> toJson() => {
        'order_id': orderId,
        'reason': reason,
        'items': items.map((e) => e.toJson()).toList(),
      };
}

class ReturnItemCreate {
  final String productId;
  final int quantity;
  final String reason;

  ReturnItemCreate({
    required this.productId,
    required this.quantity,
    required this.reason,
  });

  Map<String, dynamic> toJson() => {
        'product_id': productId,
        'quantity': quantity,
        'reason': reason,
      };
}
