import 'package:flutter/material.dart';
import '../views/auth/login_screen.dart';
import '../views/auth/register_screen.dart';
import '../views/home_screen.dart';
import '../views/orders/order_create_screen.dart';
import '../views/orders/order_detail_screen.dart';
import '../views/orders/orders_list_screen.dart';
import '../views/products/products_list_screen.dart';
import '../views/returns/return_create_screen.dart';
import '../views/returns/returns_list_screen.dart';
import '../views/shipping/shipping_detail_screen.dart';
import '../views/shipping/shipping_list_screen.dart';
import '../views/stock/stock_list_screen.dart';
import '../views/splash_screen.dart';

class RouteGenerator {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/splash':
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      case '/login':
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case '/register':
        return MaterialPageRoute(builder: (_) => const RegisterScreen());
      case '/home':
        return MaterialPageRoute(builder: (_) => const ModernDashboardScreen());
      case '/products':
        return MaterialPageRoute(builder: (_) => const ProductsListScreen());
      case '/orders':
        return MaterialPageRoute(builder: (_) => const OrdersListScreen());
      case '/order/create':
        return MaterialPageRoute(builder: (_) => const OrderCreateScreen());
      case '/order/detail':
        return MaterialPageRoute(
          builder: (_) =>
              OrderDetailScreen(orderId: settings.arguments as int),
        );
      case '/returns':
        return MaterialPageRoute(builder: (_) => const ReturnsListScreen());
      case '/return/create':
        return MaterialPageRoute(builder: (_) => const ReturnCreateScreen());
      case '/stock':
        return MaterialPageRoute(builder: (_) => const StockListScreen());
      case '/shipping':
        return MaterialPageRoute(builder: (_) => const ShippingListScreen());
      case '/shipping/detail':
        return MaterialPageRoute(
          builder: (_) =>
              ShippingDetailScreen(shippingId: settings.arguments as String),
        );
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('No route defined for ${settings.name}')),
          ),
        );
    }
  }
}
