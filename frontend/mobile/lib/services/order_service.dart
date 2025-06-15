import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/order/order.dart';
// import '../models/order/order_request.dart';
import 'api_service.dart';

final orderServiceProvider = Provider<OrderService>((ref) {
  return OrderService(ref);
});

class OrderService {
  final Ref ref;

  OrderService(this.ref);

  Future<List<Order>> getOrders() async {
    final response = await ref.read(apiServiceProvider).get('/orders');
    return (response.data as List).map((e) => Order.fromJson(e)).toList();
  }

  Future<Order> getOrder(String orderId) async {
    final response = await ref.read(apiServiceProvider).get('/orders/$orderId');
    return Order.fromJson(response.data);
  }

  Future<Order> createOrder(OrderRequest request) async {
    final response =
        await ref.read(apiServiceProvider).post('/orders', request.toJson());
    return Order.fromJson(response.data);
  }
}
