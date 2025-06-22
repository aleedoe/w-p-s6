import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/services/product_service.dart';

class ProductsListScreen extends ConsumerWidget {
  const ProductsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productFuture = ref.watch(_productsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Products',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0.5,
      ),
      backgroundColor: Colors.grey[100],
      body: productFuture.when(
        data: (products) {
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: products.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final item = products[index];
              final product = item.product;
              return Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0.5,
                color: Colors.white,
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      'http://127.0.0.1:5000/${product.imageUrl}',
                      width: 60,
                      height: 60,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Icon(Icons.broken_image),
                    ),
                  ),
                  title: Text(product.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(product.brand),
                      const SizedBox(height: 4),
                      Text(
                        "Rp ${product.price.toStringAsFixed(0)}",
                        style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
                      ),
                      Text("Stok: ${item.stock}", style: const TextStyle(color: Colors.grey)),
                    ],
                  ),
                  onTap: () {
                    // Bisa diarahkan ke detail screen nanti
                  },
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Gagal memuat produk: $err')),
      ),
    );
  }
}

// Provider future untuk mengambil produk
final _productsProvider = FutureProvider<List<ProductWithStock>>((ref) async {
  final service = ref.read(productServiceProvider);
  return await service.getProducts();
});

