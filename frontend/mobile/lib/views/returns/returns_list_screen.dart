import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:mobile/models/return_request.dart';
import 'package:mobile/providers/return_provider.dart';
import 'package:mobile/views/returns/return_create_screen.dart';

class ReturnsListScreen extends ConsumerStatefulWidget {
  const ReturnsListScreen({super.key});

  @override
  ConsumerState<ReturnsListScreen> createState() => _ReturnsListScreenState();
}

class _ReturnsListScreenState extends ConsumerState<ReturnsListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedFilter = 'all';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<ReturnRequest> _filterReturns(List<ReturnRequest> returns) {
    if (_selectedFilter == 'all') return returns;
    return returns.where((r) => r.status.toLowerCase() == _selectedFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    final returnsAsync = ref.watch(returnsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Riwayat Return',
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
        actions: [
          IconButton(
            onPressed: () => ref.refresh(returnsProvider),
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // Filter Tabs
          Container(
            color: Colors.white,
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              labelColor: const Color(0xFF3B82F6),
              unselectedLabelColor: const Color(0xFF64748B),
              indicatorColor: const Color(0xFF3B82F6),
              indicatorWeight: 2,
              labelStyle: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
              unselectedLabelStyle: const TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 14,
              ),
              onTap: (index) {
                setState(() {
                  switch (index) {
                    case 0:
                      _selectedFilter = 'all';
                      break;
                    case 1:
                      _selectedFilter = 'pending';
                      break;
                    case 2:
                      _selectedFilter = 'approved';
                      break;
                    case 3:
                      _selectedFilter = 'processed';
                      break;
                    case 4:
                      _selectedFilter = 'rejected';
                      break;
                  }
                });
              },
              tabs: const [
                Tab(text: 'Semua'),
                Tab(text: 'Menunggu'),
                Tab(text: 'Disetujui'),
                Tab(text: 'Diproses'),
                Tab(text: 'Ditolak'),
              ],
            ),
          ),
          // Content
          Expanded(
            child: returnsAsync.when(
              data: (returns) {
                final filteredReturns = _filterReturns(returns);
                
                if (filteredReturns.isEmpty) {
                  return _buildEmptyState();
                }
                
                return RefreshIndicator(
                  onRefresh: () async {
                    ref.refresh(returnsProvider);
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredReturns.length,
                    itemBuilder: (context, index) {
                      return _buildReturnCard(filteredReturns[index]);
                    },
                  ),
                );
              },
              loading: () => _buildLoadingState(),
              error: (error, stack) => _buildErrorState(error),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _navigateToCreateReturn(),
        backgroundColor: const Color(0xFF3B82F6),
        foregroundColor: Colors.white,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        icon: const Icon(Icons.add_rounded, size: 24),
        label: const Text(
          'Buat Return',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Future<void> _navigateToCreateReturn() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const ReturnCreateScreen(),
      ),
    );
    
    // If return was created successfully, refresh the list
    if (result == true) {
      ref.refresh(returnsProvider);
    }
  }

  Widget _buildReturnCard(ReturnRequest returnRequest) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Card(
        elevation: 0,
        color: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(
            color: Color(0xFFE2E8F0),
            width: 1,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Return #${returnRequest.id}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  _buildStatusChip(returnRequest.status, returnRequest.statusColor),
                ],
              ),
              const SizedBox(height: 12),
              
              // Order Info
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: const Color(0xFFE2E8F0),
                    width: 1,
                  ),
                ),
                child: Column(
                  children: [
                    _buildInfoRow(
                      'Order ID',
                      '#${returnRequest.orderId}',
                      Icons.receipt_long_rounded,
                    ),
                    const SizedBox(height: 8),
                    _buildInfoRow(
                      'Product ID',
                      '#${returnRequest.productId}',
                      Icons.inventory_2_rounded,
                    ),
                    const SizedBox(height: 8),
                    _buildInfoRow(
                      'Jumlah',
                      '${returnRequest.quantity} unit',
                      Icons.numbers_rounded,
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 12),
              
              // Reason
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: const Color(0xFFE2E8F0),
                    width: 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(
                          Icons.warning_amber_rounded,
                          size: 16,
                          color: Color(0xFFD97706),
                        ),
                        SizedBox(width: 6),
                        Text(
                          'Alasan Return',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFFD97706),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      returnRequest.reason,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF1E293B),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 12),
              
              // Dates
              Row(
                children: [
                  Expanded(
                    child: _buildDateInfo(
                      'Tanggal Pengajuan',
                      returnRequest.requestDate,
                      Icons.schedule_rounded,
                    ),
                  ),
                  if (returnRequest.processedDate != null) ...[
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildDateInfo(
                        'Tanggal Diproses',
                        returnRequest.processedDate,
                        Icons.check_circle_outline_rounded,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status, String colorHex) {
    final color = Color(int.parse('0xFF${colorHex.substring(1)}'));
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Text(
        status == 'pending' ? 'Menunggu' :
        status == 'approved' ? 'Disetujui' :
        status == 'rejected' ? 'Ditolak' :
        status == 'processed' ? 'Diproses' : status,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: const Color(0xFF64748B),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Color(0xFF64748B),
            fontWeight: FontWeight.w500,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: const TextStyle(
            fontSize: 12,
            color: Color(0xFF1E293B),
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildDateInfo(String label, DateTime? date, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                size: 12,
                color: const Color(0xFF64748B),
              ),
              const SizedBox(width: 4),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 10,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            date != null 
                ? DateFormat('dd MMM yyyy, HH:mm').format(date)
                : '-',
            style: const TextStyle(
              fontSize: 11,
              color: Color(0xFF1E293B),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(40),
            ),
            child: const Icon(
              Icons.assignment_return_rounded,
              size: 40,
              color: Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Belum ada data return',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Return request akan tampil di sini',
            style: TextStyle(
              fontSize: 14,
              color: Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => _navigateToCreateReturn(),
            icon: const Icon(Icons.add_rounded),
            label: const Text('Buat Return Pertama'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF3B82F6),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF3B82F6)),
          ),
          SizedBox(height: 16),
          Text(
            'Memuat data return...',
            style: TextStyle(
              fontSize: 14,
              color: Color(0xFF64748B),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(Object error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(40),
            ),
            child: const Icon(
              Icons.error_outline_rounded,
              size: 40,
              color: Color(0xFFEF4444),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Gagal memuat data',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            error.toString(),
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => ref.refresh(returnsProvider),
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Coba Lagi'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF3B82F6),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ],
      ),
    );
  }
}