import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/return_request.dart';
import 'package:mobile/services/return_service.dart';

class ReturnCreateScreen extends ConsumerStatefulWidget {
  const ReturnCreateScreen({super.key});

  @override
  ConsumerState<ReturnCreateScreen> createState() => _ReturnCreateScreenState();
}

class _ReturnCreateScreenState extends ConsumerState<ReturnCreateScreen> {
  final _formKey = GlobalKey<FormState>();
  final _quantityController = TextEditingController();
  final _reasonController = TextEditingController();

  bool _isLoading = false;
  bool _isLoadingData = true;

  // Data untuk dropdown
  List<OrderOption> _availableOrders = [];
  OrderOption? _selectedOrder;
  ProductOption? _selectedProduct;

  final List<String> _predefinedReasons = [
    'Produk rusak/cacat',
    'Produk tidak sesuai deskripsi',
    'Salah kirim produk',
    'Produk kadaluarsa',
    'Kemasan rusak',
    'Kualitas tidak sesuai ekspektasi',
    'Produk tidak laku di pasaran',
    'Lainnya...',
  ];

  String? _selectedReason;

  @override
  void initState() {
    super.initState();
    _loadReturnableOrders();
  }

  Future<void> _loadReturnableOrders() async {
    try {
      setState(() {
        _isLoadingData = true;
      });

      final orders =
          await ref.read(returnServiceProvider).getReturnableOrders();

      setState(() {
        _availableOrders = orders;
        _isLoadingData = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingData = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal memuat data: ${e.toString()}'),
            backgroundColor: const Color(0xFFEF4444),
          ),
        );
      }
    }
  }

  Future<void> _submitReturn() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedOrder == null || _selectedProduct == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pilih order dan produk terlebih dahulu'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final returnRequest = ReturnRequestCreate(
        orderId: _selectedOrder!.orderId,
        productId: _selectedProduct!.productId,
        quantity: int.parse(_quantityController.text),
        reason: _selectedReason == 'Lainnya...'
            ? _reasonController.text
            : (_selectedReason ?? _reasonController.text),
      );

      await ref.read(returnServiceProvider).createReturnRequest(returnRequest);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white, size: 20),
                SizedBox(width: 8),
                Text('Return request berhasil dibuat!'),
              ],
            ),
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        );

        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text('Gagal membuat return: ${e.toString()}'),
                ),
              ],
            ),
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Buat Return Request',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 20,
          ),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0,
        centerTitle: false,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            height: 1,
            color: const Color(0xFFE2E8F0),
          ),
        ),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Info Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFDEF7EC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFF10B981).withOpacity(0.2),
                    width: 1,
                  ),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.info_outline_rounded,
                          color: Color(0xFF059669),
                          size: 20,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Informasi Penting',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF059669),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8),
                    Text(
                      '• Pastikan order sudah berstatus "delivered"\n• Stok produk harus tersedia untuk return\n• Isi form dengan lengkap dan benar',
                      style: TextStyle(
                        fontSize: 12,
                        color: Color(0xFF065F46),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Order Information Section
              _buildSectionTitle('Informasi Order'),
              const SizedBox(height: 12),

              if (_isLoadingData)
                const Card(
                  elevation: 0,
                  color: Colors.white,
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: Center(
                      child: CircularProgressIndicator(),
                    ),
                  ),
                )
              else if (_availableOrders.isEmpty)
                Card(
                  elevation: 0,
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(16),
                    child: Center(
                      child: Text(
                        'Tidak ada order yang dapat di-return',
                        style: TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                )
              else
                Card(
                  elevation: 0,
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        // Order Dropdown
                        DropdownButtonFormField<OrderOption>(
                          value: _selectedOrder,
                          decoration: InputDecoration(
                            labelText: 'Pilih Order',
                            prefixIcon: const Icon(Icons.receipt_long_rounded),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide:
                                  const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide:
                                  const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(
                                  color: Color(0xFF3B82F6), width: 2),
                            ),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                          ),
                          items: _availableOrders.map((order) {
                            return DropdownMenuItem<OrderOption>(
                              value: order,
                              child: Text(
                                'Order #${order.orderId} - ${order.orderDate.day}/${order.orderDate.month}/${order.orderDate.year}',
                                style: const TextStyle(fontSize: 14),
                              ),
                            );
                          }).toList(),
                          onChanged: (OrderOption? value) {
                            setState(() {
                              _selectedOrder = value;
                              _selectedProduct =
                                  null; // Reset product selection
                            });
                          },
                          validator: (value) {
                            if (value == null) {
                              return 'Pilih order terlebih dahulu';
                            }
                            return null;
                          },
                        ),

                        const SizedBox(height: 16),

                        // Product Dropdown
                        DropdownButtonFormField<ProductOption>(
                          value: _selectedProduct,
                          decoration: InputDecoration(
                            labelText: 'Pilih Produk',
                            prefixIcon: const Icon(Icons.inventory_2_rounded),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide:
                                  const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide:
                                  const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(
                                  color: Color(0xFF3B82F6), width: 2),
                            ),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                          ),
                          items: _selectedOrder?.products.map((product) {
                                return DropdownMenuItem<ProductOption>(
                                  value: product,
                                  child: Text(
                                    '${product.productName} (Stok: ${product.availableQuantity})',
                                    style: const TextStyle(fontSize: 14),
                                  ),
                                );
                              }).toList() ??
                              [],
                          onChanged: _selectedOrder == null
                              ? null
                              : (ProductOption? value) {
                                  setState(() {
                                    _selectedProduct = value;
                                    _quantityController.clear();
                                  });
                                },
                          validator: (value) {
                            if (value == null) {
                              return 'Pilih produk terlebih dahulu';
                            }
                            return null;
                          },
                        ),

                        const SizedBox(height: 16),

                        // Quantity Input
                        TextFormField(
                          controller: _quantityController,
                          keyboardType: TextInputType.number,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly
                          ],
                          decoration: InputDecoration(
                            labelText: 'Jumlah Return',
                            hintText: _selectedProduct != null
                                ? 'Maksimal: ${_selectedProduct!.availableQuantity}'
                                : 'Masukkan jumlah produk',
                            prefixIcon: const Icon(Icons.numbers_rounded),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide:
                                  const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide:
                                  const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(
                                  color: Color(0xFF3B82F6), width: 2),
                            ),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Jumlah tidak boleh kosong';
                            }
                            final quantity = int.tryParse(value);
                            if (quantity == null || quantity <= 0) {
                              return 'Jumlah harus lebih dari 0';
                            }
                            if (_selectedProduct != null &&
                                quantity >
                                    _selectedProduct!.availableQuantity) {
                              return 'Jumlah melebihi stok yang tersedia';
                            }
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),
                ),

              const SizedBox(height: 24),

              // Reason Section
              _buildSectionTitle('Alasan Return'),
              const SizedBox(height: 12),

              Card(
                elevation: 0,
                color: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Pilih alasan return',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF374151),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Predefined reasons
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _predefinedReasons.map((reason) {
                          final isSelected = _selectedReason == reason;
                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedReason = reason;
                                if (reason != 'Lainnya...') {
                                  _reasonController.clear();
                                }
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? const Color(0xFF3B82F6).withOpacity(0.1)
                                    : const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: isSelected
                                      ? const Color(0xFF3B82F6)
                                      : const Color(0xFFE2E8F0),
                                  width: 1.5,
                                ),
                              ),
                              child: Text(
                                reason,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: isSelected
                                      ? const Color(0xFF3B82F6)
                                      : const Color(0xFF64748B),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),

                      // Custom reason input
                      if (_selectedReason == 'Lainnya...' ||
                          _selectedReason == null) ...[
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _reasonController,
                          maxLines: 4,
                          decoration: InputDecoration(
                            labelText: 'Alasan return',
                            hintText: 'Jelaskan alasan return dengan detail...',
                            prefixIcon: const Icon(Icons.edit_note_rounded),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide:
                                  const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide:
                                  const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(
                                  color: Color(0xFF3B82F6), width: 2),
                            ),
                            errorBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide:
                                  const BorderSide(color: Color(0xFFEF4444)),
                            ),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                          ),
                          validator: (value) {
                            if (_selectedReason == null &&
                                (value == null || value.isEmpty)) {
                              return 'Alasan return tidak boleh kosong';
                            }
                            if (_selectedReason == 'Lainnya...' &&
                                (value == null || value.isEmpty)) {
                              return 'Jelaskan alasan return dengan detail';
                            }
                            return null;
                          },
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submitReturn,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF3B82F6),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 2,
                    shadowColor: const Color(0xFF3B82F6).withOpacity(0.3),
                  ),
                  child: _isLoading
                      ? const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                                strokeWidth: 2,
                              ),
                            ),
                            SizedBox(width: 12),
                            Text(
                              'Mengirim...',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.send_rounded, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Kirim Return Request',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                ),
              ),

              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: Color(0xFF1E293B),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    List<TextInputFormatter>? inputFormatters,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFEF4444)),
        ),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
      ),
    );
  }
}
