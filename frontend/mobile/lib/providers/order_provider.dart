import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/order/order.dart';
import '../services/order_service.dart';

final ordersProvider = FutureProvider<List<Order>>((ref) async {
  return ref.read(orderServiceProvider).getOrders();
});

final orderProvider =
    FutureProvider.family<Order, String>((ref, orderId) async {
  return ref.read(orderServiceProvider).getOrder(orderId);
});
