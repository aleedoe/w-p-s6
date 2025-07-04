class ResellerStock {
  final String productId;
  final String productName;
  final int quantity;
  final DateTime lastUpdated;

  ResellerStock({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.lastUpdated,
  });

  factory ResellerStock.fromJson(Map<String, dynamic> json) {
    // Backend returns: {'product': {...}, 'quantity': int}
    final product = json['product'] as Map<String, dynamic>;
    
    return ResellerStock(
      productId: product['id']?.toString() ?? '',
      productName: product['name'] ?? 'Unknown Product',
      quantity: json['quantity'] ?? 0,
      lastUpdated: DateTime.now(), // Backend doesn't return last_updated in this endpoint
    );
  }
}