import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
// import '../../models/order/order.dart';
import '../../providers/order_provider.dart';
// import 'order_detail_screen.dart';

class OrdersListScreen extends ConsumerWidget {
  const OrdersListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(ordersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('My Orders')),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/order/create');
        },
        child: const Icon(Icons.add),
      ),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
        data: (orders) => ListView.builder(
          itemCount: orders.length,
          itemBuilder: (context, index) {
            final order = orders[index];
            return Card(
              child: ListTile(
                title: Text('Order #${order.id.substring(0, 8)}'),
                subtitle: Text(
                  '${order.date.toLocal()} - \$${order.total.toStringAsFixed(2)}',
                ),
                trailing: Chip(label: Text(order.status)),
                onTap: () {
                  Navigator.pushNamed(
                    context,
                    '/order/detail',
                    arguments: order.id,
                  );
                },
              ),
            );
          },
        ),
      ),
    );
  }
}
