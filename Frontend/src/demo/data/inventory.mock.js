export const MOCK_INVENTORY = {
  summary: {
    totalItems: 42,
    lowStockCount: 4,
    totalValuation: '₹1,85,600'
  },
  products: [
    { id: 'PRD001', name: 'Olaplex No. 4 Bond Maintenance Shampoo', category: 'Retail Haircare', stock: 2, reorderPoint: 5, costPrice: 1600, retailPrice: 2800, supplier: 'BeautyPro Supplies', sku: 'OL-SH-004', status: 'LOW' },
    { id: 'PRD002', name: 'Olaplex No. 5 Bond Maintenance Conditioner', category: 'Retail Haircare', stock: 3, reorderPoint: 5, costPrice: 1600, retailPrice: 2800, supplier: 'BeautyPro Supplies', sku: 'OL-CO-005', status: 'LOW' },
    { id: 'PRD003', name: 'L\'Oréal Professionnel Inoa 5.3 Light Golden Brown', category: 'Professional Color', stock: 0, reorderPoint: 6, costPrice: 420, retailPrice: 750, supplier: 'Salon Wholesale India', sku: 'LO-IN-5.3', status: 'OUT_OF_STOCK' },
    { id: 'PRD004', name: 'L\'Oréal Professionnel Inoa 6.0 Dark Blonde', category: 'Professional Color', stock: 12, reorderPoint: 6, costPrice: 420, retailPrice: 750, supplier: 'Salon Wholesale India', sku: 'LO-IN-6.0', status: 'IN_STOCK' },
    { id: 'PRD005', name: 'Wella Professionals SP Luxeoil Reconstructive Elixir', category: 'Retail Haircare', stock: 8, reorderPoint: 4, costPrice: 1400, retailPrice: 2200, supplier: 'BeautyPro Supplies', sku: 'WE-LUX-08', status: 'IN_STOCK' },
    { id: 'PRD006', name: 'Kerastase Elixir Ultime Original Hair Oil', category: 'Retail Haircare', stock: 4, reorderPoint: 3, costPrice: 2400, retailPrice: 3800, supplier: 'BeautyPro Supplies', sku: 'KE-EU-01', status: 'IN_STOCK' },
    { id: 'PRD007', name: 'Dermalogica Daily Microfoliant 74g', category: 'Skincare Retail', stock: 6, reorderPoint: 2, costPrice: 2800, retailPrice: 4500, supplier: 'Elite Cosmetics', sku: 'DM-DM-074', status: 'IN_STOCK' },
    { id: 'PRD008', name: 'Dermalogica Special Cleansing Gel 250ml', category: 'Skincare Retail', stock: 1, reorderPoint: 3, costPrice: 1800, retailPrice: 2900, supplier: 'Elite Cosmetics', sku: 'DM-SCG-250', status: 'LOW' },
    { id: 'PRD009', name: 'OPI Nail Lacquer - Big Apple Red', category: 'Nail Polish', stock: 15, reorderPoint: 4, costPrice: 450, retailPrice: 850, supplier: 'Salon Wholesale India', sku: 'OP-BAR-015', status: 'IN_STOCK' },
    { id: 'PRD010', name: 'Premium Disposable Salon Towels (Pack of 100)', category: 'Salons Consumables', stock: 45, reorderPoint: 10, costPrice: 600, retailPrice: 1200, supplier: 'Salon Wholesale India', sku: 'CS-TOW-100', status: 'IN_STOCK' }
  ]
};
