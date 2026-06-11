import { DEMO_SALON } from './salon.mock';

export const MOCK_CUSTOMERS = {
  customers: DEMO_SALON.customers.map(c => ({
    ...c,
    membership: c.status === 'VIP' ? 'Platinum Tier' : c.status === 'Active' ? 'Silver Tier' : 'None',
    loyaltyPoints: c.visits * 15,
    lastVisit: '2026-05-28',
    notes: c.id === 'cu1' ? 'Prefers iced green tea. Extremely sensitive scalp. Uses Olaplex only.' : '',
    timeline: [
      { id: 't1', date: '2026-05-28', type: 'Appointment', desc: 'Completed Signature Haircut & Styling with Rahul Mehta', amount: 1200 },
      { id: 't2', date: '2026-05-10', type: 'Purchase', desc: 'Bought Olaplex No. 4 Shampoo & No. 5 Conditioner', amount: 4800 },
      { id: 't3', date: '2026-04-15', type: 'Appointment', desc: 'Completed Global Hair Color (L\'Oréal) with Priya Sharma', amount: 4500 },
      { id: 't4', date: '2026-03-20', type: 'Feedback', desc: 'Left a 5-star review: "Priya is a miracle worker with colors!"', rating: 5 }
    ],
    appointments: [
      { id: 'ap10', date: '2026-05-28', service: 'Signature Haircut', staff: 'Rahul Mehta', status: 'COMPLETED', price: 1200 },
      { id: 'ap11', date: '2026-04-15', service: 'Global Hair Color', staff: 'Priya Sharma', status: 'COMPLETED', price: 4500 },
      { id: 'ap12', date: '2026-03-05', service: 'Premium Olaplex Therapy', staff: 'Rahul Mehta', status: 'COMPLETED', price: 3000 }
    ],
    payments: [
      { id: 'py10', date: '2026-05-28', amount: 1200, status: 'PAID', method: 'UPI' },
      { id: 'py11', date: '2026-04-15', amount: 4500, status: 'PAID', method: 'Card' },
      { id: 'py12', date: '2026-03-05', amount: 3000, status: 'PAID', method: 'Cash' }
    ]
  }))
};
