import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/shipping_info.dart';
import '../services/shipping_service.dart';

final shippingListProvider = FutureProvider<List<ShippingInfo>>((ref) async {
  return ref.read(shippingServiceProvider).getShippingInfo();
});

final shippingProvider =
    FutureProvider.family<ShippingInfo, String>((ref, shippingId) async {
  return ref.read(shippingServiceProvider).validateShipping(shippingId);
});
