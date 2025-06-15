import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
// import '../../models/order/order_request.dart';
// import '../../models/product.dart';
import '../../providers/product_provider.dart';

class OrderCreateScreen extends ConsumerStatefulWidget {
  const OrderCreateScreen({super.key});

  @override
  ConsumerState<OrderCreateScreen> createState() => _OrderCreateScreenState();
}

class _OrderCreateScreenState extends ConsumerState<OrderCreateScreen> {
  final Map<String, int> _selectedProducts = {};

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Order'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: _selectedProducts.isEmpty
                ? null
                : () {
                    // Implement order submission
                  },
          ),
        ],
      ),
      body: productsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
        data: (products) => ListView.builder(
          itemCount: products.length,
          itemBuilder: (context, index) {
            final product = products[index];
            final quantity = _selectedProducts[product.id] ?? 0;

            return Card(
              child: ListTile(
                leading: Image.network(product.imageUrl),
                title: Text(product.name),
                subtitle: Text('\$${product.price.toStringAsFixed(2)}'),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove),
                      onPressed: quantity > 0
                          ? () {
                              setState(() {
                                if (quantity == 1) {
                                  _selectedProducts.remove(product.id);
                                } else {
                                  _selectedProducts[product.id] = quantity - 1;
                                }
                              });
                            }
                          : null,
                    ),
                    Text(quantity.toString()),
                    IconButton(
                      icon: const Icon(Icons.add),
                      onPressed: () {
                        setState(() {
                          _selectedProducts[product.id] = quantity + 1;
                        });
                      },
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
