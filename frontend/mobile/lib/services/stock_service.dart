import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/stock.dart';
import 'api_service.dart';

final stockServiceProvider = Provider<StockService>((ref) {
  return StockService(ref);
});

class StockService {
  final Ref ref;

  StockService(this.ref);

  Future<List<ResellerStock>> getStock() async {
    try {
      final response = await ref.read(apiServiceProvider).get('/stock');
      
      // Backend returns array of objects with 'product' and 'quantity' fields
      return (response.data as List)
          .map((e) => ResellerStock.fromJson(e))
          .toList();
    } catch (e) {
      throw Exception('Failed to load stock: $e');
    }
  }
}