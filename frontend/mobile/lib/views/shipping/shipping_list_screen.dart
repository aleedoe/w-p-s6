import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
// import '../../models/shipping_info.dart';
import '../../providers/shipping_provider.dart';

class ShippingListScreen extends ConsumerWidget {
  const ShippingListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final shippingAsync = ref.watch(shippingListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Shipping Information')),
      body: shippingAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
        data: (shippingList) => ListView.builder(
          itemCount: shippingList.length,
          itemBuilder: (context, index) {
            final shipping = shippingList[index];
            return Card(
              child: ListTile(
                title: Text('Order: ${shipping.orderId}'),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Status: ${shipping.status}'),
                    Text('Tracking: ${shipping.trackingNumber}'),
                  ],
                ),
                trailing: const Icon(Icons.arrow_forward),
                onTap: () {
                  Navigator.pushNamed(
                    context,
                    '/shipping/detail',
                    arguments: shipping.id,
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
