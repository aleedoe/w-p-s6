import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/return_request.dart';
import 'api_service.dart';

final returnServiceProvider = Provider<ReturnService>((ref) {
  return ReturnService(ref);
});

class ReturnService {
  final Ref ref;

  ReturnService(this.ref);

  Future<List<ReturnRequest>> getReturnRequests() async {
    final response = await ref.read(apiServiceProvider).get('/returns');
    return (response.data as List)
        .map((e) => ReturnRequest.fromJson(e))
        .toList();
  }

  // Tambahkan method ini
  Future<List<OrderOption>> getReturnableOrders() async {
    final response =
        await ref.read(apiServiceProvider).get('/returns/returnable-orders');
    return (response.data as List).map((e) => OrderOption.fromJson(e)).toList();
  }

  Future<ReturnRequest> createReturnRequest(ReturnRequestCreate request) async {
    final response =
        await ref.read(apiServiceProvider).post('/returns', request.toJson());
    return ReturnRequest.fromJson(response.data);
  }
}
