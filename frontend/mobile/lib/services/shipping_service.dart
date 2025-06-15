import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/shipping_info.dart';
import 'api_service.dart';

final shippingServiceProvider = Provider<ShippingService>((ref) {
  return ShippingService(ref);
});

class ShippingService {
  final Ref ref;

  ShippingService(this.ref);

  Future<List<ShippingInfo>> getShippingInfo() async {
    final response = await ref.read(apiServiceProvider).get('/shipping');
    return (response.data as List)
        .map((e) => ShippingInfo.fromJson(e))
        .toList();
  }

  Future<ShippingInfo> validateShipping(String shippingId) async {
    final response = await ref
        .read(apiServiceProvider)
        .put('/shipping/$shippingId/validate', {});
    return ShippingInfo.fromJson(response.data);
  }
}
