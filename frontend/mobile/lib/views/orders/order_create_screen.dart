import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/providers/product_provider.dart';
import 'package:mobile/services/api_service.dart';

class OrderCreateScreen extends ConsumerStatefulWidget {
  const OrderCreateScreen({super.key});

  @override
  ConsumerState<OrderCreateScreen> createState() => _OrderCreateScreenState();
}

class _OrderCreateScreenState extends ConsumerState<OrderCreateScreen> {
  final Map<String, int> _selectedProducts = {};
  final TextEditingController _notesController = TextEditingController();

  void _submitOrder() async {
    final products = _selectedProducts.entries
        .map((e) => {
              'product_id': int.parse(e.key),
              'quantity': e.value,
            })
        .toList();

    if (products.isEmpty) return;

    try {
      final response = await ref.read(apiServiceProvider).post('/orders', {
        'products': products,
        'notes': _notesController.text,
      });

      if (response.statusCode == 201 && mounted) {
        Navigator.pop(context, true); // ✅ kirim true untuk trigger refresh
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pesanan berhasil dibuat')),
        );
      }
    } catch (e) {
      // ignore: use_build_context_synchronously
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal membuat pesanan: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Buat Pesanan'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: _selectedProducts.isEmpty ? null : _submitOrder,
          ),
        ],
      ),
      body: productsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (productsWithStock) {
          final products = productsWithStock.map((e) => e.product).toList();

          return Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  controller: _notesController,
                  decoration: const InputDecoration(
                    labelText: 'Catatan Pesanan',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: ListView.separated(
                    itemCount: products.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final product = products[index];
                      final quantity =
                          _selectedProducts[product.id.toString()] ?? 0;

                      return Card(
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        elevation: 0.5,
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  'http://127.0.0.1:5000/${product.imageUrl}',
                                  width: 60,
                                  height: 60,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) =>
                                      const Icon(Icons.broken_image),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(product.name,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 4),
                                    Text('Rp ${product.price.toInt()}'),
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  IconButton(
                                    icon:
                                        const Icon(Icons.remove_circle_outline),
                                    onPressed: quantity > 0
                                        ? () {
                                            setState(() {
                                              if (quantity == 1) {
                                                _selectedProducts.remove(
                                                    product.id.toString());
                                              } else {
                                                _selectedProducts[product.id
                                                    .toString()] = quantity - 1;
                                              }
                                            });
                                          }
                                        : null,
                                  ),
                                  Text(quantity.toString(),
                                      style: const TextStyle(fontSize: 16)),
                                  IconButton(
                                    icon: const Icon(Icons.add_circle_outline),
                                    onPressed: () {
                                      setState(() {
                                        _selectedProducts[product.id
                                            .toString()] = quantity + 1;
                                      });
                                    },
                                  ),
                                ],
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
