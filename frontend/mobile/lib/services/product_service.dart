import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/services/api_service.dart';

final productServiceProvider = Provider<ProductService>((ref) {
  return ProductService(ref);
});

class ProductService {
  final Ref ref;

  ProductService(this.ref);

  Future<List<ProductWithStock>> getProducts() async {
    final response = await ref.read(apiServiceProvider).get('/products');
    return (response.data as List)
        .map((e) => ProductWithStock.fromJson(e))
        .toList();
  }
}
