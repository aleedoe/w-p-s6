import 'package:flutter/material.dart';
import 'package:mobile/views/orders/orders_list_screen.dart';
import 'package:mobile/views/products/products_list_screen.dart';
import 'package:mobile/views/returns/returns_list_screen.dart';
import 'package:mobile/views/shipping/shipping_list_screen.dart';
import 'package:mobile/views/stock/stock_list_screen.dart';

class PlaceholderScreen extends StatelessWidget {
  final String title;
  const PlaceholderScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text('Halaman untuk $title')),
    );
  }
}

class ModernDashboardScreen extends StatefulWidget {
  const ModernDashboardScreen({super.key});

  @override
  State<ModernDashboardScreen> createState() => _ModernDashboardScreenState();
}

class _ModernDashboardScreenState extends State<ModernDashboardScreen> {
  int _selectedIndex = 0;

  static const List<Widget> _widgetOptions = <Widget>[
    DashboardList(), // Ganti dari grid ke list
    PlaceholderScreen(title: 'Laporan'),
    PlaceholderScreen(title: 'Profil'),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text(
          'Home',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.black87,
            fontSize: 28,
          ),
        ),
        elevation: 0,
        backgroundColor: Colors.white,
      ),
      body: IndexedStack(
        index: _selectedIndex,
        children: _widgetOptions,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: Colors.blue[700],
        unselectedItemColor: Colors.grey[600],
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_rounded),
            label: 'Beranda',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.analytics_rounded),
            label: 'Laporan',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_rounded),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}

class DashboardList extends StatelessWidget {
  const DashboardList({super.key});

  @override
  Widget build(BuildContext context) {
    final features = [
      {
        'icon': Icons.shopping_basket_rounded,
        'label': 'Products',
        'color': Colors.orange,
        'screen': const ProductsListScreen(),
      },
      {
        'icon': Icons.receipt_long_rounded,
        'label': 'Orders',
        'color': Colors.blue,
        'screen': const OrdersListScreen(),
      },
      {
        'icon': Icons.assignment_return_rounded,
        'label': 'Returns',
        'color': Colors.green,
        'screen': const ReturnsListScreen(),
      },
      {
        'icon': Icons.inventory_2_rounded,
        'label': 'Stock',
        'color': Colors.purple,
        'screen': const StockListScreen(),
      },
      {
        'icon': Icons.local_shipping_rounded,
        'label': 'Shipping',
        'color': Colors.red,
        'screen': const ShippingListScreen(),
      },
    ];

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: features.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final item = features[index];
        return Card(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 0.5,
          child: ListTile(
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            leading: CircleAvatar(
              backgroundColor: (item['color'] as Color).withOpacity(0.1),
              child:
                  Icon(item['icon'] as IconData, color: item['color'] as Color),
            ),
            title: Text(
              item['label'] as String,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
            ),
            trailing: const Icon(Icons.chevron_right_rounded),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => item['screen'] as Widget),
              );
            },
          ),
        );
      },
    );
  }
}
