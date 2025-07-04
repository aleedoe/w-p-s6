import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/stock_provider.dart';

class StockListScreen extends ConsumerWidget {
  const StockListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stockAsync = ref.watch(stockProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Stock Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.refresh(stockProvider);
            },
          ),
        ],
      ),
      body: stockAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                'Error: $error',
                style: const TextStyle(fontSize: 16),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.refresh(stockProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (stockItems) {
          if (stockItems.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text(
                    'No stock items found',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.refresh(stockProvider);
            },
            child: ListView.builder(
              itemCount: stockItems.length,
              itemBuilder: (context, index) {
                final stock = stockItems[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: stock.quantity > 0 ? Colors.green : Colors.red,
                      child: Text(
                        stock.quantity.toString(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    title: Text(
                      stock.productName,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text('Product ID: ${stock.productId}'),
                        Text('Quantity: ${stock.quantity}'),
                        Text(
                          'Status: ${stock.quantity > 0 ? 'In Stock' : 'Out of Stock'}',
                          style: TextStyle(
                            color: stock.quantity > 0 ? Colors.green : Colors.red,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    trailing: Icon(
                      stock.quantity > 0 ? Icons.check_circle : Icons.warning,
                      color: stock.quantity > 0 ? Colors.green : Colors.red,
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}