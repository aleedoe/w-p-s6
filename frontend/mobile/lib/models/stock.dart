class ResellerStock {
  final String productId;
  final String productName;
  final int availableQuantity;
  final int reservedQuantity;
  final DateTime lastUpdated;

  ResellerStock({
    required this.productId,
    required this.productName,
    required this.availableQuantity,
    required this.reservedQuantity,
    required this.lastUpdated,
  });

  factory ResellerStock.fromJson(Map<String, dynamic> json) {
    return ResellerStock(
      productId: json['product_id'],
      productName: json['product_name'],
      availableQuantity: json['available_quantity'],
      reservedQuantity: json['reserved_quantity'],
      lastUpdated: DateTime.parse(json['last_updated']),
    );
  }
}
