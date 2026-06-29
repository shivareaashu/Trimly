'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger client-side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Luxury Treatments Data for Showcase
const TREATMENTS = [
  {
    id: 'balayage',
    tabName: 'Royal Barber Shop',
    name: 'Royal Barber Hair & Beard Grooming',
    beforeImg: '/images/barber_before.png',
    afterImg: '/images/barber_after.png',
    beforeLabel: 'Overgrown Hair & Beard',
    afterLabel: 'Sharp Fade & Clean Groomed Beard',
    duration: '1.5 Hours',
    stylist: 'Kabir Dev (Master Barber)',
    details: 'An ultra-premium grooming experience featuring a tailored scissor cut, classic straight razor shave with aromatherapy warm towels, and beard styling.',
    price: '₹2,500'
  },
  {
    id: 'bridal',
    tabName: 'Bridal Styling',
    name: 'Luxury Bridal Makeover',
    beforeImg: '/images/bridal_before.png',
    afterImg: '/images/bridal_after.png',
    beforeLabel: 'Pre-styling Portrait',
    afterLabel: 'Complete Bridal Glow',
    duration: '6 Hours',
    stylist: 'Rohan Malhotra (Bridal Director)',
    details: 'Traditional and HD airbrush makeup matching royal aesthetic. Includes jewelry setting, hair styling, and saree/lehenga draping.',
    price: '₹25,000'
  },
  {
    id: 'keratin',
    tabName: 'Keratin Therapy',
    name: 'Silk Keratin Therapy',
    beforeImg: '/images/keratin_before.png',
    afterImg: '/images/keratin_after.png',
    beforeLabel: 'Frizzy & Tangled Hair',
    afterLabel: 'Silky Smooth & Straight',
    duration: '3.5 Hours',
    stylist: 'Priya Verma (Art Director)',
    details: 'Advanced protein treatment restoring hair structure, sealing cuticles, and removing 95% of frizz. Results last up to 4 months.',
    price: '₹9,000'
  },
  {
    id: 'facial',
    tabName: 'Glass Skin Facial',
    name: 'Glass Skin Gold Facial',
    beforeImg: '/images/makeup_before.png',
    afterImg: '/images/makeup_after.png',
    beforeLabel: 'Natural Skin Base',
    afterLabel: 'Dewy Glass Skin Glow',
    duration: '2 Hours',
    stylist: 'Sana Kapoor (Skincare Lead)',
    details: 'Multi-step micro-exfoliation infused with 24K gold serum, hyaluronic acid, and collagen-boosting LED light therapy.',
    price: '₹5,500'
  }
];

function PremiumScissor() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
      {/* Left loop (top finger hole) */}
      <circle cx="6" cy="7" r="2.5" stroke="#B58A2A" strokeWidth="2" fill="none" />
      {/* Left loop (bottom finger hole) */}
      <circle cx="6" cy="17" r="2.5" stroke="#B58A2A" strokeWidth="2" fill="none" />
      {/* Blades intersecting at pivot (12,12) */}
      <path d="M8.5 8.5 L 12 12 L 21 16.5" stroke="#B58A2A" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.5 15.5 L 12 12 L 21 7.5" stroke="#B58A2A" strokeWidth="2" strokeLinecap="round" />
      {/* Pivot screw */}
      <circle cx="12" cy="12" r="1.2" fill="#8A6A1F" stroke="#FFFFFF" strokeWidth="0.5" />
    </svg>
  );
}

function MainShowcaseReveal({ treatment }) {
  const [revealX, setRevealX] = useState(50);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);
  const scissorRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    // Smoothly animate the reveal mask percent
    gsap.to(containerRef.current, {
      '--reveal-x': `${percentage}%`,
      duration: 0.15,
      ease: 'power2.out',
      onUpdate: () => setRevealX(percentage)
    });

    // Move scissor helper
    if (scissorRef.current) {
      gsap.to(scissorRef.current, {
        x: x,
        y: y,
        duration: 0.1,
        ease: 'power2.out'
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    gsap.to(containerRef.current, {
      '--reveal-x': `${percentage}%`,
      duration: 0.15,
      ease: 'power2.out',
      onUpdate: () => setRevealX(percentage)
    });

    if (scissorRef.current) {
      gsap.to(scissorRef.current, {
        x: x,
        y: y,
        duration: 0.1,
        ease: 'power2.out'
      });
    }
  };

  // Reset reveal line when treatment switches
  useEffect(() => {
    setRevealX(50);
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        '--reveal-x': '50%',
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [treatment.id]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Massive reveal frame */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden w-full aspect-[16/9] md:aspect-[21/9] rounded-[32px] border border-[#E8DCC5]/50 shadow-2xl group cursor-none select-none"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          gsap.to(containerRef.current, {
            '--reveal-x': '50%',
            duration: 0.4,
            ease: 'power2.out',
            onUpdate: () => setRevealX(50)
          });
        }}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsHovering(true)}
        onTouchEnd={() => {
          setIsHovering(false);
          gsap.to(containerRef.current, {
            '--reveal-x': '50%',
            duration: 0.4,
            ease: 'power2.out',
            onUpdate: () => setRevealX(50)
          });
        }}
        onTouchMove={handleTouchMove}
        style={{ '--reveal-x': '50%' }}
      >
        {/* Before Image (underneath) */}
        <img src={treatment.beforeImg} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
        
        {/* After Image (clipped from the left) */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            clipPath: `polygon(var(--reveal-x) 0, 100% 0, 100% 100%, var(--reveal-x) 100%)`
          }}
        >
          <img src={treatment.afterImg} alt="After" className="absolute inset-0 w-full h-full object-cover" />
        </div>

        {/* Slicing Gold Line */}
        <div 
          className="absolute top-0 bottom-0 w-[2px] bg-[#B58A2A] pointer-events-none drop-shadow-[0_0_10px_rgba(181,138,42,0.85)] z-20"
          style={{ left: `${revealX}%` }}
        />

        {/* Floating Scissor Vector Cursor */}
        {isHovering && (
          <div 
            ref={scissorRef}
            className="absolute w-12 h-12 flex items-center justify-center pointer-events-none z-30 -ml-6 -mt-6"
            style={{ left: 0, top: 0 }}
          >
            <PremiumScissor />
          </div>
        )}

        {/* Small indicators */}
        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full border border-[#E8DCC5]/40 pointer-events-none shadow-sm z-25">
          <span className="text-[10px] font-sans font-bold tracking-wider text-[#1A1A1A] uppercase">{treatment.beforeLabel}</span>
        </div>
        <div className="absolute bottom-6 right-6 bg-[#B58A2A]/90 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 pointer-events-none shadow-sm z-25">
          <span className="text-[10px] font-sans font-bold tracking-wider text-white uppercase">{treatment.afterLabel}</span>
        </div>
      </div>

      {/* Result Details in Apple-like Product Layout */}
      <div className="bg-white border border-[#E8DCC5]/40 rounded-3xl p-8 md:p-12 shadow-sm grid md:grid-cols-12 gap-8 items-center text-left">
        <div className="md:col-span-8 space-y-4">
          <h3 className="luxury-heading text-2xl md:text-3xl font-medium text-[#1A1A1A]">{treatment.name}</h3>
          <p className="font-sans text-sm md:text-base text-stone-500 leading-relaxed max-w-2xl">{treatment.details}</p>
        </div>
        <div className="md:col-span-4 space-y-6 md:border-l md:border-[#E8DCC5]/45 md:pl-8 flex flex-col justify-between h-full">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-stone-400 font-medium">Session Duration</span>
              <span className="font-bold text-[#1A1A1A]">{treatment.duration}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-stone-400 font-medium">Stylist Grade</span>
              <span className="font-bold text-[#1A1A1A]">{treatment.stylist}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-stone-400 font-medium">Tariff Outcome</span>
              <span className="font-bold text-[#B58A2A] text-sm">{treatment.price}</span>
            </div>
          </div>
          <button 
            onClick={() => window.location.assign('/register')}
            className="w-full py-3.5 bg-[#B58A2A] hover:bg-[#8A6A1F] text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#B58A2A]/10 mt-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            Book This Treatment
          </button>
        </div>
      </div>
    </div>
  );
}


