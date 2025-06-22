import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/order_provider.dart';
import 'order_create_screen.dart';
import 'order_detail_screen.dart';

class OrdersListScreen extends ConsumerWidget {
  const OrdersListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersState = ref.watch(ordersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Daftar Pesanan')),
      body: ordersState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (orders) => ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: orders.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final order = orders[index];
            return ListTile(
              title: Text('Pesanan #${order['id']}'),
              subtitle: Text('Status: ${order['status']}'),
              trailing: Text('Rp ${order['total_amount'].toInt()}'),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => OrderDetailScreen(orderId: order['id']),
                  ),
                );
              },
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const OrderCreateScreen()),
          );
          if (result == true) {
            ref.read(ordersProvider.notifier).refreshOrders();
          }
        },
        icon: const Icon(Icons.add),
        label: const Text('Pesanan Baru'),
      ),
    );
  }
}
