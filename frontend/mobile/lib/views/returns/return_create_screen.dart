import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/return_request.dart';
import '../../services/return_service.dart';

class ReturnCreateScreen extends ConsumerStatefulWidget {
  const ReturnCreateScreen({super.key});

  @override
  ConsumerState<ReturnCreateScreen> createState() => _ReturnCreateScreenState();
}

class _ReturnCreateScreenState extends ConsumerState<ReturnCreateScreen> {
  final _formKey = GlobalKey<FormState>();
  final _orderIdController = TextEditingController();
  final _reasonController = TextEditingController();
  final List<ReturnItemCreate> _items = [];
  bool _isSubmitting = false;

  @override
  void dispose() {
    _orderIdController.dispose();
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    try {
      final request = ReturnRequestCreate(
        orderId: _orderIdController.text.trim(),
        reason: _reasonController.text.trim(),
        items: _items,
      );

      await ref.read(returnServiceProvider).createReturnRequest(request);
      if (mounted) {
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to create return: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Return Request')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _orderIdController,
                decoration: const InputDecoration(labelText: 'Order ID'),
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Required' : null,
              ),
              TextFormField(
                controller: _reasonController,
                decoration: const InputDecoration(labelText: 'Reason'),
                maxLines: 3,
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Required' : null,
              ),
              const SizedBox(height: 20),
              const Text('Items to Return:', style: TextStyle(fontSize: 16)),
              // Implement item addition UI here
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                child: _isSubmitting
                    ? const CircularProgressIndicator()
                    : const Text('Submit Return Request'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
