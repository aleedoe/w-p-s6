class TokenResponse {
  final String token;

  TokenResponse({required this.token});

  factory TokenResponse.fromJson(Map<String, dynamic> json) {
    if (json['access_token'] == null) {
      throw Exception('Access token not found in response');
    }

    return TokenResponse(
      token: json['access_token'],
    );
  }
}
