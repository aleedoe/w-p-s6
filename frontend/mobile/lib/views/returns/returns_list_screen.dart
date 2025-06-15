import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
// import '../../models/return_request.dart';
import '../../providers/return_provider.dart';

class ReturnsListScreen extends ConsumerWidget {
  const ReturnsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final returnsAsync = ref.watch(returnsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Return Requests'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              Navigator.pushNamed(context, '/return/create');
            },
          ),
        ],
      ),
      body: returnsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
        data: (returns) => ListView.builder(
          itemCount: returns.length,
          itemBuilder: (context, index) {
            final returnRequest = returns[index];
            return Card(
              child: ListTile(
                title: Text('Return #${returnRequest.id}'),
                subtitle: Text(
                    'Order: ${returnRequest.orderId} - ${returnRequest.status}'),
                trailing: const Icon(Icons.arrow_forward),
                onTap: () {
                  // Navigate to return detail if needed
                },
              ),
            );
          },
        ),
      ),
    );
  }
}
