import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/product.dart';
import 'api_service.dart';

final productServiceProvider = Provider<ProductService>((ref) {
  return ProductService(ref);
});

class ProductService {
  final Ref ref;

  ProductService(this.ref);

  Future<List<Product>> getProducts() async {
    final response = await ref.read(apiServiceProvider).get('/products');
    return (response.data as List).map((e) => Product.fromJson(e)).toList();
  }
}
