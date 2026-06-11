export const MOCK_PAYMENTS = {
  summary: {
    totalRevenue: '₹4,87,500',
    refunds: '₹8,500',
    payouts: '₹2,40,000',
    netEarnings: '₹2,39,000'
  },
  payments: [
    { id: 'TXN1001', customerName: 'Aditi Rao', service: 'Global Hair Color', amount: 4500, status: 'PAID', method: 'UPI', date: '2026-06-07 12:30 PM', invoiceNo: 'INV-2026-042' },
    { id: 'TXN1002', customerName: 'Kabir Kapoor', service: 'Signature Haircut', amount: 1200, status: 'PAID', method: 'Card', date: '2026-06-07 11:50 AM', invoiceNo: 'INV-2026-043' },
    { id: 'TXN1003', customerName: 'Meera Sen', service: 'HydraFacial Glow', amount: 5500, status: 'UNPAID', method: 'UPI', date: '2026-06-07 01:45 PM', invoiceNo: 'INV-2026-044' },
    { id: 'TXN1004', customerName: 'Rohan Gupta', service: 'Luxury Spa Pedicure', amount: 1800, status: 'PARTIAL', method: 'Cash', date: '2026-06-07 03:10 PM', invoiceNo: 'INV-2026-045' },
    { id: 'TXN1005', customerName: 'Divya Nair', service: 'Gel Extensions', amount: 2800, status: 'PAID', method: 'UPI', date: '2026-06-07 05:40 PM', invoiceNo: 'INV-2026-046' },
    { id: 'TXN1006', customerName: 'Amit Verma', service: 'Deep Tissue Massage', amount: 3200, status: 'PAID', method: 'Cashfree', date: '2026-06-07 06:15 PM', invoiceNo: 'INV-2026-047' },
    { id: 'TXN1007', customerName: 'Sneha Reddy', service: 'Gel Extensions + Pedicure', amount: 4600, status: 'PAID', method: 'Card', date: '2026-06-06 04:30 PM', invoiceNo: 'INV-2026-040' },
    { id: 'TXN1008', customerName: 'Vikram Malhotra', service: 'Haircut + Styling', amount: 3500, status: 'PAID', method: 'UPI', date: '2026-06-06 02:15 PM', invoiceNo: 'INV-2026-041' },
    { id: 'TXN1009', customerName: 'Sanjay Dutt', service: 'Balinese Therapy', amount: 3200, status: 'REFUNDED', method: 'UPI', date: '2026-06-05 11:00 AM', invoiceNo: 'INV-2026-038' }
  ]
};
