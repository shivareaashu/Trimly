export const DEMO_SALON = {
  name: 'Lumière Atelier',
  city: 'Mumbai',
  slug: 'lumiere-atelier',
  owner: 'Aanya Kapoor',
  email: 'hello@lumiereatelier.com',
  phone: '+91 98200 12345',
  branches: [
    { id: 'b1', name: 'Bandra West', address: '12 Turner Road, Bandra West, Mumbai 400050', phone: '+91 22 2640 1234' },
    { id: 'b2', name: 'Juhu', address: '44 Juhu Tara Road, Juhu, Mumbai 400049', phone: '+91 22 2620 5678' }
  ],
  categories: [
    { id: 'c1', name: 'Hair', description: 'Styling, coloring, haircuts and premium treatments' },
    { id: 'c2', name: 'Skin & Facial', description: 'Rejuvenating facials, peels and premium skin care' },
    { id: 'c3', name: 'Nails & Manicure', description: 'Gel extensions, nail art, luxury manicures' },
    { id: 'c4', name: 'Spa & Wellness', description: 'Aromatic massages, body scrubs and therapies' }
  ],
  services: [
    { id: 's1', categoryId: 'c1', name: 'Signature Haircut & Styling', duration: 45, price: 1200, rating: 4.9, description: 'Personalized haircut with luxury wash and blow-dry.' },
    { id: 's2', categoryId: 'c1', name: 'Global Hair Color (L\'Oréal)', duration: 120, price: 4500, rating: 4.8, description: 'Full head coloring with high shine and protection.' },
    { id: 's3', categoryId: 'c1', name: 'Premium Olaplex Hair Therapy', duration: 60, price: 3000, rating: 4.9, description: 'Bond-building treatment for damaged or colored hair.' },
    { id: 's4', categoryId: 'c1', name: 'Keratin Smoothing Treatment', duration: 150, price: 7500, rating: 4.7, description: 'Eliminates frizz and adds brilliant luster.' },
    
    { id: 's5', categoryId: 'c2', name: 'HydraFacial Glow', duration: 75, price: 5500, rating: 4.9, description: 'Deep cleanse, extraction, hydration, and peptide infusion.' },
    { id: 's6', categoryId: 'c2', name: 'Anti-Aging Caviar Facial', duration: 90, price: 6500, rating: 4.8, description: 'Rich caviar extracts to firm, tone and restore radiance.' },
    { id: 's7', categoryId: 'c2', name: 'Brightening Peel', duration: 45, price: 3500, rating: 4.6, description: 'Exfoliates dead skin cells to reveal fresh, glowing skin.' },
    
    { id: 's8', categoryId: 'c3', name: 'Gel Extension & Nail Art', duration: 90, price: 2800, rating: 4.9, description: 'Custom length extensions with bespoke nail design.' },
    { id: 's9', categoryId: 'c3', name: 'Luxury Spa Pedicure', duration: 60, price: 1800, rating: 4.7, description: 'Relaxing soak, scrub, mask, massage and polish.' },
    
    { id: 's10', categoryId: 'c4', name: 'Balinese Deep Tissue Massage', duration: 60, price: 3200, rating: 4.9, description: 'Firm pressure therapy using aromatherapy oils.' },
    { id: 's11', categoryId: 'c4', name: 'Aroma Body Scrub & Polish', duration: 90, price: 4000, rating: 4.8, description: 'Exfoliating scrub followed by a hydrating cream wrap.' },
    { id: 's12', categoryId: 'c4', name: 'Royal Foot Reflexology', duration: 45, price: 1500, rating: 4.9, description: 'Targeted pressure point massage for pure relaxation.' }
  ],
  staff: [
    { id: 'st1', name: 'Rahul Mehta', role: 'Senior Hair Stylist', rating: 4.9, reviews: 248, experience: '8 years', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', nextAvailable: 'Today 4:00 PM', specialty: 'Haircuts, Keratin, Styling' },
    { id: 'st2', name: 'Priya Sharma', role: 'Color Expert & Stylist', rating: 4.8, reviews: 195, experience: '6 years', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', nextAvailable: 'Today 5:30 PM', specialty: 'Global Color, Balayage, Highlights' },
    { id: 'st3', name: 'Anita Desai', role: 'Senior Skin Therapist', rating: 4.9, reviews: 312, experience: '9 years', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', nextAvailable: 'Tomorrow 11:00 AM', specialty: 'HydraFacials, Caviar Facials, Peels' },
    { id: 'st4', name: 'Rohan Malhotra', role: 'Creative Director', rating: 5.0, reviews: 412, experience: '12 years', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', nextAvailable: 'June 9, 2:00 PM', specialty: 'Makeover Transformations, Bridal Hair' },
    { id: 'st5', name: 'Neha Sen', role: 'Nail Artist', rating: 4.7, reviews: 154, experience: '4 years', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', nextAvailable: 'Today 3:00 PM', specialty: 'Gel Extensions, Custom Nail Art' },
    { id: 'st6', name: 'Vikram Roy', role: 'Wellness Therapist', rating: 4.9, reviews: 180, experience: '7 years', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', nextAvailable: 'Today 6:00 PM', specialty: 'Deep Tissue Massage, Reflexology' }
  ],
  customers: [
    { id: 'cu1', name: 'Aditi Rao', email: 'aditi.rao@gmail.com', phone: '+91 98199 87654', status: 'VIP', visits: 42, totalSpend: 84300, rating: 5.0 },
    { id: 'cu2', name: 'Kabir Kapoor', email: 'kabir.k@yahoo.com', phone: '+91 98210 54321', status: 'Active', visits: 18, totalSpend: 29500, rating: 4.8 },
    { id: 'cu3', name: 'Meera Sen', email: 'meera.sen@outlook.com', phone: '+91 99300 99887', status: 'VIP', visits: 31, totalSpend: 62400, rating: 4.9 },
    { id: 'cu4', name: 'Rohan Gupta', email: 'rohan.gupta@gmail.com', phone: '+91 98765 43210', status: 'Active', visits: 8, totalSpend: 11200, rating: 4.5 },
    { id: 'cu5', name: 'Divya Nair', email: 'divya.n@gmail.com', phone: '+91 98205 11223', status: 'Inactive', visits: 5, totalSpend: 7800, rating: 4.2 },
    { id: 'cu6', name: 'Amit Verma', email: 'amit.v@hotmail.com', phone: '+91 99200 66778', status: 'Active', visits: 12, totalSpend: 19800, rating: 4.6 },
    { id: 'cu7', name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', phone: '+91 98112 33445', status: 'VIP', visits: 25, totalSpend: 47200, rating: 5.0 },
    { id: 'cu8', name: 'Vikram Malhotra', email: 'vikram.m@gmail.com', phone: '+91 98330 99112', status: 'New', visits: 1, totalSpend: 3500, rating: 5.0 }
  ]
};
