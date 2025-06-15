import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/auth/login_request.dart';
import '../models/auth/register_request.dart';
import '../models/auth/token_response.dart';
import 'api_service.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref);
});

class AuthService {
  final Ref ref;

  AuthService(this.ref);

  Future<TokenResponse> login(LoginRequest request) async {
    final response =
        await ref.read(apiServiceProvider).post('/login', request.toJson());
    return TokenResponse.fromJson(response.data);
  }

  Future<TokenResponse> register(RegisterRequest request) async {
    final response =
        await ref.read(apiServiceProvider).post('/register', request.toJson());
    return TokenResponse.fromJson(response.data);
  }
}
