import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/return_request.dart';
import '../services/return_service.dart';

final returnsProvider = FutureProvider<List<ReturnRequest>>((ref) async {
  return ref.read(returnServiceProvider).getReturnRequests();
});