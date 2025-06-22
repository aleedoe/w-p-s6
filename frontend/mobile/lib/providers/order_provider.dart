import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';

final ordersProvider =
    AsyncNotifierProvider<OrderNotifier, List<dynamic>>(OrderNotifier.new);

class OrderNotifier extends AsyncNotifier<List<dynamic>> {
  @override
  Future<List<dynamic>> build() async {
    return await _fetchOrders();
  }

  Future<List<dynamic>> _fetchOrders() async {
    final response = await ref.read(apiServiceProvider).get('/orders');
    return response.data;
  }

  Future<void> refreshOrders() async {
    state = const AsyncLoading();
    state = AsyncData(await _fetchOrders());
  }
}
