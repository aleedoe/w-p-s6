import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/providers/order_provider.dart';
// import '../../models/order/order.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderProvider(orderId));

    return Scaffold(
      appBar: AppBar(title: const Text('Order Details')),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
        data: (order) => Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Order ID: ${order.id}',
                  style: Theme.of(context).textTheme.titleLarge),
              Text('Date: ${order.date.toLocal()}'),
              Text('Status: ${order.status}'),
              Text('Total: \$${order.total.toStringAsFixed(2)}'),
              const SizedBox(height: 16),
              const Text('Items:',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              Expanded(
                child: ListView.builder(
                  itemCount: order.details.length,
                  itemBuilder: (context, index) {
                    final item = order.details[index];
                    return ListTile(
                      title: Text(item.productName),
                      subtitle: Text('Quantity: ${item.quantity}'),
                      trailing: Text('\$${item.unitPrice.toStringAsFixed(2)}'),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
