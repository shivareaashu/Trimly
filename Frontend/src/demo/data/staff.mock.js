import { DEMO_SALON } from './salon.mock';

export const MOCK_STAFF = {
  staff: DEMO_SALON.staff.map(s => ({
    ...s,
    weeklyTarget: 50000,
    weeklySales: s.id === 'st1' ? 42000 : s.id === 'st2' ? 48500 : s.id === 'st4' ? 62000 : 28000,
    commissionRate: s.id === 'st4' ? '15%' : '10%',
    earningsThisMonth: s.id === 'st1' ? 84000 : s.id === 'st2' ? 92000 : s.id === 'st4' ? 120000 : 54000,
    attendanceRate: s.id === 'st1' ? '98%' : '95%',
    status: 'ACTIVE',
    schedule: {
      days: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
      hours: '10:00 AM - 08:00 PM'
    },
    performance: [
      { month: 'Mar', revenue: 110000 },
      { month: 'Apr', revenue: 130000 },
      { month: 'May', revenue: 145000 }
    ],
    reviewsList: [
      { author: 'Aditi Rao', rating: 5, text: 'Amazing service! Very professional.', date: '2026-05-28' },
      { author: 'Meera Sen', rating: 5, text: 'Outstanding job on my haircut.', date: '2026-05-15' }
    ]
  }))
};
