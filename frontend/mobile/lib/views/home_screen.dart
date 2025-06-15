import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reseller Dashboard')),
      body: GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(16),
        children: [
          _buildFeatureCard(
            context,
            Icons.shopping_basket,
            'Products',
            () => Navigator.pushNamed(context, '/products'),
          ),
          _buildFeatureCard(
            context,
            Icons.receipt,
            'Orders',
            () => Navigator.pushNamed(context, '/orders'),
          ),
          _buildFeatureCard(
            context,
            Icons.assignment_return,
            'Returns',
            () => Navigator.pushNamed(context, '/returns'),
          ),
          _buildFeatureCard(
            context,
            Icons.inventory,
            'Stock',
            () => Navigator.pushNamed(context, '/stock'),
          ),
          _buildFeatureCard(
            context,
            Icons.local_shipping,
            'Shipping',
            () => Navigator.pushNamed(context, '/shipping'),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard(
      BuildContext context, IconData icon, String label, VoidCallback onTap) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48),
            const SizedBox(height: 8),
            Text(label, style: Theme.of(context).textTheme.titleLarge),
          ],
        ),
      ),
    );
  }
}
