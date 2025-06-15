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
    final response = await ref.read(apiServiceProvider).get('/stock');
    return (response.data as List)
        .map((e) => ResellerStock.fromJson(e))
        .toList();
  }
}
