import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
// import '../../models/stock.dart';
import '../../providers/stock_provider.dart';

class StockListScreen extends ConsumerWidget {
  const StockListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stockAsync = ref.watch(stockProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Stock Management')),
      body: stockAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
        data: (stockItems) => ListView.builder(
          itemCount: stockItems.length,
          itemBuilder: (context, index) {
            final stock = stockItems[index];
            return Card(
              child: ListTile(
                title: Text(stock.productName),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Available: ${stock.availableQuantity}'),
                    Text('Reserved: ${stock.reservedQuantity}'),
                    Text('Updated: ${stock.lastUpdated.toLocal().toString()}'),
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
