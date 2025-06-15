class ShippingInfo {
  final String id;
  final String orderId;
  final String trackingNumber;
  final String carrier;
  final DateTime shippedDate;
  final DateTime? estimatedDelivery;
  final DateTime? deliveredDate;
  final String status;

  ShippingInfo({
    required this.id,
    required this.orderId,
    required this.trackingNumber,
    required this.carrier,
    required this.shippedDate,
    this.estimatedDelivery,
    this.deliveredDate,
    required this.status,
  });

  factory ShippingInfo.fromJson(Map<String, dynamic> json) {
    return ShippingInfo(
      id: json['id'],
      orderId: json['order_id'],
      trackingNumber: json['tracking_number'],
      carrier: json['carrier'],
      shippedDate: DateTime.parse(json['shipped_date']),
      estimatedDelivery: json['estimated_delivery'] != null
          ? DateTime.parse(json['estimated_delivery'])
          : null,
      deliveredDate: json['delivered_date'] != null
          ? DateTime.parse(json['delivered_date'])
          : null,
      status: json['status'],
    );
  }
}
