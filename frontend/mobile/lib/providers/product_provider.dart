import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/product.dart';
import '../services/product_service.dart';

final productsProvider = FutureProvider<List<ProductWithStock>>((ref) async {
  return await ref.read(productServiceProvider).getProducts();
});

