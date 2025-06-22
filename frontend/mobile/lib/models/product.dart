class Product {
  final int id;
  final String name;
  final String brand;
  final String category;
  final String model;
  final String description;
  final String imageUrl;
  final double price;

  Product({
    required this.id,
    required this.name,
    required this.brand,
    required this.category,
    required this.model,
    required this.description,
    required this.imageUrl,
    required this.price,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      brand: json['brand'],
      category: json['category'],
      model: json['model'],
      description: json['description'],
      imageUrl: json['image_url'],
      price: json['price'].toDouble(),
    );
  }
}

class ProductWithStock {
  final Product product;
  final int stock;

  ProductWithStock({required this.product, required this.stock});

  factory ProductWithStock.fromJson(Map<String, dynamic> json) {
    return ProductWithStock(
      product: Product.fromJson(json['product']),
      stock: json['stock'],
    );
  }
}
