import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/product.dart';
import '../services/product_service.dart';

final productsProvider =
    AsyncNotifierProvider<ProductNotifier, List<ProductWithStock>>(ProductNotifier.new);

class ProductNotifier extends AsyncNotifier<List<ProductWithStock>> {
  @override
  Future<List<ProductWithStock>> build() async {
    return await ref.read(productServiceProvider).getProducts();
  }

  Future<void> refreshProducts() async {
    state = const AsyncLoading();
    state = AsyncData(await ref.read(productServiceProvider).getProducts());
  }
}
