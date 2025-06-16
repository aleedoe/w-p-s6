import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/auth/login_request.dart';
import '../models/auth/register_request.dart';
import '../services/auth_service.dart';
import '../utils/storage.dart';

final authProvider =
    StateNotifierProvider<AuthNotifier, AsyncValue<void>>((ref) {
  return AuthNotifier(ref);
});

class AuthNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref ref;
  AuthNotifier(this.ref) : super(const AsyncValue.data(null));

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final response = await ref.read(authServiceProvider).login(
            LoginRequest(email: email, password: password),
          );
      await SecureStorage.saveToken(response.token);
      state = const AsyncValue.data(null);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
      rethrow;
    }
  }

  Future<void> register({
    required String username,
    required String email,
    required String password,
    required String name,
    required String phone,
    required String address,
  }) async {
    state = const AsyncValue.loading();
    try {
      final response = await ref.read(authServiceProvider).register(
            RegisterRequest(
              username: username,
              email: email,
              password: password,
              name: name,
              phone: phone,
              address: address,
            ),
          );
      await SecureStorage.saveToken(response.token);
      state = const AsyncValue.data(null);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
      rethrow;
    }
  }

  Future<void> logout() async {
    await SecureStorage.deleteToken();
    state = const AsyncValue.data(null);
  }
}
