export const MOCK_SUPPLIERS = {
  suppliers: [
    {
      id: 'SUP001',
      name: 'BeautyPro Supplies',
      contactName: 'Vikram Malhotra',
      email: 'sales@beautypro.in',
      phone: '+91 98222 11000',
      address: 'Plot 12, MIDC Industrial Area, Andheri East, Mumbai 400093',
      outstandingBalance: '₹35,000',
      activeOrders: 2,
      totalOrders: 28,
      leadTime: '3 Days',
      status: 'ACTIVE'
    },
    {
      id: 'SUP002',
      name: 'Salon Wholesale India',
      contactName: 'Rajesh Mehta',
      email: 'support@salonwholesale.co.in',
      phone: '+91 99201 44556',
      address: 'G-14, Galleria Market, Hiranandani, Powai, Mumbai 400076',
      outstandingBalance: '₹12,800',
      activeOrders: 1,
      totalOrders: 15,
      leadTime: '5 Days',
      status: 'ACTIVE'
    },
    {
      id: 'SUP003',
      name: 'Elite Cosmetics',
      contactName: 'Neha Deshmukh',
      email: 'orders@elitecosmetics.com',
      phone: '+91 98110 55667',
      address: 'Shop 5, Linking Road, Khar West, Mumbai 400052',
      outstandingBalance: '₹0',
      activeOrders: 0,
      totalOrders: 8,
      leadTime: '2 Days',
      status: 'ACTIVE'
    }
  ],
  purchaseOrders: [
    { id: 'PO-2026-004', supplierName: 'BeautyPro Supplies', amount: 25000, date: '2026-06-05', status: 'SENT', itemsCount: 4 },
    { id: 'PO-2026-003', supplierName: 'Salon Wholesale India', amount: 15000, date: '2026-06-03', status: 'RECEIVED', itemsCount: 8 },
    { id: 'PO-2026-002', supplierName: 'BeautyPro Supplies', amount: 12000, date: '2026-05-20', status: 'COMPLETED', itemsCount: 3 },
    { id: 'PO-2026-001', supplierName: 'Elite Cosmetics', amount: 8500, date: '2026-05-10', status: 'COMPLETED', itemsCount: 2 }
  ]
};
