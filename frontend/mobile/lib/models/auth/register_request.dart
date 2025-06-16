class RegisterRequest {
  final String username;
  final String email;
  final String password;
  final String name;
  final String phone;
  final String address;

  RegisterRequest({
    required this.username,
    required this.email,
    required this.password,
    required this.name,
    required this.phone,
    required this.address,
  });

  Map<String, dynamic> toJson() => {
        'username': username,
        'email': email,
        'password': password,
        'name': name,
        'phone': phone,
        'address': address,
      };
}
