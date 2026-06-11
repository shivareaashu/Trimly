import { DEMO_SALON } from './salon.mock';

export const MOCK_CALENDAR = {
  appointments: [
    {
      id: 'cal1',
      customerId: 'cu1',
      customerName: 'Aditi Rao',
      serviceId: 's2',
      serviceName: 'Global Hair Color (L\'Oréal)',
      price: 4500,
      duration: 120,
      staffId: 'st2', // Priya Sharma
      staffName: 'Priya Sharma',
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      date: '2026-06-07',
      status: 'CONFIRMED',
      color: 'violet'
    },
    {
      id: 'cal2',
      customerId: 'cu2',
      customerName: 'Kabir Kapoor',
      serviceId: 's1',
      serviceName: 'Signature Haircut & Styling',
      price: 1200,
      duration: 45,
      staffId: 'st1', // Rahul Mehta
      staffName: 'Rahul Mehta',
      startTime: '11:00 AM',
      endTime: '11:45 AM',
      date: '2026-06-07',
      status: 'CONFIRMED',
      color: 'teal'
    },
    {
      id: 'cal3',
      customerId: 'cu3',
      customerName: 'Meera Sen',
      serviceId: 's5',
      serviceName: 'HydraFacial Glow',
      price: 5500,
      duration: 75,
      staffId: 'st3', // Anita Desai
      staffName: 'Anita Desai',
      startTime: '12:30 PM',
      endTime: '1:45 PM',
      date: '2026-06-07',
      status: 'CONFIRMED',
      color: 'emerald'
    },
    {
      id: 'cal4',
      customerId: 'cu4',
      customerName: 'Rohan Gupta',
      serviceId: 's9',
      serviceName: 'Luxury Spa Pedicure',
      price: 1800,
      duration: 60,
      staffId: 'st5', // Neha Sen
      staffName: 'Neha Sen',
      startTime: '02:00 PM',
      endTime: '03:00 PM',
      date: '2026-06-07',
      status: 'PENDING',
      color: 'amber'
    },
    {
      id: 'cal5',
      customerId: 'cu5',
      customerName: 'Divya Nair',
      serviceId: 's8',
      serviceName: 'Gel Extension & Nail Art',
      price: 2800,
      duration: 90,
      staffId: 'st5', // Neha Sen
      staffName: 'Neha Sen',
      startTime: '04:00 PM',
      endTime: '05:30 PM',
      date: '2026-06-07',
      status: 'CONFIRMED',
      color: 'pink'
    },
    {
      id: 'cal6',
      customerId: 'cu6',
      customerName: 'Amit Verma',
      serviceId: 's10',
      serviceName: 'Balinese Deep Tissue Massage',
      price: 3200,
      duration: 60,
      staffId: 'st6', // Vikram Roy
      staffName: 'Vikram Roy',
      startTime: '05:00 PM',
      endTime: '06:00 PM',
      date: '2026-06-07',
      status: 'CONFIRMED',
      color: 'rose'
    }
  ],
  timeSlots: [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', 
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', 
    '07:00 PM', '08:00 PM'
  ]
};
