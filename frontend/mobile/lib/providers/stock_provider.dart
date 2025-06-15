import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/stock.dart';
import '../services/stock_service.dart';

final stockProvider = FutureProvider<List<ResellerStock>>((ref) async {
  return ref.read(stockServiceProvider).getStock();
});