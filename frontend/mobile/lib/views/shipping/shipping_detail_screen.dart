import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/services/shipping_service.dart';
// import '../../models/shipping_info.dart';
import '../../providers/shipping_provider.dart';

class ShippingDetailScreen extends ConsumerWidget {
  final String shippingId;

  const ShippingDetailScreen({super.key, required this.shippingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final shippingAsync = ref.watch(shippingProvider(shippingId));

    return Scaffold(
      appBar: AppBar(title: const Text('Shipping Details')),
      body: shippingAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
        data: (shipping) => Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Order ID: ${shipping.orderId}',
                  style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),
              _buildDetailRow('Status', shipping.status),
              _buildDetailRow('Carrier', shipping.carrier),
              _buildDetailRow('Tracking Number', shipping.trackingNumber),
              _buildDetailRow(
                  'Shipped Date', shipping.shippedDate.toLocal().toString()),
              if (shipping.estimatedDelivery != null)
                _buildDetailRow('Estimated Delivery',
                    shipping.estimatedDelivery!.toLocal().toString()),
              if (shipping.deliveredDate != null)
                _buildDetailRow('Delivered Date',
                    shipping.deliveredDate!.toLocal().toString()),
              const SizedBox(height: 24),
              if (shipping.status != 'DELIVERED')
                ElevatedButton(
                  onPressed: () async {
                    try {
                      await ref
                          .read(shippingServiceProvider)
                          .validateShipping(shipping.id);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Shipping status updated')),
                      );
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Error: $e')),
                      );
                    }
                  },
                  child: const Text('Mark as Delivered'),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
