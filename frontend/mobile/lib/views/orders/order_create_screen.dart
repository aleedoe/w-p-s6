import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/providers/product_provider.dart';

class OrderCreateScreen extends ConsumerStatefulWidget {
  const OrderCreateScreen({super.key});

  @override
  ConsumerState<OrderCreateScreen> createState() => _OrderCreateScreenState();
}

class _OrderCreateScreenState extends ConsumerState<OrderCreateScreen> {
  final Map<String, int> _selectedProducts = {};

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productsProvider); // List<ProductWithStock>

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Order'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: _selectedProducts.isEmpty
                ? null
                : () {
                    // ignore: avoid_print
                    print('Order submitted: $_selectedProducts');
                  },
          ),
        ],
      ),
      body: productsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
        data: (productsWithStock) => ListView.builder(
          itemCount: productsWithStock.length,
          itemBuilder: (context, index) {
            final product = productsWithStock[index].product;
            final quantity = _selectedProducts[product.id.toString()] ?? 0;

            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              elevation: 0.5,
              child: ListTile(
                leading: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    'http://127.0.0.1:5000/${product.imageUrl}',
                    width: 50,
                    height: 50,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const Icon(Icons.broken_image),
                  ),
                ),
                title: Text(product.name),
                subtitle: Text(
                  'Rp ${product.price.toStringAsFixed(0)}',
                  style: const TextStyle(color: Colors.green, fontWeight: FontWeight.w500),
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove),
                      onPressed: quantity > 0
                          ? () {
                              setState(() {
                                if (quantity == 1) {
                                  _selectedProducts.remove(product.id.toString());
                                } else {
                                  _selectedProducts[product.id.toString()] = quantity - 1;
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
                          _selectedProducts[product.id.toString()] = quantity + 1;
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
