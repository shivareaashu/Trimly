import { DEMO_SALON } from './salon.mock';

export const MOCK_DASHBOARD = {
  todayEarnings: '₹48,750',
  appointmentsTotal: 31,
  appointmentsRemaining: 12,
  newCustomersStr: '418',
  staffWorkingStr: '5 / 6',
  
  todayBookings: [
    {
      id: 'ap1',
      customer: { id: 'cu1', firstName: 'Aditi', lastName: 'Rao' },
      service: { name: 'Global Hair Color (L\'Oréal)', duration: 120 },
      startTime: '2026-06-07T16:00:00.000Z',
      status: 'CONFIRMED'
    },
    {
      id: 'ap2',
      customer: { id: 'cu2', firstName: 'Kabir', lastName: 'Kapoor' },
      service: { name: 'Signature Haircut & Styling', duration: 45 },
      startTime: '2026-06-07T16:45:00.000Z',
      status: 'CONFIRMED'
    },
    {
      id: 'ap3',
      customer: { id: 'cu3', firstName: 'Meera', lastName: 'Sen' },
      service: { name: 'HydraFacial Glow', duration: 75 },
      startTime: '2026-06-07T17:30:00.000Z',
      status: 'CONFIRMED'
    },
    {
      id: 'ap4',
      customer: { id: 'cu4', firstName: 'Rohan', lastName: 'Gupta' },
      service: { name: 'Luxury Spa Pedicure', duration: 60 },
      startTime: '2026-06-07T18:45:00.000Z',
      status: 'PENDING'
    },
    {
      id: 'ap5',
      customer: { id: 'cu7', firstName: 'Sneha', lastName: 'Reddy' },
      service: { name: 'Gel Extension & Nail Art', duration: 90 },
      startTime: '2026-06-07T19:30:00.000Z',
      status: 'CONFIRMED'
    }
  ],

  chartData: {
    '7D': [
      { label: 'Mon', value: 38000 },
      { label: 'Tue', value: 42000 },
      { label: 'Wed', value: 31000 },
      { label: 'Thu', value: 49000 },
      { label: 'Fri', value: 52000 },
      { label: 'Sat', value: 68000 },
      { label: 'Sun', value: 48750 } // Highest or current
    ],
    '30D': [
      { label: 'Week 1', value: 245000 },
      { label: 'Week 2', value: 290000 },
      { label: 'Week 3', value: 275000 },
      { label: 'Week 4', value: 310000 }
    ],
    '90D': [
      { label: 'Mar', value: 1120000 },
      { label: 'Apr', value: 1280000 },
      { label: 'May', value: 1350000 }
    ]
  },

  paymentsList: [
    {
      id: 'pay1',
      customer: { firstName: 'Meera', lastName: 'Sen' },
      appointment: { service: { name: 'HydraFacial Glow' } },
      amount: 5500,
      paymentStatus: 'UNPAID'
    },
    {
      id: 'pay2',
      customer: { firstName: 'Kabir', lastName: 'Kapoor' },
      appointment: { service: { name: 'Signature Haircut' } },
      amount: 1200,
      paymentStatus: 'PARTIAL'
    },
    {
      id: 'pay3',
      customer: { firstName: 'Rohan', lastName: 'Gupta' },
      appointment: { service: { name: 'Luxury Spa Pedicure' } },
      amount: 1800,
      paymentStatus: 'UNPAID'
    }
  ],

  inventoryAlerts: [
    { name: 'Olaplex No. 4 Shampoo', unitsLeft: 2, status: 'LOW' },
    { name: 'L\'Oréal Professionnel Inoa 5.3', unitsLeft: 0, status: 'OUT_OF_STOCK' },
    { name: 'Wella Professionals SP Luxeoil', unitsLeft: 3, status: 'LOW' }
  ]
};