export default function StitchLandingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeTreatment, setActiveTreatment] = useState('balayage');

  // Interactive Feature Accordion States
  const [customerMgmtActive, setCustomerMgmtActive] = useState(0);
  const [posActive, setPosActive] = useState(0);
  const [gstActive, setGstActive] = useState(0);
  const [inventoryActive, setInventoryActive] = useState(0);
  const [employeeActive, setEmployeeActive] = useState(0);

  // Booking Demo State
  const [bookingStep, setBookingStep] = useState(0); // 0: service, 1: staff, 2: time, 3: confirm, 4: success
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  // Mobile navigation and interactive simulator states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState('dashboard');

  // References for animations
  const heroTextRef = useRef(null);
  const heroVisualRef = useRef(null);
  const parallaxSecRef = useRef(null);
  const parallaxImgRef = useRef(null);
  const timelineSecRef = useRef(null);
  const svgPathRef = useRef(null);
  const pageBuilderRef = useRef(null);

  // Metrics count references
  const appointmentsCountRef = useRef(null);
  const customersCountRef = useRef(null);
  const revenueCountRef = useRef(null);

  // Override body styling for Light luxury theme
  useEffect(() => {
    document.body.style.backgroundColor = '#F8F5F1';
    document.body.style.backgroundImage = 'none';
    document.body.style.color = '#1A1A1A';
    document.body.classList.add('light-theme');

    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.backgroundImage = '';
      document.body.style.color = '';
      document.body.classList.remove('light-theme');
    };
  }, []);

  // 1. Hero Dynamic Word Cycler
  useEffect(() => {
    const words = ["Appointments.", "Customers.", "Payments.", "Payroll.", "Websites."];
    let wordIndex = 0;
    const cycler = heroTextRef.current;
    if (!cycler) return;

    const changeWord = () => {
      gsap.to(cycler, {
        opacity: 0,
        y: -10,
        duration: 0.4,
        onComplete: () => {
          cycler.innerText = words[wordIndex];
          gsap.fromTo(cycler, 
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4 }
          );
          wordIndex = (wordIndex + 1) % words.length;
        }
      });
    };

    const interval = setInterval(changeWord, 2500);
    return () => clearInterval(interval);
  }, []);

  // 2. Hero Mouse Move Parallax & 3D Tilt
  const handleHeroMouseMove = (e) => {
    if (!heroVisualRef.current) return;
    const rect = heroVisualRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    gsap.to(heroVisualRef.current, {
      rotateY: mouseX * 0.02,
      rotateX: -mouseY * 0.02,
      transformPerspective: 1000,
      ease: 'power2.out',
      duration: 0.5
    });

    const cards = heroVisualRef.current.querySelectorAll('.floating-card');
    cards.forEach((card, index) => {
      const depth = (index + 1) * 0.04;
      gsap.to(card, {
        x: mouseX * depth,
        y: mouseY * depth,
        ease: 'power2.out',
        duration: 0.6
      });
    });
  };

  const handleHeroMouseLeave = () => {
    if (!heroVisualRef.current) return;
    gsap.to(heroVisualRef.current, {
      rotateY: 0,
      rotateX: 0,
      ease: 'power2.out',
      duration: 0.8
    });

    const cards = heroVisualRef.current.querySelectorAll('.floating-card');
    cards.forEach((card) => {
      gsap.to(card, {
        x: 0,
        y: 0,
        ease: 'power2.out',
        duration: 0.8
      });
    });
  };

  // 3. GSAP Major Animations: Parallax Scroll, Scroll Timeline, Counters, and Builder Assembly
  useEffect(() => {
    // A. Section 1 Parallax Reveal Scale
    if (parallaxSecRef.current && parallaxImgRef.current) {
      gsap.fromTo(parallaxImgRef.current, 
        { scale: 1.15, y: -20 },
        {
          scale: 1.0,
          y: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: parallaxSecRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    }

    // B. Section 2 Customer Journey Scroll Timeline
    if (timelineSecRef.current && svgPathRef.current) {
      const path = svgPathRef.current;
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: timelineSecRef.current,
          start: 'top 50%',
          end: 'bottom 60%',
          scrub: 0.5
        }
      });

      // Light up timeline nodes on scroll
      const nodes = timelineSecRef.current.querySelectorAll('.journey-node');
      nodes.forEach((node, idx) => {
        gsap.fromTo(node,
          { scale: 0.85, opacity: 0.4, borderColor: '#E8DCC5', backgroundColor: '#FFFFFF' },
          {
            scale: 1.1,
            opacity: 1,
            borderColor: '#B58A2A',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 0 15px rgba(181,138,42,0.3)',
            duration: 0.3,
            scrollTrigger: {
              trigger: node,
              start: 'top 65%',
              end: 'top 45%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      });

      const cards = timelineSecRef.current.querySelectorAll('.journey-card');
      cards.forEach((card) => {
        gsap.fromTo(card,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            scrollTrigger: {
              trigger: card,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }

    // C. Scroll Counters for Metrics Section
    const counters = [
      { ref: appointmentsCountRef, end: 50000, suffix: '+' },
      { ref: customersCountRef, end: 5000, suffix: '+' },
      { ref: revenueCountRef, end: 10, prefix: '₹ ', suffix: ' Cr+' }
    ];

    counters.forEach(c => {
      if (!c.ref.current) return;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: c.end,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: c.ref.current,
          start: 'top 85%'
        },
        onUpdate: () => {
          if (c.ref.current) {
            c.ref.current.innerText = `${c.prefix || ''}${Math.floor(obj.val).toLocaleString('en-IN')}${c.suffix || ''}`;
          }
        }
      });
    });

    // D. Page Builder Live Assembly Timeline Loop
    if (pageBuilderRef.current) {
      const container = pageBuilderRef.current;
      const hero = container.querySelector('.builder-hero');
      const gallery = container.querySelector('.builder-gallery');
      const team = container.querySelector('.builder-team');
      const bookBtn = container.querySelector('.builder-book');
      const publishModal = container.querySelector('.builder-publish');
      const cursor = container.querySelector('.builder-cursor');

      const buildTl = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });

      // Init values
      gsap.set([hero, gallery, team, bookBtn, publishModal], { opacity: 0, scale: 0.95, y: 15 });
      gsap.set(cursor, { x: 260, y: 220, opacity: 1 });

      buildTl
        // 1. Drag Hero Section
        .to(cursor, { x: 20, y: 50, duration: 1, ease: 'power2.inOut' })
        .to(cursor, { scale: 0.8, duration: 0.2 })
        .to(cursor, { x: 130, y: 40, duration: 0.8, ease: 'power2.inOut' })
        .to(hero, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }, '-=0.2')
        .to(cursor, { scale: 1, duration: 0.2 })

        // 2. Drag Gallery Section
        .to(cursor, { x: 20, y: 140, duration: 0.8, ease: 'power2.inOut' })
        .to(cursor, { scale: 0.8, duration: 0.2 })
        .to(cursor, { x: 130, y: 120, duration: 0.8, ease: 'power2.inOut' })
        .to(gallery, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }, '-=0.2')
        .to(cursor, { scale: 1, duration: 0.2 })

        // 3. Drag Team Section
        .to(cursor, { x: 20, y: 230, duration: 0.8, ease: 'power2.inOut' })
        .to(cursor, { scale: 0.8, duration: 0.2 })
        .to(cursor, { x: 130, y: 200, duration: 0.8, ease: 'power2.inOut' })
        .to(team, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }, '-=0.2')
        .to(cursor, { scale: 1, duration: 0.2 })

        // 4. Drag Book Button
        .to(cursor, { x: 20, y: 310, duration: 0.8, ease: 'power2.inOut' })
        .to(cursor, { scale: 0.8, duration: 0.2 })
        .to(cursor, { x: 130, y: 280, duration: 0.8, ease: 'power2.inOut' })
        .to(bookBtn, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }, '-=0.2')
        .to(cursor, { scale: 1, duration: 0.2 })

        // 5. Click Publish Button
        .to(cursor, { x: 230, y: 15, duration: 0.8, ease: 'power2.inOut' })
        .to(cursor, { scale: 0.8, duration: 0.15 })
        .to(cursor, { scale: 1, duration: 0.15 })
        .to(publishModal, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' })
        .to(cursor, { opacity: 0, duration: 0.3 })
        .to({}, { duration: 3 }); // Wait screen before repeat

      return () => {
        buildTl.kill();
      };
    }
  }, []);

  // 4. Booking Demo Autoplay Loop
  useEffect(() => {
    const stepTimings = [
      () => { // Step 0: Service Select
        setSelectedService('');
        setSelectedStaff('');
        setSelectedTime('');
        setShowWhatsApp(false);
        setBookingStep(0);
      },
      () => { // Click Service
        setSelectedService('Balayage Highlight & Hair Spa');
        setBookingStep(1);
      },
      () => { // Click Staff
        setSelectedStaff('Ananya Sharma');
        setBookingStep(2);
      },
      () => { // Click Time
        setSelectedTime('Tomorrow, 2:30 PM');
        setBookingStep(3);
      },
      () => { // Confirmed
        setBookingStep(4);
        setTimeout(() => setShowWhatsApp(true), 600);
      }
    ];

    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % stepTimings.length;
      stepTimings[current]();
    }, 2800);

    // Initial setup
    stepTimings[0]();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="trimly-font text-[#1A1A1A] selection:bg-[#E8DCC5] selection:text-[#1A1A1A] min-h-screen bg-[#F8F5F1]">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

        .trimly-font, .font-sans {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .luxury-heading {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 750;
          letter-spacing: -0.025em;
        }
        .luxury-card {
          background: #FFFFFF;
          border: 1px solid rgba(181, 138, 42, 0.15);
          box-shadow: 0 4px 30px rgba(181, 138, 42, 0.03);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .luxury-card:hover {
          border-color: rgba(181, 138, 42, 0.4);
          box-shadow: 0 10px 40px rgba(181, 138, 42, 0.08);
          transform: translateY(-4px);
        }
        .floating-card {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-1 { animation: float-slow 4s ease-in-out infinite; }
        .animate-float-2 { animation: float-slow 5s ease-in-out infinite 0.7s; }
        .animate-float-3 { animation: float-slow 6.5s ease-in-out infinite 1.2s; }
        .animate-float-4 { animation: float-slow 5.5s ease-in-out infinite 1.8s; }
        .animate-float-5 { animation: float-slow 4.8s ease-in-out infinite 2.2s; }

        @keyframes gold-glow-pulse {
          0%, 100% {
            border-color: rgba(181, 138, 42, 0.3);
            box-shadow: 0 20px 50px rgba(181, 138, 42, 0.08), inset 0 0 15px rgba(181, 138, 42, 0.02);
          }
          50% {
            border-color: rgba(181, 138, 42, 0.75);
            box-shadow: 0 20px 50px rgba(181, 138, 42, 0.2), inset 0 0 25px rgba(181, 138, 42, 0.08);
          }
        }
        .popular-glow {
          animation: gold-glow-pulse 4s ease-in-out infinite;
        }
        .booking-phone-shadow {
          box-shadow: 0 25px 60px -15px rgba(181, 138, 42, 0.12);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F8F5F1]/80 backdrop-blur-md border-b border-[#E8DCC5]/40 h-20">
        <div className="flex justify-between items-center w-full px-6 md:px-12 max-w-[1440px] mx-auto h-full">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.assign('/')}>
            <img alt="Trimly Logo" className="h-8 w-8 object-contain" src="/logo.svg" />
            <span className="luxury-heading text-2xl font-bold tracking-tight text-[#1A1A1A]">Trimly</span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a className="font-sans text-sm font-medium text-[#1A1A1A]/70 hover:text-[#B58A2A] transition-colors" href="/demo">Product</a>
            <a className="font-sans text-sm font-medium text-[#1A1A1A]/70 hover:text-[#B58A2A] transition-colors" href="/demo-booking">Features</a>
            <a className="font-sans text-sm font-medium text-[#1A1A1A]/70 hover:text-[#B58A2A] transition-colors" href="#pricing">Pricing</a>
            <a className="font-sans text-sm font-medium text-[#1A1A1A]/70 hover:text-[#B58A2A] transition-colors" href="#">About</a>
            <a className="font-sans text-sm font-medium text-[#1A1A1A]/70 hover:text-[#B58A2A] transition-colors" href="#">Contact</a>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <button className="hidden sm:block font-sans text-sm font-medium text-[#1A1A1A]/70 hover:text-[#B58A2A] transition-colors" onClick={() => window.location.assign('/login')}>Login</button>
            <button className="bg-[#B58A2A] hover:bg-[#8A6A1F] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-sans text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#B58A2A]/15 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]" onClick={() => window.location.assign('/register')}>Start Free Trial</button>
            
            {/* Hamburger Button */}
            <button 
              className="md:hidden text-[#1A1A1A] p-2 hover:text-[#B58A2A] transition-colors focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-x-0 top-20 bg-[#F8F5F1] border-b border-[#E8DCC5]/40 shadow-xl transition-all duration-300 ease-in-out z-45 md:hidden overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[350px] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'
        }`}
      >
        <div className="flex flex-col gap-4 px-6">
          <a className="font-sans text-base font-semibold text-[#1A1A1A] hover:text-[#B58A2A] transition-colors" href="/demo" onClick={() => setIsMobileMenuOpen(false)}>Product</a>
          <a className="font-sans text-base font-semibold text-[#1A1A1A] hover:text-[#B58A2A] transition-colors" href="/demo-booking" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
          <a className="font-sans text-base font-semibold text-[#1A1A1A] hover:text-[#B58A2A] transition-colors" href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
          <a className="font-sans text-base font-semibold text-[#1A1A1A] hover:text-[#B58A2A] transition-colors" href="#" onClick={() => setIsMobileMenuOpen(false)}>About</a>
          <a className="font-sans text-base font-semibold text-[#1A1A1A] hover:text-[#B58A2A] transition-colors" href="#" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
          <div className="w-full h-px bg-[#E8DCC5]/30 my-2" />
          <div className="flex items-center gap-4">
            <button className="flex-1 py-3 border border-[#B58A2A]/40 text-[#8A6A1F] rounded-full font-sans text-sm font-semibold hover:bg-[#E8DCC5]/10 transition-colors" onClick={() => { setIsMobileMenuOpen(false); window.location.assign('/login'); }}>Login</button>
            <button className="flex-1 py-3 bg-[#B58A2A] hover:bg-[#8A6A1F] text-white rounded-full font-sans text-sm font-semibold transition-colors text-center" onClick={() => { setIsMobileMenuOpen(false); window.location.assign('/register'); }}>Start Free Trial</button>
          </div>
        </div>
      </div>

      <main className="pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden min-h-[92vh] flex items-center py-12">
          {/* Subtle light accent glow behind */}
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#E8DCC5]/30 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-[#B58A2A]/5 rounded-full blur-[80px] pointer-events-none -z-10" />

          <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-8 text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#E8DCC5]/40 text-[#8A6A1F] font-sans text-xs font-bold tracking-wider rounded-full border border-[#B58A2A]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B58A2A] animate-ping" />
                THE LUXURY SALON OPERATING SYSTEM
              </span>
              <div className="space-y-4">
                <h1 className="luxury-heading text-4xl sm:text-5xl lg:text-6xl font-medium text-[#1A1A1A] leading-[1.15]">
                  Run Your Salon. <br />
                  <span className="text-[#B58A2A] italic">Not Your Spreadsheets.</span>
                </h1>
                <div className="h-10 sm:h-12 flex items-center">
                  <span 
                    ref={heroTextRef}
                    className="luxury-heading text-2xl sm:text-3xl font-light text-[#8A6A1F] border-b border-[#B58A2A]/30 pb-1"
                  >
                    Appointments.
                  </span>
                </div>
                <p className="font-sans text-base sm:text-lg text-[#1A1A1A]/70 max-w-lg leading-relaxed pt-2">
                  All-in-one salon operating system designed to elevate your client experience, automate check-ins, streamline payments, and run staff payroll flawlessly.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <button className="bg-[#B58A2A] hover:bg-[#8A6A1F] text-white px-8 py-4 rounded-full font-sans text-sm font-semibold transition-all shadow-md shadow-[#B58A2A]/15 hover:scale-[1.03] active:scale-[0.97]" onClick={() => window.location.assign('/register')}>Start Free Trial</button>
                <button className="border border-[#B58A2A]/40 text-[#8A6A1F] hover:bg-[#E8DCC5]/20 px-8 py-4 rounded-full font-sans text-sm font-semibold transition-all" onClick={() => {
                  const demoSection = document.getElementById('booking-demo');
                  if (demoSection) demoSection.scrollIntoView({ behavior: 'smooth' });
                }}>Watch Demo</button>
                <button 
                  className="bg-[#1A1A1A] hover:bg-stone-850 text-white px-8 py-4 rounded-full font-sans text-sm font-semibold transition-all flex items-center gap-2 shadow-lg hover:scale-[1.03] active:scale-[0.97]" 
                  onClick={() => setIsDemoModalOpen(true)}
                >
                  <span className="material-symbols-outlined text-sm">phone_iphone</span>
                  Explore the Demo
                </button>
              </div>
            </div>

            {/* Apple Vision Pro Interactive Visual */}
            <div className="lg:col-span-7 flex justify-center items-center relative py-12">
              <div 
                ref={heroVisualRef}
                onMouseMove={handleHeroMouseMove}
                onMouseLeave={handleHeroMouseLeave}
                className="relative w-full max-w-[520px] aspect-[1/1] flex items-center justify-center transition-transform duration-350"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Center Image */}
                <div className="relative w-[75%] aspect-[1/1] rounded-full overflow-hidden border-[6px] border-white shadow-2xl z-10 bg-[#FFFFFF]">
                  <img alt="Luxury Salon Interior" className="w-full h-full object-cover" src="/images/salon_interior.png" />
                </div>

                {/* Floating Widget 1: Today's Revenue */}
                <div className="absolute top-[8%] left-[2%] z-20 floating-card bg-white/80 border border-[#E8DCC5]/40 rounded-2xl p-4 flex items-center gap-3 animate-float-1 max-w-[200px] cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <span className="material-symbols-outlined text-lg font-bold">trending_up</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-bold text-stone-400 block tracking-wider uppercase">Today's Revenue</span>
                    <span className="text-sm font-sans font-bold text-[#1A1A1A]">₹48,250.00</span>
                  </div>
                </div>

                {/* Floating Widget 2: Appointments */}
                <div className="absolute top-[5%] right-[2%] z-20 floating-card bg-white/80 border border-[#E8DCC5]/40 rounded-2xl p-4 flex items-center gap-3 animate-float-2 max-w-[190px] cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-[#B58A2A]">
                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-bold text-stone-400 block tracking-wider uppercase">Appointments</span>
                    <span className="text-sm font-sans font-bold text-[#1A1A1A]">12 Scheduled</span>
                  </div>
                </div>

                {/* Floating Widget 3: Payments */}
                <div className="absolute bottom-[20%] left-[2%] sm:left-[-8%] z-20 floating-card bg-white/80 border border-[#E8DCC5]/40 rounded-2xl p-4 flex items-center gap-3 animate-float-3 max-w-[210px] cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <span className="material-symbols-outlined text-lg">payments</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-bold text-stone-400 block tracking-wider uppercase">Latest Payment</span>
                    <span className="text-sm font-sans font-bold text-[#1A1A1A]">₹6,500.00 <span className="text-stone-400 font-normal">UPI</span></span>
                  </div>
                </div>

                {/* Floating Widget 4: Staff Active */}
                <div className="absolute bottom-[16%] right-[2%] sm:right-[-5%] z-20 floating-card bg-white/80 border border-[#E8DCC5]/40 rounded-2xl p-4 flex items-center gap-3 animate-float-4 max-w-[170px] cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-[#E8DCC5]/30 flex items-center justify-center text-[#8A6A1F]">
                    <span className="material-symbols-outlined text-lg">badge</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-bold text-stone-400 block tracking-wider uppercase">Staff Check-in</span>
                    <span className="text-sm font-sans font-bold text-[#1A1A1A]">4 Stylists Active</span>
                  </div>
                </div>

                {/* Floating Widget 5: Custom Website */}
                <div className="absolute bottom-[2%] left-[30%] z-20 floating-card bg-white/80 border border-[#E8DCC5]/40 rounded-2xl p-3.5 flex items-center gap-2.5 animate-float-5 cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                  <span className="text-[11px] font-sans font-semibold text-[#1A1A1A]">trimly.co/luxe-atelier</span>
                  <span className="text-[9px] font-sans font-bold text-[#B58A2A] bg-[#E8DCC5]/30 border border-[#B58A2A]/20 px-2 py-0.5 rounded-full">Live</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: LUXURY SALON IMAGE PARALLAX */}
        <section ref={parallaxSecRef} className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden border-y border-[#E8DCC5]/40">
          <div ref={parallaxImgRef} className="absolute inset-0 w-full h-[120%]">
            <div className="absolute inset-0 bg-black/10 z-10" />
            <img 
              alt="Luxury Salon Workspace" 
              className="w-full h-full object-cover" 
              src="/images/salon_interior.png" 
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center z-20 text-center px-4">
            <div className="max-w-2xl bg-white/95 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-[#E8DCC5]/40 shadow-xl">
              <h2 className="luxury-heading text-3xl md:text-4xl font-medium text-[#1A1A1A] mb-4">
                The Standard of Salon Excellence
              </h2>
              <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70 leading-relaxed">
                Your clients expect premium quality in every single touchpoint. Your workspace scheduling and billing operations should feel just as curated.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: CUSTOMER JOURNEY (SCROLL TIMELINE) */}
        <section ref={timelineSecRef} className="py-24 md:py-32 bg-white overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">Operational Orchestration</span>
              <h2 className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A]">The Seamless Client Flow</h2>
              <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70">
                From the first click on your website to their recurring reservation, Trimly designs the perfect customer loop.
              </p>
            </div>

            {/* Timeline Layout */}
            <div className="relative max-w-4xl mx-auto flex flex-col items-center">
              {/* SVG Connector Line */}
              <div className="absolute top-[20px] bottom-[20px] w-[2px] left-6 md:left-1/2 -translate-x-1/2 pointer-events-none">
                {/* Background Line */}
                <div className="absolute inset-0 w-full h-full bg-[#E8DCC5]/30" />
                {/* Active drawing Line */}
                <svg className="absolute inset-0 w-full h-full overflow-visible" fill="none">
                  <line 
                    ref={svgPathRef}
                    x1="0" y1="0" x2="0" y2="100%" 
                    className="stroke-[#B58A2A] stroke-[2px]" 
                  />
                </svg>
              </div>

              {/* Journey Step 1 */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 w-full mb-16 md:mb-24 items-center">
                {/* Text Side */}
                <div className="journey-card md:text-right md:pr-12 pl-12 md:pl-0 order-2 md:order-1">
                  <div className="bg-[#F8F5F1] p-6 rounded-2xl border border-[#E8DCC5]/30 max-w-md ml-0 md:ml-auto">
                    <span className="text-xs font-sans font-bold text-[#B58A2A]">STEP 01</span>
                    <h3 className="luxury-heading text-lg font-bold text-[#1A1A1A] mt-1 mb-2">Customer Books</h3>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      Client accesses your premium branded website, chooses their service, preferred master stylist, and preferred slot in 3 simple taps.
                    </p>
                  </div>
                </div>
                {/* Dot in Center */}
                <div className="journey-node absolute left-6 md:left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-[3px] border-[#E8DCC5] bg-white z-20 flex items-center justify-center order-1 md:order-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B58A2A]" />
                </div>
                {/* Empty side for layout */}
                <div className="hidden md:block pl-12 order-3" />
              </div>

              {/* Journey Step 2 */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 w-full mb-16 md:mb-24 items-center">
                <div className="hidden md:block pr-12 text-right" />
                <div className="journey-node absolute left-6 md:left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-[3px] border-[#E8DCC5] bg-white z-20 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B58A2A]" />
                </div>
                <div className="journey-card pl-12 max-w-md">
                  <div className="bg-[#F8F5F1] p-6 rounded-2xl border border-[#E8DCC5]/30">
                    <span className="text-xs font-sans font-bold text-[#B58A2A]">STEP 02</span>
                    <h3 className="luxury-heading text-lg font-bold text-[#1A1A1A] mt-1 mb-2">Check In</h3>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      Automated greeting reminders send WhatsApp updates. The receptionist welcomes the VIP client as their details sync instantly with the tablet terminal.
                    </p>
                  </div>
                </div>
              </div>

              {/* Journey Step 3 */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 w-full mb-16 md:mb-24 items-center">
                <div className="journey-card md:text-right md:pr-12 pl-12 md:pl-0 order-2 md:order-1">
                  <div className="bg-[#F8F5F1] p-6 rounded-2xl border border-[#E8DCC5]/30 max-w-md ml-0 md:ml-auto">
                    <span className="text-xs font-sans font-bold text-[#B58A2A]">STEP 03</span>
                    <h3 className="luxury-heading text-lg font-bold text-[#1A1A1A] mt-1 mb-2">The Service</h3>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      The stylist pulls client history records, allergy logs, and past formulations. The premium product formulation details are stored digitally for consistency.
                    </p>
                  </div>
                </div>
                <div className="journey-node absolute left-6 md:left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-[3px] border-[#E8DCC5] bg-white z-20 flex items-center justify-center order-1 md:order-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B58A2A]" />
                </div>
                <div className="hidden md:block pl-12 order-3" />
              </div>

              {/* Journey Step 4 */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 w-full mb-16 md:mb-24 items-center">
                <div className="hidden md:block pr-12 text-right" />
                <div className="journey-node absolute left-6 md:left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-[3px] border-[#E8DCC5] bg-white z-20 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B58A2A]" />
                </div>
                <div className="journey-card pl-12 max-w-md">
                  <div className="bg-[#F8F5F1] p-6 rounded-2xl border border-[#E8DCC5]/30">
                    <span className="text-xs font-sans font-bold text-[#B58A2A]">STEP 04</span>
                    <h3 className="luxury-heading text-lg font-bold text-[#1A1A1A] mt-1 mb-2">Elegant Payment</h3>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      Zero friction checkout. Instantly print custom bills or accept card and UPI payments. Stylist commissions and inventory stocks are auto-deducted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Journey Step 5 */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 w-full items-center">
                <div className="journey-card md:text-right md:pr-12 pl-12 md:pl-0 order-2 md:order-1">
                  <div className="bg-[#F8F5F1] p-6 rounded-2xl border border-[#E8DCC5]/30 max-w-md ml-0 md:ml-auto">
                    <span className="text-xs font-sans font-bold text-[#B58A2A]">STEP 05</span>
                    <h3 className="luxury-heading text-lg font-bold text-[#1A1A1A] mt-1 mb-2">Revisit Cycle</h3>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      AI systems track customer absence and send automated re-engagement texts to ensure they book their next cut or styling on schedule.
                    </p>
                  </div>
                </div>
                <div className="journey-node absolute left-6 md:left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-[3px] border-[#E8DCC5] bg-white z-20 flex items-center justify-center order-1 md:order-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B58A2A]" />
                </div>
                <div className="hidden md:block pl-12 order-3" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SALON CHAOS VS TRIMLY */}
        <section className="py-24 md:py-32 bg-[#F8F5F1] border-y border-[#E8DCC5]/40">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <span className="text-xs font-sans font-bold text-[#8A6A1F] uppercase tracking-widest block">Compare Operations</span>
              <h2 className="luxury-heading text-3xl md:text-4xl font-medium text-[#1A1A1A]">Is Your Salon Chaotic or Curated?</h2>
              <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70">
                Stop patching your premium business operations with messy templates and disjointed systems.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-stretch">
              {/* Left Column: Salon Chaos */}
              <div className="bg-white/40 border border-red-200/50 rounded-[32px] p-8 md:p-12 flex flex-col justify-between space-y-8 shadow-sm">
                <div>
                  <h3 className="luxury-heading text-2xl font-medium text-red-900 flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-red-600">error</span>
                    Traditional Chaos
                  </h3>
                  <ul className="space-y-6 text-[#1A1A1A]/80 font-sans">
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs select-none">✕</span>
                      <div>
                        <strong className="text-red-950 font-bold block text-sm">Clunky Excel Spreadsheets</strong>
                        <p className="text-xs text-stone-500 mt-1">Manual formulas get broken; numbers are difficult to track on mobile.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs select-none">✕</span>
                      <div>
                        <strong className="text-red-950 font-bold block text-sm">Manual WhatsApp Inboxes</strong>
                        <p className="text-xs text-stone-500 mt-1">Staff spend hours sending booking confirmations and copy-pasting slots.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs select-none">✕</span>
                      <div>
                        <strong className="text-red-950 font-bold block text-sm">Paper Notebook Check-Ins</strong>
                        <p className="text-xs text-stone-500 mt-1">No customer history. Allergy alerts and formulas are written on loose scraps.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs select-none">✕</span>
                      <div>
                        <strong className="text-red-950 font-bold block text-sm">Interrupted Phone Calls</strong>
                        <p className="text-xs text-stone-500 mt-1"> stylists stop their services to handle reservations, losing valuable time.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs select-none">✕</span>
                      <div>
                        <strong className="text-red-950 font-bold block text-sm">Lost Appointments</strong>
                        <p className="text-xs text-stone-500 mt-1">Double bookings or forgotten slots frustrate clients and damage your brand.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 text-xs font-semibold text-red-800 font-sans tracking-wide uppercase">
                  Drains up to 25% of premium salon revenue.
                </div>
              </div>

              {/* Right Column: Trimly OS */}
              <div className="bg-white border-2 border-[#B58A2A] rounded-[32px] p-8 md:p-12 flex flex-col justify-between space-y-8 shadow-xl shadow-[#B58A2A]/5 relative">
                <span className="absolute -top-4 right-10 bg-[#B58A2A] text-white text-[10px] font-sans font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-white">
                  CURATED ATELIER
                </span>
                <div>
                  <h3 className="luxury-heading text-2xl font-medium text-[#8A6A1F] flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Trimly Dashboard
                  </h3>
                  <ul className="space-y-6 text-[#1A1A1A] font-sans">
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[#B58A2A] font-bold text-xs select-none">✓</span>
                      <div>
                        <strong className="text-[#1A1A1A] font-bold block text-sm">Integrated Dashboard &amp; CRM</strong>
                        <p className="text-xs text-stone-500 mt-1">Beautiful real-time reports on styling revenues, retail sales, and commissions.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[#B58A2A] font-bold text-xs select-none">✓</span>
                      <div>
                        <strong className="text-[#1A1A1A] font-bold block text-sm">Automated WhatsApp Reminders</strong>
                        <p className="text-xs text-stone-500 mt-1">Auto-messages confirm bookings and remind clients dynamically in English &amp; Hindi.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[#B58A2A] font-bold text-xs select-none">✓</span>
                      <div>
                        <strong className="text-[#1A1A1A] font-bold block text-sm">Digital Treatment Cards</strong>
                        <p className="text-xs text-stone-500 mt-1">Store photo records of styling sessions, color mix formulas, and VIP treatment notes.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[#B58A2A] font-bold text-xs select-none">✓</span>
                      <div>
                        <strong className="text-[#1A1A1A] font-bold block text-sm">Self-Service Client Portal</strong>
                        <p className="text-xs text-stone-500 mt-1">Clients select dates, services, and pay deposits online without receptionist help.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[#B58A2A] font-bold text-xs select-none">✓</span>
                      <div>
                        <strong className="text-[#1A1A1A] font-bold block text-sm">Optimized Calendar Flow</strong>
                        <p className="text-xs text-stone-500 mt-1">Calendar engine naturally clusters appointments, reducing idle chairs by 30%.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 text-xs font-semibold text-[#8A6A1F] font-sans tracking-wide uppercase">
                  Improves profit margins by up to 40% in 60 days.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3.3: PREMIUM FEATURE CARDS */}
        <section className="py-24 md:py-32 bg-white border-b border-[#E8DCC5]/40 overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">Everything You Need</span>
              <h2 className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A]">
                Powerful Features, <br className="hidden md:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#B58A2A] to-[#8A6A1F]">Beautifully Designed</span>
              </h2>
              <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70">
                Every feature is purpose-built for Indian salons and barbershops. From regional language booking to WhatsApp campaigns — all in one elegant system.
              </p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">

              {/* Card 1: Smart Booking Calendar — Large Card */}
              <div className="group relative lg:col-span-2 bg-white rounded-[28px] border border-[#E8DCC5]/50 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#B58A2A]/8 transition-all duration-500 hover:-translate-y-1.5 cursor-pointer">
                <div className="aspect-[2/1] relative overflow-hidden">
                  <img src="/images/feature_smart_booking.png" alt="Smart Booking Calendar" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                  {/* Floating Badge */}
                  <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md border border-[#E8DCC5]/60 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <span className="material-symbols-outlined text-[#B58A2A] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                    <span className="text-[10px] font-sans font-bold text-[#1A1A1A] uppercase tracking-wider">Smart Booking</span>
                  </div>
                </div>
                <div className="p-8 space-y-3">
                  <h3 className="luxury-heading text-xl md:text-2xl font-medium text-[#1A1A1A] group-hover:text-[#8A6A1F] transition-colors">
                    Intelligent Appointment Calendar
                  </h3>
                  <p className="font-sans text-sm text-[#1A1A1A]/60 leading-relaxed max-w-lg">
                    AI-powered scheduling that auto-clusters appointments, prevents double-bookings, and sends smart WhatsApp reminders. Reduce no-shows by 65% and fill every chair.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-[9px] font-sans font-bold text-[#8A6A1F] bg-[#E8DCC5]/30 px-3 py-1 rounded-full uppercase tracking-wider">Auto Reminders</span>
                    <span className="text-[9px] font-sans font-bold text-[#8A6A1F] bg-[#E8DCC5]/30 px-3 py-1 rounded-full uppercase tracking-wider">Zero Double-Booking</span>
                    <span className="text-[9px] font-sans font-bold text-[#8A6A1F] bg-[#E8DCC5]/30 px-3 py-1 rounded-full uppercase tracking-wider">Online Booking Link</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Multi-Language Support */}
              <div className="group relative bg-white rounded-[28px] border border-[#E8DCC5]/50 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#B58A2A]/8 transition-all duration-500 hover:-translate-y-1.5 cursor-pointer">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img src="/images/feature_language_support.png" alt="Multi Language Booking" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
                  <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md border border-[#E8DCC5]/60 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <span className="material-symbols-outlined text-[#B58A2A] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
                    <span className="text-[10px] font-sans font-bold text-[#1A1A1A] uppercase tracking-wider">8+ Languages</span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="luxury-heading text-lg font-medium text-[#1A1A1A] group-hover:text-[#8A6A1F] transition-colors">
                    Regional Language Support
                  </h3>
                  <p className="font-sans text-xs text-[#1A1A1A]/60 leading-relaxed">
                    Let your clients book in Hindi, Marathi, Tamil, Kannada, Telugu, Malayalam, Gujarati, or English. True Indian localization.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[8px] font-bold text-[#8A6A1F] bg-[#E8DCC5]/25 px-2 py-0.5 rounded-full">हिंदी</span>
                    <span className="text-[8px] font-bold text-[#8A6A1F] bg-[#E8DCC5]/25 px-2 py-0.5 rounded-full">मराठी</span>
                    <span className="text-[8px] font-bold text-[#8A6A1F] bg-[#E8DCC5]/25 px-2 py-0.5 rounded-full">தமிழ்</span>
                    <span className="text-[8px] font-bold text-[#8A6A1F] bg-[#E8DCC5]/25 px-2 py-0.5 rounded-full">ಕನ್ನಡ</span>
                    <span className="text-[8px] font-bold text-[#8A6A1F] bg-[#E8DCC5]/25 px-2 py-0.5 rounded-full">English</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Bulk WhatsApp Messages */}
              <div className="group relative bg-white rounded-[28px] border border-[#E8DCC5]/50 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#B58A2A]/8 transition-all duration-500 hover:-translate-y-1.5 cursor-pointer">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img src="/images/feature_bulk_messages.png" alt="Bulk WhatsApp Campaigns" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
                  <div className="absolute top-5 left-5 bg-emerald-50/90 backdrop-blur-md border border-emerald-200/60 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <span className="text-sm">💬</span>
                    <span className="text-[10px] font-sans font-bold text-emerald-800 uppercase tracking-wider">WhatsApp API</span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="luxury-heading text-lg font-medium text-[#1A1A1A] group-hover:text-[#8A6A1F] transition-colors">
                    Bulk Revisit Messages
                  </h3>
                  <p className="font-sans text-xs text-[#1A1A1A]/60 leading-relaxed">
                    Auto-detect lapsed clients and send targeted WhatsApp campaigns like "We miss you!" with custom booking links to fill empty chairs.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1.5 text-[9px] font-sans font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live API Connected
                    </div>
                    <span className="text-[9px] font-sans font-bold text-[#8A6A1F] bg-[#E8DCC5]/30 px-2.5 py-1 rounded-full uppercase tracking-wider">1-Click Send</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Salon Treatment Tracking — Large Card */}
              <div className="group relative lg:col-span-2 bg-white rounded-[28px] border border-[#E8DCC5]/50 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#B58A2A]/8 transition-all duration-500 hover:-translate-y-1.5 cursor-pointer">
                <div className="grid md:grid-cols-2 h-full">
                  <div className="aspect-square md:aspect-auto relative overflow-hidden">
                    <img src="/images/feature_salon_treatment.png" alt="Salon Treatment Tracking" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 hidden md:block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent md:hidden" />
                  </div>
                  <div className="p-8 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#B58A2A] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                      <span className="text-[10px] font-sans font-bold text-[#B58A2A] uppercase tracking-widest">Treatment Records</span>
                    </div>
                    <h3 className="luxury-heading text-xl md:text-2xl font-medium text-[#1A1A1A] group-hover:text-[#8A6A1F] transition-colors">
                      Digital Treatment Cards & Service History
                    </h3>
                    <p className="font-sans text-sm text-[#1A1A1A]/60 leading-relaxed">
                      Store photo records of every session. Track allergy notes, color mix formulas, product preferences, and past treatments. Your stylists always know the client's history.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[9px] font-sans font-bold text-[#8A6A1F] bg-[#E8DCC5]/30 px-3 py-1 rounded-full uppercase tracking-wider">Photo Records</span>
                      <span className="text-[9px] font-sans font-bold text-[#8A6A1F] bg-[#E8DCC5]/30 px-3 py-1 rounded-full uppercase tracking-wider">Color Formulas</span>
                      <span className="text-[9px] font-sans font-bold text-[#8A6A1F] bg-[#E8DCC5]/30 px-3 py-1 rounded-full uppercase tracking-wider">Allergy Alerts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 5: Loyalty & Rewards */}
              <div className="group relative bg-white rounded-[28px] border border-[#E8DCC5]/50 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#B58A2A]/8 transition-all duration-500 hover:-translate-y-1.5 cursor-pointer">
                <div className="p-8 space-y-5 h-full flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #FDF8F0 0%, #F8F5F1 50%, #F0EBE3 100%)' }}>
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B58A2A] to-[#8A6A1F] flex items-center justify-center shadow-lg shadow-[#B58A2A]/20">
                      <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>loyalty</span>
                    </div>
                    <h3 className="luxury-heading text-lg font-medium text-[#1A1A1A] group-hover:text-[#8A6A1F] transition-colors">
                      Loyalty & Rewards Engine
                    </h3>
                    <p className="font-sans text-xs text-[#1A1A1A]/60 leading-relaxed">
                      Points, cashback, tier-based VIP perks, birthday bonuses, and referral rewards. Turn every visit into lasting loyalty.
                    </p>
                  </div>
                  {/* Mini Stats Preview */}
                  <div className="bg-white rounded-2xl border border-[#E8DCC5]/40 p-4 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-sans font-bold text-stone-400 uppercase tracking-wider">Active Members</span>
                      <span className="text-sm font-sans font-bold text-[#1A1A1A]">1,250+</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-sans font-bold text-stone-400 uppercase tracking-wider">Repeat Rate</span>
                      <span className="text-sm font-sans font-bold text-emerald-600">80% ↑</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-sans font-bold text-stone-400 uppercase tracking-wider">Revenue Impact</span>
                      <span className="text-sm font-sans font-bold text-[#B58A2A]">+₹12.5L</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 6: Staff & Commission Management */}
              <div className="group relative lg:col-span-3 bg-white rounded-[28px] border border-[#E8DCC5]/50 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#B58A2A]/8 transition-all duration-500 hover:-translate-y-1.5 cursor-pointer">
                <div className="p-8 md:p-10">
                  <div className="grid md:grid-cols-3 gap-8 items-center">
                    {/* Info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#B58A2A] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                        <span className="text-[10px] font-sans font-bold text-[#B58A2A] uppercase tracking-widest">Staff Management</span>
                      </div>
                      <h3 className="luxury-heading text-xl font-medium text-[#1A1A1A] group-hover:text-[#8A6A1F] transition-colors">
                        Stylist Commissions & Scheduling
                      </h3>
                      <p className="font-sans text-sm text-[#1A1A1A]/60 leading-relaxed">
                        Automated payroll with commission split logic. Track individual stylist performance, shift rotas, and tip collections.
                      </p>
                    </div>
                    {/* Live Mini Dashboard Preview */}
                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Active Staff", value: "12", icon: "person", color: "bg-blue-50 text-blue-600" },
                        { label: "Avg. Commission", value: "₹18K", icon: "payments", color: "bg-emerald-50 text-emerald-600" },
                        { label: "Shifts This Week", value: "48", icon: "schedule", color: "bg-amber-50 text-amber-700" },
                        { label: "Tip Collection", value: "₹4,200", icon: "volunteer_activism", color: "bg-purple-50 text-purple-600" }
                      ].map((stat, idx) => (
                        <div key={idx} className="bg-[#F8F5F1] border border-[#E8DCC5]/30 rounded-2xl p-4 text-center space-y-2 transition-all duration-300 hover:bg-white hover:shadow-lg hover:border-[#B58A2A]/30 hover:scale-[1.03]">
                          <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mx-auto`}>
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                          </div>
                          <div className="text-lg font-sans font-bold text-[#1A1A1A]">{stat.value}</div>
                          <div className="text-[8px] font-sans font-bold text-stone-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3.5: OWNER DASHBOARD DEMO */}
        <section className="py-24 md:py-32 bg-white border-b border-[#E8DCC5]/40">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">Command Center</span>
              <h2 className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A]">Your Salon's Mission Control</h2>
              <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70">
                Track staff scheduling, inventory alerts, and direct revenue analytics in real-time from a beautifully unified cockpit.
              </p>
            </div>

            {/* Dashboard Mockup Display Container */}
            <div className="max-w-[1100px] mx-auto bg-[#254C75] rounded-[32px] p-8 md:p-16 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[460px] md:min-h-[520px]">
              {/* Subtle ambient light inside the dashboard backdrop */}
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />

              <div className="relative w-full max-w-[850px] aspect-[16/9] md:aspect-[16/8.5] flex items-center justify-center">
                {/* Center Image: Male Grooming */}
                <div className="w-[45%] aspect-[1/1] rounded-[24px] overflow-hidden border-4 border-white/10 shadow-2xl bg-stone-900 z-10">
                  <img src="/images/male_grooming.png" alt="Male Grooming Session" className="w-full h-full object-cover" />
                </div>

                {/* Card 1: Top Left Revenue Boost */}
                <div className="absolute top-[-5%] left-[8%] z-20 bg-white rounded-2xl p-4 flex items-center gap-3 border border-stone-100 shadow-xl max-w-[210px] animate-float-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg font-bold">trending_up</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-sans font-black text-[#1A1A1A]">30%</span>
                      <span className="text-[10px] font-sans font-bold text-[#1A1A1A] tracking-tight">Revenue Boost</span>
                    </div>
                    <span className="text-[9px] font-sans font-semibold text-emerald-600 block text-left">Using WhatsApp API</span>
                  </div>
                </div>

                {/* Card 2: Left Calendar Scheduler */}
                <div className="absolute top-[18%] left-[-4%] z-20 bg-white rounded-2xl p-5 border border-stone-100 shadow-2xl w-[260px] font-sans text-left hidden sm:block animate-float-3">
                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[8px] font-bold text-stone-500 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" /> Confirmed
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" /> Online Booking
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Arrived
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-stone-300" /> Attended
                    </div>
                  </div>

                  {/* Month */}
                  <div className="text-[11px] font-bold text-[#1A1A1A] mb-2 font-sans">Feb 2025</div>

                  {/* Calendar Dates Mini Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[8px] font-bold text-stone-400 mb-4">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                    <span className="text-stone-250"></span><span className="text-stone-250"></span><span className="text-stone-250"></span><span className="text-stone-250"></span><span className="text-stone-250"></span><span className="text-stone-250"></span><span>1</span>
                    <span>2</span><span>3</span><span>4</span><span>5</span><span className="w-5 h-5 rounded-md bg-blue-900 text-white flex items-center justify-center mx-auto text-[8px] font-bold">6</span><span>7</span><span>8</span>
                    <span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span>
                    <span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span>
                  </div>

                  {/* Employee Select */}
                  <div className="border-t border-stone-100 pt-3">
                    <span className="text-[8px] font-bold text-stone-400 block tracking-wider uppercase mb-2">Select Employee</span>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                          <span className="font-bold text-stone-700">Mahima</span>
                        </div>
                        <span className="text-stone-400 font-semibold">10:15 AM - 01:15 PM</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                          <span className="font-bold text-stone-700">Riya</span>
                        </div>
                        <span className="text-stone-400 font-semibold">12:15 PM - 04:10 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Top Right Reorder Alerts */}
                <div className="absolute top-[2%] right-[-5%] z-20 bg-white rounded-2xl p-5 border border-stone-100 shadow-2xl w-[250px] font-sans text-left hidden sm:block animate-float-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] mb-4 pb-2 border-b border-stone-100">Reorder Alerts</h4>
                  <div className="space-y-3">
                    {/* Item 1 */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-[#1A1A1A] block">Shaving Cream</span>
                        <span className="text-[8px] text-stone-400 block">Only 2 left</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full uppercase">Urgent</span>
                        <span className="text-[9px] font-bold text-[#B58A2A] hover:underline cursor-pointer">Reorder</span>
                      </div>
                    </div>
                    {/* Item 2 */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-[#1A1A1A] block">Hair Gel</span>
                        <span className="text-[8px] text-stone-400 block">Only 4 left</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">Low</span>
                        <span className="text-[9px] font-bold text-[#B58A2A] hover:underline cursor-pointer">Reorder</span>
                      </div>
                    </div>
                    {/* Item 3 */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-[#1A1A1A] block">Talcum Powder</span>
                        <span className="text-[8px] text-stone-400 block">Only 1 left</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase">Critical</span>
                        <span className="text-[9px] font-bold text-[#B58A2A] hover:underline cursor-pointer">Reorder</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4: Bottom Right Appointments */}
                <div className="absolute bottom-[4%] right-[8%] z-20 bg-white rounded-2xl p-4.5 border border-stone-100 shadow-xl min-w-[170px] text-left animate-float-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-sans font-black text-[#1A1A1A]">456</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      67% 📈
                    </span>
                  </div>
                  <strong className="text-xs font-sans font-bold text-[#1A1A1A] block mt-1">Appointments</strong>
                  <span className="text-[9px] font-sans text-stone-400 block font-semibold">This Week</span>
                </div>
              </div>

              {/* Chat Live Badge at Left Edge */}
              <div className="absolute bottom-6 left-6 z-20 bg-[#1A365D] border border-blue-400/20 px-4 py-2.5 rounded-full text-white text-[10px] font-sans font-bold flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Chat live with an agent now!
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4: LUXURY RESULT SHOWCASE */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">Transformation Portfolios</span>
              <h2 className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A]">Signature Transformations</h2>
              <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70">
                Select a treatment style below. Use the custom golden shears to slide and slice the canvas, revealing raw before-after results.
              </p>
            </div>

            {/* Treatment Selector Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {TREATMENTS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTreatment(t.id)}
                  className={`px-6 py-3 rounded-full text-xs font-bold font-sans uppercase tracking-wider transition-all duration-300 border ${
                    activeTreatment === t.id
                      ? 'bg-[#B58A2A] border-[#B58A2A] text-white shadow-lg shadow-[#B58A2A]/15 scale-[1.02]'
                      : 'bg-white border-[#E8DCC5] text-[#8A6A1F] hover:bg-[#F8F5F1] hover:border-[#B58A2A]/40'
                  }`}
                >
                  {t.tabName}
                </button>
              ))}
            </div>

            {/* Showcase Component Reveal */}
            <MainShowcaseReveal 
              treatment={TREATMENTS.find(t => t.id === activeTreatment) || TREATMENTS[0]} 
            />
          </div>
        </section>

        {/* SECTION 4.2: CORE MANAGEMENT ENGINE (Redesigned Feature Sections) */}
        <section className="py-24 md:py-32 bg-white border-b border-[#E8DCC5]/40 overflow-hidden text-left">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12 space-y-28 md:space-y-36">

            {/* ═══════════════════════════════════════════════ */}
            {/* 1. CUSTOMER MANAGEMENT */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Dashboard Mockup */}
              <div className="relative flex justify-center">
                {/* Vertical accent bar */}
                <div className="absolute left-0 top-6 bottom-6 w-1 rounded-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 hidden lg:block" />
                
                <div className="relative w-full max-w-[440px] ml-4 lg:ml-8">
                  {/* Main Card: Customer Profile */}
                  <div className="bg-white rounded-2xl border border-stone-200/80 shadow-lg p-5 relative z-10">
                    {/* Header with photo */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-200 border-2 border-white shadow-md">
                        <img src="/images/male_grooming.png" alt="Customer" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-sm text-[#1A1A1A]">Yashesvi</h4>
                        <span className="text-[10px] font-sans text-stone-400">+91-92XXXXXX78</span>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <button className="bg-blue-600 text-white text-[9px] font-sans font-bold px-3 py-1.5 rounded-lg">✏ Edit</button>
                      <button className="bg-blue-600 text-white text-[9px] font-sans font-bold px-3 py-1.5 rounded-lg">📅 Add Appointment</button>
                      <button className="bg-blue-100 text-blue-700 text-[9px] font-sans font-bold px-3 py-1.5 rounded-lg">Invoice</button>
                      <button className="bg-emerald-500 text-white text-[9px] font-sans font-bold px-3 py-1.5 rounded-lg">📱 Send</button>
                    </div>
                    {/* Service History Table */}
                    <div className="bg-stone-50 rounded-xl p-3 mb-3">
                      <h5 className="font-sans font-bold text-xs text-[#1A1A1A] mb-2">Service History</h5>
                      <table className="w-full text-[10px] font-sans">
                        <thead><tr className="text-stone-400 font-bold"><td className="pb-1.5">Date</td><td className="pb-1.5">Service Name</td><td className="pb-1.5">Staff</td><td className="pb-1.5"></td></tr></thead>
                        <tbody className="text-stone-700 font-medium">
                          <tr><td className="py-1">18 Aug</td><td>Hair Coloring</td><td>—</td><td className="text-emerald-600 font-bold">Completed</td></tr>
                          <tr><td className="py-1">11 Aug</td><td>Shaving</td><td>—</td><td className="text-emerald-600 font-bold">Completed</td></tr>
                          <tr><td className="py-1">02 Aug</td><td>Hair Cut</td><td>—</td><td className="text-emerald-600 font-bold">Completed</td></tr>
                        </tbody>
                      </table>
                      <button className="text-[9px] text-blue-600 font-bold font-sans mt-1.5">View Full History</button>
                    </div>
                    {/* Membership Badge */}
                    <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-xl px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏆</span>
                        <div>
                          <span className="font-sans font-bold text-xs block">Membership: GOLD</span>
                          <span className="font-sans text-[9px] text-amber-200">Expiring: 31 Dec 2025</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-amber-200 block">Available Points</span>
                        <span className="font-sans font-bold text-sm flex items-center gap-1">🎯 1,250</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Insights Card */}
                  <div className="absolute -top-4 -right-6 bg-white rounded-xl border border-stone-200 shadow-xl p-3 w-[160px] z-20">
                    <h5 className="font-sans font-bold text-[10px] text-[#1A1A1A] mb-2">Insights</h5>
                    <div className="space-y-1.5 text-[9px] font-sans">
                      <div className="flex justify-between"><span className="text-stone-400">Total Visits:</span><span className="font-bold text-[#1A1A1A]">22</span></div>
                      <div className="flex justify-between"><span className="text-stone-400">Last Visit:</span><span className="font-bold text-[#1A1A1A]">18 Aug 2025</span></div>
                      <div className="flex justify-between"><span className="text-stone-400">Avg Spend/Visit:</span><span className="font-bold text-[#1A1A1A]">₹1,850</span></div>
                      <div className="flex justify-between"><span className="text-stone-400">Favorite Service:</span><span className="font-bold text-[#1A1A1A]">Hair Spa</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Title + Accordion */}
              <div className="space-y-6">
                <h2 className="font-sans text-3xl md:text-4xl font-bold text-[#1A1A1A] leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">Customer</span> Management
                </h2>
                <div className="border border-stone-200/80 rounded-2xl bg-white overflow-hidden shadow-sm">
                  {[
                    { title: "Unified Profiles", sub: "Complete client histories", desc: "Maintain complete client histories with preferences, visit records, and past purchases, ensuring personalized service and consistent customer experiences." },
                    { title: "Smart Scheduling", sub: "Automated reminders", desc: "Auto-send WhatsApp booking confirmations and reminders. Reduce no-shows and keep your chairs filled consistently." },
                    { title: "Loyalty Rewards", sub: "Repeat customer growth", desc: "Award points for every visit, product purchase, or referral. VIP tiers and birthday bonuses keep your best clients engaged." },
                    { title: "Feedback Tools", sub: "Real-time engagement", desc: "Auto-collect reviews after checkout. Publish positive testimonials to your website and Google profile instantly." },
                    { title: "Targeted Campaigns", sub: "Personalized marketing", desc: "Segment clients by visit frequency, spend, or lapse period. Send targeted bulk WhatsApp promotions to drive revisits." }
                  ].map((item, idx) => {
                    const isOpen = customerMgmtActive === idx;
                    return (
                      <div key={idx} className={`border-b border-stone-100 last:border-0 transition-colors duration-200 ${isOpen ? 'bg-stone-50/50' : ''}`}>
                        <button onClick={() => setCustomerMgmtActive(idx)} className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none group">
                          <span className="font-sans text-sm">
                            <strong className={`font-bold transition-colors ${isOpen ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/80 group-hover:text-[#1A1A1A]'}`}>{item.title}</strong>
                            <span className="text-stone-400 font-medium"> – {item.sub}</span>
                          </span>
                          <span className={`material-symbols-outlined text-stone-400 text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <p className="px-6 pb-4 font-sans text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* 2. POS (POINT OF SALE) */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: POS Mockup */}
              <div className="relative flex justify-center order-2 lg:order-1">
                <div className="absolute left-0 top-6 bottom-6 w-1 rounded-full bg-gradient-to-b from-emerald-400 via-blue-500 to-purple-600 hidden lg:block" />
                
                <div className="relative w-full max-w-[420px] ml-4 lg:ml-8">
                  {/* Main POS Card */}
                  <div className="bg-white rounded-2xl border border-stone-200/80 shadow-lg p-5 relative z-10">
                    {/* POS Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500 text-lg">📶</span>
                      </div>
                      <div className="flex gap-4 text-xs font-sans font-bold text-stone-700">
                        <span className="border-b-2 border-blue-600 pb-1">Cash</span>
                        <span className="text-stone-400">Card</span>
                        <span className="text-stone-400">UPI</span>
                      </div>
                    </div>
                    {/* Photo bar */}
                    <div className="w-full h-20 rounded-xl overflow-hidden mb-4 bg-stone-100">
                      <img src="/images/barber_after.png" alt="Salon" className="w-full h-full object-cover" />
                    </div>
                    {/* Bill Details */}
                    <div className="space-y-2 mb-4">
                      <h5 className="font-sans font-bold text-xs text-[#1A1A1A]">Bill</h5>
                      <div className="space-y-1.5 text-[11px] font-sans">
                        <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span className="font-bold text-[#1A1A1A]">₹1,050</span></div>
                        <div className="flex justify-between"><span className="text-stone-500">Discount</span><span className="font-bold text-red-500">-₹50</span></div>
                        <div className="flex justify-between"><span className="text-stone-500">GST (18%)</span><span className="font-bold text-[#1A1A1A]">₹180</span></div>
                        <div className="flex justify-between border-t border-stone-100 pt-1.5"><span className="font-bold text-[#1A1A1A]">Total Bill</span><span className="font-bold text-[#1A1A1A] text-sm">₹1,180</span></div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-emerald-500 text-xs">●</span>
                        <span className="text-[10px] font-sans font-bold text-emerald-600">Paid</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-sans text-stone-400">
                        <span>📋</span> <span className="font-medium">Split Payment</span>
                      </div>
                      <button className="bg-blue-600 text-white text-[10px] font-sans font-bold px-5 py-2 rounded-lg mt-2 shadow-md">Send Invoice</button>
                    </div>
                  </div>

                  {/* Floating Customer History Card */}
                  <div className="absolute top-12 -right-8 bg-white rounded-xl border border-stone-200 shadow-xl p-3.5 w-[185px] z-20">
                    <h5 className="font-sans font-bold text-[10px] text-[#1A1A1A] mb-2.5">Customer History</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-sans">
                        <span className="text-stone-600 font-medium">Hair Cut</span>
                        <span className="text-stone-400">₹500</span>
                        <span className="text-blue-600 font-bold cursor-pointer">View</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-sans">
                        <span className="text-stone-600 font-medium">Hair Wash</span>
                        <span className="text-stone-400">₹300</span>
                        <span className="text-blue-600 font-bold cursor-pointer">View</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Title + Accordion */}
              <div className="space-y-6 order-1 lg:order-2">
                <h2 className="font-sans text-3xl md:text-4xl font-bold text-[#1A1A1A] leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600">POS</span> (Point Of Sale)
                </h2>
                <div className="border border-stone-200/80 rounded-2xl bg-white overflow-hidden shadow-sm">
                  {[
                    { title: "Faster Billing", sub: "GST-ready, touch-screen", desc: "Experience GST-ready Barber Shop billing software with fast, touch-screen invoicing. Works online and offline, ensuring seamless customer experience and compliance every time." },
                    { title: "Auto Inventory", sub: "Real-time stock updates", desc: "Products used during services are auto-deducted from inventory. Stock levels update in real-time across all branches." },
                    { title: "Cash Flow Control", sub: "Auto drawer balance, refunds & payouts", desc: "Track cash drawer balance, split payments across card/UPI/cash, manage refunds, and reconcile end-of-day payouts automatically." },
                    { title: "Revenue Tracking", sub: "Add-ons, retail & staff sales", desc: "Break down revenue by services, retail product sales, add-on treatments, and individual stylist performance." },
                    { title: "Growth Insights", sub: "Reports to boost services & revenue", desc: "Identify your most profitable services, peak hours, and average ticket size to optimize pricing and staffing." }
                  ].map((item, idx) => {
                    const isOpen = posActive === idx;
                    return (
                      <div key={idx} className={`border-b border-stone-100 last:border-0 transition-colors duration-200 ${isOpen ? 'bg-stone-50/50' : ''}`}>
                        <button onClick={() => setPosActive(idx)} className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none group">
                          <span className="font-sans text-sm">
                            <strong className={`font-bold transition-colors ${isOpen ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/80 group-hover:text-[#1A1A1A]'}`}>{item.title}</strong>
                            <span className="text-stone-400 font-medium"> – {item.sub}</span>
                          </span>
                          <span className={`material-symbols-outlined text-stone-400 text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <p className="px-6 pb-4 font-sans text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* 3. GST ACCOUNTING */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: GST Mockup */}
              <div className="relative flex justify-center">
                <div className="absolute left-0 top-6 bottom-6 w-1 rounded-full bg-gradient-to-b from-orange-500 via-red-500 to-purple-600 hidden lg:block" />
                
                <div className="relative w-full max-w-[420px] ml-4 lg:ml-8">
                  {/* Main GST Card */}
                  <div className="bg-white rounded-2xl border border-stone-200/80 shadow-lg p-5 relative z-10">
                    {/* GST Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
                        <span className="font-sans font-bold text-sm text-[#1A1A1A]">Compliance & GST Reports</span>
                      </div>
                      <span className="text-[8px] font-sans font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">India GST Ready</span>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <button className="bg-blue-600 text-white text-[9px] font-sans font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">📄 Generate GST Invoice</button>
                      <button className="bg-blue-100 text-blue-700 text-[9px] font-sans font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">📊 Download GST Report</button>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <button className="bg-stone-100 text-stone-600 text-[9px] font-sans font-bold px-3 py-1.5 rounded-lg">🔄 Reconcile with GSTN</button>
                      <button className="bg-stone-100 text-stone-600 text-[9px] font-sans font-bold px-3 py-1.5 rounded-lg">⚙ Settings</button>
                    </div>
                    {/* Salon Photo */}
                    <div className="w-full h-16 rounded-xl overflow-hidden mb-4 bg-stone-100">
                      <img src="/images/salon_interior_after.png" alt="Salon" className="w-full h-full object-cover" />
                    </div>
                    {/* GST Overview */}
                    <div className="bg-stone-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-sans font-bold text-xs text-[#1A1A1A]">GST Overview – August 2025</h5>
                      </div>
                      <div className="flex items-center gap-3 mb-3 text-[10px] font-sans">
                        <input type="text" readOnly className="border border-stone-200 rounded-lg px-2 py-1 text-[10px] w-28 bg-white" value="Search invoice/custome" />
                        <select className="border border-stone-200 rounded-lg px-2 py-1 text-[10px] bg-white">
                          <option>August 2025</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-white rounded-lg p-2.5 border border-stone-100">
                          <span className="text-[8px] font-sans text-stone-400 block">Total GST Collected (This Month)</span>
                          <span className="font-sans font-bold text-sm text-[#1A1A1A]">₹1,25,400</span>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-stone-100">
                          <span className="text-[8px] font-sans text-stone-400 block">Total GST Paid (This Month)</span>
                          <span className="font-sans font-bold text-sm text-[#1A1A1A]">₹98,700</span>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-stone-100">
                          <span className="text-[8px] font-sans text-stone-400 block">Net GST Payable</span>
                          <span className="font-sans font-bold text-sm text-blue-700">₹26,700</span>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-stone-100">
                          <span className="text-[8px] font-sans text-stone-400 block">Invoices Generated</span>
                          <span className="font-sans font-bold text-sm text-[#1A1A1A]">152</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Title + Accordion */}
              <div className="space-y-6">
                <h2 className="font-sans text-3xl md:text-4xl font-bold text-[#1A1A1A] leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-red-500 to-purple-600">GST</span> Accounting
                </h2>
                <div className="border border-stone-200/80 rounded-2xl bg-white overflow-hidden shadow-sm">
                  {[
                    { title: "Simple GST Billing", sub: "Filing for Growing Salons", desc: "Create fast, GST-compliant invoices online and offline, optimize barber shop accounting workflow, and ensure seamless tax filing for barber shop growth." },
                    { title: "Effortless GST Accounting", sub: "Reports & Compliance Made Easy", desc: "Auto-generate GSTR-1, GSTR-3B, and GSTR-9 reports. Reconcile input tax credits against purchases and track your net GST liability." },
                    { title: "Smart GST Solutions", sub: "To Boost Your Salon's Growth", desc: "Categorize services under correct HSN/SAC codes. Apply different GST rates for services vs retail products automatically." },
                    { title: "One-Click GST Invoices", sub: "Returns & Tax Reports", desc: "Generate professional GST invoices with one click. Download monthly and quarterly tax reports ready for your CA or filing portal." },
                    { title: "Hassle-Free GST Compliance", sub: "for Modern Salon Businesses", desc: "Stay compliant with automated tax calculations, digital record keeping, and GSTN reconciliation features built specifically for salons." }
                  ].map((item, idx) => {
                    const isOpen = gstActive === idx;
                    return (
                      <div key={idx} className={`border-b border-stone-100 last:border-0 transition-colors duration-200 ${isOpen ? 'bg-stone-50/50' : ''}`}>
                        <button onClick={() => setGstActive(idx)} className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none group">
                          <span className="font-sans text-sm">
                            <strong className={`font-bold transition-colors ${isOpen ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/80 group-hover:text-[#1A1A1A]'}`}>{item.title}</strong>
                            <span className="text-stone-400 font-medium"> – {item.sub}</span>
                          </span>
                          <span className={`material-symbols-outlined text-stone-400 text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <p className="px-6 pb-4 font-sans text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* 4. INVENTORY & WAREHOUSE */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Title + Accordion */}
              <div className="space-y-6 order-2 lg:order-1">
                <h2 className="font-sans text-3xl md:text-4xl font-bold text-[#1A1A1A] leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-blue-600">Inventory & Warehouse</span>
                  <br />Management
                </h2>
                <div className="border border-stone-200/80 rounded-2xl bg-white overflow-hidden shadow-sm">
                  {[
                    { title: "Boost Profits", sub: "Track top-selling products", desc: "Identify top-selling products across inventory and warehouse. Optimize stock flow, maximize profits, and ensure faster turnover for steady salon growth." },
                    { title: "Cut Wastage", sub: "Control pilferage & misuse", desc: "Track product usage per service automatically. Flag unusual consumption patterns and prevent product theft or overuse." },
                    { title: "Stay Stocked", sub: "Auto reorder alerts", desc: "Set minimum stock thresholds. Receive automated alerts when products run low and trigger purchase orders with one click." },
                    { title: "Smarter Purchases", sub: "Fast vs. slow movers", desc: "Analyze product movement speed. Identify dead stock vs fast-moving items to optimize your purchase orders and shelf space." },
                    { title: "Centralized Control", sub: "Multi-branch warehouses", desc: "Manage central warehouse and branch-level inventories from a single dashboard. Track inter-branch transfers and supplier orders." }
                  ].map((item, idx) => {
                    const isOpen = inventoryActive === idx;
                    return (
                      <div key={idx} className={`border-b border-stone-100 last:border-0 transition-colors duration-200 ${isOpen ? 'bg-stone-50/50' : ''}`}>
                        <button onClick={() => setInventoryActive(idx)} className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none group">
                          <span className="font-sans text-sm">
                            <strong className={`font-bold transition-colors ${isOpen ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/80 group-hover:text-[#1A1A1A]'}`}>{item.title}</strong>
                            <span className="text-stone-400 font-medium"> – {item.sub}</span>
                          </span>
                          <span className={`material-symbols-outlined text-stone-400 text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <p className="px-6 pb-4 font-sans text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Inventory Mockup */}
              <div className="relative flex justify-center order-1 lg:order-2">
                <div className="absolute right-0 top-6 bottom-6 w-1 rounded-full bg-gradient-to-b from-pink-500 via-rose-500 to-blue-600 hidden lg:block" />
                
                <div className="relative w-full max-w-[420px] mr-4 lg:mr-8">
                  {/* Consumption vs Services Card */}
                  <div className="bg-white rounded-2xl border border-stone-200/80 shadow-lg overflow-hidden relative z-10">
                    {/* Consumption Header */}
                    <div className="bg-stone-800 text-white p-4 flex items-start gap-3">
                      <div className="flex-1">
                        <h5 className="font-sans font-bold text-xs mb-2">Consumption vs Services</h5>
                        <ul className="text-[9px] font-sans text-stone-300 space-y-1 list-disc list-inside">
                          <li>Hair Spa — Used 8 shampoo bottles this month</li>
                          <li>Gold Facial — Consumed 12 facial kits</li>
                          <li>Hair Coloring — Used 15 color kits</li>
                        </ul>
                      </div>
                      <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img src="/images/salon_interior_after.png" alt="Salon" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-2 p-4 flex-wrap">
                      <button className="bg-blue-600 text-white text-[8px] font-sans font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">+ Add Product</button>
                      <button className="bg-blue-100 text-blue-700 text-[8px] font-sans font-bold px-2.5 py-1.5 rounded-lg">📋 New Purchase</button>
                      <button className="bg-emerald-100 text-emerald-700 text-[8px] font-sans font-bold px-2.5 py-1.5 rounded-lg">📦 Stock Transfer</button>
                      <button className="bg-amber-100 text-amber-700 text-[8px] font-sans font-bold px-2.5 py-1.5 rounded-lg">🔔 Reorder Alerts</button>
                    </div>
                    {/* Reorder Alerts List */}
                    <div className="px-4 pb-4">
                      <h5 className="font-sans font-bold text-xs text-[#1A1A1A] mb-3">Reorder Alerts</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-sans font-bold text-[11px] text-[#1A1A1A] block">Matrix Hair Color Kit</span>
                            <span className="text-[9px] font-sans text-stone-400">Only 6 left</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">Urgent</span>
                            <span className="text-[10px] font-bold text-blue-600 cursor-pointer">Reorder</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-sans font-bold text-[11px] text-[#1A1A1A] block">Loreal Shampoo 1L</span>
                            <span className="text-[9px] font-sans text-stone-400">Only 4 left</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Low</span>
                            <span className="text-[10px] font-bold text-blue-600 cursor-pointer">Reorder</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-sans font-bold text-[11px] text-[#1A1A1A] block">Disposable Towels (100 pcs)</span>
                            <span className="text-[9px] font-sans text-stone-400">Only 1 pack left</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Critical</span>
                            <span className="text-[10px] font-bold text-blue-600 cursor-pointer">Reorder</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* 5. EMPLOYEE MANAGEMENT */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Title + Accordion */}
              <div className="space-y-6">
                <h2 className="font-sans text-3xl md:text-4xl font-bold text-[#1A1A1A] leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500">Employee</span> Management
                </h2>
                <div className="border border-stone-200/80 rounded-2xl bg-white overflow-hidden shadow-sm">
                  {[
                    { title: "Track Staff Performance", sub: "Reward with Automated Incentives", desc: "Boost staff productivity with automated performance tracking, monitor key metrics, and reward top performers to enhance efficiency and barber shop profitability." },
                    { title: "Seamless Attendance Management", sub: "Shifts & Leave Requests Made Easy", desc: "Track real-time attendance with biometric integration. Manage shift scheduling, overtime calculations, and leave approvals from one panel." },
                    { title: "Client Loyalty Boost", sub: "Personalized Stylist Preferences", desc: "Let clients choose their favorite stylists when booking. Track stylist-level satisfaction scores and repeat client ratios." },
                    { title: "Automated Payroll Processing", sub: "Faster & Accurate Salary Disbursal", desc: "Auto-calculate salaries with commission splits, deductions, bonuses, and tip distributions. Generate payslips and track disbursements." },
                    { title: "Multi-Branch Control", sub: "Easily Manage Staff Roles Across Salons", desc: "Assign roles, permissions, and branch-level access. Manage inter-branch staff transfers and holiday calendars centrally." }
                  ].map((item, idx) => {
                    const isOpen = employeeActive === idx;
                    return (
                      <div key={idx} className={`border-b border-stone-100 last:border-0 transition-colors duration-200 ${isOpen ? 'bg-stone-50/50' : ''}`}>
                        <button onClick={() => setEmployeeActive(idx)} className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none group">
                          <span className="font-sans text-sm">
                            <strong className={`font-bold transition-colors ${isOpen ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/80 group-hover:text-[#1A1A1A]'}`}>{item.title}</strong>
                            <span className="text-stone-400 font-medium"> – {item.sub}</span>
                          </span>
                          <span className={`material-symbols-outlined text-stone-400 text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <p className="px-6 pb-4 font-sans text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Employee Mockup */}
              <div className="relative flex justify-center">
                <div className="absolute right-0 top-6 bottom-6 w-1 rounded-full bg-gradient-to-b from-rose-500 via-pink-500 to-amber-500 hidden lg:block" />
                
                <div className="relative w-full max-w-[420px] mr-4 lg:mr-8">
                  {/* Main Employee Card */}
                  <div className="bg-white rounded-2xl border border-stone-200/80 shadow-lg p-5 relative z-10">
                    {/* Header Buttons */}
                    <div className="flex gap-2 mb-4">
                      <button className="bg-blue-600 text-white text-[9px] font-sans font-bold px-3 py-1.5 rounded-lg">+ New Staff</button>
                      <button className="bg-stone-100 text-stone-600 text-[9px] font-sans font-bold px-3 py-1.5 rounded-lg">Export CSV</button>
                    </div>
                    
                    {/* Attendance Tracking */}
                    <div className="bg-stone-50 rounded-xl p-3 mb-3">
                      <h5 className="font-sans font-bold text-[10px] text-[#1A1A1A] mb-2.5">Real-Time Biometric Attendance Tracking</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <div>
                              <span className="font-sans font-bold text-[10px] text-[#1A1A1A] block">Ramesh Yadav</span>
                              <span className="text-[8px] font-sans text-stone-400">Hairdresser • Present - 10:30 AM</span>
                            </div>
                          </div>
                          <span className="text-[8px] font-sans text-stone-400 font-medium">Total: 10h 31m</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div>
                            <span className="font-sans font-bold text-[10px] text-[#1A1A1A] block">Karan Mishra</span>
                            <span className="text-[8px] font-sans text-stone-400">Receptionist • Present - 9:45 AM</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-stone-300" />
                          <div>
                            <span className="font-sans font-bold text-[10px] text-[#1A1A1A] block">Ganesh Singh</span>
                            <span className="text-[8px] font-sans text-red-400">On Leave</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payroll Table */}
                    <div className="bg-stone-50 rounded-xl p-3 mb-3">
                      <h5 className="font-sans font-bold text-[10px] text-[#1A1A1A] mb-2.5">Payroll & Salary Management</h5>
                      <table className="w-full text-[10px] font-sans">
                        <thead><tr className="text-stone-400 font-bold"><td className="pb-1.5">Staff</td><td className="pb-1.5">Salary</td><td className="pb-1.5">Status</td></tr></thead>
                        <tbody className="text-stone-700 font-medium">
                          <tr><td className="py-1">Ramesh Yadav</td><td>₹30,000</td><td><span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Paid</span></td></tr>
                          <tr><td className="py-1">Karan Mishra</td><td>₹28,000</td><td><span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pending</span></td></tr>
                          <tr><td className="py-1">Ganesh Singh</td><td>₹25,000</td><td><span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Paid</span></td></tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Performance Tracking */}
                    <div className="bg-stone-50 rounded-xl p-3">
                      <h5 className="font-sans font-bold text-[10px] text-[#1A1A1A] mb-2">Performance Tracking</h5>
                      <div className="space-y-1 text-[10px] font-sans">
                        <div className="flex justify-between"><span className="text-stone-400">Top Performer</span><span className="font-bold text-[#1A1A1A]">Mahima Verma</span></div>
                        <div className="flex justify-between"><span className="text-stone-400">Services (Aug)</span><span className="font-bold text-[#1A1A1A]">58</span></div>
                        <div className="flex justify-between"><span className="text-stone-400">Avg Rating</span><span className="font-bold text-amber-500">⭐ 4.9</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Floating photo badge */}
                  <div className="absolute -top-3 right-4 w-16 h-16 rounded-xl overflow-hidden border-3 border-white shadow-xl z-20">
                    <img src="/images/male_grooming.png" alt="Staff" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 5: WEBSITE BUILDER DEMO */}
        <section className="py-24 md:py-32 bg-[#F8F5F1] border-y border-[#E8DCC5]/40">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Side Info */}
              <div className="lg:col-span-5 space-y-8">
                <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">No-Code Website Builder</span>
                <h2 className="luxury-heading text-3xl md:text-4xl font-medium text-[#1A1A1A] leading-tight">
                  Drag. Drop. Publish. <br />
                  A Website Built Live.
                </h2>
                <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70 leading-relaxed">
                  Your luxury salon website represents your storefront. Trimly allows you to generate a fully optimized, responsive, and gorgeously themed website within minutes. 
                </p>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#B58A2A] font-bold text-xs border border-[#E8DCC5]/50 shadow-sm">1</div>
                    <div>
                      <strong className="text-sm font-bold font-sans">Choose Curated Layout Block</strong>
                      <p className="text-xs text-stone-500 mt-0.5">Pick visual blocks aligned to salon brand spacing guidelines.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#B58A2A] font-bold text-xs border border-[#E8DCC5]/50 shadow-sm">2</div>
                    <div>
                      <strong className="text-sm font-bold font-sans">Assemble Your Services</strong>
                      <p className="text-xs text-stone-500 mt-0.5">Define your high-end hair, make-up, and massage treatment tariffs.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#B58A2A] font-bold text-xs border border-[#E8DCC5]/50 shadow-sm">3</div>
                    <div>
                      <strong className="text-sm font-bold font-sans">Launch Live Web Link</strong>
                      <p className="text-xs text-stone-500 mt-0.5">Map custom domains with built-in speed caching &amp; high SEO rank.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Simulator */}
              <div className="lg:col-span-7 flex justify-center">
                <div 
                  ref={pageBuilderRef}
                  className="w-full max-w-[440px] aspect-[4/5] bg-white rounded-3xl border border-[#E8DCC5]/60 shadow-xl p-5 relative overflow-hidden flex flex-col justify-between select-none"
                >
                  {/* Builder Header Mockup */}
                  <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] font-sans text-stone-400 font-bold uppercase tracking-wider">Trimly Live Canvas</span>
                    <button className="bg-[#B58A2A] text-white text-[9px] font-sans font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                      Publish
                    </button>
                  </div>

                  {/* Canvas Center Area representing elements dropping in */}
                  <div className="flex-1 bg-[#F8F5F1]/50 rounded-2xl p-3 space-y-3 relative overflow-hidden">
                    {/* Element: Hero Block */}
                    <div className="builder-hero bg-white border border-[#E8DCC5]/30 rounded-xl p-3 text-center space-y-1 shadow-sm opacity-0">
                      <h4 className="luxury-heading text-xs font-bold text-[#1A1A1A]">Welcome to Velvet Atelier</h4>
                      <p className="text-[8px] text-stone-400 max-w-[150px] mx-auto font-sans leading-tight">Curating elevated styling sessions and luxury hair treatment in Mumbai.</p>
                    </div>

                    {/* Element: Gallery Block */}
                    <div className="builder-gallery bg-white border border-[#E8DCC5]/30 rounded-xl p-2.5 space-y-1.5 shadow-sm opacity-0">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold font-sans text-[#1A1A1A]">Our Salon Portfolio</span>
                        <span className="text-[7px] text-[#B58A2A] font-bold font-sans uppercase">View All</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="aspect-square rounded-md bg-stone-100 overflow-hidden">
                          <img className="w-full h-full object-cover" src="/images/hair_color_after.png" alt="" />
                        </div>
                        <div className="aspect-square rounded-md bg-stone-100 overflow-hidden">
                          <img className="w-full h-full object-cover" src="/images/makeup_after.png" alt="" />
                        </div>
                        <div className="aspect-square rounded-md bg-stone-100 overflow-hidden">
                          <img className="w-full h-full object-cover" src="/images/bridal_after.png" alt="" />
                        </div>
                      </div>
                    </div>

                    {/* Element: Team block */}
                    <div className="builder-team bg-white border border-[#E8DCC5]/30 rounded-xl p-2.5 space-y-1.5 shadow-sm opacity-0">
                      <span className="text-[9px] font-bold font-sans text-[#1A1A1A]">Stylist Mastercrafts</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 border border-stone-50 rounded-lg p-1 bg-stone-50/50">
                          <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden">
                            <img className="w-full h-full object-cover" src="/images/hair_color_before.png" alt="" />
                          </div>
                          <div>
                            <span className="text-[7px] font-bold font-sans block text-[#1A1A1A]">Ananya S.</span>
                            <span className="text-[6px] text-stone-400 font-sans block">Master Colorist</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 border border-stone-50 rounded-lg p-1 bg-stone-50/50">
                          <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden">
                            <img className="w-full h-full object-cover" src="/images/bridal_before.png" alt="" />
                          </div>
                          <div>
                            <span className="text-[7px] font-bold font-sans block text-[#1A1A1A]">Rohan M.</span>
                            <span className="text-[6px] text-stone-400 font-sans block">Bridal Expert</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Element: Book Now Button */}
                    <div className="builder-book text-center opacity-0 pt-1">
                      <button className="w-full py-2 bg-[#B58A2A] text-white text-[9px] font-sans font-bold uppercase tracking-widest rounded-lg shadow-sm">
                        Schedule An Appointment
                      </button>
                    </div>

                    {/* Modal published checkmark alert */}
                    <div className="builder-publish absolute inset-x-6 top-1/4 bg-white/95 border border-[#B58A2A]/40 p-4 rounded-2xl text-center space-y-2.5 shadow-2xl opacity-0 z-20">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                      </div>
                      <div>
                        <h5 className="text-[11px] font-sans font-bold text-[#1A1A1A]">Website Live &amp; Published!</h5>
                        <p className="text-[9px] text-[#B58A2A] font-sans mt-0.5 font-semibold">trimly.co/velvet-atelier</p>
                      </div>
                    </div>

                    {/* Hand Drag Indicator Cursor */}
                    <div 
                      className="builder-cursor absolute w-8 h-8 pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: 0, top: 0 }}
                    >
                      <span className="text-2xl select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">🫵</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 6: MINI-BOOKING DEMO */}
        <section id="booking-demo" className="py-24 md:py-32 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Side: Simulation Visual */}
              <div className="lg:col-span-7 flex justify-center order-2 lg:order-1">
                <div className="relative w-full max-w-[340px] aspect-[9/18] bg-stone-900 rounded-[40px] p-3 border-[6px] border-stone-850 booking-phone-shadow flex flex-col justify-between overflow-hidden">
                  
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-stone-900 rounded-b-2xl z-40 flex items-center justify-center">
                    <div className="w-10 h-1 speaker bg-stone-800 rounded-full" />
                  </div>

                  {/* Client Booking Screen App */}
                  <div className="flex-1 bg-[#F8F5F1] rounded-[32px] p-4 flex flex-col justify-between overflow-hidden relative pt-8 font-sans">
                    
                    {/* Booking Flow Header */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">Velvet Salon Reservations</span>
                        <span className="text-[9px] font-bold text-[#B58A2A] bg-[#E8DCC5]/40 px-2 py-0.5 rounded-full">Book Slot</span>
                      </div>
                      <div className="w-full bg-[#E8DCC5]/30 h-1 rounded-full overflow-hidden mb-5">
                        <div 
                          className="bg-[#B58A2A] h-full transition-all duration-500" 
                          style={{ width: `${(bookingStep + 1) * 20}%` }}
                        />
                      </div>
                    </div>

                    {/* Core App View */}
                    <div className="flex-1 overflow-y-auto space-y-4">
                      {/* STEP 0: SELECT SERVICE */}
                      {bookingStep >= 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-stone-400 block tracking-wider uppercase">Select Treatment</span>
                          <div className={`p-3 rounded-xl border text-left transition-all ${selectedService ? 'bg-white border-[#B58A2A] shadow-sm' : 'bg-white/60 border-stone-200/60'}`}>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-[#1A1A1A]">Balayage Highlight &amp; Hair Spa</span>
                              <span className="text-xs font-bold text-[#B58A2A]">₹4,500</span>
                            </div>
                            <span className="text-[8px] text-stone-400 block mt-0.5">Average duration: 120 mins • Master stylist</span>
                          </div>
                        </div>
                      )}

                      {/* STEP 1: SELECT STAFF */}
                      {bookingStep >= 1 && (
                        <div className="space-y-2 animate-fade-in">
                          <span className="text-[9px] font-bold text-stone-400 block tracking-wider uppercase">Select Master Stylist</span>
                          <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${selectedStaff ? 'bg-white border-[#B58A2A] shadow-sm' : 'bg-white/60 border-stone-200/60'}`}>
                            <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden">
                              <img className="w-full h-full object-cover" src="/images/hair_color_before.png" alt="" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-[#1A1A1A] block">Ananya Sharma</span>
                              <span className="text-[8px] text-stone-400 block">Senior Hair Colorist • 98% Rating</span>
                            </div>
                            {selectedStaff && (
                              <span className="material-symbols-outlined text-xs text-[#B58A2A] ml-auto">check_circle</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* STEP 2: SELECT DATE / TIME */}
                      {bookingStep >= 2 && (
                        <div className="space-y-2 animate-fade-in">
                          <span className="text-[9px] font-bold text-stone-400 block tracking-wider uppercase">Select Date &amp; Time</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-xl border bg-white border-[#B58A2A] text-center shadow-xs">
                              <span className="text-[8px] text-stone-400 uppercase font-semibold block">Date</span>
                              <span className="text-xs font-bold text-[#1A1A1A]">June 12, 2026</span>
                            </div>
                            <div className={`p-2.5 rounded-xl border text-center transition-all ${selectedTime ? 'bg-white border-[#B58A2A] shadow-xs' : 'bg-white/60 border-stone-200/60'}`}>
                              <span className="text-[8px] text-stone-400 uppercase font-semibold block">Time Slot</span>
                              <span className="text-xs font-bold text-[#1A1A1A]">2:30 PM</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: CONFIRM AT BOTTOM */}
                      {bookingStep >= 3 && (
                        <div className="pt-2 animate-fade-in">
                          <button className="w-full py-3 bg-[#B58A2A] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-md">
                            Confirm Appointment Booking
                          </button>
                        </div>
                      )}

                      {/* STEP 4: SUCCESS VIEW */}
                      {bookingStep >= 4 && (
                        <div className="py-6 text-center space-y-4 animate-fade-in">
                          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-lg font-bold">check</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#1A1A1A]">Appointment Booking Confirmed!</h4>
                            <p className="text-[9px] text-stone-400 mt-1">Details sent to WhatsApp registered mobile number.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* App Footer Brand */}
                    <div className="text-center text-[7px] text-stone-400 tracking-widest uppercase font-bold pt-2 border-t border-stone-100">
                      Powered by Trimly Operating System
                    </div>

                    {/* Simulation WhatsApp Notification */}
                    {showWhatsApp && (
                      <div className="absolute top-8 inset-x-2 bg-white/95 border border-amber-200/60 p-3.5 rounded-2xl shadow-2xl flex items-start gap-3 z-30 animate-fade-in">
                        <img alt="WhatsApp Icon" className="w-7 h-7 object-contain" src="/logo.svg" />
                        <div className="flex-1 text-left">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-[#8A6A1F]">TRIMLY MESSENGER</span>
                            <span className="text-[7px] text-stone-400">now</span>
                          </div>
                          <p className="text-[9px] font-medium text-stone-600 leading-tight mt-0.5">
                            "Hey! Ananya confirmed your Balayage Highlight at Velvet Salon for June 12, 2:30 PM. See you!"
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>

              {/* Right Side: Info Panel */}
              <div className="lg:col-span-5 space-y-8 order-1 lg:order-2">
                <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">Instant Booking Simulation</span>
                <h2 className="luxury-heading text-3xl md:text-4xl font-medium text-[#1A1A1A] leading-tight">
                  Seamless Booking Experience. <br />
                  For Client Delight.
                </h2>
                <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70 leading-relaxed">
                  Your clients book instantly from any phone, choosing services, master stylists, and slots in under 30 seconds. Trimly automatically locks in the staff schedule and updates their calendar.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8F5F1] p-5 rounded-2xl border border-[#E8DCC5]/30">
                    <span className="material-symbols-outlined text-[#B58A2A] text-2xl mb-2">sms</span>
                    <strong className="text-sm font-sans block text-[#1A1A1A]">No-Show Prevention</strong>
                    <span className="text-xs text-stone-500 block mt-1">WhatsApp &amp; SMS reminders slash absent rates by 65%.</span>
                  </div>
                  <div className="bg-[#F8F5F1] p-5 rounded-2xl border border-[#E8DCC5]/30">
                    <span className="material-symbols-outlined text-[#B58A2A] text-2xl mb-2">credit_card</span>
                    <strong className="text-sm font-sans block text-[#1A1A1A]">Deposit Lock-In</strong>
                    <span className="text-xs text-stone-500 block mt-1">Accept digital booking deposits to guarantee high-ticket slots.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* METRICS SECTION */}
        <section className="py-20 md:py-24 bg-[#E8DCC5]/30 border-y border-[#E8DCC5]/40 text-center">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <span 
                ref={appointmentsCountRef} 
                className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A] block"
              >
                0
              </span>
              <span className="text-xs font-sans font-bold text-[#8A6A1F] uppercase tracking-wider block">Appointments Booked</span>
            </div>
            <div className="space-y-2">
              <span 
                ref={customersCountRef} 
                className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A] block"
              >
                0
              </span>
              <span className="text-xs font-sans font-bold text-[#8A6A1F] uppercase tracking-wider block">Customers Managed</span>
            </div>
            <div className="space-y-2">
              <span 
                ref={revenueCountRef} 
                className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A] block"
              >
                0
              </span>
              <span className="text-xs font-sans font-bold text-[#8A6A1F] uppercase tracking-wider block">Tariff Value Processed</span>
            </div>
            <div className="space-y-2">
              <span className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A] block">
                8+
              </span>
              <span className="text-xs font-sans font-bold text-[#8A6A1F] uppercase tracking-wider block">Languages Supported</span>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-24 md:py-32 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">Flat Simple Tariff</span>
              <h2 className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A]">Curated Pricing Tiers</h2>
              <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70">
                Choose the perfect operating model to run your hair studio, boutique salon, or franchise branch network.
              </p>
            </div>

            {/* Billing toggle */}
            <div className="flex justify-center items-center gap-4 mb-16">
              <span className={`text-xs font-sans font-bold transition-colors ${billingCycle === 'monthly' ? 'text-[#1A1A1A]' : 'text-stone-400'}`}>Monthly Billing</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-14 h-7 bg-[#E8DCC5]/40 rounded-full p-1 border border-[#B58A2A]/20 transition-all focus:outline-none"
              >
                <div className={`w-4.5 h-4.5 bg-[#B58A2A] rounded-full transition-transform ease-out duration-300 ${billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-sans font-bold transition-colors ${billingCycle === 'annual' ? 'text-[#1A1A1A]' : 'text-stone-400'}`}>Annual Billing</span>
                <span className="text-[9px] font-sans font-bold text-[#B58A2A] bg-[#E8DCC5]/40 border border-[#B58A2A]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Save 20%</span>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1240px] mx-auto items-stretch">
              
              {/* Card 1: Starter */}
              <div className="luxury-card rounded-3xl p-8 flex flex-col justify-between space-y-8 bg-white">
                <div className="space-y-4">
                  <span className="text-[10px] font-sans font-bold text-stone-400 tracking-widest uppercase block">Starter Plan</span>
                  <div className="flex items-baseline gap-1">
                    <span className="luxury-heading text-4xl font-medium text-[#1A1A1A]">
                      ₹{billingCycle === 'monthly' ? '2,499' : '1,999'}
                    </span>
                    <span className="text-xs text-stone-450">/mo</span>
                  </div>
                  <p className="text-xs text-stone-500 font-sans leading-relaxed">Perfect for independent stylists or single-chair operations starting digital CRM.</p>
                  <div className="w-full h-px bg-stone-100 my-4" />
                  <ul className="space-y-3 text-xs text-stone-600 font-sans">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Basic Booking Calendar
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Trimly Subdomain URL
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Basic Client Profile CRM
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 border border-[#B58A2A]/40 text-[#8A6A1F] hover:bg-[#E8DCC5]/20 text-xs font-sans font-bold uppercase tracking-wider transition rounded-xl" onClick={() => window.location.assign('/register')}>
                  Start Free Trial
                </button>
              </div>

              {/* Card 2: Growth (Most Popular) */}
              <div className="luxury-card popular-glow rounded-3xl p-8 flex flex-col justify-between space-y-8 bg-white relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B58A2A] text-white text-[9px] font-sans font-bold tracking-widest uppercase px-3.5 py-1 rounded-full border border-white">
                  MOST POPULAR
                </span>
                <div className="space-y-4">
                  <span className="text-[10px] font-sans font-bold text-[#B58A2A] tracking-widest uppercase block">Growth Plan</span>
                  <div className="flex items-baseline gap-1">
                    <span className="luxury-heading text-4xl font-medium text-[#1A1A1A]">
                      ₹{billingCycle === 'monthly' ? '4,999' : '3,999'}
                    </span>
                    <span className="text-xs text-stone-450">/mo</span>
                  </div>
                  <p className="text-xs text-stone-500 font-sans leading-relaxed">Ideal for boutique ateliers managing team stylist rotas and WhatsApp CRM.</p>
                  <div className="w-full h-px bg-stone-100 my-4" />
                  <ul className="space-y-3 text-xs text-stone-600 font-sans">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Advanced Calendar &amp; Reminders
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Custom Domain Setup
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      WhatsApp Notifications
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Stylist Commission Engine
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 bg-[#B58A2A] hover:bg-[#8A6A1F] text-white text-xs font-sans font-bold uppercase tracking-wider transition rounded-xl shadow-md" onClick={() => window.location.assign('/register')}>
                  Start Free Trial
                </button>
              </div>

              {/* Card 3: Premium */}
              <div className="luxury-card rounded-3xl p-8 flex flex-col justify-between space-y-8 bg-white">
                <div className="space-y-4">
                  <span className="text-[10px] font-sans font-bold text-stone-400 tracking-widest uppercase block">Premium Plan</span>
                  <div className="flex items-baseline gap-1">
                    <span className="luxury-heading text-4xl font-medium text-[#1A1A1A]">
                      ₹{billingCycle === 'monthly' ? '9,999' : '7,999'}
                    </span>
                    <span className="text-xs text-stone-450">/mo</span>
                  </div>
                  <p className="text-xs text-stone-500 font-sans leading-relaxed">Perfect for luxury salon networks requiring custom branding and advanced inventory.</p>
                  <div className="w-full h-px bg-stone-100 my-4" />
                  <ul className="space-y-3 text-xs text-stone-600 font-sans">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Multi-Branch Management
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      VIP Loyalty Rewards
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Professional Inventory Tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Dedicated 24/7 Phone Support
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 border border-[#B58A2A]/40 text-[#8A6A1F] hover:bg-[#E8DCC5]/20 text-xs font-sans font-bold uppercase tracking-wider transition rounded-xl" onClick={() => window.location.assign('/register')}>
                  Start Free Trial
                </button>
              </div>

              {/* Card 4: Enterprise */}
              <div className="luxury-card rounded-3xl p-8 flex flex-col justify-between space-y-8 bg-white">
                <div className="space-y-4">
                  <span className="text-[10px] font-sans font-bold text-stone-400 tracking-widest uppercase block">Enterprise Plan</span>
                  <div className="flex items-baseline gap-1">
                    <span className="luxury-heading text-4xl font-medium text-[#1A1A1A]">Custom</span>
                  </div>
                  <p className="text-xs text-stone-500 font-sans leading-relaxed">Tailored specifically for major retail salon chains and master franchises in India.</p>
                  <div className="w-full h-px bg-stone-100 my-4" />
                  <ul className="space-y-3 text-xs text-stone-600 font-sans">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Custom API &amp; Webhook Access
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Custom White-Label Domain UI
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Dedicated Account Director
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      SLA Availability Agreement
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 border border-[#B58A2A]/40 text-[#8A6A1F] hover:bg-[#E8DCC5]/20 text-xs font-sans font-bold uppercase tracking-wider transition rounded-xl" onClick={() => window.location.assign('/register')}>
                  Contact Sales
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-24 md:py-32 bg-[#F8F5F1] border-t border-[#E8DCC5]/40">
          <div className="max-w-[800px] mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">Curated Questions</span>
              <h2 className="luxury-heading text-3xl font-medium text-[#1A1A1A]">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "What is Trimly?",
                  a: "Trimly is an all-in-one salon operating system designed to replace calendars, WhatsApp messages, paper notebooks, and payroll sheets. We assist premium Indian salons in delivering a luxury client experience."
                },
                {
                  q: "Can I use my own custom website domain name?",
                  a: "Yes! With our Growth and Premium plans, you can link your custom business domain (e.g. yoursalon.com) to our fast-loading booking engine."
                },
                {
                  q: "How does the WhatsApp reminder scheduling work?",
                  a: "Trimly hooks directly into official API services. Once an appointment is saved, the client receives booking alerts and re-booking prompts automatically."
                },
                {
                  q: "Is there a setup fee for franchise salons?",
                  a: "No setup fees. You can import your current customer records and inventory details instantly, or request our support team's guidance."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-[#E8DCC5]/30 rounded-2xl overflow-hidden shadow-xs">
                  <button 
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full flex justify-between items-center p-6 text-left font-sans font-bold text-sm text-[#1A1A1A] focus:outline-none"
                  >
                    <span>{item.q}</span>
                    <span className={`material-symbols-outlined text-[#B58A2A] transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
                  </button>
                  <div className={`transition-all duration-350 overflow-hidden ${openFaqIndex === idx ? 'max-h-40 border-t border-[#E8DCC5]/20' : 'max-h-0'}`}>
                    <p className="p-6 font-sans text-xs text-stone-500 leading-relaxed bg-[#FAF9F5]/30">
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA (FULL SCREEN HERO OVERLAY) */}
        <section className="relative py-32 md:py-44 overflow-hidden border-t border-[#E8DCC5]/40 text-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#F8F5F1]/85 backdrop-blur-xs z-10" />
            <img 
              alt="Luxury Salon Interior Backdrop" 
              className="w-full h-full object-cover" 
              src="/images/salon_interior.png" 
            />
          </div>
          <div className="max-w-[1440px] mx-auto px-6 relative z-20 space-y-10">
            <h2 className="luxury-heading text-4xl md:text-5xl lg:text-6xl font-medium text-[#1A1A1A] leading-tight">
              Your clients expect luxury. <br />
              Your software should too.
            </h2>
            <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70 max-w-lg mx-auto leading-relaxed">
              Experience the beautiful operating system that scales customer loyalty and drives high-end styling revenue. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xs sm:max-w-none mx-auto">
              <button className="w-full sm:w-auto bg-[#B58A2A] hover:bg-[#8A6A1F] text-white px-10 py-4.5 rounded-full font-sans text-sm font-semibold transition-all shadow-md shadow-[#B58A2A]/15 hover:scale-[1.03]" onClick={() => window.location.assign('/register')}>Start Free Trial</button>
              <button className="w-full sm:w-auto bg-white border border-[#B58A2A]/40 text-[#8A6A1F] hover:bg-stone-50 px-10 py-4.5 rounded-full font-sans text-sm font-semibold transition-all shadow-sm" onClick={() => window.location.assign('/register')}>Book Demo</button>
            </div>
            <div className="pt-12 flex flex-wrap justify-center gap-8 text-[11px] font-sans font-bold text-stone-500 border-t border-[#E8DCC5]/50 max-w-md mx-auto">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                14-day free trial
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Unlimited stylists
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Zero setup fees
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#E8DCC5]/40 text-[#1A1A1A]/70">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 flex flex-col md:flex-row justify-between items-start gap-16 md:gap-24">
          <div className="max-w-xs space-y-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.assign('/')}>
              <img alt="Trimly Logo" className="h-7 w-7 object-contain" src="/logo.svg" />
              <span className="luxury-heading text-xl font-bold tracking-tight text-[#1A1A1A]">Trimly</span>
            </div>
            <p className="font-sans text-xs text-stone-500 leading-relaxed">
              Approachable luxury for beauty ateliers. Empowering styling entrepreneurs with elegant software systems across Mumbai, Delhi, and Bangalore.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-16 w-full md:w-auto">
            <div className="space-y-4">
              <h4 className="font-sans text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">Product</h4>
              <ul className="space-y-3 text-xs text-stone-500">
                <li><a className="hover:text-[#B58A2A] transition-colors" href="/demo">Booking App</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="/demo">Inventory CRM</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="/demo">Stylist Rotas</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="/demo">Checkout Billing</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-sans text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">Company</h4>
              <ul className="space-y-3 text-xs text-stone-500">
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">About Trimly</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">Stylist Partners</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">Press Inquiries</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">Careers</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-sans text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">Legal</h4>
              <ul className="space-y-3 text-xs text-stone-500">
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">Privacy Guidelines</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">Terms of Use</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">Security Standards</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 border-t border-[#E8DCC5]/20 flex flex-col md:flex-row justify-between items-center text-xs text-stone-400 gap-4">
          <p>© 2026 Trimly Technologies. The Standard of Salon Excellence.</p>
          <div className="flex gap-6">
            <a className="hover:text-[#B58A2A] transition-colors" href="#"><span className="material-symbols-outlined text-base">public</span></a>
            <a className="hover:text-[#B58A2A] transition-colors" href="#"><span className="material-symbols-outlined text-base">share</span></a>
            <a className="hover:text-[#B58A2A] transition-colors" href="#"><span className="material-symbols-outlined text-base">alternate_email</span></a>
          </div>
        </div>
      </footer>

      {/* Interactive Mobile Demo Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-[#F8F5F1] rounded-[36px] border border-[#E8DCC5]/50 shadow-2xl w-full max-w-[850px] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[650px] relative">
            
            {/* Close Button */}
            <button 
              className="absolute top-5 right-5 z-50 bg-white/85 hover:bg-white text-stone-700 hover:text-black w-8 h-8 rounded-full flex items-center justify-center border border-stone-200/80 shadow-md transition-all active:scale-[0.95]"
              onClick={() => setIsDemoModalOpen(false)}
            >
              <span className="material-symbols-outlined text-sm font-bold">close</span>
            </button>

            {/* Left Content / Controller Area */}
            <div className="p-6 md:p-8 md:w-[45%] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E8DCC5]/40 overflow-y-auto h-1/2 md:h-full bg-white/40">
              <div className="space-y-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8DCC5]/40 text-[#8A6A1F] font-sans text-[10px] font-bold tracking-widest rounded-full uppercase border border-[#B58A2A]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B58A2A] animate-pulse" />
                    Live Mobile Simulator
                  </span>
                  <h3 className="luxury-heading text-2xl font-bold text-[#1A1A1A] mt-3 leading-tight">
                    Explore Trimly OS <br />On Mobile
                  </h3>
                  <p className="font-sans text-xs text-stone-500 leading-relaxed mt-2">
                    Experience how your salon looks in the palm of your hand. Tap the modules below to switch screens on the simulated phone mockup.
                  </p>
                </div>

                {/* Tab selector buttons */}
                <div className="space-y-2.5">
                  {[
                    { id: 'dashboard', icon: 'trending_up', label: 'Revenue Dashboard', desc: 'Monitor daily sales and active stylists.' },
                    { id: 'calendar', icon: 'calendar_month', label: 'Stylist Rota Calendar', desc: 'Drag, drop, and check appointments.' },
                    { id: 'crm', icon: 'group', label: 'VIP Client CRM', desc: 'Track loyalty scores and visit records.' },
                    { id: 'billing', icon: 'receipt_long', label: 'Quick POS Checkout', desc: 'Accept payments and print custom bills.' }
                  ].map((tab) => {
                    const isActive = activeDemoTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveDemoTab(tab.id)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                          isActive 
                            ? 'bg-[#B58A2A]/10 border-[#B58A2A] shadow-xs' 
                            : 'bg-white border-[#E8DCC5]/30 hover:border-[#B58A2A]/40 hover:bg-stone-50/50'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-lg p-2.5 rounded-xl shrink-0 transition-colors ${
                          isActive 
                            ? 'bg-[#B58A2A] text-white' 
                            : 'bg-[#F8F5F1] text-[#8A6A1F] group-hover:bg-[#E8DCC5]/30'
                        }`}>
                          {tab.icon}
                        </span>
                        <div>
                          <span className={`font-sans font-bold text-xs block transition-colors ${isActive ? 'text-[#8A6A1F]' : 'text-[#1A1A1A]'}`}>
                            {tab.label}
                          </span>
                          <span className="text-[10px] text-stone-400 block leading-tight mt-0.5">{tab.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom badge */}
              <div className="pt-6 border-t border-[#E8DCC5]/30 hidden md:block">
                <p className="text-[10px] text-stone-400 font-sans leading-relaxed">
                  *This simulator uses different classes and raw CSS media queries specifically engineered for device previews.
                </p>
              </div>
            </div>

            {/* Right: Phone Simulator Container */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-8 h-1/2 md:h-full bg-[#E8DCC5]/10 relative overflow-hidden">
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#B58A2A]/5 rounded-full blur-[80px] pointer-events-none" />

              {/* iPhone Mockup Frame */}
              <div className="w-[280px] sm:w-[310px] aspect-[9/18.5] bg-stone-900 rounded-[38px] p-2.5 border-[5px] border-stone-850 shadow-2xl relative flex flex-col justify-between overflow-hidden scale-90 sm:scale-100 transition-transform">
                
                {/* Dynamic Island / Camera Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-stone-900 rounded-b-2xl z-50 flex items-center justify-center">
                  <div className="w-8 h-1.5 speaker bg-stone-800 rounded-full" />
                </div>

                {/* Simulator Display Screen */}
                <div className="flex-1 bg-[#F8F5F1] rounded-[30px] p-3.5 flex flex-col justify-between overflow-hidden relative pt-6 font-sans select-none">
                  
                  {/* Status Bar Mockup */}
                  <div className="flex justify-between items-center text-[8px] font-sans font-bold text-stone-400 px-1 mb-2">
                    <span>9:41 AM</span>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[8px]">signal_cellular_alt</span>
                      <span className="material-symbols-outlined text-[8px]">wifi</span>
                      <span className="material-symbols-outlined text-[9px]">battery_full</span>
                    </div>
                  </div>

                  {/* Simulator Screen Content Header */}
                  <div className="flex justify-between items-center pb-2 border-b border-stone-200/50 mb-3">
                    <div className="flex items-center gap-1.5">
                      <img src="/logo.svg" alt="Logo" className="w-4.5 h-4.5 object-contain" />
                      <span className="luxury-heading text-[11px] font-bold text-[#1A1A1A]">Trimly OS</span>
                    </div>
                    <span className="text-[7px] font-bold text-[#8A6A1F] bg-[#E8DCC5]/40 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      {activeDemoTab}
                    </span>
                  </div>

                  {/* Simulator Screen Body */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5 space-y-3">
                    
                    {/* TAB CONTENT: DASHBOARD */}
                    {activeDemoTab === 'dashboard' && (
                      <div className="space-y-3 animate-fade-in">
                        {/* Summary metric card */}
                        <div className="bg-white p-3 rounded-xl border border-[#E8DCC5]/40 shadow-xs space-y-1">
                          <span className="text-[7.5px] font-sans font-bold text-stone-400 tracking-wider uppercase block">Today's Revenue</span>
                          <div className="flex items-baseline justify-between">
                            <span className="text-base font-sans font-bold text-[#1A1A1A]">₹42,500</span>
                            <span className="text-[7.5px] font-sans font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[8px] font-bold">arrow_upward</span>
                              +14%
                            </span>
                          </div>
                        </div>

                        {/* Split progress metrics */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2.5 rounded-xl border border-stone-100 text-left">
                            <span className="text-[7px] text-stone-400 font-bold block uppercase tracking-wider">Booked</span>
                            <span className="text-xs font-bold text-[#1A1A1A] block mt-0.5">14 Sessions</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-stone-100 text-left">
                            <span className="text-[7px] text-stone-400 font-bold block uppercase tracking-wider">Occupancy</span>
                            <span className="text-xs font-bold text-[#B58A2A] block mt-0.5">85% Capacity</span>
                          </div>
                        </div>

                        {/* Active Stylist Rota */}
                        <div className="bg-white p-3 rounded-xl border border-[#E8DCC5]/30">
                          <h5 className="text-[8.5px] font-sans font-bold text-[#1A1A1A] mb-2 uppercase tracking-wide">Stylists on Duty</h5>
                          <div className="space-y-2">
                            {[
                              { name: 'Karan Malhotra', role: 'Master Barber', status: 'In Session', color: 'bg-amber-500' },
                              { name: 'Sana Kapoor', role: 'Skincare Lead', status: 'Available', color: 'bg-emerald-500' },
                              { name: 'Rohan Sharma', role: 'Hair Stylist', status: 'Available', color: 'bg-emerald-500' }
                            ].map((stylist, sIdx) => (
                              <div key={sIdx} className="flex items-center justify-between text-[9px]">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-stone-100 overflow-hidden">
                                    <span className="material-symbols-outlined text-[10px] text-stone-400 flex items-center justify-center h-full">person</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#1A1A1A] block leading-tight">{stylist.name}</span>
                                    <span className="text-[7px] text-stone-400 block">{stylist.role}</span>
                                  </div>
                                </div>
                                <span className={`text-[7px] font-bold text-white ${stylist.color} px-1.5 py-0.5 rounded-full`}>
                                  {stylist.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB CONTENT: CALENDAR */}
                    {activeDemoTab === 'calendar' && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="bg-white p-3 rounded-xl border border-[#E8DCC5]/40 shadow-xs">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[8.5px] font-sans font-bold text-[#1A1A1A] uppercase">Schedule Grid</span>
                            <span className="text-[7px] text-stone-400 font-bold">June 12, 2026</span>
                          </div>
                          
                          <div className="space-y-2">
                            {[
                              { time: '10:00 AM', label: 'Beard Trim & Clean Shave', stylist: 'Karan M.', selected: false },
                              { time: '11:30 AM', label: 'Glass Skin facial & Scrub', stylist: 'Sana K.', selected: true },
                              { time: '02:00 PM', label: 'Bridal Makeover Trial', stylist: 'Sana K.', selected: false },
                              { time: '04:30 PM', label: 'Silk Keratin Therapy', stylist: 'Rohan S.', selected: false }
                            ].map((slot, sIdx) => (
                              <div 
                                key={sIdx} 
                                className={`p-2 rounded-lg border text-left flex items-start justify-between cursor-pointer transition-all ${
                                  slot.selected 
                                    ? 'bg-[#B58A2A]/15 border-[#B58A2A] shadow-2xs' 
                                    : 'bg-stone-50 border-stone-100 hover:bg-white hover:border-[#E8DCC5]'
                                }`}
                              >
                                <div>
                                  <span className="text-[8px] font-bold text-stone-400 block">{slot.time}</span>
                                  <span className="text-[9.5px] font-bold text-[#1A1A1A] block mt-0.5 leading-tight">{slot.label}</span>
                                  <span className="text-[7.5px] text-[#B58A2A] block font-semibold mt-0.5">Stylist: {slot.stylist}</span>
                                </div>
                                {slot.selected && (
                                  <span className="material-symbols-outlined text-[9px] text-[#B58A2A] bg-white rounded-full p-0.5">check</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB CONTENT: CRM */}
                    {activeDemoTab === 'crm' && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="bg-white p-2.5 rounded-xl border border-stone-200/60 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[10px] text-stone-400">search</span>
                          <input 
                            type="text" 
                            readOnly 
                            className="text-[9px] bg-transparent outline-none w-full border-none p-0 text-[#1A1A1A] placeholder-stone-300"
                            placeholder="Search VIP customers..." 
                          />
                        </div>

                        <div className="space-y-2">
                          {[
                            { name: 'Aditya Birla', visits: 12, spent: '₹28,500', rating: 'VIP', color: 'text-amber-700 bg-amber-50' },
                            { name: 'Priya Sen', visits: 8, spent: '₹14,200', rating: 'Regular', color: 'text-stone-600 bg-stone-100' },
                            { name: 'Kabir Dev', visits: 15, spent: '₹34,000', rating: 'VIP Elite', color: 'text-indigo-700 bg-indigo-50' }
                          ].map((client, cIdx) => (
                            <div key={cIdx} className="bg-white p-2.5 rounded-xl border border-[#E8DCC5]/25 flex items-center justify-between text-left">
                              <div className="space-y-0.5">
                                <span className="font-bold text-[9.5px] text-[#1A1A1A] block leading-tight">{client.name}</span>
                                <div className="flex gap-2 text-[7.5px] text-stone-400">
                                  <span>{client.visits} Visits</span>
                                  <span>•</span>
                                  <span>Spent: {client.spent}</span>
                                </div>
                              </div>
                              <span className={`text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${client.color}`}>
                                {client.rating}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-stone-100 text-left">
                          <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#8A6A1F] uppercase mb-1">
                            <span className="material-symbols-outlined text-[9px]">notes</span>
                            Active VIP Formula Logs
                          </div>
                          <p className="text-[8.5px] text-stone-500 font-sans leading-relaxed">
                            "Aditya Birla: Matrix 50ml developer + 6N gold blonde highlights. Avoid hot water rinse due to scalp sensitivity."
                          </p>
                        </div>
                      </div>
                    )}

                    {/* TAB CONTENT: BILLING */}
                    {activeDemoTab === 'billing' && (
                      <div className="space-y-3 animate-fade-in text-left">
                        <div className="bg-white p-3.5 rounded-xl border border-[#E8DCC5]/40 shadow-xs space-y-3">
                          <div className="flex justify-between items-center text-[7.5px] font-bold text-stone-400 uppercase pb-1.5 border-b border-dashed border-stone-200">
                            <span>Receipt #9901</span>
                            <span>Cashier: Karan M.</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-[9px] text-[#1A1A1A]">
                              <div>
                                <span className="font-bold block">Royal Scissor Cut &amp; Trim</span>
                                <span className="text-[7px] text-stone-400">Stylist: Kabir D.</span>
                              </div>
                              <span className="font-bold text-stone-700">₹2,500</span>
                            </div>
                            <div className="flex justify-between text-[9px] text-[#1A1A1A]">
                              <div>
                                <span className="font-bold block">Hair Spa deep conditioning</span>
                                <span className="text-[7px] text-stone-400">Stylist: Rohan S.</span>
                              </div>
                              <span className="font-bold text-stone-700">₹1,800</span>
                            </div>
                          </div>

                          <div className="w-full h-px bg-stone-100" />

                          <div className="space-y-1 text-[9px]">
                            <div className="flex justify-between text-stone-400">
                              <span>Subtotal</span>
                              <span>₹4,300</span>
                            </div>
                            <div className="flex justify-between text-stone-400">
                              <span>GST (18%)</span>
                              <span>₹774</span>
                            </div>
                            <div className="flex justify-between text-[#1A1A1A] font-bold pt-1 text-[10px] border-t border-stone-100">
                              <span>Total Net Tariff</span>
                              <span className="text-[#B58A2A]">₹5,074</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button className="py-2.5 bg-[#B58A2A] text-white text-[8px] font-bold uppercase tracking-wider rounded-lg text-center shadow-xs">
                            💳 UPI / Card
                          </button>
                          <button className="py-2.5 bg-white border border-stone-200 text-stone-600 text-[8px] font-bold uppercase tracking-wider rounded-lg text-center hover:bg-stone-50">
                            🖨️ Print Receipt
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Simulator Screen Footer */}
                  <div className="pt-2 border-t border-stone-200/50 mt-2 text-center text-[6.5px] text-stone-400 font-bold uppercase tracking-widest">
                    Trimly OS Live Simulation
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
